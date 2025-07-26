import React from "react";
import logov2 from "../../assets/images/logov2.png";
import { HiMiniSparkles } from "react-icons/hi2";
import { GiStairsGoal } from "react-icons/gi";
import { FaWandMagicSparkles } from "react-icons/fa6";
import { FaInfoCircle } from "react-icons/fa";
import {
  MdTimeline,
  MdDescription,
  MdPeople,
  MdAnalytics,
  MdQuestionAnswer,
} from "react-icons/md";
import { useNavigate } from "react-router-dom";

export default function Sidebar() {
  const navigate = useNavigate();
  return (
    <div className="h-full w-full bg-purple-500 border-r-2 border-black p-6">
      <div className="w-full flex flex-col">
        <div className="w-full flex justify-center">
          {/* Responsive width: max width on small screens */}
          <img src={logov2} alt="logo" className="w-2/4 max-w-xs sm:max-w-sm" />
        </div>
        <div className="w-full flex flex-col gap-4 pt-6 sm:gap-6 sm:pt-10">
          {/* Sidebar items */}
          <div
            className="w-full flex items-center gap-4 hover:bg-purple-600 rounded-md p-2 cursor-pointer"
            onClick={() => navigate("/AlChat")}
          >
            <HiMiniSparkles className="text-2xl flex-shrink-0" />
            <div className="text-xl truncate">AI Chat</div>
          </div>

          <div
            className="w-full flex items-center gap-4 hover:bg-purple-600 rounded-md p-2 cursor-pointer"
            onClick={() => navigate("/CareerRoadmap")}
          >
            <MdTimeline className="text-2xl flex-shrink-0" />
            <div className="text-xl truncate">Career Roadmap</div>
          </div>

          <div
            className="w-full flex items-center gap-4 hover:bg-purple-600 rounded-md p-2 cursor-pointer"
            onClick={() => navigate("/SkillGapAnalyzer")}
          >
            <MdAnalytics className="text-2xl flex-shrink-0" />
            <div className="text-xl truncate">Skill Gap Analyzer</div>
          </div>

          <div
            className="w-full flex items-center gap-4 hover:bg-purple-600 rounded-md p-2 cursor-pointer"
            onClick={() => navigate("/MockInterview")}
          >
            <MdQuestionAnswer className="text-2xl flex-shrink-0" />
            <div className="text-xl truncate">Mock Interview</div>
          </div>

          <div
            className="w-full flex items-center gap-4 hover:bg-purple-600 rounded-md p-2 cursor-pointer"
            onClick={() => navigate("/ResumeBuilder")}
          >
            <MdDescription className="text-2xl flex-shrink-0" />
            <div className="text-xl truncate">Resume Builder</div>
          </div>

          <div
            className="w-full flex items-center gap-4 hover:bg-purple-600 rounded-md p-2 cursor-pointer"
            onClick={() => navigate("/Mentorship")}
          >
            <MdPeople className="text-2xl flex-shrink-0" />
            <div className="text-xl truncate">Mentorship</div>
          </div>

          <div
            className="w-full flex items-center gap-4 hover:bg-purple-600 rounded-md p-2 cursor-pointer"
            onClick={() => navigate("/LatestJobs")}
          >
            <GiStairsGoal className="text-2xl flex-shrink-0" />
            <div className="text-xl truncate">Latest Jobs</div>
          </div>

          <div
            className="w-full flex items-center gap-4 hover:bg-purple-600 rounded-md p-2 cursor-pointer"
            onClick={() => navigate("/SkillsInformation")}
          >
            <FaInfoCircle className="text-2xl flex-shrink-0" />
            <div className="text-xl truncate">Skills Information</div>
          </div>
        </div>
      </div>
    </div>
  );
}
