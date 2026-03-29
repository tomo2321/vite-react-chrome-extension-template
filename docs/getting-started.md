# Getting Started

## Prerequisites

- [mise](https://mise.jdx.dev/) (manages Node.js and pnpm versions automatically)

Install the correct tool versions:

```bash
mise install
```

This provisions the exact Node.js and pnpm versions declared in `mise.toml`.

## Create Your Extension from This Template

1. **Clone or use the template**

   ```bash
   # Clone directly
   git clone https://github.com/<owner>/vite-react-chrome-extension-template my-extension
   cd my-extension

   # Or use GitHub's "Use this template" button on the repository page
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Update `package.json`** — set `name`, `description`, and `author` for your extension.

4. **Update `src/manifest.ts`** — set `name`, `description`, and `version` inside `defineManifest`.

5. **Enable only the features you need** — in `src/manifest.ts`, set unused feature flags to `false`:

   ```ts
   export const features = {
     action: true, // popup
     background: true, // service worker
     content_scripts: true, // content scripts
     side_panel: true, // side panel
     options: true, // options page
     devtools: true, // DevTools panel
     chrome_url_overrides: false, // newtab / bookmarks / history override
   };
   ```

## Development

Start the dev server with Hot Module Replacement (HMR):

```bash
pnpm dev
```

Then load the extension in Chrome:

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked** and select the `dist/` folder

Changes to source files are reflected in the browser without reloading the extension (HMR via CRXJS).

## Production Build

```bash
pnpm build
```

The built extension is output to `dist/`. Zip that folder for submission to the Chrome Web Store.

## Adapting the Template

The template ships with sample code for every feature. Replace or delete what you don't need:

| Sample file / directory            | What to do                                           |
| ---------------------------------- | ---------------------------------------------------- |
| `src/content/example.com/`         | Replace with your target site and script logic       |
| `src/content/apps/floating/`       | Replace or delete — sample draggable React widget    |
| `src/content/apps/sidebar/`        | Replace or delete — sample resizable sidebar         |
| `src/pages/popup/App.tsx`          | Replace contents with your popup UI                  |
| `src/pages/options/App.tsx`        | Replace contents with your settings UI               |
| `src/pages/sidepanel/routes/`      | Replace `Home.tsx` and `Detail.tsx` with your routes |
| `src/pages/devtools/panel/App.tsx` | Replace contents with your DevTools panel UI         |
| `src/pages/chrome-url-overrides/`  | Replace contents with your new tab UI                |
| `src/background/index.ts`          | Replace the sample `onInstalled` handler             |

When you remove a content script directory, also remove its entry from `content_scripts` in
`src/manifest.ts`.

> **Tip:** After changing the manifest (feature flags, permissions, match patterns), the
> extension must be reloaded manually in Chrome. Go to `chrome://extensions` and click the
> reload icon. HMR handles source-only changes, but manifest changes always require a reload.

## Generate Icons

See [icons.md](icons.md) for how to generate PNG icons from text labels.
