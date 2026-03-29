# AGENTS.md — Chrome Extension Agent Guide

This is a **Chrome extension** built with **Vite**, **React**, and **TypeScript**.
See [docs/index.md](docs/index.md) for documentation and [docs/rules.md](docs/rules.md) for coding rules.

## Setup

```bash
mise install   # Provision Node.js and pnpm versions
pnpm install   # Install dependencies
```

## Commands

```bash
pnpm dev       # Start dev server with HMR
pnpm build     # Production build → dist/
pnpm check     # Lint + format (Biome) — run after every change
pnpm lint:md   # Lint Markdown
pnpm fmt       # Format all files (dprint)
```

## Code Style

- Biome enforces linting and formatting for JS/TS/JSON/CSS
- dprint formats Markdown and YAML
- Run `pnpm check` before committing — pre-commit hooks enforce this automatically
