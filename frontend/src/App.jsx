import React from "react";
import { createRoot } from "react-dom/client";
import Home from "./Pages/Home.jsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}
const root = createRoot(document.getElementById("app"));
root.render(<App />);
