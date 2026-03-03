import { crx } from "@crxjs/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import manifest, { features } from "./src/manifest";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), crx({ manifest })],
  build: {
    rollupOptions: {
      input: {
        // CRXJS auto-detects HTML entry points listed in the manifest, but
        // HTML files referenced dynamically via `chrome.devtools.panels.create()`
        // are NOT picked up automatically and will result in a blank panel.
        //
        // Action: Whenever you add a new DevTools panel, register its HTML here
        // as an explicit Rollup entry so it gets bundled correctly.
        // The key (e.g. "devtools_panel") is an arbitrary chunk name used by
        // Rollup for the output filename — it can be any unique string.
        //   e.g. my_panel: "src/pages/devtools/my-panel/index.html",
        ...(features.devtools && {
          devtools_panel: "src/pages/devtools/panel/index.html",
        }),
      },
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    hmr: {
      port: 5173,
    },
    origin: "http://localhost:5173",
  },
});
