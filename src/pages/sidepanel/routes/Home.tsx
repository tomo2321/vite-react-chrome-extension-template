import { useState } from "react";
import { useNavigate } from "react-router-dom";
import viteLogo from "/vite.svg";
import reactLogo from "../../../assets/react.svg";
import "../App.css";

function Home() {
  const [count, setCount] = useState(0);
  const navigate = useNavigate();

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank" rel="noopener">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank" rel="noopener">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Side Panel</h1>
      <div className="card">
        <button type="button" onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/pages/sidepanel/routes/Home.tsx</code> and save to test
          HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
      <div className="card">
        <button type="button" onClick={() => navigate("/detail")}>
          Go to Detail
        </button>
      </div>
    </>
  );
}

export default Home;
