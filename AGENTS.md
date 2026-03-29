# AGENTS.md — Template Repository

This is a **Chrome extension template** for building extensions with Vite, React, and TypeScript.
This file is for contributors developing the template itself.

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

## Template Guidelines

- All sample source files must remain functional and buildable (`pnpm build` must pass)
- New extension features must be gated behind a feature flag in `src/manifest.ts`
- Documentation in `docs/` is for extension developers using the template, not for template
  contributors — keep it accurate relative to the sample source code
- `AGENTS.new-project.md` is the `AGENTS.md` for new projects created from this template;
  keep it in sync with any changes to the project structure or commands
