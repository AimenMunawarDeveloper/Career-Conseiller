import React from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import { useApp } from "../Context/AppContext";

export default function Layout({ children }) {
  const { isOpen } = useApp();

  return (
    <div className="w-full h-screen flex flex-row overflow-hidden">
      {/* Sidebar - always present but responsive width */}
      <div
        className={`h-screen bg-purple-500 border-r-2 border-black transition-all duration-300 ease-in-out ${
          isOpen
            ? "w-64 md:w-72 lg:w-80" // Open state - responsive widths
            : "w-0" // Closed state - no width
        }`}
      >
        {isOpen && <Sidebar />}
      </div>

      {/* Main content area - responsive to sidebar state */}
      <div
        className={`h-screen flex flex-col transition-all duration-300 ease-in-out ${
          isOpen
            ? "flex-1" // Use flex-1 to take remaining space
            : "w-full" // Full width when sidebar closed
        }`}
      >
        <TopBar />
        <div className="flex-1 overflow-auto p-6">{children}</div>
      </div>
    </div>
  );
}
