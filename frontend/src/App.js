// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import EquationSolver from "./EquationSolver";
import "./style.css";

function App() {
  return (
    <Router>
      <Routes>
        {/* Default route shows the Equation Solver */}
        <Route path="/" element={<EquationSolver />} />
      </Routes>
    </Router>
  );
}

export default App;
