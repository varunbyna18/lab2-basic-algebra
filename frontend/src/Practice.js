import React from "react";
import EquationSolver from "./EquationSolver";

function Practice() {
  return (
    <div className="page">
      <h2>📝 Practice Solving Equations</h2>
      <p>Enter a linear equation (example: 2x+3=11 or 4y-5=7) and see the solution.</p>
      <EquationSolver />
    </div>
  );
}

export default Practice;
