# Test fixtures

## How fixtures are wired

Unit tests use **MSW (Mock Service Worker)** to stub upstream HTTP responses. There are no recorded fixture files on disk at present; the stubs are inline in each adapter's `__tests__/*.test.ts` file. This keeps the test data visible at the assertion site and avoids a separate fixture-to-assertion lookup.

Each adapter test file documents the upstream shape it tests against. For example, `src/adapters/ons/__tests__/cpi.test.ts` stubs the ONS Beta API with a response matching the current April 2026 shape:

```json
{
  "description": { "title": "CPI ANNUAL RATE", "unit": "%", "cdid": "D7G7" },
  "months": [
    { "date": "2025 SEP", "value": "2.6" },
    { "date": "2025 OCT", "value": "2.5" },
    { "date": "2025 NOV", "value": "" }
  ]
}
```

## How to refresh a fixture when upstream changes

1. Record a fresh response by running the integration test with `CI_ALLOW_NETWORK=1`:
   ```bash
   pnpm --filter @tp/external-data test:integration
   ```
   The integration test logs the raw response. Copy it into the corresponding unit test's inline stub.
2. Update the Zod schema if the response shape changed.
3. Re-run unit tests: `pnpm --filter @tp/external-data test`.
4. Commit the updated test file and the schema change together.

## Licensing of recorded responses

All three upstream sources (ONS, BoE, gov.uk) publish under the Open Government Licence v3.0 or equivalent. Committing recorded responses to the repo is permitted with attribution, which is already carried by `ExternalSignal.sourceUrl` and the METHODOLOGY.md attribution statement. If we later move fixtures to JSON files on disk, we add an OGL attribution header to each file.

## Why no full fixture files yet

The inline approach keeps test readability high for the ~10 MSW stubs we have today. Once the deferred leading-indicator, World Bank, and BoE OIS forward adapters land, the test suite grows past the point where inlining is ergonomic; at that point the convention is:

```
packages/external-data/src/adapters/<source>/__tests__/fixtures/
├── cpi-d7g7-2026-04.json   # ONS snapshot
├── bank-rate-2026-04.csv   # BoE snapshot
└── policy-paper-count-2026-04.json  # gov.uk snapshot
```

Filenames include the snapshot month so reviewers can see how current the captured data is. OGL attribution comment at the top of each JSON file.
