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

const appIcons = ([16, 48, 128] as const satisfies readonly number[]).reduce<
  Record<number, string>
>((acc, size) => {
  if (hasIcon(size)) acc[size] = iconPath(size);
  return acc;
}, {});

const actionIcons = ([16, 32] as const satisfies readonly number[]).reduce<
  Record<number, string>
>((acc, size) => {
  if (hasIcon(size)) acc[size] = iconPath(size);
  return acc;
}, {});

/**
 * Feature flags to control which optional sections are included in the manifest.
 * Set each flag to `true` to include the section, or `false` to omit it.
 */
const features = {
  action: true,
  background: true,
  side_panel: true,
};

/**
 * List of Chrome extension permissions to declare in the manifest.
 * Entries are derived from the {@link features} flags — disabled features
 * do not contribute a permission, so no unused permissions are requested.
 *
 * @see {@link https://developer.chrome.com/docs/extensions/reference/permissions-list}
 */
const permissions = [features.side_panel ? "sidePanel" : undefined].filter(
  (p) => p !== undefined,
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
  // Only include `side_panel` if the feature flag is enabled
  ...(features.side_panel && {
    side_panel: {
      default_path: "src/pages/sidepanel/index.html",
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
