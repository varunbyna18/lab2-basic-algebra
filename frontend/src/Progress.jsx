import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot
} from "recharts";

export default function Progress() {
  const [attempts, setAttempts] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/progress")
      .then((res) => res.json())
      .then((data) => setAttempts(data))
      .catch((err) => console.error("❌ Failed to load progress:", err));
  }, []);

  // Function to evaluate left-hand side for a given x
  const evaluateEquation = (equation, x) => {
    try {
      const [lhs, rhs] = equation.split("=");
      // Replace "x" with actual number
      const lhsEval = eval(lhs.replace(/x/g, `(${x})`));
      const rhsEval = eval(rhs.replace(/x/g, `(${x})`));
      return lhsEval - rhsEval; // f(x) = lhs - rhs
    } catch (e) {
      return null;
    }
  };

  return (
    <div className="page">
      <h2>📊 Progress & Visualization</h2>
      {attempts.length === 0 ? (
        <p>No attempts yet.</p>
      ) : (
        attempts.map((attempt, idx) => {
          const { equation, solution } = attempt;

          // Extract numeric solution from "x = 5"
          let solX = null;
          if (solution && solution.includes("=")) {
            solX = parseFloat(solution.split("=")[1].trim());
          }

          // Build chart data: x from -10 to 10
          const data = [];
          for (let x = -10; x <= 10; x++) {
            const y = evaluateEquation(equation, x);
            if (y !== null) data.push({ x, y });
          }

          return (
            <div key={idx} style={{ marginBottom: "40px" }}>
              <h4>
                {equation} → {solution}
              </h4>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data}>
                  <CartesianGrid stroke="#ccc" />
                  <XAxis dataKey="x" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="y" stroke="#007bff" dot={false} />
                  {solX !== null && (
                    <ReferenceDot
                      x={solX}
                      y={0}
                      r={6}
                      stroke="red"
                      strokeWidth={2}
                      fill="red"
                      label={{ value: `x=${solX}`, position: "top" }}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          );
        })
      )}
    </div>
  );
}
