import React, { useState, useEffect } from "react";
import Sidebar from "../Components/Sidebar";
import TopBar from "../Components/TopBar";
import { useApp } from "../Context/AppContext";
import {
  BsPlus,
  BsCheckCircle,
  BsCircle,
  BsArrowRight,
  BsArrowRepeat,
} from "react-icons/bs";
import { MdTimeline, MdSchool, MdWork, MdTrendingUp } from "react-icons/md";
import axios from "axios";
import { toast } from "react-hot-toast";

export default function CareerRoadmap() {
  const { isOpen } = useApp();
  const [roadmap, setRoadmap] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    currentEducation: "",
    currentSkills: "",
    interests: "",
    targetRole: "",
    experienceLevel: "entry",
  });

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const fetchRoadmap = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/roadmap`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setRoadmap(response.data.roadmap);
    } catch (error) {
      if (error.response?.status === 404) {
        setShowCreateForm(true);
      } else {
        toast.error("Failed to load career roadmap");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRoadmap = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/roadmap`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setRoadmap(response.data.roadmap);
      setShowCreateForm(false);
      toast.success("Career roadmap created successfully!");
    } catch (error) {
      toast.error("Failed to create career roadmap");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkComplete = async (goalType, goalIndex, completed) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/api/roadmap/goal`,
        { goalType, goalIndex, completed },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchRoadmap(); // Refresh roadmap
      toast.success(
        `Goal ${completed ? "marked as complete" : "marked as incomplete"}`
      );
    } catch (error) {
      toast.error("Failed to update goal status");
    }
  };

  const handleRegenerateRoadmap = async () => {
    if (!confirm("This will regenerate your entire roadmap. Are you sure?"))
      return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/roadmap/regenerate`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setRoadmap(response.data?.roadmap);
      toast.success("Career roadmap regenerated successfully!");
    } catch (error) {
      toast.error("Failed to regenerate roadmap");
    } finally {
      setIsLoading(false);
    }
  };

  const renderGoalSection = (title, goals, goalType, icon) => (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center gap-3 mb-4">
        {icon}
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      </div>
      {goals && goals.length > 0 ? (
        <div className="space-y-3">
          {goals.map((goal, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
            >
              <button
                onClick={() =>
                  handleMarkComplete(goalType, index, !goal.completed)
                }
                className="flex-shrink-0 mt-1"
              >
                {goal.completed ? (
                  <BsCheckCircle className="text-green-500 text-lg" />
                ) : (
                  <BsCircle className="text-gray-400 text-lg hover:text-gray-600" />
                )}
              </button>
              <div className="flex-1">
                <p
                  className={`text-sm ${
                    goal.completed
                      ? "line-through text-gray-500"
                      : "text-gray-800"
                  }`}
                >
                  {goal.goal || goal.skill || goal.name || goal.opportunity}
                </p>
                {goal.timeline && (
                  <p className="text-xs text-gray-500 mt-1">{goal.timeline}</p>
                )}
                {goal.completed && goal.completedDate && (
                  <p className="text-xs text-green-600 mt-1">
                    Completed:{" "}
                    {new Date(goal.completedDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-sm">No goals set yet.</p>
      )}
    </div>
  );

  const renderProgressCard = (title, progress, color) => (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-700">{title}</h4>
        <span className="text-sm font-semibold text-gray-900">
          {Math.round(progress)}%
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${color}`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="w-full h-screen flex flex-row">
        {isOpen && (
          <div className="w-1/5 h-screen">
            <Sidebar />
          </div>
        )}
        <div
          className={`h-screen flex flex-col ${isOpen ? "w-4/5" : "w-full"}`}
        >
          <TopBar />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">
                Loading your career roadmap...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showCreateForm) {
    return (
      <div className="w-full h-screen flex flex-row">
        {isOpen && (
          <div className="w-1/5 h-screen">
            <Sidebar />
          </div>
        )}
        <div
          className={`h-screen flex flex-col ${isOpen ? "w-4/5" : "w-full"}`}
        >
          <TopBar />
          <div className="flex-1 p-6">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Create Your Career Roadmap
                </h1>
                <p className="text-gray-600">
                  Let's build a personalized plan for your career development
                </p>
              </div>

              <form onSubmit={handleCreateRoadmap} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Education Level
                  </label>
                  <input
                    type="text"
                    value={formData.currentEducation}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        currentEducation: e.target.value,
                      })
                    }
                    placeholder="e.g., Bachelor's in Computer Science, High School Diploma"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Skills
                  </label>
                  <textarea
                    value={formData.currentSkills}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        currentSkills: e.target.value,
                      })
                    }
                    placeholder="List your current skills (e.g., JavaScript, Project Management, Communication)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows="3"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Career Interests
                  </label>
                  <textarea
                    value={formData.interests}
                    onChange={(e) =>
                      setFormData({ ...formData, interests: e.target.value })
                    }
                    placeholder="Describe your career interests and goals"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows="3"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Role (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.targetRole}
                    onChange={(e) =>
                      setFormData({ ...formData, targetRole: e.target.value })
                    }
                    placeholder="e.g., Software Engineer, Data Scientist, Product Manager"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Experience Level
                  </label>
                  <select
                    value={formData.experienceLevel}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        experienceLevel: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="entry">Entry Level</option>
                    <option value="mid">Mid Level</option>
                    <option value="senior">Senior Level</option>
                    <option value="expert">Expert Level</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-purple-500 text-white py-3 px-6 rounded-lg hover:bg-purple-600 disabled:opacity-50 transition-colors"
                >
                  {isLoading ? "Creating Roadmap..." : "Create Career Roadmap"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const mainContent = (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Career Roadmap
            </h1>
            <p className="text-gray-600">
              Track your progress and achieve your career goals
            </p>
          </div>
          <button
            onClick={handleRegenerateRoadmap}
            className="flex items-center gap-2 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors"
          >
            <BsArrowRepeat className="text-sm" />
            Regenerate
          </button>
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {renderProgressCard(
            "Short-term Goals",
            roadmap?.progress?.shortTermProgress || 0,
            "bg-blue-500"
          )}
          {renderProgressCard(
            "Medium-term Goals",
            roadmap?.progress?.mediumTermProgress || 0,
            "bg-yellow-500"
          )}
          {renderProgressCard(
            "Long-term Goals",
            roadmap?.progress?.longTermProgress || 0,
            "bg-green-500"
          )}
          {renderProgressCard(
            "Overall Progress",
            roadmap?.progress?.overallProgress || 0,
            "bg-purple-500"
          )}
        </div>

        {/* Roadmap Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {renderGoalSection(
            "Short-term Goals (3-6 months)",
            roadmap?.roadmap.shortTermGoals,
            "shortTermGoals",
            <MdTimeline className="text-purple-500 text-xl" />
          )}
          {renderGoalSection(
            "Medium-term Goals (6-18 months)",
            roadmap?.roadmap.mediumTermGoals,
            "mediumTermGoals",
            <MdWork className="text-blue-500 text-xl" />
          )}
          {renderGoalSection(
            "Long-term Goals (1-3 years)",
            roadmap?.roadmap.longTermGoals,
            "longTermGoals",
            <MdTrendingUp className="text-green-500 text-xl" />
          )}
          {renderGoalSection(
            "Courses & Certifications",
            roadmap?.roadmap.courses,
            "courses",
            <MdSchool className="text-orange-500 text-xl" />
          )}
          {renderGoalSection(
            "Skills to Develop",
            roadmap?.roadmap.skillsToDevelop,
            "skillsToDevelop",
            <MdTimeline className="text-indigo-500 text-xl" />
          )}
          {renderGoalSection(
            "Networking Opportunities",
            roadmap?.roadmap.networkingOpportunities,
            "networkingOpportunities",
            <MdWork className="text-teal-500 text-xl" />
          )}
        </div>

        {/* Target Job Titles */}
        {roadmap?.roadmap.targetJobTitles &&
          roadmap?.roadmap.targetJobTitles.length > 0 && (
            <div className="mt-6 bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Target Job Titles
              </h3>
              <div className="flex flex-wrap gap-2">
                {roadmap?.roadmap.targetJobTitles.map((job, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium"
                  >
                    {job?.title}
                  </span>
                ))}
              </div>
            </div>
          )}
      </div>
    </div>
  );

  return (
    <div className="w-full h-screen flex flex-row">
      {isOpen ? (
        <div className="w-full h-screen flex flex-row">
          <div className="w-1/5 h-screen">
            <Sidebar />
          </div>
          <div className="w-4/5 h-screen flex flex-col">
            <TopBar />
            {mainContent}
          </div>
        </div>
      ) : (
        <div className="w-full h-screen flex flex-col">
          <TopBar />
          {mainContent}
        </div>
      )}
    </div>
  );
}
