chrome.devtools.panels.create(
  "DevTools",
  "",
  "src/pages/devtools/panel/index.html",
  (panel) => {
    console.log("DevTools panel created:", panel);
  },
);
