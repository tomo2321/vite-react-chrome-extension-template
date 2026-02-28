import { useEffect, useState } from "react";
import viteLogo from "/vite.svg";
import reactLogo from "../../assets/react.svg";
import "./App.css";

const STORAGE_KEY = "options_count";

function App() {
  const [count, setCount] = useState(0);

  // Load persisted count on mount
  useEffect(() => {
    chrome.storage.local.get(STORAGE_KEY, (result) => {
      if (typeof result[STORAGE_KEY] === "number") {
        setCount(result[STORAGE_KEY]);
      }
    });
  }, []);

  const increment = () => {
    setCount((prev) => {
      const next = prev + 1;
      chrome.storage.local.set({ [STORAGE_KEY]: next });
      return next;
    });
  };

  const reset = () => {
    setCount(0);
    chrome.storage.local.set({ [STORAGE_KEY]: 0 });
  };

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Options</h1>
      <div className="card">
        <div className="button-group">
          <button onClick={increment}>count is {count}</button>
          <button onClick={reset}>reset</button>
        </div>
        <p>
          Edit <code>src/pages/options/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
