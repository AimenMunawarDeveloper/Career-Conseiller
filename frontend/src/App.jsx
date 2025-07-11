import React from "react";
import { createRoot } from "react-dom/client";
import Home from "./Pages/Home.jsx";
import LoginSignup from "./Pages/LoginSignup.jsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./Context/AppContext.jsx";

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginSignup />} />
          <Route path="/Home" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
const root = createRoot(document.getElementById("app"));
root.render(<App />);
