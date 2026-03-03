import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
// `?inline` imports the processed Tailwind CSS as a plain string so it can be
// injected into the Shadow DOM instead of the host document's <head>.
import styles from "./style.css?inline";

const HOST_ID = "crx-apps-sidebar-host";

if (!document.getElementById(HOST_ID)) {
  const host = document.createElement("div");
  host.id = HOST_ID;
  document.body.appendChild(host);

  const shadow = host.attachShadow({ mode: "open" });

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
