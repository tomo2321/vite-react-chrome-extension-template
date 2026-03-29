# Project Structure

```text
vite-react-chrome-extension-template/
├── public/
│   └── icons/            # PNG icons (16, 32, 48, 128 px) — auto-detected by manifest
├── scripts/
│   └── generate-icon.ts  # CLI tool for generating PNG icons from text
├── src/
│   ├── manifest.ts       # Extension manifest with feature flags
│   ├── assets/           # Imported assets (content-hashed at build time)
│   ├── background/
│   │   └── index.ts      # Background service worker entry point
│   ├── content/          # Content scripts — one directory per target site / UI pattern
│   │   ├── example.com/  # Plain content script injected into example.com
│   │   └── apps/
│   │       ├── floating/ # Draggable floating React widget
│   │       └── sidebar/  # Resizable sidebar React app
│   ├── pages/            # Extension pages (each has its own HTML entry)
│   │   ├── popup/        # Browser action popup
│   │   ├── options/      # Options UI page
│   │   ├── sidepanel/    # Chrome Side Panel page (with in-page routing)
│   │   ├── devtools/     # DevTools page + panel
│   │   └── chrome-url-overrides/ # Overrides Chrome's New Tab page
│   └── shared/           # Shared utilities and types
│       ├── index.css     # Global CSS reset / base styles
│       ├── types/
│       │   └── geometry.ts   # Shared TypeScript types (e.g. Position)
│       └── utils/
│           └── url.ts        # toExtUrl() — converts asset paths for content scripts
├── vite.config.ts        # Vite + CRXJS + Tailwind CSS configuration
├── biome.json            # Biome linter / formatter configuration
├── dprint.json           # dprint formatter configuration (Markdown, YAML)
├── mise.toml             # Tool version pins (Node.js, pnpm)
└── package.json          # Scripts and dependencies
```

## Key Conventions

### One directory per content script target

Each target site or UI pattern lives in its own directory under `src/content/`. The manifest
references the entry file (`.ts` or `.tsx`) directly. CSS imported inside the JS file is
automatically injected by CRXJS — do not add it separately under the `css` key in the manifest.

### Feature flags in `src/manifest.ts`

Every optional manifest section (action, background, content scripts, side panel, options,
DevTools, URL overrides) is gated behind an `export const features` flag. Setting a flag to
`false` removes the entire manifest section and its associated permissions at build time.

### Assets in `public/` vs `src/assets/`

| Location      | Build output        | CRXJS `web_accessible_resources`                   |
| ------------- | ------------------- | -------------------------------------------------- |
| `public/`     | Copied as-is        | **Not** auto-registered — add manually to manifest |
| `src/assets/` | Content-hashed path | Auto-registered by CRXJS                           |

In content scripts, always use `toExtUrl()` from `src/shared/utils/url.ts` to convert asset
paths to valid `chrome-extension://` URLs.
