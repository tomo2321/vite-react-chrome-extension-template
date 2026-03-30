# Vite + React Chrome Extension Template

A batteries-included template for building Chrome extensions with **Vite**, **React 19**,
**TypeScript**, and **Tailwind CSS v4**.

## Features

- **TypeScript manifest** — define your `manifest.json` in TypeScript with full type safety
- **Feature flags** — enable or disable popup, background service worker, content scripts, side
  panel, options page, DevTools panel, and URL overrides from a single object
- **HMR in content scripts and extension pages** — powered by [CRXJS](https://crxjs.dev/vite-plugin)
- **Tailwind CSS v4** — utility-first CSS available in all pages and content scripts
- **In-page routing** — side panel uses `MemoryRouter` from React Router v7
- **Icon generator** — CLI script to generate PNG icons from text labels
- **Biome + dprint** — fast linting and formatting with pre-commit hooks via Husky
- **Vitest** — unit and component tests with jsdom, 100% coverage on all example components
- **Storybook 10** — component development and browser-based story tests via Playwright

## Included Examples

| Component            | Location                          | Demonstrates                              |
| -------------------- | --------------------------------- | ----------------------------------------- |
| Popup                | `src/pages/popup/`                | Basic browser action popup                |
| Options              | `src/pages/options/`              | Settings page with `chrome.storage.local` |
| Side Panel           | `src/pages/sidepanel/`            | In-panel routing with MemoryRouter        |
| DevTools Panel       | `src/pages/devtools/`             | Custom DevTools panel                     |
| New Tab Override     | `src/pages/chrome-url-overrides/` | Replaces Chrome's new tab page            |
| Background Worker    | `src/background/`                 | Service worker with `onInstalled` handler |
| Plain Content Script | `src/content/example.com/`        | Script injected into example.com          |
| Floating Widget      | `src/content/apps/floating/`      | Draggable React overlay on Yahoo Japan    |
| Sidebar App          | `src/content/apps/sidebar/`       | Resizable React sidebar on Google         |

## Quick Start

```bash
# 1. Install tool versions (Node.js + pnpm)
mise install

# 2. Install dependencies + Playwright browser for Storybook tests
pnpm setup

# 3. Start dev server
pnpm dev
```

Then open `chrome://extensions`, enable **Developer mode**, click **Load unpacked**, and select
the `dist/` folder.

## Testing

```bash
pnpm test              # Run all tests (unit + Storybook browser)
pnpm test:coverage     # Unit tests with coverage report
pnpm test:storybook    # Storybook story tests only (headless Chromium)
pnpm storybook         # Start Storybook dev server on :6006
```

All example components ship with:

- **Unit tests** — behaviour and interaction (`App.test.tsx`)
- **Snapshot tests** — DOM regression (`App.snapshot.test.tsx`)
- **Stories** — component workshop + browser-based smoke/interaction tests (`App.stories.tsx`)

Coverage is reported to `coverage/coverage-summary.json` (machine-readable) and `coverage/index.html`
(interactive). Update snapshots after intentional UI changes with
`pnpm vitest run -u --project=unit`.

## Documentation

- [Getting started](docs/getting-started.md) — setup, dev server, production build
- [Project structure](docs/project-structure.md) — directory layout and conventions
- [Manifest and feature flags](docs/manifest-and-features.md) — configure the extension manifest
- [Content scripts](docs/content-scripts.md) — add scripts injected into web pages
- [Extension pages](docs/pages.md) — popup, options, side panel, DevTools, URL overrides
- [Icons](docs/icons.md) — generate PNG icons with the built-in script
- [Development guide](docs/development.md) — scripts, toolchain, build output

## For AI Coding Agents

`AGENTS.new-project.md` is the `AGENTS.md` for new projects created from this template.
After setting up your extension, swap the files:

```bash
rm AGENTS.md
mv AGENTS.new-project.md AGENTS.md
```

See [docs/getting-started.md](docs/getting-started.md) for the full setup checklist.

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
