import { useCallback, useEffect, useRef, useState } from "react";
import _reactLogo from "../../../assets/react.svg";
import type { Position } from "../../../shared/types/geometry";
import { toExtUrl } from "../../../shared/utils/url";

// vite.svg lives in public/ and is copied as-is at build time (no content hash),
// so its filename is stable and can be passed as a string literal.
// src/assets/ imports (e.g. _reactLogo) get a content-hashed path like
// "/assets/react-CHdo91hT.svg". CRXJS detects those imports and auto-registers
// them in web_accessible_resources, so no manual manifest entry is needed.
const viteLogo = toExtUrl("vite.svg");
const reactLogo = toExtUrl(_reactLogo);

function App() {
  const [count, setCount] = useState(0);
  const [visible, setVisible] = useState(true);
  const [position, setPosition] = useState<Position>({
    x: window.innerWidth - 340,
    y: 20,
  });
  const [isDragging, setIsDragging] = useState(false);
  const dragging = useRef(false);
  const dragOffset = useRef<Position>({ x: 0, y: 0 });

  const onMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      dragging.current = true;
      setIsDragging(true);
      dragOffset.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      };
      e.preventDefault();
    },
    [position],
  );

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      setPosition({
        x: e.clientX - dragOffset.current.x,
        y: e.clientY - dragOffset.current.y,
      });
    };
    const onMouseUp = () => {
      dragging.current = false;
      setIsDragging(false);
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={isDragging ? "widget dragging" : "widget"}
      style={
        {
          "--x": `${position.x}px`,
          "--y": `${position.y}px`,
        } as React.CSSProperties
      }
    >
      {/* Header / drag handle */}
      <div role="toolbar" className="header" onMouseDown={onMouseDown}>
        <span className="header-title">Content Script: Floating App</span>
        <button
          type="button"
          className="close-button"
          onClick={() => setVisible(false)}
          title="Close"
        >
          ×
        </button>
      </div>

      {/* Body */}
      <div className="body">
        <div className="logos">
          <a href="https://vite.dev" target="_blank" rel="noreferrer">
            <img src={viteLogo} className="logo" alt="Vite logo" />
          </a>
          <a href="https://react.dev" target="_blank" rel="noreferrer">
            <img src={reactLogo} className="logo logo-react" alt="React logo" />
          </a>
        </div>

        <h1 className="title">Floating</h1>

        <div className="card">
          <button
            type="button"
            className="count-button"
            onClick={() => setCount((count) => count + 1)}
          >
            count is {count}
          </button>
          <p className="hint">
            Edit <code>src/content/apps/floating/App.tsx</code> and save to test
            HMR
          </p>
        </div>

        <p className="read-the-docs">
          Click on the Vite and React logos to learn more
        </p>
      </div>
    </div>
  );
}

export default App;
