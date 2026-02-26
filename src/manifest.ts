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

export default defineManifest((env) => ({
  manifest_version: 3,
  name: "Vite + React Chrome Extension",
  description: "Chrome extension built with Vite and React.",
  version: "0.0.0",
  ...(Object.keys(appIcons).length > 0 && { icons: appIcons }),
  action: {
    ...(Object.keys(actionIcons).length > 0 && { default_icon: actionIcons }),
    default_popup: "index.html",
  },
  // Required during development to enable HMR (Hot Module Replacement) via the Vite dev server
  // (localhost:5173). @crxjs/vite-plugin connects to the dev server through a content script,
  // and without this permission the connection is refused.
  //
  // Included automatically only in development mode (`vite dev`).
  // Access to localhost is not needed in production and may cause the Chrome Web Store review
  // to reject the submission for declaring an unnecessary permission.
  ...(env.mode === "development" && {
    host_permissions: ["http://localhost:5173/*"],
  }),
}));
