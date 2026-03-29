# Content Scripts

Content scripts run in the context of web pages. This template organises them under
`src/content/` with one directory per target site or UI pattern.

## Directory Structure

```text
src/content/
├── example.com/          # Plain content script (no React)
│   ├── index.ts
│   └── style.css
└── apps/
    ├── floating/         # Draggable floating React widget
    │   ├── index.tsx     # React root mount
    │   ├── App.tsx
    │   └── style.css
    └── sidebar/          # Resizable sidebar React app
        ├── index.tsx
        ├── App.tsx
        └── style.css
```

## Directory Naming Convention

Name each directory after the target domain. This makes the match pattern immediately clear
from the directory structure:

```text
src/content/
├── example.com/       # targets https://example.com/*
├── github.com/        # targets https://github.com/*
└── _all/              # targets <all_urls> — use _all, global, or all-sites
```

For services spanning multiple domains (e.g. github.com + a GitHub Enterprise instance), a
short name without the TLD (e.g. `github/`) is also fine.

## Adding a Content Script

1. Create a directory under `src/content/` named after the target domain.

2. Add an entry file (`index.ts` or `index.tsx`). For a React app, use the Shadow DOM pattern
   described below. See `src/content/apps/floating/index.tsx` for a complete example.

3. Register it in `src/manifest.ts` under `content_scripts`:

   ```ts
   {
     matches: ["https://your-target-site.com/*"],
     js: ["src/content/your-script/index.tsx"],
     run_at: runAt.document_idle,
   }
   ```

4. If the script loads assets from `public/` (e.g. `vite.svg`), add them to
   `web_accessible_resources` in the manifest. Scope `matches` to only the pages where the
   script runs — avoid `<all_urls>` in production.

## CSS Injection Modes

There are two ways to load CSS in a content script, each with different behaviour:

| Import style                              | Where CSS is injected               | When to use                               |
| ----------------------------------------- | ----------------------------------- | ----------------------------------------- |
| `import "./style.css"`                    | Host page `<head>`                  | Plain scripts; styles applied to page DOM |
| `import styles from "./style.css?inline"` | Shadow DOM via `adoptedStyleSheets` | React apps using Shadow DOM isolation     |

Do **not** add a `css` key to the content script manifest entry regardless of which mode you
use. CRXJS handles injection automatically. Adding it separately causes a "Could not load css"
build error.

## React Apps: Shadow DOM Isolation

Host-page CSS rules (e.g. `a { color: … }`, `* { box-sizing: … }`) bleed into content script
DOM and break widget layouts. Mounting your React app inside a Shadow Root creates an isolated
subtree: styles inside never affect the host page, and host-page styles never affect the widget.

```tsx
// src/content/apps/your-app/index.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import styles from "./style.css?inline"; // bundled as a string, not injected into <head>

const HOST_ID = "crx-your-app-host";

// Guard against double injection — SPAs may re-trigger the content script
// on client-side navigation. This ensures only one instance is ever mounted.
if (!document.getElementById(HOST_ID)) {
  const host = document.createElement("div");
  host.id = HOST_ID;
  document.body.appendChild(host);

  const shadow = host.attachShadow({ mode: "open" });

  // adoptedStyleSheets injects CSS into the shadow root without a <style> element.
  const sheet = new CSSStyleSheet();
  sheet.replaceSync(styles);
  shadow.adoptedStyleSheets = [sheet];

  const container = document.createElement("div");
  shadow.appendChild(container);

  ReactDOM.createRoot(container).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}
```

## Using Assets in Content Scripts

Asset paths from Vite imports are relative to the host page, not the extension. Use `toExtUrl()`
from `src/shared/utils/url.ts` to produce valid `chrome-extension://` URLs:

```ts
import _logo from "../../assets/logo.svg";
import { toExtUrl } from "../../shared/utils/url";

const logo = toExtUrl(_logo);
// Produces: chrome-extension://<id>/assets/logo-HASH.svg
```

For `public/` assets (e.g. `vite.svg`), pass the filename as a string:

```ts
const icon = toExtUrl("vite.svg");
```

## Provided Examples

### Plain Content Script (`src/content/example.com/`)

A minimal TypeScript content script injected into `https://example.com/*`. Logs to the console
and applies a CSS file directly to the page.

### Floating Widget (`src/content/apps/floating/`)

A draggable React widget injected into `https://www.yahoo.co.jp/`. Demonstrates:

- Shadow DOM isolation with `?inline` CSS + `adoptedStyleSheets`
- Double injection guard for SPA compatibility
- Drag-to-move with `mousedown` / `mousemove` / `mouseup` events
- Using `toExtUrl()` to load assets safely from a content script

### Sidebar App (`src/content/apps/sidebar/`)

A resizable sidebar React app injected into `https://www.google.com/`. Demonstrates:

- Shadow DOM isolation with `?inline` Tailwind CSS v4
- Pushing the host page layout with `document.documentElement.style.marginRight`
- Drag-to-resize with localStorage persistence
