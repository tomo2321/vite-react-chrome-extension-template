import { defineManifest } from "@crxjs/vite-plugin";

export default defineManifest({
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
  host_permissions: ["http://localhost:5173/*"],
});
