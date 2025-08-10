import React from "react";
import { createRoot } from "react-dom/client";
import Home from "./Pages/Home.jsx";
import LoginSignup from "./Pages/LoginSignup.jsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./Context/AppContext.jsx";
import AlChat from "./Pages/AlChat.jsx";
import LatestJobs from "./Pages/LatestJobs.jsx";
import SkillsInformation from "./Pages/SkillsInformation.jsx";
import CareerRoadmap from "./Pages/CareerRoadmap.jsx";
import ResumeBuilder from "./Pages/ResumeBuilder.jsx";
import SkillGapAnalyzer from "./Pages/SkillGapAnalyzer.jsx";
import MockInterview from "./Pages/MockInterview.jsx";
import { Toaster } from "react-hot-toast";

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginSignup />} />
          <Route path="/Home" element={<Home />} />
          <Route path="/AlChat" element={<AlChat />} />
          <Route path="/LatestJobs" element={<LatestJobs />} />
          <Route path="/SkillsInformation" element={<SkillsInformation />} />
          <Route path="/CareerRoadmap" element={<CareerRoadmap />} />
          <Route path="/ResumeBuilder" element={<ResumeBuilder />} />
          <Route path="/SkillGapAnalyzer" element={<SkillGapAnalyzer />} />
          <Route path="/MockInterview" element={<MockInterview />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" />
    </AppProvider>
  );
}
const root = createRoot(document.getElementById("app"));
root.render(<App />);
