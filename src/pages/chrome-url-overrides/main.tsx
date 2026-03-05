import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// NOTE: shared/index.css is intentionally NOT imported here.
// Tailwind CSS is imported directly in App.css (@import "tailwindcss") instead,
// to avoid preflight style conflicts with pages that still rely on shared/index.css.
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
