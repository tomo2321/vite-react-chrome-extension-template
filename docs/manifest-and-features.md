# Manifest and Feature Flags

The Chrome extension manifest is defined in TypeScript at `src/manifest.ts` using
[CRXJS's `defineManifest`](https://crxjs.dev/vite-plugin). This lets you use imports,
environment variables, and TypeScript types directly in the manifest.

## Feature Flags

```ts
export const features = {
  action: true, // Browser action (popup)
  background: true, // Background service worker
  content_scripts: true, // Content scripts
  side_panel: true, // Chrome Side Panel
  options: true, // Options UI
  devtools: true, // DevTools page and panel
  chrome_url_overrides: true, // Override newtab / bookmarks / history
};
```

Set a flag to `false` to completely omit that manifest section — including its permissions —
from the built extension. This keeps the manifest minimal and avoids unnecessary permission
prompts or Chrome Web Store rejections.

## Permissions

Permissions are declared in `src/manifest.ts` and derived from the feature flags. When you add
a feature that requires additional permissions, add them to the `permissions` array:

```ts
const permissions: string[] = Array.from(
  new Set([
    ...(features.side_panel ? ["sidePanel"] : []),
    ...(features.options ? ["storage"] : []),
    // Add your permissions here, gated on the relevant feature flag
  ]),
);
```

See the [Chrome permissions reference](https://developer.chrome.com/docs/extensions/reference/permissions-list)
for available values.

## `run_at` for Content Scripts

The `runAt` constant in `src/manifest.ts` provides typed values for the `run_at` manifest field:

| Value            | When it runs                                                                                               |
| ---------------- | ---------------------------------------------------------------------------------------------------------- |
| `document_start` | Before DOM is constructed (earliest). Use for style overrides or early DOM manipulation.                   |
| `document_end`   | After DOM is complete, but before images/frames load.                                                      |
| `document_idle`  | After DOM is complete, optimized for page load speed (**default**). No need to listen for `window.onload`. |

## Icons

PNG icon files placed in `public/icons/` are automatically detected and included in the manifest.
Supported sizes: 16, 48, 128 px (app icons) and 16, 32 px (action icons).

See [icons.md](icons.md) for how to generate icon files.

## `web_accessible_resources`

Resources declared under `web_accessible_resources` are accessible from host pages. This is only
needed when a content script injects DOM that references extension assets loaded by the host page.

- Extension-internal pages (popup, options, side panel, DevTools) share the extension origin and
  are **not** subject to this restriction.
- Files in `public/` must be listed manually (CRXJS cannot auto-detect them).
- Files imported from `src/assets/` are auto-registered by CRXJS.

The template uses `matches: ["<all_urls>"]` as a placeholder. **Narrow this to the actual pages
where your content script runs** to minimise the attack surface exposed to third-party pages:

```ts
web_accessible_resources: [
  {
    resources: ["vite.svg"],
    matches: ["https://www.yahoo.co.jp/"], // only where the content script is injected
  },
],
```

## `host_permissions` and HMR

In development mode, `host_permissions: ["http://localhost:5173/*"]` is added automatically so
the CRXJS dev server can serve HMR updates. This permission is omitted in production builds to
avoid unnecessary permission requests during Chrome Web Store review.

## `chrome_url_overrides`

An extension can override **one** Chrome page at a time. Available keys:

| Key         | Overrides            |
| ----------- | -------------------- |
| `bookmarks` | `chrome://bookmarks` |
| `history`   | `chrome://history`   |
| `newtab`    | `chrome://newtab`    |

Update the key in `src/manifest.ts` and point it to the correct HTML entry file.

## DevTools Panel Registration

DevTools panel HTML files are referenced dynamically via `chrome.devtools.panels.create()`, so
CRXJS cannot auto-detect them. Each panel must be registered as an explicit Rollup entry in
`vite.config.ts`:

```ts
input: {
  devtools_panel: "src/pages/devtools/panel/index.html",
  // my_panel: "src/pages/devtools/my-panel/index.html",
},
```
