# Prompt 9: Brief Generator and PDA Platform Integration

**Runtime:** approximately 3 hours. Sequential. Requires Prompt 7 merged (Brief view skeleton exists).

**Authoritative context:** Read `ARCHITECTURE.md` sections 9 (external integrations, especially 9.5 on PDA Platform) and 10 (demo reliability rules) before starting.

---

## Role and mission

You are a senior full-stack engineer integrating PDA Platform's narrative generation into Project Trueplan. The Brief view's content is the product's articulate voice: it reads the portfolio's state, synthesises what matters, and produces a board-ready summary in the register of an investment committee note.

Three things must be true of this integration:

1. **PDA Platform is backgrounded.** The user never sees it named. They see "Project Trueplan generated this brief." Credit PDA Platform only in the About page and the footer.
2. **PDA Platform is never on the demo's critical path.** Everything is cached. The narrative shown at demo time was pre-computed and stored. Live generation happens on a separate schedule and on explicit user action.
3. **Graceful degradation.** If PDA Platform is unavailable, the Brief view still renders, using a deterministic fallback narrative built from the same data. The fallback is obviously-written-by-a-machine prose; the PDA Platform narrative is demonstrably better. The quality gap is the argument for the integration.

---

## What you are building

### 9.1 Package structure

Narrative generation lives in a small new package:

```
packages/narrative/
├── src/
│   ├── index.ts
│   ├── pda-client.ts           // MCP client for PDA Platform
│   ├── prompt-templates.ts     // the system and user prompts
│   ├── fallback.ts             // deterministic narrative generator
│   ├── summariser.ts           // combines data into narrative input
│   ├── cache.ts                // deterministic cache-key computation
│   └── __tests__/
├── README.md
├── PROMPT_ENGINEERING.md       // how the prompts are designed and why
└── package.json
```

The package is **not** pure like the intelligence packages; it talks to PDA Platform over the network. But it has a clean boundary: given a summary of portfolio state, it returns narrative text. Caching, retry, and fallback handled internally.

### 9.2 MCP client

`pda-client.ts` wraps PDA Platform's MCP endpoint at `https://pda-platform-i33p.onrender.com/sse`.

```typescript
export interface PdaClientConfig {
  mcpUrl: string;
  timeoutMs?: number;              // default 30000
  retryAttempts?: number;          // default 2
  warmKeepEnabled?: boolean;       // default false; true during demo period
}

export class PdaClient {
  constructor(config: PdaClientConfig);

  async generateNarrative(input: NarrativeInput): Promise<Result<string, PdaError>>;
  async warmPing(): Promise<void>;    // cheap call to keep the Render instance warm
  async healthCheck(): Promise<boolean>;
}
```

Notes:

- Uses `@modelcontextprotocol/sdk` TypeScript SDK for the MCP connection.
- Connection is re-established per call (SSE connections don't persist cleanly for our use case).
- Timeout is aggressive because cold-starts on Render can be 20+ seconds; `timeoutMs` set to 30000 by default.
- Retry: once on network failure, never on protocol failure. Total max wall time ~60s.
- Errors are values (`Result` union), not exceptions.
- Warm-ping does the cheapest available PDA Platform tool call (typically a metadata fetch) to wake the Render instance.

### 9.3 The narrative input

The "portfolio state summary" that gets fed to PDA Platform. Kept compact so the prompt stays under token budgets and the cache key stays deterministic.

```typescript
export interface NarrativeInput {
  project: {
    code: string;
    name: string;
    description: string;
  };
  computedAt: Date;
  summary: {
    totalAssumptions: number;
    breachingNow: number;
    breachingWithin30d: number;
    breachingWithin90d: number;
    overallDriftScore: number;         // portfolio mean
    globalFragility: number;
    topDrivers: Array<{                 // up to 5
      code: string;
      description: string;
      driverScore: number;
    }>;
    mostAtRisk: Array<{                 // up to 5, by lead time asc
      code: string;
      description: string;
      leadTimeDays: number;
      severity: 'safe' | 'warning' | 'critical';
      confidence: 'HIGH' | 'MODERATE' | 'LOW';
    }>;
    externalSignals: Array<{            // the 3 live signals
      code: string;
      description: string;
      baselineValue: number;
      currentValue: number;
      driftPct: number;
      lastRetrievedAt: Date;
    }>;
  };
}
```

A helper `summariser.ts` builds this from the database. It's a pure function taking already-fetched rows.

### 9.4 Prompt templates

`prompt-templates.ts` contains the system and user prompts. These are the paper's prompt-engineering artefact; document them carefully in `PROMPT_ENGINEERING.md`.

#### System prompt

```
You are writing a board-ready assurance brief for a senior responsible owner
(SRO) of a UK government major programme. Your register is an investment
committee memo: concise, evidence-first, plain English, no jargon, no hedging
except where calibrated uncertainty is warranted.

Write in British English. Do not use em dashes. Use full stops and commas.

The brief has three paragraphs, in this order:

Paragraph 1: The position today. One or two sentences on the overall portfolio
state. Lead with the most material finding. Cite specific assumption codes
when a single assumption dominates.

Paragraph 2: The most actionable near-term issue. Identify the single
assumption whose breach is both most imminent and highest downstream exposure.
Say what is happening in plain terms, what the lead time is, and what the
cascade would touch.

Paragraph 3: The call to action. State specifically what the SRO should do
next: direct action, seek further information, commission a review. Be
concrete, time-bounded, and proportionate.

Total length: 180 to 260 words. Do not exceed 260 words. Do not include
headings. Do not include bullet points. Do not address the reader as "you".
Write in the third person, like an assurance note.
```

#### User prompt template

```
Project: {project.name} ({project.code})
Data computed: {computedAt}

Portfolio summary:
- {totalAssumptions} assumptions tracked
- {breachingNow} currently breaching tolerance
- {breachingWithin30d} projected to breach within 30 days
- Overall drift score: {overallDriftScore, percentage}
- System fragility: {globalFragility, percentage}

Top upstream drivers (assumptions whose drift cascades most widely):
{topDrivers, formatted list}

Most at-risk assumptions (shortest lead time first):
{mostAtRisk, formatted list with lead time, severity, and confidence}

Externally-anchored assumptions with live data:
{externalSignals, formatted list with baseline, current, drift%, retrieval time}

Write the brief now.
```

The system prompt is stable; the user prompt is templated per call.

### 9.5 Caching

`cache.ts` provides deterministic cache-key computation:

```typescript
export function computeCacheKey(input: NarrativeInput): string;
```

Hash (SHA-256, truncated to 16 chars) of a canonical JSON serialisation of the input, excluding `computedAt` (which changes every run but shouldn't invalidate the cache if the underlying state is the same).

Cache lookup and storage happen against the `briefs` table. The flow:

1. Compute cache key.
2. Query `briefs` for `(project_id, cache_key)`.
3. If found and `generated_at` is within TTL (default 6 hours), return cached narrative.
4. If not found or expired, call PDA Platform.
5. On success, insert the new brief into `briefs`.
6. On failure, call the fallback generator and mark the row as fallback-sourced.

Cache TTL is configurable. For the hackathon, set to 1 hour during the hack period (recompute runs nightly, so caches stay aligned with data refreshes) and 24 hours afterwards.

### 9.6 Fallback narrative

`fallback.ts` produces a deterministic narrative when PDA Platform is unavailable. The goal is a brief that is complete, accurate, and plain, but obviously template-generated.

```typescript
export function generateFallbackNarrative(input: NarrativeInput): string;
```

Implementation: a set of sentence templates that fill in values from `summary`. Example output:

> "The portfolio contains 47 assumptions. Three are currently breaching tolerance and five are projected to breach within thirty days. The overall drift score is 0.42. System fragility is 0.31.
>
> The most at-risk assumption is A015 Commercial, with a projected breach in 14 days at moderate confidence. If it breaches, cascade analysis indicates downstream impact on A003 Technical and A027 Infrastructure.
>
> Recommended action: convene an assurance review within fourteen days, prioritising A015 and its immediate upstream driver A039 Economic Inflation."

Not beautiful. Honest. Deterministic. Never wrong. It's the insurance policy.

Rendering-side, the Brief view shows a subtle badge ("Generated by Project Trueplan fallback" vs "Generated via narrative engine") so the audience knows which they're looking at. In demo conditions the cache will always have the PDA Platform version; the badge exists for honesty, not for theatre.

### 9.7 The API route

In `apps/web/app/api/brief-generate/route.ts`:

```typescript
export async function POST(request: Request) {
  // 1. Authenticate (anon is OK for demo project)
  // 2. Fetch portfolio state for demo project
  // 3. Build NarrativeInput via summariser
  // 4. Check cache; return if fresh
  // 5. Call PdaClient.generateNarrative
  // 6. On success, cache and return
  // 7. On failure, call fallback, cache flagged, return
  // 8. Revalidate /brief route
}
```

Runs on the Next.js server (not the client). Uses the service role key to write to the `briefs` table. Timeout matches `PdaClient` timeout plus a buffer.

### 9.8 Scheduled pre-generation

A Supabase edge function `regenerate-brief/` runs at 05:00 UTC nightly (after the nightly compute pipeline) and regenerates the brief. This ensures the cached narrative is always fresh without anyone clicking refresh.

During the hack period, supplement with a manual pre-generation script runnable on demand: `pnpm generate-brief`.

### 9.9 The Brief view rendering

Expand the Brief view skeleton from Prompt 7 to:

- Fetch the latest brief from `briefs` table via the data-access layer.
- Render the narrative as markdown (even if PDA Platform returns plain text, pass through `remark` for typographic niceties like smart quotes).
- Show the generation metadata at the top of the reading column: "Generated {relative time} · {PDA Platform | fallback} · Based on {totalAssumptions} assumptions".
- Show a discreet "Regenerate" button that triggers `/api/brief-generate`. Visible only to authenticated users; for the anon demo project, hide it (we don't want judges accidentally regenerating on stage).
- Print styles from Prompt 7 remain intact.

### 9.10 Warm-keep during demo

To ensure PDA Platform is warm during the live demo (even though we cache and don't call live), run a warm-ping every 10 minutes. Three mechanisms:

1. **Supabase edge function** `pda-warm-ping/` scheduled via pg_cron every 10 minutes during the hackathon period (toggled by env var `PDA_WARM_KEEP_ACTIVE`).
2. **Optional local script** `pnpm pda:warm-loop` that pings every 2 minutes; run on Ant's laptop during demo prep for belt-and-braces.
3. **A pre-demo health check** in `DEMO_CHECKLIST.md`: before walking on stage, run `pnpm pda:health` and confirm response in under 3 seconds.

### 9.11 Tests

- **Unit tests** for `summariser.ts`: given mocked database rows, produces the expected `NarrativeInput`.
- **Unit tests** for `computeCacheKey`: deterministic, excludes `computedAt`, produces stable 16-character keys.
- **Unit tests** for `generateFallbackNarrative`: complete output for various portfolio states, 3 paragraphs, British English, no em dashes (enforced in test).
- **Integration test** for `PdaClient` against a mock MCP server. Assert timeout behaviour, retry behaviour, error handling.
- **Integration test** against the real PDA Platform endpoint, gated by `CI_ALLOW_EXTERNAL_MCP=true`; verifies the actual narrative is returned and falls within the expected length range.
- **E2E test** of the Brief view: loads, shows cached narrative, clicks regenerate (if visible), asserts new narrative appears.

Coverage target 75%.

### 9.12 PROMPT_ENGINEERING.md

Paper appendix quality. Cover:

1. **Design intent.** What register the brief is in and why ("board-ready investment committee memo"). The decision to mandate three specific paragraphs with specific purposes.
2. **Word-count constraints.** Why 180-260 words specifically. Reader attention data; the briefs people actually read tend to be in this band. Citing a source here is bonus, not required.
3. **Register directives.** British English, no em dashes, no bullets, no headings, third person. Rationale for each constraint.
4. **User-prompt structure.** Why we pre-format the data into a hierarchical list rather than a free-text dump. Pre-formatting gives the model reliable structure to reason over; cf. "chain of thought in structured prompts" literature.
5. **Caching strategy.** Why cache on input hash; why exclude `computedAt`. Why 1-hour TTL during the hack.
6. **Fallback philosophy.** The fallback is not a failure mode, it's a floor. The gap between fallback and PDA Platform narrative is itself a demonstrable value proposition for the integration.
7. **Validation.** How we sanity-check PDA Platform outputs: word count within range, no banned phrases, no em dashes, no fabricated assumption codes. These checks happen post-generation; on violation the brief falls back.

### 9.13 Documentation

- `README.md` for the package.
- `PROMPT_ENGINEERING.md` as above.
- Update `apps/web/DEMO_CHECKLIST.md` with the warm-keep steps and the pre-demo regeneration step.
- Update `supabase/functions/README.md` with the new `regenerate-brief` and `pda-warm-ping` functions.

---

## Out of scope

- Generating briefs for multiple projects (demo project only).
- An authoring interface for editing briefs manually (deferred).
- Versioning of briefs with diffs (deferred).
- Multiple narrative styles (executive, technical, public) - single style for the hack.

---

## Definition of done

- [ ] `packages/narrative` structure matches 9.1
- [ ] `PdaClient` connects to PDA Platform MCP endpoint and generates narrative
- [ ] Health check and warm-ping work and are used
- [ ] `summariser.ts` builds `NarrativeInput` from database rows
- [ ] Prompt templates documented in `PROMPT_ENGINEERING.md`
- [ ] Cache hit/miss logic works correctly against `briefs` table
- [ ] Fallback narrative complete, deterministic, British English, no em dashes
- [ ] `/api/brief-generate` route works end-to-end
- [ ] Brief view renders cached narrative, shows generation metadata
- [ ] `regenerate-brief` edge function deployed and scheduled
- [ ] `pda-warm-ping` function deployed (gated by env var)
- [ ] Pre-generation script (`pnpm generate-brief`) works
- [ ] Tests pass with ≥75% coverage
- [ ] All four views (Horizon, Cascade, Trace, Brief) now function end-to-end
- [ ] Demo checklist updated
- [ ] PR opened, reviewed against `ARCHITECTURE.md` sections 9.5 and 10

---

## Self-check before PR

1. If PDA Platform is unavailable during the demo, does the Brief view still render a meaningful narrative from fallback? Verify by disabling the endpoint and loading the page.
2. Is the cached narrative measurably better than the fallback? Print both side by side; the gap should be obvious.
3. Does the Brief view print correctly as a one-page document? Test physically or with a browser print preview.
4. Is PDA Platform backgrounded in the UI (no logos, no branded references in the product chrome)?
5. Does the warm-ping strategy actually keep the Render instance warm? Check the PDA Platform response time after a ping and again 10 minutes later; both should be fast.
6. Does the generation metadata tell the user the truth (PDA Platform vs fallback) without making a theatrical point of it?

---

*End of Prompt 9. The tenth and final prompt is the runbook and Laura's pack, produced in the next message.*
