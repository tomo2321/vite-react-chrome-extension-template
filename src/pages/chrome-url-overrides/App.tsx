import { useState } from "react";
import viteLogo from "/vite.svg";
import reactLogo from "../../assets/react.svg";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center p-8 text-center">
      <div className="flex justify-center">
        <a href="https://vite.dev" target="_blank">
          <img
            src={viteLogo}
            className="h-[6em] p-[1.5em] will-change-[filter] [transition:filter_300ms] hover:filter-[drop-shadow(0_0_2em_#646cffaa)]"
            alt="Vite logo"
          />
        </a>
        <a href="https://react.dev" target="_blank">
          <img
            src={reactLogo}
            className="h-[6em] p-[1.5em] will-change-[filter] [transition:filter_300ms] hover:filter-[drop-shadow(0_0_2em_#61dafbaa)] motion-safe:animate-[logo-spin_20s_linear_infinite]"
            alt="React logo"
          />
        </a>
      </div>
      <h1>Chrome URL Overrides</h1>
      <div className="p-[2em]">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/pages/chrome-url-overrides/App.tsx</code> and save to
          test HMR
        </p>
      </div>
      <p className="text-[#888]">
        Click on the Vite and React logos to learn more
      </p>
    </div>
  );
}

export default App;
