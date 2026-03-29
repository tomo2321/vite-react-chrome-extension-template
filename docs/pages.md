# Extension Pages

Each extension page lives under `src/pages/<page-name>/` and has its own `index.html` entry
point. Pages are standard React + Vite apps with access to the full Chrome extension API
(`chrome.*`).

## Popup (`src/pages/popup/`)

The browser action popup that opens when the user clicks the extension icon in the toolbar.

- Entry: `src/pages/popup/index.html`
- Manifest: registered under `action.default_popup`
- Feature flag: `features.action`

## Options (`src/pages/options/`)

The extension's settings page, opened via the Extensions menu or `chrome.runtime.openOptionsPage()`.

- Entry: `src/pages/options/index.html`
- Manifest: registered under `options_ui.page` with `open_in_tab: false` (inline panel)
- Feature flag: `features.options`
- Uses `chrome.storage.local` to persist settings across sessions

## Side Panel (`src/pages/sidepanel/`)

The [Chrome Side Panel](https://developer.chrome.com/docs/extensions/reference/api/sidePanel)
that opens in the browser's side panel area.

- Entry: `src/pages/sidepanel/index.html`
- Manifest: registered under `side_panel.default_path`
- Feature flag: `features.side_panel`
- Requires `sidePanel` permission
- Uses `MemoryRouter` from `react-router-dom` for in-panel client-side routing
  (browser history APIs are not available in side panels)

### Adding Routes

Routes are defined in `src/pages/sidepanel/App.tsx` using React Router v7:

```tsx
<MemoryRouter>
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/detail" element={<Detail />} />
  </Routes>
</MemoryRouter>;
```

Add route components under `src/pages/sidepanel/routes/`.

## DevTools Panel (`src/pages/devtools/`)

Adds a custom panel to Chrome DevTools.

- DevTools page entry: `src/pages/devtools/index.html` (loaded by Chrome to register the panel)
- Panel entry: `src/pages/devtools/panel/index.html` (the actual panel UI)
- Manifest: registered under `devtools_page`
- Feature flag: `features.devtools`

The DevTools page (`src/pages/devtools/index.ts`) calls `chrome.devtools.panels.create()` to
register the panel:

```ts
chrome.devtools.panels.create(
  "My Panel",
  "",
  "src/pages/devtools/panel/index.html",
);
```

**Important:** Every DevTools panel HTML file must also be registered as an explicit Rollup
entry in `vite.config.ts` because CRXJS cannot auto-detect dynamically referenced HTML files.
See [manifest-and-features.md](manifest-and-features.md#devtools-panel-registration).

## Chrome URL Overrides (`src/pages/chrome-url-overrides/`)

Replaces one of Chrome's built-in pages (New Tab, History, or Bookmarks).

- Entry: `src/pages/chrome-url-overrides/index.html`
- Manifest: registered under `chrome_url_overrides`
- Feature flag: `features.chrome_url_overrides`
- Currently overrides `newtab` (New Tab page)

To override a different page, update the key in `src/manifest.ts`:

```ts
chrome_url_overrides: {
  history: "src/pages/chrome-url-overrides/index.html",
}
```

An extension may override **only one** Chrome page at a time.

## Tailwind CSS in Pages

Most extension pages import `src/shared/index.css` in their `main.tsx` — a plain CSS reset with
no Tailwind. The `chrome-url-overrides` page is the exception: it uses Tailwind CSS v4 by
importing it directly in its own `App.css` and does **not** import `shared/index.css`.

When adding Tailwind to a new page:

1. Do **not** import `shared/index.css` in the page's `main.tsx`.
2. Import Tailwind directly in the page's own CSS file instead:

```css
/* src/pages/your-page/App.css */
@import "tailwindcss";
```

Tailwind's preflight rules (e.g. `img { display: block }`) conflict with the base styles in
`shared/index.css`, so the two must not be used together in the same page.
