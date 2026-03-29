# Development Guide

## Available Scripts

| Script               | Description                                            |
| -------------------- | ------------------------------------------------------ |
| `pnpm dev`           | Start Vite dev server with HMR                         |
| `pnpm build`         | Type-check and build for production (`dist/`)          |
| `pnpm check`         | Run Biome lint + format and auto-fix                   |
| `pnpm lint`          | Run Biome linter only                                  |
| `pnpm format`        | Run Biome formatter (writes files)                     |
| `pnpm lint:md`       | Lint Markdown files with markdownlint-cli2             |
| `pnpm fmt`           | Format all files with dprint                           |
| `pnpm format:md`     | Format Markdown files with dprint                      |
| `pnpm generate-icon` | Generate PNG icon from text (see [icons.md](icons.md)) |

## Toolchain

| Tool                                                                                                   | Purpose                                    |
| ------------------------------------------------------------------------------------------------------ | ------------------------------------------ |
| [Vite](https://vite.dev)                                                                               | Build tool and dev server                  |
| [CRXJS](https://crxjs.dev/vite-plugin)                                                                 | Chrome extension HMR and manifest bundling |
| [React 19](https://react.dev)                                                                          | UI framework                               |
| [TypeScript](https://www.typescriptlang.org)                                                           | Type safety                                |
| [Tailwind CSS v4](https://tailwindcss.com)                                                             | Utility-first CSS                          |
| [Biome](https://biomejs.dev)                                                                           | Linting and formatting (JS/TS/JSON/CSS)    |
| [dprint](https://dprint.dev)                                                                           | Formatting for Markdown and YAML           |
| [Husky](https://typicode.github.io/husky/) + [lint-staged](https://github.com/lint-staged/lint-staged) | Pre-commit hooks                           |
| [mise](https://mise.jdx.dev/)                                                                          | Node.js and pnpm version management        |

## Pre-commit Hooks

Husky runs lint-staged on every commit:

- **JS/TS/JSON/CSS** — `biome check --write` (lint + format)
- **Markdown** — `markdownlint-cli2 --fix` then `dprint fmt`
- **YAML** — `dprint fmt`

## Vite Dev Server

The dev server is fixed to port **5173** (`server.strictPort: true`). CRXJS uses this port for
HMR WebSocket connections. The `host_permissions` in the manifest (development mode only) allows
the extension to connect to `http://localhost:5173/*`.

Do not change the port without also updating the `host_permissions` entry in `src/manifest.ts`.

## TypeScript Configuration

| File                 | Covers                                      |
| -------------------- | ------------------------------------------- |
| `tsconfig.json`      | Project references root                     |
| `tsconfig.app.json`  | All `src/` files (includes `@types/chrome`) |
| `tsconfig.node.json` | Vite config and `scripts/`                  |

## Build Output

`pnpm build` outputs the packaged extension to `dist/`. Load this folder in Chrome via
**Extensions → Developer mode → Load unpacked** for production testing.

For Chrome Web Store submission, zip the `dist/` directory.

## Adding New Pages

1. Create a directory under `src/pages/<page-name>/`.
2. Add `index.html`, `main.tsx`, and `App.tsx` (copy from an existing page).
3. Register the page in `src/manifest.ts` under the appropriate manifest key.
4. If it is a DevTools panel, also add it as a Rollup input in `vite.config.ts`.
