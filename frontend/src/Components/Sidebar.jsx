import React from "react";
import logov2 from "../../assets/images/logov2.png";

export default function Sidebar() {
  return (
    <div className="h-full w-full bg-purple-500">
      <div className="w-full flex items-center p-30">
        {" "}
        <img src={logov2} alt="logo" className="w-28 h-28" />
        <div></div>
      </div>
    </div>
  );
}
