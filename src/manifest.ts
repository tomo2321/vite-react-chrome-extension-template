import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineManifest } from "@crxjs/vite-plugin";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const iconsDir = path.resolve(__dirname, "../public/icons");

function iconPath(size: number): string {
  return `icons/icon${size}.png`;
}

function hasIcon(size: number): boolean {
  return fs.existsSync(path.join(iconsDir, `icon${size}.png`));
}

function buildIcons(sizes: readonly number[]): Record<number, string> {
  return sizes.reduce<Record<number, string>>((acc, size) => {
    if (hasIcon(size)) acc[size] = iconPath(size);
    return acc;
  }, {});
}

const appIcons = buildIcons([16, 48, 128]);
const actionIcons = buildIcons([16, 32]);

/**
 * Available `run_at` values for content scripts.
 *
 * - `document_start` : Injected after any CSS files from the `css` array, but before any other DOM is
 *                      constructed or any other script is run (earliest).
 * - `document_end`   : Injected immediately after the DOM is complete, but before subresources like
 *                      images and frames have loaded.
 * - `document_idle`  : The browser chooses a time between `document_end` and immediately after
 *                      `window.onload` fires (default). Optimized for page load speed.
 *                      Content scripts at this timing do not need to listen for `window.onload`
 *                      — they are guaranteed to run after the DOM is complete.
 *
 * @see {@link https://developer.chrome.com/docs/extensions/reference/api/extensionTypes#type-RunAt}
 */
export const runAt = {
  /**
   * Injected after any CSS files from the `css` array, but before any other DOM is constructed
   * or any other script is run — use for style overrides or early DOM manipulation.
   */
  document_start: "document_start",
  /**
   * Injected immediately after the DOM is complete, but before subresources like images and
   * frames have loaded — use when you need the DOM ready but don't want to wait for all assets.
   */
  document_end: "document_end",
  /**
   * The browser chooses a time between `document_end` and right after `window.onload` fires
   * (default). Guaranteed to run after the DOM is complete; optimized for page load speed.
   */
  document_idle: "document_idle",
} as const;

/**
 * Feature flags to control which optional sections are included in the manifest.
 * Set each flag to `true` to include the section, or `false` to omit it.
 */
export const features = {
  action: true,
  background: true,
  content_scripts: true,
  side_panel: true,
  options: true,
  devtools: true,
  chrome_url_overrides: true,
};

/**
 * List of Chrome extension permissions to declare in the manifest.
 * Entries are derived from the {@link features} flags — disabled features
 * do not contribute a permission, so no unused permissions are requested.
 *
 * @see {@link https://developer.chrome.com/docs/extensions/reference/permissions-list}
 */
const permissions: string[] = Array.from(
  new Set([
    // features.action permissions: add entries here when needed
    // features.background permissions: add entries here when needed
    // features.content_scripts permissions: add entries here when needed
    ...(features.side_panel ? ["sidePanel"] : []),
    ...(features.options ? ["storage"] : []),
    // features.devtools permissions: add entries here when needed
  ]),
);

export default defineManifest((env) => ({
  manifest_version: 3,
  name: "Vite + React Chrome Extension",
  description: "Chrome extension built with Vite and React.",
  version: "0.0.0",
  // Only include `icons` if at least one icon file exists in public/icons/
  ...(Object.keys(appIcons).length > 0 && { icons: appIcons }),
  // Only include `action` if the feature flag is enabled
  ...(features.action && {
    action: {
      // Only include `default_icon` if at least one action icon file exists in public/icons/
      ...(Object.keys(actionIcons).length > 0 && { default_icon: actionIcons }),
      default_popup: "src/pages/popup/index.html",
    },
  }),
  // Only include `background` if the feature flag is enabled
  ...(features.background && {
    background: {
      service_worker: "src/background/index.ts",
      type: "module",
    },
  }),
  // Only include `content_scripts` if the feature flag is enabled
  ...(features.content_scripts && {
    content_scripts: [
      {
        matches: ["https://example.com/*"],
        js: ["src/content/example.com/index.ts"],
        // Change `run_at` to `runAt.document_start` or `runAt.document_end` if earlier injection is needed.
        run_at: runAt.document_idle,
        // No `css` key needed: CRXJS automatically injects CSS imported in the JS file (e.g. `import "./style.css"`).
        // Listing CSS here separately causes a "Could not load css" error.
      },
      {
        matches: ["https://www.yahoo.co.jp/"],
        js: ["src/content/apps/floating/index.tsx"],
        run_at: runAt.document_idle,
      },
      {
        matches: ["https://www.google.com/"],
        js: ["src/content/apps/sidebar/index.tsx"],
        run_at: runAt.document_idle,
      },
    ],
  }),
  // Only include `web_accessible_resources` if content scripts are enabled.
  // These resources are requested by the host page (not the extension itself), which is
  // only the case when a content script injects DOM that references extension assets.
  // Extension-internal pages (popup, options, sidepanel, devtools) share the same origin
  // and are never subject to this restriction; background service workers are also exempt.
  //
  // CRXJS auto-registration note:
  // - public/ files (e.g. vite.svg) are NOT imported by JS, so CRXJS cannot detect them
  //   and they must be listed here manually.
  // - src/assets/ files (e.g. react.svg) ARE imported by JS and get a content-hashed
  //   path at build time; CRXJS detects those imports and auto-registers them, so they
  //   do NOT need to appear here.
  ...(features.content_scripts && {
    web_accessible_resources: [
      {
        resources: ["vite.svg"],
        // NOTE: `<all_urls>` is used here for simplicity as a template sample.
        // In a real extension, scope this to only the pages where your content
        // script is injected (e.g. ["https://www.yahoo.co.jp/"]) to minimise
        // the attack surface exposed to third-party pages.
        matches: ["<all_urls>"],
      },
    ],
  }),
  // Only include `side_panel` if the feature flag is enabled
  ...(features.side_panel && {
    side_panel: {
      default_path: "src/pages/sidepanel/index.html",
    },
  }),
  // Only include `options_ui` if the feature flag is enabled
  ...(features.options && {
    options_ui: {
      page: "src/pages/options/index.html",
      open_in_tab: false,
    },
  }),
  // Only include `devtools_page` if the feature flag is enabled
  ...(features.devtools && {
    devtools_page: "src/pages/devtools/index.html",
  }),
  // Only include `chrome_url_overrides` if the feature flag is enabled.
  // Extensions can override one of the following Chrome pages, but each extension can only
  // override ONE page at a time — do not define more than one key here:
  //
  //   bookmarks : Replaces chrome://bookmarks (Bookmark Manager)
  //   history   : Replaces chrome://history   (History page)
  //   newtab    : Replaces chrome://newtab     (New Tab page)
  //
  // @see https://developer.chrome.com/docs/extensions/develop/ui/override-chrome-pages
  ...(features.chrome_url_overrides && {
    chrome_url_overrides: {
      newtab: "src/pages/chrome-url-overrides/index.html",
    },
  }),
  permissions,
  // Only include `host_permissions` in development to allow HMR via the Vite dev server.
  // Connecting to localhost is not needed in production and may cause the Chrome Web Store
  // review to reject the submission for declaring an unnecessary permission.
  ...(env.mode === "development" && {
    host_permissions: ["http://localhost:5173/*"],
  }),
}));
