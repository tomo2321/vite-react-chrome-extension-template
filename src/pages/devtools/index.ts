chrome.devtools.panels.create(
  "DevTools",
  "",
  "src/pages/devtools/panel/index.html",
  function (panel) {
    console.log("DevTools panel created:", panel);
  },
);
