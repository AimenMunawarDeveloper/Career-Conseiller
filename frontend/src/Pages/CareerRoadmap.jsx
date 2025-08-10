import React, { useState, useEffect } from "react";
import Layout from "../Components/Layout";
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
  const [roadmap, setRoadmap] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    currentEducation: "",
    currentSkills: "",
    interests: "",
    targetRole: "",
    experienceLevel: "entry",
    resumeContent: "",
    preferredIndustry: "",
    salaryExpectations: "",
    workStyle: "flexible",
    locationPreferences: "",
    timeline: "",
  });
  const [resumeFile, setResumeFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [autoFilledFields, setAutoFilledFields] = useState(new Set());

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
      // Handle the nested roadmap structure
      const roadmapData = response.data.roadmap;
      const actualRoadmap = roadmapData.roadmap || roadmapData;
      console.log("Fetch roadmap data:", actualRoadmap);
      setRoadmap(actualRoadmap);

      // Load existing data into form for editing
      setFormData({
        currentEducation: roadmapData.currentEducation || "",
        currentSkills: Array.isArray(roadmapData.currentSkills)
          ? roadmapData.currentSkills.join(", ")
          : roadmapData.currentSkills || "",
        interests: Array.isArray(roadmapData.interests)
          ? roadmapData.interests.join(", ")
          : roadmapData.interests || "",
        targetRole: roadmapData.targetRole || "",
        experienceLevel: roadmapData.experienceLevel || "entry",
        resumeContent: roadmapData.resumeContent || "",
        preferredIndustry: roadmapData.preferredIndustry || "",
        salaryExpectations: roadmapData.salaryExpectations || "",
        workStyle: roadmapData.workStyle || "flexible",
        locationPreferences: roadmapData.locationPreferences || "",
        timeline: roadmapData.timeline || "",
      });
      setShowCreateForm(false); // Don't show form if roadmap exists
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

  const handleResumeUpload = async (file) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/files/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // The text is already extracted in the upload response
      if (response.data.extractedText) {
        const extractedText = response.data.extractedText;

        // Auto-fill form fields based on resume content
        const autoFilledData = await autoFillFromResume(extractedText);

        // Track which fields were auto-filled
        const filledFields = new Set();
        Object.keys(autoFilledData).forEach((key) => {
          if (autoFilledData[key]) {
            filledFields.add(key);
          }
        });
        setAutoFilledFields(filledFields);

        setFormData((prev) => ({
          ...prev,
          resumeContent: extractedText,
          ...autoFilledData,
        }));

        toast.success(
          "Resume uploaded and analyzed successfully! Fields have been auto-filled."
        );
      } else {
        toast.warning(
          "Resume uploaded but text extraction failed. You can still proceed."
        );
      }
    } catch (error) {
      toast.error("Failed to upload resume");
      console.error("Resume upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  // Function to auto-fill form fields based on resume content
  const autoFillFromResume = async (resumeText) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/ai/analyze-resume-autofill`,
        { resumeText },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      return response.data.autoFilledData || {};
    } catch (error) {
      console.error("Failed to analyze resume for auto-fill:", error);
      // Fallback to basic extraction
      return extractBasicInfoFromResume(resumeText);
    }
  };

  // Fallback function for basic resume parsing
  const extractBasicInfoFromResume = (resumeText) => {
    const autoFilledData = {};

    // Extract education
    const educationPatterns = [
      /(?:Bachelor|Master|PhD|B\.?S\.?|M\.?S\.?|B\.?A\.?|M\.?A\.?)[\s\w]*?(?:in|of|,)\s*([\w\s]+)/gi,
      /(?:University|College|Institute)[\s\w]*?(?:of|at|,)\s*([\w\s]+)/gi,
    ];

    for (const pattern of educationPatterns) {
      const match = resumeText.match(pattern);
      if (match) {
        autoFilledData.currentEducation = match[0].trim();
        break;
      }
    }

    // Extract skills
    const skillsPatterns = [
      /(?:Skills|Technologies|Programming Languages|Tools):\s*([^.\n]+)/gi,
      /(?:JavaScript|Python|Java|React|Node\.js|SQL|AWS|Docker|Git|HTML|CSS|TypeScript|Angular|Vue|MongoDB|PostgreSQL|MySQL|Redis|Kubernetes|Docker|Jenkins|Jira|Agile|Scrum)/gi,
    ];

    const skills = [];
    for (const pattern of skillsPatterns) {
      const matches = resumeText.match(pattern);
      if (matches) {
        skills.push(...matches.map((skill) => skill.replace(/[:\s]+$/, "")));
      }
    }

    if (skills.length > 0) {
      autoFilledData.currentSkills = [...new Set(skills)].join(", ");
    }

    // Extract job titles/roles
    const rolePatterns = [
      /(?:Software Engineer|Developer|Programmer|Data Scientist|Product Manager|Designer|Analyst|Architect|Lead|Senior|Junior|Full Stack|Frontend|Backend|DevOps|QA|Test)/gi,
    ];

    const roles = [];
    for (const pattern of rolePatterns) {
      const matches = resumeText.match(pattern);
      if (matches) {
        roles.push(...matches);
      }
    }

    if (roles.length > 0) {
      autoFilledData.targetRole = roles[0];
    }

    // Extract experience level based on years of experience
    const experiencePattern =
      /(\d+)\s*(?:years?|yrs?)\s*(?:of\s*)?experience/gi;
    const experienceMatch = resumeText.match(experiencePattern);
    if (experienceMatch) {
      const years = parseInt(experienceMatch[0].match(/\d+/)[0]);
      if (years < 2) autoFilledData.experienceLevel = "entry";
      else if (years < 5) autoFilledData.experienceLevel = "mid";
      else if (years < 10) autoFilledData.experienceLevel = "senior";
      else autoFilledData.experienceLevel = "expert";
    }

    return autoFilledData;
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

      // Handle the nested roadmap structure
      const roadmapData = response.data.roadmap;
      const actualRoadmap = roadmapData.roadmap || roadmapData;
      console.log("Create roadmap data:", actualRoadmap);
      setRoadmap(actualRoadmap);

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

      // Send the current form data for regeneration
      const regenerateData = {
        currentEducation: formData.currentEducation,
        currentSkills: formData.currentSkills,
        interests: formData.interests,
        targetRole: formData.targetRole,
        experienceLevel: formData.experienceLevel,
        resumeContent: formData.resumeContent,
        preferredIndustry: formData.preferredIndustry,
        salaryExpectations: formData.salaryExpectations,
        workStyle: formData.workStyle,
        locationPreferences: formData.locationPreferences,
        timeline: formData.timeline,
      };

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/roadmap/regenerate`,
        regenerateData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Handle the nested roadmap structure
      const roadmapData = response.data.roadmap;
      const actualRoadmap = roadmapData.roadmap || roadmapData;
      console.log("Regenerate roadmap data:", actualRoadmap);
      setRoadmap(actualRoadmap);

      toast.success("Career roadmap regenerated successfully!");
    } catch (error) {
      console.error("Regenerate error:", error);
      toast.error("Failed to regenerate career roadmap");
    } finally {
      setIsLoading(false);
    }
  };

  const renderGoalSection = (title, goals, goalType, icon) => (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center mb-4">
        <div className="text-2xl text-purple-500 mr-3">{icon}</div>
        <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
      </div>
      <div className="space-y-3">
        {goals.map((goal, index) => (
          <div key={index} className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <button
                  onClick={() =>
                    handleMarkComplete(goalType, index, !goal.completed)
                  }
                  className="mr-3 text-xl"
                >
                  {goal.completed ? (
                    <BsCheckCircle className="text-green-500" />
                  ) : (
                    <BsCircle className="text-gray-400" />
                  )}
                </button>
                <span
                  className={`${
                    goal.completed
                      ? "line-through text-gray-500"
                      : "text-gray-700"
                  } font-medium`}
                >
                  {goal.goal}
                </span>
              </div>
              {goal.priority && (
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    goal.priority === "high"
                      ? "bg-red-100 text-red-800"
                      : goal.priority === "medium"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {goal.priority}
                </span>
              )}
            </div>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>{goal.timeline}</span>
              {goal.estimatedEffort && (
                <span>Effort: {goal.estimatedEffort}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderProgressCard = (title, progress, color) => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
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
      <Layout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your career roadmap...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (showCreateForm) {
    return (
      <Layout>
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
            {/* Resume Upload Section */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Resume Upload (Optional) - Auto-fill Available
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Upload your resume to automatically fill in education, skills,
                experience level, and target role fields.
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Your Resume
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setResumeFile(file);
                        handleResumeUpload(file);
                      }
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  {isUploading && (
                    <p className="text-sm text-blue-600 mt-2">
                      Uploading and analyzing resume...
                    </p>
                  )}
                  {formData.resumeContent && (
                    <p className="text-sm text-green-600 mt-2">
                      ✓ Resume analyzed successfully
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Education Level
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.currentEducation}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        currentEducation: e.target.value,
                      });
                      // Remove auto-filled indicator if user manually edits
                      if (autoFilledFields.has("currentEducation")) {
                        setAutoFilledFields((prev) => {
                          const newSet = new Set(prev);
                          newSet.delete("currentEducation");
                          return newSet;
                        });
                      }
                    }}
                    placeholder="e.g., Bachelor's in Computer Science"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      autoFilledFields.has("currentEducation")
                        ? "border-green-300 bg-green-50"
                        : "border-gray-300"
                    }`}
                    required
                  />
                  {autoFilledFields.has("currentEducation") && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        Auto-filled
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Role
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.targetRole}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        targetRole: e.target.value,
                      });
                      // Remove auto-filled indicator if user manually edits
                      if (autoFilledFields.has("targetRole")) {
                        setAutoFilledFields((prev) => {
                          const newSet = new Set(prev);
                          newSet.delete("targetRole");
                          return newSet;
                        });
                      }
                    }}
                    placeholder="e.g., Software Engineer, Data Scientist"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      autoFilledFields.has("targetRole")
                        ? "border-green-300 bg-green-50"
                        : "border-gray-300"
                    }`}
                  />
                  {autoFilledFields.has("targetRole") && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        Auto-filled
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Skills
              </label>
              <div className="relative">
                <textarea
                  value={formData.currentSkills}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      currentSkills: e.target.value,
                    });
                    // Remove auto-filled indicator if user manually edits
                    if (autoFilledFields.has("currentSkills")) {
                      setAutoFilledFields((prev) => {
                        const newSet = new Set(prev);
                        newSet.delete("currentSkills");
                        return newSet;
                      });
                    }
                  }}
                  placeholder="List your current skills separated by commas (e.g., JavaScript, Project Management, Communication)"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    autoFilledFields.has("currentSkills")
                      ? "border-green-300 bg-green-50"
                      : "border-gray-300"
                  }`}
                  rows="3"
                  required
                />
                {autoFilledFields.has("currentSkills") && (
                  <div className="absolute right-3 top-3">
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      Auto-filled
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Career Interests & Goals
              </label>
              <textarea
                value={formData.interests}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    interests: e.target.value,
                  })
                }
                placeholder="Describe your career interests, passions, and long-term goals separated by commas"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows="3"
                required
              />
            </div>

            {/* Additional Preferences */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Industry
                </label>
                <input
                  type="text"
                  value={formData.preferredIndustry}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      preferredIndustry: e.target.value,
                    })
                  }
                  placeholder="e.g., Technology, Healthcare, Finance"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experience Level
                </label>
                <div className="relative">
                  <select
                    value={formData.experienceLevel}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        experienceLevel: e.target.value,
                      });
                      // Remove auto-filled indicator if user manually edits
                      if (autoFilledFields.has("experienceLevel")) {
                        setAutoFilledFields((prev) => {
                          const newSet = new Set(prev);
                          newSet.delete("experienceLevel");
                          return newSet;
                        });
                      }
                    }}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      autoFilledFields.has("experienceLevel")
                        ? "border-green-300 bg-green-50"
                        : "border-gray-300"
                    }`}
                  >
                    <option value="entry">Entry Level</option>
                    <option value="mid">Mid Level</option>
                    <option value="senior">Senior Level</option>
                    <option value="expert">Expert Level</option>
                  </select>
                  {autoFilledFields.has("experienceLevel") && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        Auto-filled
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Work Style Preference
                </label>
                <select
                  value={formData.workStyle}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      workStyle: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="flexible">Flexible</option>
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="onsite">On-site</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Salary Expectations
                </label>
                <input
                  type="text"
                  value={formData.salaryExpectations}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      salaryExpectations: e.target.value,
                    })
                  }
                  placeholder="e.g., $60,000 - $80,000, Competitive"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location Preferences
                </label>
                <input
                  type="text"
                  value={formData.locationPreferences}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      locationPreferences: e.target.value,
                    })
                  }
                  placeholder="e.g., New York, Remote, West Coast"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Timeline
                </label>
                <input
                  type="text"
                  value={formData.timeline}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      timeline: e.target.value,
                    })
                  }
                  placeholder="e.g., 6 months, 1 year, Flexible"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Generate AI-Powered Career Roadmap
            </button>
          </form>
        </div>
      </Layout>
    );
  }

  if (!roadmap) {
    return (
      <Layout>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            No Career Roadmap Found
          </h2>
          <p className="text-gray-600 mb-6">
            Create your first career roadmap to get started on your professional
            journey.
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
          >
            <BsPlus className="inline mr-2" />
            Create Roadmap
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Your Career Roadmap
            </h1>
            <p className="text-gray-600">
              Track your progress and achieve your career goals
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center"
            >
              <BsPlus className="mr-2" />
              Edit
            </button>
            <button
              onClick={handleRegenerateRoadmap}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center"
            >
              <BsArrowRepeat className="mr-2" />
              Regenerate
            </button>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {renderProgressCard(
            "Short-term Goals",
            roadmap.shortTermGoals && roadmap.shortTermGoals.length > 0
              ? (roadmap.shortTermGoals.filter((g) => g.completed).length /
                  roadmap.shortTermGoals.length) *
                  100
              : 0,
            "bg-green-500"
          )}
          {renderProgressCard(
            "Medium-term Goals",
            roadmap.mediumTermGoals && roadmap.mediumTermGoals.length > 0
              ? (roadmap.mediumTermGoals.filter((g) => g.completed).length /
                  roadmap.mediumTermGoals.length) *
                  100
              : 0,
            "bg-blue-500"
          )}
          {renderProgressCard(
            "Long-term Goals",
            roadmap.longTermGoals && roadmap.longTermGoals.length > 0
              ? (roadmap.longTermGoals.filter((g) => g.completed).length /
                  roadmap.longTermGoals.length) *
                  100
              : 0,
            "bg-purple-500"
          )}
        </div>

        {/* Goal Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {roadmap.shortTermGoals &&
            roadmap.shortTermGoals.length > 0 &&
            renderGoalSection(
              "Short-term Goals (3-6 months)",
              roadmap.shortTermGoals,
              "shortTermGoals",
              <MdTimeline />
            )}
          {roadmap.mediumTermGoals &&
            roadmap.mediumTermGoals.length > 0 &&
            renderGoalSection(
              "Medium-term Goals (6-12 months)",
              roadmap.mediumTermGoals,
              "mediumTermGoals",
              <MdSchool />
            )}
          {roadmap.longTermGoals &&
            roadmap.longTermGoals.length > 0 &&
            renderGoalSection(
              "Long-term Goals (1-3 years)",
              roadmap.longTermGoals,
              "longTermGoals",
              <MdWork />
            )}
        </div>

        {/* No Goals Message */}
        {(!roadmap.shortTermGoals || roadmap.shortTermGoals.length === 0) &&
          (!roadmap.mediumTermGoals || roadmap.mediumTermGoals.length === 0) &&
          (!roadmap.longTermGoals || roadmap.longTermGoals.length === 0) && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-6">
              <div className="flex items-center">
                <MdTimeline className="text-2xl text-yellow-500 mr-3" />
                <div>
                  <h3 className="text-lg font-semibold text-yellow-800">
                    No Goals Generated Yet
                  </h3>
                  <p className="text-yellow-700 mt-1">
                    Your AI-powered career roadmap is being generated. Please
                    wait a moment or try regenerating the roadmap.
                  </p>
                </div>
              </div>
            </div>
          )}

        {/* Skills to Develop */}
        {roadmap.skillsToDevelop && roadmap.skillsToDevelop.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <div className="flex items-center mb-4">
              <MdTrendingUp className="text-2xl text-purple-500 mr-3" />
              <h3 className="text-xl font-semibold text-gray-800">
                Skills to Develop
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {roadmap.skillsToDevelop.map((skill, index) => (
                <div
                  key={index}
                  className="p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-800">
                      {skill.skill}
                    </h4>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        skill.priority === "high"
                          ? "bg-red-100 text-red-800"
                          : skill.priority === "medium"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {skill.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {skill.currentLevel} → {skill.targetLevel}
                  </p>
                  {skill.resources && skill.resources.length > 0 && (
                    <div className="text-sm text-gray-500">
                      <strong>Resources:</strong> {skill.resources.join(", ")}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommended Courses */}
        {roadmap.courses && roadmap.courses.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <div className="flex items-center mb-4">
              <MdSchool className="text-2xl text-purple-500 mr-3" />
              <h3 className="text-xl font-semibold text-gray-800">
                Recommended Courses
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {roadmap.courses.map((course, index) => (
                <div
                  key={index}
                  className="p-4 border border-gray-200 rounded-lg"
                >
                  <h4 className="font-semibold text-gray-800 mb-1">
                    {course.name}
                  </h4>
                  <p className="text-sm text-gray-600 mb-2">
                    {course.provider}
                  </p>
                  {course.duration && (
                    <p className="text-sm text-gray-500 mb-1">
                      Duration: {course.duration}
                    </p>
                  )}
                  {course.cost && (
                    <p className="text-sm text-gray-500 mb-2">
                      Cost: {course.cost}
                    </p>
                  )}
                  {course.skillsCovered && course.skillsCovered.length > 0 && (
                    <p className="text-sm text-gray-500 mb-2">
                      Skills: {course.skillsCovered.join(", ")}
                    </p>
                  )}
                  {course.url && (
                    <a
                      href={course.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:text-purple-700 text-sm flex items-center"
                    >
                      View Course
                      <BsArrowRight className="ml-1" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Networking Opportunities */}
        {roadmap.networkingOpportunities &&
          roadmap.networkingOpportunities.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
              <div className="flex items-center mb-4">
                <MdWork className="text-2xl text-purple-500 mr-3" />
                <h3 className="text-xl font-semibold text-gray-800">
                  Networking Opportunities
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {roadmap.networkingOpportunities.map((opportunity, index) => (
                  <div
                    key={index}
                    className="p-4 border border-gray-200 rounded-lg"
                  >
                    <h4 className="font-semibold text-gray-800 mb-1">
                      {opportunity.opportunity}
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">
                      Type: {opportunity.type}
                    </p>
                    {opportunity.frequency && (
                      <p className="text-sm text-gray-500 mb-1">
                        Frequency: {opportunity.frequency}
                      </p>
                    )}
                    {opportunity.estimatedCost && (
                      <p className="text-sm text-gray-500">
                        Cost: {opportunity.estimatedCost}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* Industry Insights */}
        {roadmap.industryInsights && (
          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <div className="flex items-center mb-4">
              <MdTrendingUp className="text-2xl text-purple-500 mr-3" />
              <h3 className="text-xl font-semibold text-gray-800">
                Industry Insights
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {roadmap.industryInsights.trends &&
                roadmap.industryInsights.trends.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Trends</h4>
                    <ul className="space-y-1">
                      {roadmap.industryInsights.trends.map((trend, index) => (
                        <li key={index} className="text-sm text-gray-600">
                          • {trend}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              {roadmap.industryInsights.growthAreas &&
                roadmap.industryInsights.growthAreas.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">
                      Growth Areas
                    </h4>
                    <ul className="space-y-1">
                      {roadmap.industryInsights.growthAreas.map(
                        (area, index) => (
                          <li key={index} className="text-sm text-gray-600">
                            • {area}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}
              {roadmap.industryInsights.challenges &&
                roadmap.industryInsights.challenges.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">
                      Challenges
                    </h4>
                    <ul className="space-y-1">
                      {roadmap.industryInsights.challenges.map(
                        (challenge, index) => (
                          <li key={index} className="text-sm text-gray-600">
                            • {challenge}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}
            </div>
          </div>
        )}

        {/* Target Job Titles */}
        {roadmap.targetJobTitles && roadmap.targetJobTitles.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <div className="flex items-center mb-4">
              <MdWork className="text-2xl text-purple-500 mr-3" />
              <h3 className="text-xl font-semibold text-gray-800">
                Target Job Titles
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {roadmap.targetJobTitles.map((job, index) => (
                <div
                  key={index}
                  className="p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-800">{job.title}</h4>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        job.priority === "high"
                          ? "bg-red-100 text-red-800"
                          : job.priority === "medium"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {job.priority}
                    </span>
                  </div>
                  {job.salaryRange && (
                    <p className="text-sm text-gray-600 mb-1">
                      Salary: {job.salaryRange}
                    </p>
                  )}
                  {job.requiredSkills && job.requiredSkills.length > 0 && (
                    <p className="text-sm text-gray-500 mb-1">
                      Skills: {job.requiredSkills.join(", ")}
                    </p>
                  )}
                  {job.companies && job.companies.length > 0 && (
                    <p className="text-sm text-gray-500">
                      Companies: {job.companies.join(", ")}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Personalized Advice */}
        {roadmap.personalizedAdvice && (
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg shadow-md p-6 mt-6">
            <div className="flex items-center mb-4">
              <MdTrendingUp className="text-2xl text-purple-500 mr-3" />
              <h3 className="text-xl font-semibold text-gray-800">
                Personalized Advice
              </h3>
            </div>
            <p className="text-gray-700 leading-relaxed">
              {roadmap.personalizedAdvice}
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
