import React, { useState } from "react";
import Layout from "../Components/Layout";
import {
  BsGraphUp,
  BsCheckCircle,
  BsXCircle,
  BsArrowRight,
} from "react-icons/bs";
import { MdSchool, MdWork, MdTrendingUp } from "react-icons/md";
import axios from "axios";
import { toast } from "react-hot-toast";

export default function SkillGapAnalyzer() {
  const [formData, setFormData] = useState({
    currentSkills: "",
    targetRole: "",
  });
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!formData.currentSkills || !formData.targetRole) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/ai/skill-gap-analysis`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAnalysis(response.data);
      toast.success("Skill gap analysis completed!");
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error("Failed to analyze skills");
    } finally {
      setIsLoading(false);
    }
  };

  const renderSkillCategory = (title, skills, icon, color) => (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center gap-3 mb-4">
        {icon}
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      </div>
      {skills && skills.length > 0 ? (
        <div className="space-y-2">
          {skills.map((skill, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
            >
              <BsXCircle className="text-red-500" />
              <span className="text-gray-700">{skill}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
          <BsCheckCircle className="text-green-500" />
          <span className="text-green-700">All required skills covered!</span>
        </div>
      )}
    </div>
  );

  const renderRecommendations = () => (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Recommended Actions
      </h3>

      {analysis.recommendations.courses.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
            <MdSchool className="text-blue-500" />
            Recommended Courses
          </h4>
          <div className="space-y-3">
            {analysis.recommendations.courses.map((course, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4"
              >
                <h5 className="font-medium text-gray-800">{course.course}</h5>
                <p className="text-sm text-gray-600 mt-1">
                  Provider: {course.provider}
                </p>
                <p className="text-sm text-gray-600">
                  Duration: {course.estimatedDuration}
                </p>
                {course.cost && (
                  <p className="text-sm text-gray-600">
                    Cost: {course.cost}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {analysis.recommendations.projects.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
            <MdWork className="text-green-500" />
            Project Ideas
          </h4>
          <div className="space-y-3">
            {analysis.recommendations.projects.map((project, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4"
              >
                <h5 className="font-medium text-gray-800">{project.project}</h5>
                <p className="text-sm text-gray-600 mt-1">
                  {project.description}
                </p>
                {project.difficulty && (
                  <p className="text-sm text-gray-600">
                    Difficulty: {project.difficulty}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {analysis.recommendations.certifications.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
            <MdTrendingUp className="text-purple-500" />
            Certifications
          </h4>
          <div className="space-y-3">
            {analysis.recommendations.certifications.map((cert, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4"
              >
                <h5 className="font-medium text-gray-800">
                  {cert.certification}
                </h5>
                <p className="text-sm text-gray-600 mt-1">
                  Provider: {cert.provider}
                </p>
                {cert.validity && (
                  <p className="text-sm text-gray-600">
                    Validity: {cert.validity}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderAnalysisInsights = () => (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Analysis Insights
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-lg font-semibold text-blue-600 capitalize">
            {analysis.analysis?.overallGap || "Medium"}
          </div>
          <div className="text-sm text-blue-700">Overall Gap Level</div>
        </div>
        
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-lg font-semibold text-green-600 capitalize">
            {analysis.analysis?.marketDemand || "High"}
          </div>
          <div className="text-sm text-green-700">Market Demand</div>
        </div>
        
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <div className="text-lg font-semibold text-purple-600">
            {analysis.analysis?.timeline || "6-12 months"}
          </div>
          <div className="text-sm text-purple-700">Timeline to Acquire</div>
        </div>
        
        <div className="text-center p-4 bg-orange-50 rounded-lg">
          <div className="text-lg font-semibold text-orange-600">
            {analysis.analysis?.prioritySkills?.length || 0}
          </div>
          <div className="text-sm text-orange-700">Priority Skills</div>
        </div>
      </div>

      {analysis.analysis?.prioritySkills && analysis.analysis.prioritySkills.length > 0 && (
        <div className="mt-6">
          <h4 className="font-medium text-gray-700 mb-3">Priority Skills to Focus On:</h4>
          <div className="flex flex-wrap gap-2">
            {analysis.analysis.prioritySkills.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderProgressChart = () => {
    const totalSkills =
      analysis.skillGap.technical.length +
      analysis.skillGap.soft.length +
      analysis.skillGap.tools.length;
    const currentSkillsCount = analysis.currentSkills.length;
    const progressPercentage =
      totalSkills > 0
        ? (currentSkillsCount / (currentSkillsCount + totalSkills)) * 100
        : 100;

    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Skill Progress Overview
        </h3>

        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Current Skills: {currentSkillsCount}</span>
            <span>Missing Skills: {totalSkills}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <div className="text-center mt-2">
            <span className="text-lg font-semibold text-gray-800">
              {Math.round(progressPercentage)}%
            </span>
            <span className="text-sm text-gray-600 ml-1">Complete</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {analysis.skillGap.technical.length}
            </div>
            <div className="text-sm text-blue-700">Technical Skills Needed</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {analysis.skillGap.soft.length}
            </div>
            <div className="text-sm text-green-700">Soft Skills Needed</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {analysis.skillGap.tools.length}
            </div>
            <div className="text-sm text-purple-700">Tools Needed</div>
          </div>
        </div>
      </div>
    );
  };

  const mainContent = (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Skill Gap Analyzer
          </h1>
          <p className="text-gray-600">
            Compare your current skills with job requirements and get
            personalized recommendations
          </p>
        </div>

        {/* Analysis Form */}
        {!analysis && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Analyze Your Skills
            </h2>
            <form onSubmit={handleAnalyze} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Role
                </label>
                <select
                  value={formData.targetRole}
                  onChange={(e) =>
                    setFormData({ ...formData, targetRole: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                >
                  <option value="">Select a role</option>
                  <option value="software engineer">Software Engineer</option>
                  <option value="data scientist">Data Scientist</option>
                  <option value="product manager">Product Manager</option>
                  <option value="ui/ux designer">UI/UX Designer</option>
                  <option value="devops engineer">DevOps Engineer</option>
                  <option value="frontend developer">Frontend Developer</option>
                  <option value="backend developer">Backend Developer</option>
                  <option value="full stack developer">Full Stack Developer</option>
                  <option value="machine learning engineer">Machine Learning Engineer</option>
                  <option value="business analyst">Business Analyst</option>
                  <option value="project manager">Project Manager</option>
                  <option value="sales representative">Sales Representative</option>
                  <option value="customer success manager">Customer Success Manager</option>
                  <option value="human resources specialist">Human Resources Specialist</option>
                  <option value="financial analyst">Financial Analyst</option>
                  <option value="content writer">Content Writer</option>
                  <option value="digital marketing specialist">Digital Marketing Specialist</option>
                  <option value="marketing specialist">Marketing Specialist</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Current Skills (comma-separated)
                </label>
                <textarea
                  value={formData.currentSkills}
                  onChange={(e) =>
                    setFormData({ ...formData, currentSkills: e.target.value })
                  }
                  placeholder="e.g., JavaScript, Python, Communication, Project Management"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows="4"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-purple-500 text-white py-3 px-6 rounded-lg hover:bg-purple-600 disabled:opacity-50 transition-colors"
              >
                {isLoading ? "Analyzing..." : "Analyze Skills"}
              </button>
            </form>
          </div>
        )}

        {/* Analysis Results */}
        {analysis && (
          <div className="space-y-6">
            {/* Progress Chart */}
            {renderProgressChart()}

            {/* Analysis Insights */}
            {renderAnalysisInsights()}

            {/* Skill Gaps */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {renderSkillCategory(
                "Technical Skills Needed",
                analysis.skillGap.technical,
                <BsGraphUp className="text-blue-500 text-xl" />,
                "blue"
              )}
              {renderSkillCategory(
                "Soft Skills Needed",
                analysis.skillGap.soft,
                <MdWork className="text-green-500 text-xl" />,
                "green"
              )}
              {renderSkillCategory(
                "Tools & Technologies Needed",
                analysis.skillGap.tools,
                <MdTrendingUp className="text-purple-500 text-xl" />,
                "purple"
              )}
            </div>

            {/* Recommendations */}
            {renderRecommendations()}

            {/* Action Button */}
            <div className="text-center">
              <button
                onClick={() => setAnalysis(null)}
                className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Analyze Different Role
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return <Layout>{mainContent}</Layout>;
}
