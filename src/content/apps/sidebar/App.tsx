import { useCallback, useEffect, useRef, useState } from "react";
import _reactLogo from "../../../assets/react.svg";
import { toExtUrl } from "../../../shared/utils/url";

const viteLogo = toExtUrl("vite.svg");
const reactLogo = toExtUrl(_reactLogo);

const MIN_WIDTH = 200;
const MAX_WIDTH = 600;
const DEFAULT_WIDTH = 288; // 18rem
const STORAGE_KEY = "rx-apps-sidebar-width";

function loadWidth(): number {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === null) return DEFAULT_WIDTH;
  const n = Number(stored);
  return Number.isFinite(n)
    ? Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, n))
    : DEFAULT_WIDTH;
}

function App() {
  const [open, setOpen] = useState(true);
  const [width, setWidth] = useState(loadWidth);
  const [count, setCount] = useState(0);
  const [isResizing, setIsResizing] = useState(false);
  const resizing = useRef(false);

  // Push the host page to the left when the sidebar is open
  useEffect(() => {
    const html = document.documentElement;
    if (!isResizing) {
      html.style.transition = "margin-right 0.25s ease";
    }
    html.style.marginRight = open ? `${width}px` : "0px";
    return () => {
      html.style.marginRight = "0px";
    };
  }, [open, width, isResizing]);

  // Drag-to-resize handlers
  const onResizeStart = useCallback((e: React.MouseEvent) => {
    resizing.current = true;
    setIsResizing(true);
    document.documentElement.style.transition = "none";
    e.preventDefault();
  }, []);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!resizing.current) return;
      const newWidth = Math.min(
        MAX_WIDTH,
        Math.max(MIN_WIDTH, window.innerWidth - e.clientX),
      );
      setWidth(newWidth);
      document.documentElement.style.marginRight = `${newWidth}px`;
    };
    const onMouseUp = () => {
      if (!resizing.current) return;
      resizing.current = false;
      setIsResizing(false);
      document.documentElement.style.transition = "margin-right 0.25s ease";
      // Persist the final width after drag ends
      setWidth((w) => {
        localStorage.setItem(STORAGE_KEY, String(w));
        return w;
      });
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  return (
    <>
      {/* Toggle tab — always visible on the right edge */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{ right: open ? `${width}px` : "0" }}
        className="fixed top-1/2 -translate-y-1/2 z-2147483647 w-5 h-16 bg-[#242424] border border-white/10 border-r-0 rounded-l-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-[#2e2e2e] transition-[right,background-color] duration-250 ease cursor-pointer shadow-lg"
        aria-label={open ? "Close sidebar" : "Open sidebar"}
      >
        <svg
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          className="w-3 h-3"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {open ? (
            <polyline points="9 18 15 12 9 6" />
          ) : (
            <polyline points="15 18 9 12 15 6" />
          )}
        </svg>
      </button>

      {/* Sidebar panel */}
      {open && (
        <div
          style={{ width: `${width}px` }}
          className="fixed top-0 right-0 h-full bg-[#242424] text-white shadow-2xl flex flex-col z-2147483646 font-sans"
        >
          {/* Resize handle — left edge */}
          <hr
            tabIndex={0}
            aria-orientation="vertical"
            aria-valuenow={width}
            aria-valuemin={MIN_WIDTH}
            aria-valuemax={MAX_WIDTH}
            aria-label="Drag to resize"
            onMouseDown={onResizeStart}
            className="absolute top-0 left-0 w-1 h-full cursor-ew-resize hover:bg-indigo-500/60 active:bg-indigo-400/80 transition-colors z-10 border-0 m-0 p-0"
            title="Drag to resize"
          />
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <span className="text-sm font-semibold tracking-wide text-white/70">
              Content Script: Sidebar App
            </span>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto flex flex-col items-center px-4 py-6 gap-6">
            {/* Logos */}
            <div className="flex items-center gap-4">
              <a href="https://vite.dev" target="_blank" rel="noreferrer">
                <img
                  src={viteLogo}
                  className="h-16 p-3 transition-[filter] duration-300 hover:filter-[drop-shadow(0_0_1.5em_#646cffaa)]"
                  alt="Vite logo"
                />
              </a>
              <a href="https://react.dev" target="_blank" rel="noreferrer">
                <img
                  src={reactLogo}
                  className="h-16 p-3 transition-[filter] duration-300 hover:filter-[drop-shadow(0_0_1.5em_#61dafbaa)] animate-spin [animation-duration:20s]"
                  alt="React logo"
                />
              </a>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-white">Sidebar</h1>

            {/* Card */}
            <div className="w-full rounded-xl bg-white/5 border border-white/10 p-5 flex flex-col items-center gap-3">
              <button
                type="button"
                onClick={() => setCount((count) => count + 1)}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-sm font-medium transition-colors cursor-pointer"
              >
                count is {count}
              </button>
              <p className="text-xs text-white/50 text-center">
                Edit{" "}
                <code className="font-mono text-indigo-400">
                  src/content/apps/sidebar/App.tsx
                </code>{" "}
                and save to test HMR
              </p>
            </div>

            {/* Footer note */}
            <p className="text-xs text-white/40 text-center">
              Click on the Vite and React logos to learn more
            </p>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
