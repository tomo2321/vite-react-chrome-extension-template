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
 * Feature flags to control which optional sections are included in the manifest.
 * Set each flag to `true` to include the section, or `false` to omit it.
 */
export const features = {
  action: true,
  background: true,
  content_scripts: true,
  side_panel: true,
  devtools: true,
};

/**
 * List of Chrome extension permissions to declare in the manifest.
 * Entries are derived from the {@link features} flags — disabled features
 * do not contribute a permission, so no unused permissions are requested.
 *
 * @see {@link https://developer.chrome.com/docs/extensions/reference/permissions-list}
 */
const permissions: string[] = [
  // features.action permissions: add entries here when needed
  // features.background permissions: add entries here when needed
  // features.content_scripts permissions: add entries here when needed
  ...(features.side_panel ? ["sidePanel"] : []),
  // features.devtools permissions: add entries here when needed
];

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
        // No `css` key needed: CRXJS automatically injects CSS imported in the JS file (e.g. `import "./style.css"`).
        // Listing CSS here separately causes a "Could not load css" error.
      },
    ],
  }),
  // Only include `side_panel` if the feature flag is enabled
  ...(features.side_panel && {
    side_panel: {
      default_path: "src/pages/sidepanel/index.html",
    },
  }),
  // Only include `devtools_page` if the feature flag is enabled
  ...(features.devtools && {
    devtools_page: "src/pages/devtools/index.html",
  }),
  permissions,
  // Only include `host_permissions` in development to allow HMR via the Vite dev server.
  // Connecting to localhost is not needed in production and may cause the Chrome Web Store
  // review to reject the submission for declaring an unnecessary permission.
  ...(env.mode === "development" && {
    host_permissions: ["http://localhost:5173/*"],
  }),
}));
