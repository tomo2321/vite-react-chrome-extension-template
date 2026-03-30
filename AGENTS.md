# AGENTS.md — Template Repository

This is a **Chrome extension template** for building extensions with Vite, React, and TypeScript.
This file is for contributors developing the template itself.

## Setup

```bash
mise install                           # Provision Node.js and pnpm versions
pnpm install                           # Install dependencies
pnpm exec playwright install chromium  # Install Chromium for Storybook/Vitest browser tests
```

Or use the convenience script:

```bash
mise install
pnpm setup
```

## Commands

```bash
pnpm dev              # Start dev server with HMR
pnpm build            # Production build → dist/
pnpm check            # Lint + format (Biome) — run after every change
pnpm lint:md          # Lint Markdown
pnpm fmt              # Format all files (dprint)
pnpm test             # Run all tests (unit + Storybook browser)
pnpm test:watch       # Run unit tests in watch mode
pnpm test:coverage    # Run unit tests with v8 coverage report
pnpm test:storybook   # Run Storybook story tests only (real Chromium)
pnpm storybook        # Start Storybook dev server on port 6006
pnpm build-storybook  # Build static Storybook → storybook-static/
```

## Testing

### Unit & component tests (`unit` project)

- Framework: **Vitest** with **jsdom** environment
- Includes: `src/**/*.{test,spec}.{ts,tsx}` and `src/**/*.snapshot.test.tsx`
- Setup: `src/test/setup.ts` — installs jest-dom matchers and a `chrome.*` API mock
- Chrome mock: `src/test/chrome-mock.ts` — all stubs are `vi.fn()` (assertable + overridable)
- Coverage output: `coverage/` — reporters: `text`, `text-summary`, `json`, `json-summary`, `html`, `lcov`
  - `coverage/coverage-summary.json` — machine-readable totals (good for agents)
  - `coverage/coverage-final.json` — line-level detail per file

### Storybook story tests (`storybook` project)

- Framework: **Storybook 10** + **`@storybook/addon-vitest`** running in headless Chromium via Playwright
- Each `*.stories.tsx` file is run as a browser test — smoke test for `Default`, play functions for interaction stories
- Run in isolation: `pnpm test:storybook`

### Snapshot tests

Each component has a co-located `App.snapshot.test.tsx`. To update snapshots after intentional UI changes:

```bash
pnpm vitest run -u --project=unit
```

## Code Style

- Biome enforces linting and formatting for JS/TS/JSON/CSS
- dprint formats Markdown and YAML
- Run `pnpm check` before committing — pre-commit hooks enforce this automatically

## Template Guidelines

- All sample source files must remain functional and buildable (`pnpm build` must pass)
- All tests must pass (`pnpm test`) after any change
- New extension features must be gated behind a feature flag in `src/manifest.ts`
- Documentation in `docs/` is for extension developers using the template, not for template
  contributors — keep it accurate relative to the sample source code
- `AGENTS.new-project.md` is the `AGENTS.md` for new projects created from this template;
  keep it in sync with any changes to the project structure or commands
