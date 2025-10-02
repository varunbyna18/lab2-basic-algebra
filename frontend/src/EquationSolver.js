// src/EquationSolver.js
import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

function EquationSolver() {
  const [equation, setEquation] = useState("");
  const [solution, setSolution] = useState("");
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);

  // 🌐 Use your Render backend instead of localhost
  const API_BASE = "https://lab2-basic-algebra.onrender.com";


  // 🔹 Load previous attempts from MongoDB on mount
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(`${API_BASE}/attempts`);
        const data = await response.json();

        if (data.success) {
          // Parse solutions into { variable, value }
          const parsed = data.attempts
            .map((att) => {
              if (!att.solution) return null;
              const [variable, value] = att.solution.split("=");
              const numericValue = parseFloat(value?.trim());
              if (isNaN(numericValue)) return null;
              return { variable: variable.trim(), value: numericValue };
            })
            .filter(Boolean);

          setHistory(parsed);
        }
      } catch (err) {
        console.error("⚠️ Failed to load history", err);
      }
    };

    fetchHistory();
  }, []);

  const solveEquation = async () => {
    try {
      const response = await fetch(`${API_BASE}/solve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ equation }),
      });

      const data = await response.json();

      if (data.success) {
        setSolution(data.solution);
        setError("");

        // Extract numeric solution
        const [variable, value] = data.solution.split("=");
        const numericValue = parseFloat(value.trim());

        // Update local history state
        setHistory((prev) => [
          ...prev,
          { variable: variable.trim(), value: numericValue },
        ]);
      } else {
        setError("⚠️ Unsupported equation");
        setSolution("");
      }
    } catch (err) {
      setError("❌ Failed to connect to backend");
      setSolution("");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "40px" }}>
      <h1>
        <span role="img" aria-label="abacus">🧮</span> Equation Solver
      </h1>
      <input
        type="text"
        value={equation}
        onChange={(e) => setEquation(e.target.value)}
        placeholder="Enter equation (e.g. 5+x=9)"
        style={{ padding: "8px", width: "250px", marginRight: "8px" }}
      />
      <button onClick={solveEquation} style={{ padding: "8px 16px" }}>
        Solve
      </button>

      {solution && (
        <div style={{ marginTop: "20px", color: "green", fontWeight: "bold" }}>
          ✅ Solution: <span dangerouslySetInnerHTML={{ __html: solution }} />
        </div>
      )}
      {error && (
        <div style={{ marginTop: "20px", color: "red" }}>
          {error}
        </div>
      )}

      {/* Visualization */}
      {history.length > 0 && (
        <div style={{ marginTop: "40px" }}>
          <h3>📊 Visualization of Solved Equations</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={history} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="variable" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export default EquationSolver;
