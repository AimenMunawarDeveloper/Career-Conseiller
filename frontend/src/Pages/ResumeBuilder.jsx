import React, { useState, useEffect } from "react";
import Sidebar from "../Components/Sidebar";
import TopBar from "../Components/TopBar";
import { useApp } from "../Context/AppContext";
import { BsPlus, BsTrash, BsDownload, BsEye, BsShare } from "react-icons/bs";
import { MdEdit, MdAnalytics } from "react-icons/md";
import axios from "axios";
import { toast } from "react-hot-toast";

export default function ResumeBuilder() {
  const { isOpen } = useApp();
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const [formData, setFormData] = useState({
    title: "My Resume",
    personalInfo: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      location: "",
      linkedin: "",
      github: "",
      portfolio: "",
    },
    summary: "",
    experience: [],
    education: [],
    skills: [],
    certifications: [],
    projects: [],
    languages: [],
    volunteerWork: [],
    awards: [],
    template: "modern",
  });

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/resume`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setResumes(response.data.resumes);
    } catch (error) {
      toast.error("Failed to load resumes");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateResume = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/resume`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setResumes([...resumes, response.data.resume]);
      setSelectedResume(response.data.resume);
      setShowCreateForm(false);
      toast.success("Resume created successfully!");
    } catch (error) {
      toast.error("Failed to create resume");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateResume = async () => {
    if (!selectedResume) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/resume/${selectedResume._id}`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSelectedResume(response.data.resume);
      setResumes(
        resumes.map((r) =>
          r._id === selectedResume._id ? response.data.resume : r
        )
      );
      toast.success("Resume updated successfully!");
    } catch (error) {
      toast.error("Failed to update resume");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeResume = async () => {
    if (!selectedResume) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/resume/${selectedResume._id}/analyze`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAnalysis(response.data);
      setShowAnalysis(true);
    } catch (error) {
      toast.error("Failed to analyze resume");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!selectedResume) return;

    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/resume/${selectedResume._id}/pdf`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${selectedResume.title}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      toast.error("Failed to download PDF");
    }
  };

  const handleTogglePublic = async () => {
    if (!selectedResume) return;

    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/api/resume/${selectedResume._id}/public`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSelectedResume(response.data.resume);
      setResumes(
        resumes.map((r) =>
          r._id === selectedResume._id ? response.data.resume : r
        )
      );
      toast.success(
        `Resume ${
          response.data.resume.isPublic ? "made public" : "made private"
        }`
      );
    } catch (error) {
      toast.error("Failed to update resume visibility");
    }
  };

  const addArrayItem = (field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], getDefaultItem(field)],
    }));
  };

  const removeArrayItem = (field, index) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const updateArrayItem = (field, index, updates) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) =>
        i === index ? { ...item, ...updates } : item
      ),
    }));
  };

  const getDefaultItem = (field) => {
    const defaults = {
      experience: {
        title: "",
        company: "",
        location: "",
        startDate: "",
        endDate: "",
        current: false,
        description: "",
        achievements: [],
        skills: [],
      },
      education: {
        degree: "",
        institution: "",
        location: "",
        startDate: "",
        endDate: "",
        current: false,
        gpa: "",
        relevantCourses: [],
      },
      skills: {
        category: "",
        skills: [],
      },
      certifications: {
        name: "",
        issuer: "",
        date: "",
        expiryDate: "",
        credentialId: "",
        url: "",
      },
      projects: {
        title: "",
        description: "",
        technologies: [],
        url: "",
        githubUrl: "",
        image: "",
      },
      languages: {
        language: "",
        proficiency: "conversational",
      },
      volunteerWork: {
        role: "",
        organization: "",
        startDate: "",
        endDate: "",
        current: false,
        description: "",
      },
      awards: {
        title: "",
        issuer: "",
        date: "",
        description: "",
      },
    };
    return defaults[field] || {};
  };

  const renderPersonalInfo = () => (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Personal Information
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="First Name"
          value={formData.personalInfo.firstName}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              personalInfo: { ...prev.personalInfo, firstName: e.target.value },
            }))
          }
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <input
          type="text"
          placeholder="Last Name"
          value={formData.personalInfo.lastName}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              personalInfo: { ...prev.personalInfo, lastName: e.target.value },
            }))
          }
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <input
          type="email"
          placeholder="Email"
          value={formData.personalInfo.email}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              personalInfo: { ...prev.personalInfo, email: e.target.value },
            }))
          }
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <input
          type="tel"
          placeholder="Phone"
          value={formData.personalInfo.phone}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              personalInfo: { ...prev.personalInfo, phone: e.target.value },
            }))
          }
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <input
          type="text"
          placeholder="Location"
          value={formData.personalInfo.location}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              personalInfo: { ...prev.personalInfo, location: e.target.value },
            }))
          }
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <input
          type="url"
          placeholder="LinkedIn URL"
          value={formData.personalInfo.linkedin}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              personalInfo: { ...prev.personalInfo, linkedin: e.target.value },
            }))
          }
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <input
          type="url"
          placeholder="GitHub URL"
          value={formData.personalInfo.github}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              personalInfo: { ...prev.personalInfo, github: e.target.value },
            }))
          }
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <input
          type="url"
          placeholder="Portfolio URL"
          value={formData.personalInfo.portfolio}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              personalInfo: { ...prev.personalInfo, portfolio: e.target.value },
            }))
          }
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>
    </div>
  );

  const renderArraySection = (title, field, renderItem) => (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <button
          onClick={() => addArrayItem(field)}
          className="flex items-center gap-2 bg-purple-500 text-white px-3 py-2 rounded-lg hover:bg-purple-600 transition-colors"
        >
          <BsPlus />
          Add {title.slice(0, -1)}
        </button>
      </div>
      <div className="space-y-4">
        {formData[field].map((item, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-700">
                {title.slice(0, -1)} {index + 1}
              </h4>
              <button
                onClick={() => removeArrayItem(field, index)}
                className="text-red-500 hover:text-red-700"
              >
                <BsTrash />
              </button>
            </div>
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );

  const mainContent = (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Resume Builder
            </h1>
            <p className="text-gray-600">
              Create and manage your professional resumes
            </p>
          </div>
          <div className="flex gap-3">
            {selectedResume && (
              <>
                <button
                  onClick={handleAnalyzeResume}
                  className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <MdAnalytics />
                  Analyze
                </button>
                <button
                  onClick={handleDownloadPDF}
                  className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                >
                  <BsDownload />
                  Download PDF
                </button>
                <button
                  onClick={handleTogglePublic}
                  className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                >
                  <BsShare />
                  {selectedResume.isPublic ? "Make Private" : "Make Public"}
                </button>
              </>
            )}
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center gap-2 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors"
            >
              <BsPlus />
              New Resume
            </button>
          </div>
        </div>

        {/* Resume List */}
        {!showCreateForm && !selectedResume && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resumes.map((resume) => (
              <div
                key={resume._id}
                className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => {
                  setSelectedResume(resume);
                  setFormData(resume);
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {resume.title}
                  </h3>
                  <div className="flex gap-2">
                    <button className="text-blue-500 hover:text-blue-700">
                      <BsEye />
                    </button>
                    <button className="text-green-500 hover:text-green-700">
                      <BsDownload />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Template: {resume.template}
                </p>
                <p className="text-sm text-gray-500">
                  Last updated:{" "}
                  {new Date(resume.lastUpdated).toLocaleDateString()}
                </p>
                {resume.isPublic && (
                  <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    Public
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Resume Form */}
        {showCreateForm && (
          <form onSubmit={handleCreateResume} className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Resume Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Resume Title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
                <select
                  value={formData.template}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      template: e.target.value,
                    }))
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="modern">Modern</option>
                  <option value="classic">Classic</option>
                  <option value="creative">Creative</option>
                  <option value="minimal">Minimal</option>
                </select>
              </div>
            </div>

            {renderPersonalInfo()}

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Professional Summary
              </h3>
              <textarea
                placeholder="Write a compelling professional summary..."
                value={formData.summary}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, summary: e.target.value }))
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows="4"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-purple-500 text-white py-3 px-6 rounded-lg hover:bg-purple-600 disabled:opacity-50 transition-colors"
            >
              {isLoading ? "Creating Resume..." : "Create Resume"}
            </button>
          </form>
        )}

        {/* Resume Editor */}
        {selectedResume && !showCreateForm && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedResume.title}
              </h2>
              <button
                onClick={handleUpdateResume}
                disabled={isLoading}
                className="flex items-center gap-2 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 disabled:opacity-50 transition-colors"
              >
                <MdEdit />
                {isLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>

            {renderPersonalInfo()}

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Professional Summary
              </h3>
              <textarea
                placeholder="Write a compelling professional summary..."
                value={formData.summary}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, summary: e.target.value }))
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows="4"
              />
            </div>

            {/* Add more sections here for experience, education, skills, etc. */}
          </div>
        )}

        {/* Analysis Modal */}
        {showAnalysis && analysis && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Resume Analysis
                </h3>
                <button
                  onClick={() => setShowAnalysis(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">
                    Resume Score
                  </h4>
                  <p className="text-blue-700">{analysis.resumeScore}%</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">
                    Strengths
                  </h4>
                  <p className="text-green-700">{analysis.analysis}</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-yellow-800 mb-2">
                    Suggestions
                  </h4>
                  <ul className="text-yellow-700 space-y-1">
                    {analysis.suggestions.map((suggestion, index) => (
                      <li key={index}>• {suggestion}</li>
                    ))}
                  </ul>
                </div>
              </div>
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
