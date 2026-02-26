import { defineManifest } from "@crxjs/vite-plugin";

export default defineManifest((env) => ({
  manifest_version: 3,
  name: "Vite + React Chrome Extension",
  description: "Chrome extension built with Vite and React.",
  version: "0.0.0",
  // Uncomment the following block once you have generated the icon files.
  // icons: {
  //   16: "icons/icon16.png",
  //   48: "icons/icon48.png",
  //   128: "icons/icon128.png",
  // },
  action: {
    // Uncomment the following block once you have generated the icon files.
    // default_icon: {
    //   16: "icons/icon16.png",
    //   32: "icons/icon32.png",
    // },
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
