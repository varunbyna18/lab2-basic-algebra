import React, { useState } from "react";

function Practice() {
  const [equation, setEquation] = useState("");
  const [solution, setSolution] = useState("");

  const solveEquation = async () => {
    const res = await fetch("http://localhost:5000/solve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ equation }),
    });
    const data = await res.json();
    setSolution(data.success ? data.solution : data.message);
  };

  return (
    <div className="page">
      <h2>🧮 Practice Solving Equations</h2>
      <input
        value={equation}
        onChange={(e) => setEquation(e.target.value)}
        placeholder="e.g., 5 + x = 9"
      />
      <button onClick={solveEquation}>Solve</button>
      {solution && <h3>Result: {solution}</h3>}
    </div>
  );
}

export default Practice;
