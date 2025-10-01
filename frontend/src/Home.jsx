import React from "react";
import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="page">
      <h1>Welcome to Basic Algebra App</h1>
      <p>Select an option:</p>
      <nav>
        <Link to="/practice">🧮 Practice Algebra</Link> |{" "}
        <Link to="/progress">📊 View Progress</Link>
      </nav>
    </div>
  );
}

export default Home;
