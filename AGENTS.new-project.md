# AGENTS.md — Chrome Extension Agent Guide

This is a **Chrome extension** built with **Vite**, **React**, and **TypeScript**.
See [docs/index.md](docs/index.md) for documentation and [docs/rules.md](docs/rules.md) for coding rules.

## Setup

```bash
mise install                           # Provision Node.js, pnpm and uv versions
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
pnpm mcp:sync         # Regenerate agent MCP configs from mcp-servers.json
```

## Testing

See [docs/testing.md](docs/testing.md) for full details. Key points:

- Chrome mock: `src/test/chrome-mock.ts` — use `vi.mocked(chrome.*)` to override in tests; mocks reset before each test automatically
- Coverage files: `coverage/coverage-summary.json` (totals) and `coverage/coverage-final.json` (line-level)
- Update snapshots after intentional UI changes: `pnpm vitest run -u --project=unit`

## MCP Servers

MCP servers are defined once in `mcp-servers.json`. `pnpm mcp:sync` generates the per-agent configs
(`.mcp.json`, `.cursor/mcp.json`, `.vscode/mcp.json`, `.gemini/settings.json`, `.codex/config.toml`,
`opencode.json`). It runs automatically on `pnpm install` and after `git checkout` / `git merge`.

- Never edit the generated files' MCP sections — edit `mcp-servers.json` and run `pnpm mcp:sync`
- Personal overrides go in the git-ignored `mcp-servers.local.json`
- See [docs/mcp.md](docs/mcp.md)

## Code Style

- Biome enforces linting and formatting for JS/TS/JSON/CSS
- dprint formats Markdown and YAML
- Run `pnpm check` before committing — pre-commit hooks enforce this automatically
