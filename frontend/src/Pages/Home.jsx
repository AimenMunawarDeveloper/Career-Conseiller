import React from "react";
import Sidebar from "../Components/Sidebar";
import TopBar from "../Components/TopBar";
import { useApp } from "../Context/AppContext";

export default function Home() {
  const { isOpen } = useApp();
  return (
    <div className="w-full h-screen flex flex-row">
      {isOpen ? (
        <div className="w-full h-screen flex flex-row">
          <div className="w-1/5 h-screen">
            <Sidebar />
          </div>
          <div className="w-4/5 h-screen">
            <TopBar />
            right side content
          </div>
        </div>
      ) : (
        <div className="w-full h-screen flex flex-row">
          <div className="w-full h-screen">
            <TopBar />
            right side content
          </div>
        </div>
      )}
    </div>
  );
}
