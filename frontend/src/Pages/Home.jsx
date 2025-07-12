import React from "react";
import Sidebar from "../Components/Sidebar";

export default function Home() {
  return (
    <div className="w-full h-screen flex flex-row">
      <div className="w-1/4 h-screen">
        <Sidebar />
      </div>
      <div className="w-3/4 h-screen">right side content</div>
    </div>
  );
}
