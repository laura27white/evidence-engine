# Project Trueplan: Build Runbook

**Audience:** Laura White, directing Claude Code to build Project Trueplan for MPA Challenge 5.

**Purpose:** Turn ten prompts into a three-week build with minimum friction. Covers environment, workflow, pause/resume patterns, approvals, troubleshooting, and the pre-hack checklist.

---

## 1. Before you start: the environment decision

You asked this two days ago. I gave you three options and you paused. Now that the prompts exist I can give you a more specific recommendation.

**Use GitHub Codespaces, billed to your personal quota (not the author's personal org).**

Here's why, concretely, for this project:

1. You already have Claude Code installed; Claude Code inside Codespaces works the same as locally.
2. Everything the prompts need is Linux-native (pnpm, Supabase CLI with Docker, Deno for edge functions, Playwright). Codespaces ships a Linux environment with all of this preinstalled or one apt-get away.
3. The repo is private under the maintainer, so you need to flip one org setting to route billing to your personal 60-hours/month free allowance. One-time setup.
4. If your laptop dies, you open the Codespace on another device and keep going. The build state lives in the cloud.
5. No Windows-native pain (symlinks, line endings, Husky).
6. If you overshoot the free quota (unlikely) the cost is about 18 cents per hour, max £10 across the whole build.

**Setup, step by step:**

1. Go to `github.com/organizations/<your-org>/settings/codespaces` (or whatever your org slug is; check via `gh api user/orgs --jq '.[].login'`).
2. Under Policies, allow members to use Codespaces.
3. Under Billing, ensure "Members can use personal GitHub quotas" is enabled, or set a small spending limit (£5) as a safety net.
4. Create the repo: `gh repo create <your-org>/project-trueplan --private --clone=false`. Don't clone it locally.
5. On github.com, open the empty repo. Click the green Code button → Codespaces → Create codespace on main.
6. Wait ~90 seconds. You now have a full dev environment in the browser (VS Code interface) or in the desktop VS Code if you prefer (Remote: Codespaces extension).
7. In the Codespace terminal, open Claude Code: `claude` (or whatever your alias is).

If you prefer not to use Codespaces after all, the build works on Windows native too; you'll just hit more papercuts. See section 8 for Windows-specific fixes.

---

## 2. How to actually run the prompts

Each prompt is a self-contained runbook for Claude Code. The shape of every session is:

1. Open Claude Code in the Codespace terminal.
2. Paste the prompt's full content (the markdown file).
3. Claude Code acknowledges and proposes a plan before writing any code.
4. You approve or adjust the plan.
5. Claude Code executes: creates branch, writes files, runs tests, commits, pushes, opens PR.
6. You review the PR on github.com, merge if satisfied, close the Claude Code session.
7. Move to the next prompt.

That's the whole loop. One prompt per session. One feature branch per prompt. One PR per prompt. Never skip the plan-approval step; it's your chance to catch scope drift before Claude Code writes 2000 lines of wrong code.

**The wave structure:**

- **Wave 1 (day 1):** Prompt 0. One session. No dependencies.
- **Wave 2 (days 2-4):** Prompts 1, 2, 3 in parallel. Three separate Claude Code sessions, one per prompt, each on its own feature branch off `main`. They don't conflict.
- **Wave 3 (days 5-8):** Prompts 4, 5, 6 in parallel. Same pattern. Depends on Waves 1 and 2 merged.
- **Wave 4 (days 9-14):** Prompts 7, 8, 9 sequential. Depends on everything before.
- **Week 3 (days 15-21):** Polish, rehearsal, paper draft, demo prep.

You can compress or expand depending on how much time you're putting in per day. The wave structure is the dependency shape; the calendar is flexible.

---

## 3. Day-to-day workflow

For each prompt session:

### Start

```bash
# In Codespace terminal
git status                      # confirm clean main
git pull origin main            # confirm up to date
claude                          # open Claude Code
```

Paste the prompt content. Wait for Claude Code to acknowledge and propose a plan.

### The approval step

Claude Code should propose:

- The feature branch name it will create
- The files it will create or modify
- The test strategy
- The commit plan
- What it's going out of scope for

If any of those look wrong, push back before it starts work. Example:

> "Hold. The prompt says run in parallel with Prompts 2 and 3, but Prompt 1 hasn't been merged yet. Either we wait, or we use the stub path described in the prompt's soft-dependency section. Which?"

Claude Code is good at plans when asked. Don't skip this.

### Mid-session

Let it work. It will write files, run tests, run linters, iterate on failures. Occasionally it will pause and ask a question. Answer succinctly; don't re-explain the prompt.

Useful things to check mid-session:

- Are the git commits authored by `laurawhite <laura27white@gmail.com>`? If not, stop it and fix the identity.
- Are commits following conventional format? If not, stop it and fix.
- Are tests being written alongside code? If not, stop it.

### End of session

Claude Code should:

1. Run the full CI suite locally (`pnpm lint && pnpm typecheck && pnpm test && pnpm build`).
2. Push to the feature branch.
3. Open a PR via `gh pr create` with a description that answers the prompt's self-check questions.

You review the PR on github.com. Things to specifically check:

- All CI checks green (or, if any failed, does the PR description explain why and propose a follow-up).
- PR description answers the self-check questions honestly.
- No em dashes (CI catches this; verify the check ran).
- No real secrets committed (`.env.local` not in the diff).
- Files in the expected places per the prompt's structure.

Merge when satisfied. Delete the feature branch (GitHub's button). Pull `main` locally. Done.

### Resuming a session

If a session gets interrupted (timeout, you step away, connection drops), resume with:

> "Resume work on the Prompt 2 session. The last commit was {hash}. Continue from there, following the remaining definition-of-done items."

Claude Code will fetch the branch, look at the commit history, and pick up where it stopped.

---

## 4. Handling pause points

### If a prompt's definition-of-done has items you can't complete today

Open the PR anyway, marked as draft, with a clear list of what's done and what's not. Merge partially if the unfinished items are truly later-work (e.g. Chromatic can be wired later if you don't have a token yet). Don't let perfect block progress.

### If you hit a blocker that needs external input

Document it in the PR description. Common examples:

- ONS API schema shifted; need to update Zod schema. Decision needed: update now or defer.
- PDA Platform returning malformed responses. Fallback works; PDA needs investigation.
- Storybook Chromatic token not yet provisioned.

Don't let these block merging the rest of the work.

### If Claude Code gets stuck

Sometimes it loops on a tricky test or a Next.js quirk. After two failed attempts, stop it and either:

- Give it a specific hint ("the issue is that Next.js 14 App Router doesn't allow `use client` and `export const revalidate` in the same file; split them.")
- Tell it to commit its progress with a TODO and move on to the next definition-of-done item.

Don't let it burn hours on one item. The prompts are large enough that getting 90% of each is better than getting 100% of some and 0% of others.

---

## 5. Inter-prompt coordination

### When Prompt 3 depends on Prompt 1 (schema)

Option A: wait for Prompt 1 to merge, then start Prompt 3.

Option B: start Prompt 3 with the stub path documented in the prompt (in-memory store for writer). Merge Prompt 3 with a TODO to swap the stub for real Supabase writes once Prompt 1 merges. Then file a small follow-up PR to swap.

Option B is usually better for calendar efficiency, but it requires you to remember to file the follow-up. Keep a checklist.

### When a later prompt needs to adjust an earlier one

Sometimes Prompt 7 will discover a field missing from the Prompt 1 schema. Handle via a small migration PR. Don't modify Prompt 1's original migration. Add a new migration (`0006_add_missing_field.sql`) and regenerate types.

### The em-dash rule keeps biting

CI catches it, but the fix is tedious. Tell Claude Code explicitly at the start of each session:

> "Non-negotiable: no em dashes anywhere in code, comments, UI copy, or docs. The CI job will fail if any appear. Use colons, commas, or full stops instead."

That gets it right the first time in most sessions.

---

## 6. Milestone checkpoints

At the end of each wave, pause and verify before starting the next.

### After Wave 1 (Prompt 0)

- Repo exists, private, on author's personal org.
- CI pipeline runs green on an empty-but-scaffolded repo.
- `pnpm dev` starts the Next.js app locally in the Codespace.
- `.env.example` is complete; your local `.env.local` has the Supabase keys.

### After Wave 2 (Prompts 1, 2, 3)

- Supabase local instance running. All migrations applied.
- `pnpm db:import-hpo` loads the 47 assumptions.
- `pnpm db:seed-drift` populates historical measurements.
- Storybook builds with all 16+ components rendered and accessible.
- External data adapters fetch real ONS/BoE/gov.uk data without errors.

### After Wave 3 (Prompts 4, 5, 6)

- All three intelligence packages pass tests at 95% coverage.
- Each has a METHODOLOGY.md draft readable as paper methodology.
- Running the empirical validation on A039/A040/A041 produces plausible numbers.

### After Wave 4 (Prompts 7, 8, 9)

- All four views render with real data in the Codespace browser preview.
- Deployed to Netlify at a public-but-unlisted URL.
- Lighthouse scores >=90 performance, >=95 accessibility on every page.
- Brief view loads cached narrative within 1 second.

If any milestone fails, stop and fix before the next wave. The waves are designed so fixes are cheap if caught at the boundary and expensive if let through to later work.

---

## 7. The final week: polish, rehearsal, demo prep

Week 3 has no prompts. It's the week where plans stop and judgement takes over.

### Day-by-day (approximate)

- **Day 15-16: Polish the Trace view relentlessly.** It's the hero. Spend an afternoon on the live timestamp, the tooltip legibility, the forecast cone gradient. Small touches.
- **Day 17: Demo rehearsal with Laura (first run).** Full three-minute pitch. Identify what trips her up.
- **Day 18: Fix what tripped her up. Second rehearsal.**
- **Day 19: Loom recording for demo insurance.** Record a perfect three-minute demo as a backup for live-demo failure.
- **Day 20: Pre-flight checks.** Pre-compute all data. Warm PDA Platform. Verify timestamps. Verify Netlify deploy.
- **Day 21 (hack day): Deliver.**

### What to avoid in week 3

- Adding features. You won't finish them well.
- Rewriting things that work. Resist the temptation.
- Changing the demo structure based on last-minute feedback. If Laura says "I don't like the cascade view," that's late feedback; work around it (e.g. skip it in her walkthrough) rather than rebuild it.

---

## 8. Environment troubleshooting

### Codespace won't start

- Check your personal quota: `gh codespace list` shows running ones; delete old ones.
- Check org policy: personal Codespaces must allow personal billing.

### `pnpm install` fails with EACCES

Codespaces rare, but if it happens: `sudo chown -R $USER:$USER node_modules .pnpm-store`.

### Supabase CLI fails to start

Docker Desktop must be running in the Codespace. It is by default. If not: `sudo service docker start`.

### Next.js build fails with font loading

`next/font/google` requires internet access at build time. Codespaces has it. If Next.js still fails, check that the font family strings are exact matches for Google Fonts names.

### Playwright tests fail locally but pass in CI

Usually: playwright browsers not installed. Run `pnpm exec playwright install`.

### If you end up on Windows native anyway

- Set `git config --global core.autocrlf input` in the repo.
- Install `pnpm` via Corepack: `corepack enable && corepack prepare pnpm@latest --activate`.
- Use PowerShell 7, not CMD or older PowerShell.
- Enable Developer Mode in Windows Settings for symlinks to work without admin.
- Install Docker Desktop with WSL2 backend even if you're not using WSL; Supabase CLI needs it.
- Expect occasional hangs on Playwright; `pnpm test:e2e --repeat-each=2` often masks them.

---

## 9. The demo-day checklist

The morning of the hack:

- [ ] Netlify build green, deployed to `project-trueplan-demo.netlify.app` or similar
- [ ] Supabase data fresh (run `pnpm generate-brief` + `supabase:trigger-recompute`)
- [ ] PDA Platform responsive (run `pnpm pda:health`; <3s response)
- [ ] Trace view `retrievedAt` timestamp is fresh (< 2 minutes old)
- [ ] Loom recording uploaded to a public URL as demo insurance
- [ ] Laptop charged, backup laptop charged
- [ ] Browser in incognito mode (no extensions interfering); bookmark the demo URL
- [ ] Three tabs pre-opened: Horizon, Trace for A039, Cascade for A039
- [ ] Screen sharing pre-tested on the hack venue's AV
- [ ] Network tested; personal 5G hotspot as backup
- [ ] Your contact for the organising team noted in case of AV failure
- [ ] Laura's presenter pack with her in print and on her phone
- [ ] Spare clean USB stick with the Loom recording, in case we need to screen it directly

---

## 10. What "done" looks like

You will know the build is ready when all of the following are true:

1. A non-technical observer can navigate all four views and understand what they are seeing.
2. Laura has run through the three-minute pitch three times and lands it cleanly.
3. A hostile question ("why not Excel?" or "how do we know this isn't made up?") has a crisp answer, practised.
4. The repo is tidy; a peer reviewer could read the code.
5. The paper methodology sections are drafted well enough that you know what you'll write up afterwards.
6. You have slept the night before the hack.

The last one is not a joke.

---

*End of runbook.*
