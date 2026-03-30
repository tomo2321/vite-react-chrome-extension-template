# AGENTS.md — Chrome Extension Agent Guide

This is a **Chrome extension** built with **Vite**, **React**, and **TypeScript**.
See [docs/index.md](docs/index.md) for documentation and [docs/rules.md](docs/rules.md) for coding rules.

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

### Unit & component tests

- Run with `pnpm test` or `pnpm test:watch`
- Setup file: `src/test/setup.ts` — installs jest-dom matchers + `chrome.*` API mock
- Chrome mock: `src/test/chrome-mock.ts` — use `vi.mocked(chrome.storage.local.get).mockImplementation(...)` to override in tests

### Coverage

- Run with `pnpm test:coverage` — output in `coverage/`
- `coverage/coverage-summary.json` — machine-readable totals
- `coverage/coverage-final.json` — line-level detail per file

### Snapshot tests

Each component has a co-located `App.snapshot.test.tsx`. Update after intentional UI changes:

```bash
pnpm vitest run -u --project=unit
```

### Storybook story tests

- Each `*.stories.tsx` is run as a browser test in headless Chromium
- Run with `pnpm test:storybook`

## Code Style

- Biome enforces linting and formatting for JS/TS/JSON/CSS
- dprint formats Markdown and YAML
- Run `pnpm check` before committing — pre-commit hooks enforce this automatically
