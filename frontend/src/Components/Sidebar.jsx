import React from "react";
import logov2 from "../../assets/images/logov2.png";
import { HiMiniSparkles } from "react-icons/hi2";
import { GiStairsGoal } from "react-icons/gi";
import { FaWandMagicSparkles } from "react-icons/fa6";

export default function Sidebar() {
  return (
    <div className="h-full w-full bg-purple-500 border-r-2 border-black p-6">
      <div className="w-full flex p-30 flex-col">
        {" "}
        <div className="w-full flex justify-center">
          {" "}
          <img src={logov2} alt="logo" className="w-2/4" />
        </div>
        <div className="w-full flex flex-col gap-6 pt-10 ">
          <div className="w-full flex gap-6 hover:bg-purple-600 rounded-md p-2 cursor-pointer">
            <HiMiniSparkles className="text-2xl" />
            <div className="text-xl">AI Interaction</div>
          </div>
          <div className="w-full flex gap-6 hover:bg-purple-600 rounded-md p-2 cursor-pointer">
            <GiStairsGoal className="text-2xl" />
            <div className="text-xl">Careers Information</div>
          </div>
          <div className="w-full flex gap-6 hover:bg-purple-600 rounded-md p-2 cursor-pointer">
            <FaWandMagicSparkles className="text-2xl" />
            <div className="text-xl">Personalized Recommendation</div>
          </div>
        </div>
        <div></div>
      </div>
    </div>
  );
}
