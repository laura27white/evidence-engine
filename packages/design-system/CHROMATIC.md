# Chromatic visual regression

Chromatic snapshots every Storybook story on every PR so a design change is caught at review time rather than after merge.

## One-time setup

1. Create a Chromatic account at <https://www.chromatic.com> and link the the project repository repo.
2. Chromatic asks what kind of project; choose **Storybook**.
3. Copy the project token into the project repository on GitHub: Settings → Secrets and variables → Actions → New repository secret → name `CHROMATIC_PROJECT_TOKEN`.
4. Next PR that touches `packages/design-system/**` will trigger the Chromatic job.

## How the CI job is wired

The `.github/workflows/ci.yml` file has a `Chromatic` job gated on `secrets.CHROMATIC_PROJECT_TOKEN`:

- **When the secret is present.** The job runs `pnpm chromatic` with the token, uploads stories, and waits for the Chromatic API. Changes show up on the PR as a commit status linking to the Chromatic build URL; approved changes baseline themselves on merge.
- **When the secret is missing.** The job runs `echo` and exits zero with a warning. The repo stays buildable without the token, and the rest of CI is unaffected.

This matches the Prompt 2 spec: "optional but wired".

## Running locally

You can snapshot from your machine once the token is in your shell:

```bash
export CHROMATIC_PROJECT_TOKEN=chpt_xxxxxxxxxxxx
pnpm --filter @tp/design-system chromatic
```

The script in `package.json` passes `--exit-zero-on-changes` so a visual diff does not fail the local invocation; review the build URL in the output.

## What Chromatic does not replace

- **Accessibility.** Chromatic catches pixel diffs, not axe violations. The `@storybook/addon-a11y` addon flags those in the Storybook UI and in the dedicated axe-core Playwright test.
- **Interaction.** Chromatic captures a static snapshot per story. Interaction tests live in the component `*.test.tsx` files.

## Budget notes

The free Chromatic tier caps at 5,000 snapshots per month on private repos. Sixteen components with three to five stories each, re-snapshotted on every PR, lands comfortably inside that cap for a hackathon project.
