# Rules

1. **Manifest changes go in `src/manifest.ts`** — never write a raw `manifest.json`.
2. **Use feature flags** (`export const features`) to enable/disable sections and their permissions.
3. **Do not add `css` to content script manifest entries** — CRXJS injects imported CSS automatically.
4. **Use `toExtUrl()`** (`src/shared/utils/url.ts`) for all asset paths inside content scripts.
5. **Register each DevTools panel HTML** as a Rollup input in `vite.config.ts`.
6. **Use `MemoryRouter`** (not `BrowserRouter`) for routing inside the side panel.
7. **Run `pnpm build && pnpm check`** after every change to verify correctness.
