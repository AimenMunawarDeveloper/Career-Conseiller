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
    <div className="h-full w-full p-4 md:p-6">
      <div className="w-full flex flex-col h-full">
        <div className="w-full flex justify-center mb-6">
          {/* Responsive logo */}
          <img
            src={logov2}
            alt="logo"
            className="w-3/4 max-w-[120px] md:max-w-[140px] lg:max-w-[160px]"
          />
        </div>

        <div className="flex-1 flex flex-col gap-3 md:gap-4">
          {/* Sidebar items with responsive text */}
          <div
            className="w-full flex items-center gap-3 md:gap-4 hover:bg-purple-600 rounded-md p-2 md:p-3 cursor-pointer transition-colors duration-200"
            onClick={() => navigate("/AlChat")}
          >
            <HiMiniSparkles className="text-xl md:text-2xl flex-shrink-0" />
            <div className="text-sm md:text-base lg:text-lg font-medium truncate">
              AI Chat
            </div>
          </div>

          <div
            className="w-full flex items-center gap-3 md:gap-4 hover:bg-purple-600 rounded-md p-2 md:p-3 cursor-pointer transition-colors duration-200"
            onClick={() => navigate("/CareerRoadmap")}
          >
            <MdTimeline className="text-xl md:text-2xl flex-shrink-0" />
            <div className="text-sm md:text-base lg:text-lg font-medium truncate">
              Career Roadmap
            </div>
          </div>

          <div
            className="w-full flex items-center gap-3 md:gap-4 hover:bg-purple-600 rounded-md p-2 md:p-3 cursor-pointer transition-colors duration-200"
            onClick={() => navigate("/SkillGapAnalyzer")}
          >
            <MdAnalytics className="text-xl md:text-2xl flex-shrink-0" />
            <div className="text-sm md:text-base lg:text-lg font-medium truncate">
              Skill Gap Analyzer
            </div>
          </div>

          <div
            className="w-full flex items-center gap-3 md:gap-4 hover:bg-purple-600 rounded-md p-2 md:p-3 cursor-pointer transition-colors duration-200"
            onClick={() => navigate("/MockInterview")}
          >
            <MdQuestionAnswer className="text-xl md:text-2xl flex-shrink-0" />
            <div className="text-sm md:text-base lg:text-lg font-medium truncate">
              Mock Interview
            </div>
          </div>

          <div
            className="w-full flex items-center gap-3 md:gap-4 hover:bg-purple-600 rounded-md p-2 md:p-3 cursor-pointer transition-colors duration-200"
            onClick={() => navigate("/ResumeAnalyzer")}
          >
            <MdDescription className="text-xl md:text-2xl flex-shrink-0" />
            <div className="text-sm md:text-base lg:text-lg font-medium truncate">
              Resume Analyzer
            </div>
          </div>

          <div
            className="w-full flex items-center gap-3 md:gap-4 hover:bg-purple-600 rounded-md p-2 md:p-3 cursor-pointer transition-colors duration-200"
            onClick={() => navigate("/LatestJobs")}
          >
            <GiStairsGoal className="text-xl md:text-2xl flex-shrink-0" />
            <div className="text-sm md:text-base lg:text-lg font-medium truncate">
              Latest Jobs
            </div>
          </div>

          <div
            className="w-full flex items-center gap-3 md:gap-4 hover:bg-purple-600 rounded-md p-2 md:p-3 cursor-pointer transition-colors duration-200"
            onClick={() => navigate("/SkillsInformation")}
          >
            <FaInfoCircle className="text-xl md:text-2xl flex-shrink-0" />
            <div className="text-sm md:text-base lg:text-lg font-medium truncate">
              Skills Information
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
