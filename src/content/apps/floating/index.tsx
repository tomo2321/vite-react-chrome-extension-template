import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
// `?inline` imports the CSS as a plain string so it can be injected
// into the Shadow DOM instead of being appended to the host document's <head>.
import styles from "./style.css?inline";

// Guard against double injection.
// In most cases a content script runs once per page load, but SPAs may
// re-trigger script execution on client-side navigation. Wrapping the mount
// logic in an if-block (rather than throwing) avoids unhandled errors in the
// console while ensuring only one instance of the widget is ever mounted.
const HOST_ID = "crx-apps-floating-host";

if (!document.getElementById(HOST_ID)) {
  // --- Why Shadow DOM? ---
  // A content script's DOM is part of the host page. Without isolation,
  // the host page's CSS rules (e.g. `a { color: ... }`, `* { box-sizing: ... }`)
  // bleed into the widget and can break its layout or appearance.
  // attachShadow() creates an isolated subtree: styles defined inside it never
  // affect the host page, and host-page styles never affect the widget.
  // As a result, CSS class names like `.logo` are safe without a vendor prefix.
  const host = document.createElement("div");
  host.id = HOST_ID;
  document.body.appendChild(host);

  const shadow = host.attachShadow({ mode: "open" });

  // `adoptedStyleSheets` is preferred over injecting a <style> element:
  // the same CSSStyleSheet object can be shared across multiple shadow roots,
  // and the CSS lives in a dedicated .css file with full editor support.
  const sheet = new CSSStyleSheet();
  sheet.replaceSync(styles);
  shadow.adoptedStyleSheets = [sheet];

  const container = document.createElement("div");
  shadow.appendChild(container);

  ReactDOM.createRoot(container).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}
