import { useNavigate } from "react-router-dom";
import "../App.css";

function Detail() {
  const navigate = useNavigate();

  return (
    <>
      <h1>Detail</h1>
      <p>
        Edit <code>src/pages/sidepanel/routes/Detail.tsx</code> and save to test
        HMR
      </p>
      <div className="card">
        <button type="button" onClick={() => navigate("/")}>
          Back to Home
        </button>
      </div>
    </>
  );
}

export default Detail;
