import React, { useState } from "react";
import Layout from "../Components/Layout";
import {
  BsUpload,
  BsFileText,
  BsStar,
  BsCheckCircle,
  BsArrowRight,
} from "react-icons/bs";
import { MdAnalytics, MdFeedback, MdTimer } from "react-icons/md";
import axios from "axios";
import { toast } from "react-hot-toast";

export default function ResumeAnalyzer() {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleAnalyzeResume = async () => {
    if (!resumeText.trim()) {
      toast.error("Please enter your resume text");
      return;
    }

    setIsAnalyzing(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/ai/analyze-resume`,
        {
          resumeText: resumeText.trim(),
          jobDescription: jobDescription.trim() || null,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setAnalysis(response.data);
      setShowAnalysis(true);
      toast.success("Resume analysis completed!");
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error("Failed to analyze resume");
    } finally {
      setIsAnalyzing(false);
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
        setResumeText(extractedText);
        toast.success("Resume uploaded and text extracted successfully!");
      } else {
        toast.warning(
          "Resume uploaded but text extraction failed. You can still paste the text manually."
        );
      }
    } catch (error) {
      toast.error("Failed to upload resume");
      console.error("Resume upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const resetAnalysis = () => {
    setResumeText("");
    setJobDescription("");
    setAnalysis(null);
    setShowAnalysis(false);
    setResumeFile(null);
  };

  const renderAnalysisForm = () => (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <MdAnalytics className="text-purple-500" />
        Resume Analysis
      </h2>
      <p className="text-gray-600 mb-6">
        Get AI-powered feedback on your resume to improve your chances of
        landing your dream job. Upload your resume file or paste the text
        directly.
      </p>

      <div className="space-y-6">
        {/* File Upload Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Resume (Optional)
          </label>
          <input
            type="file"
            accept=".pdf,.doc,.docx,.txt"
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
              Uploading and extracting text from resume...
            </p>
          )}
          {resumeFile && !isUploading && (
            <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <BsFileText className="text-green-600" />
                <span className="text-sm font-medium text-green-800">
                  {resumeFile.name}
                </span>
                <span className="text-xs text-green-600">
                  ✓ Uploaded successfully
                </span>
              </div>
            </div>
          )}
          <p className="text-sm text-gray-500 mt-1">
            Supported formats: PDF, DOC, DOCX, TXT
          </p>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">OR</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Resume Text *
          </label>
          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste your resume text here... (You can copy from Word, PDF, or any text format)"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            rows="12"
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            Include your experience, education, skills, and achievements
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Job Description (Optional)
          </label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the job description you're applying for to get targeted feedback..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            rows="6"
          />
          <p className="text-sm text-gray-500 mt-1">
            This helps provide more targeted recommendations
          </p>
        </div>

        <button
          onClick={handleAnalyzeResume}
          disabled={isAnalyzing || !resumeText.trim()}
          className="w-full bg-purple-500 text-white py-3 px-6 rounded-lg hover:bg-purple-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
        >
          {isAnalyzing ? (
            <>
              <MdTimer className="animate-spin" />
              Analyzing Resume...
            </>
          ) : (
            <>
              <MdAnalytics />
              {resumeFile ? "Analyze Uploaded Resume" : "Analyze Resume"}
            </>
          )}
        </button>
      </div>
    </div>
  );

  const renderAnalysisResults = () => (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <MdFeedback className="text-purple-500" />
        Analysis Results
      </h2>

      <div className="space-y-6">
        {/* Overall Score */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-3">
            Overall Assessment
          </h3>
          <div className="flex items-center gap-4">
            <div className="text-3xl font-bold text-purple-600">
              {analysis.resumeScore || "85"}%
            </div>
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <BsStar
                  key={i}
                  className={`text-xl ${
                    i < Math.floor((analysis.resumeScore || 85) / 20)
                      ? "text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Detailed Analysis */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <BsCheckCircle className="text-green-500" />
              Strengths
            </h3>
            <div className="bg-green-50 p-4 rounded-lg">
              <ul className="space-y-2">
                {analysis.strengths?.map((strength, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-sm text-green-700"
                  >
                    <BsCheckCircle className="text-green-500 mt-0.5 flex-shrink-0" />
                    {strength}
                  </li>
                )) ||
                  [
                    "Clear structure and formatting",
                    "Relevant experience highlighted",
                    "Good use of action verbs",
                  ].map((strength, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-sm text-green-700"
                    >
                      <BsCheckCircle className="text-green-500 mt-0.5 flex-shrink-0" />
                      {strength}
                    </li>
                  ))}
              </ul>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <BsArrowRight className="text-orange-500" />
              Areas for Improvement
            </h3>
            <div className="bg-orange-50 p-4 rounded-lg">
              <ul className="space-y-2">
                {analysis.areasForImprovement?.map((area, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-sm text-orange-700"
                  >
                    <BsArrowRight className="text-orange-500 mt-0.5 flex-shrink-0" />
                    {area}
                  </li>
                )) ||
                  [
                    "Add more quantifiable achievements",
                    "Include relevant keywords from job descriptions",
                    "Enhance the professional summary",
                  ].map((area, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-sm text-orange-700"
                    >
                      <BsArrowRight className="text-orange-500 mt-0.5 flex-shrink-0" />
                      {area}
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Suggestions */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-3">
            Specific Suggestions
          </h3>
          <div className="bg-blue-50 p-4 rounded-lg">
            <ul className="space-y-2">
              {analysis.suggestions?.map((suggestion, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-sm text-blue-700"
                >
                  <BsArrowRight className="text-blue-500 mt-0.5 flex-shrink-0" />
                  {suggestion}
                </li>
              )) ||
                [
                  "Use numbers to quantify your achievements (e.g., 'Increased sales by 25%')",
                  "Include industry-specific keywords naturally in your content",
                  "Make your summary more compelling and specific to your target role",
                  "Add relevant certifications and training programs",
                ].map((suggestion, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-sm text-blue-700"
                  >
                    <BsArrowRight className="text-blue-500 mt-0.5 flex-shrink-0" />
                    {suggestion}
                  </li>
                ))}
            </ul>
          </div>
        </div>

        {/* ATS Optimization Tips */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-3">
            ATS Optimization Tips
          </h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <ul className="space-y-2 text-sm text-gray-700">
              <li>
                • Use standard section headings (Experience, Education, Skills)
              </li>
              <li>• Avoid graphics, tables, and complex formatting</li>
              <li>
                • Use simple, readable fonts (Arial, Calibri, Times New Roman)
              </li>
              <li>
                • Include relevant keywords naturally throughout your resume
              </li>
              <li>• Keep your resume to 1-2 pages maximum</li>
              <li>• Use bullet points for achievements and responsibilities</li>
            </ul>
          </div>
        </div>

        {/* Keywords to Add */}
        {analysis.keywords && (
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">
              Keywords to Consider Adding
            </h3>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex flex-wrap gap-2">
                {analysis.keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-4">
          <button
            onClick={resetAnalysis}
            className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Analyze Another Resume
          </button>
        </div>
      </div>
    </div>
  );

  const mainContent = (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Resume Analyzer
          </h1>
          <p className="text-gray-600">
            Get AI-powered feedback on your resume to improve your chances of
            landing interviews
          </p>
        </div>

        {/* Content */}
        {!showAnalysis && renderAnalysisForm()}
        {showAnalysis && renderAnalysisResults()}
      </div>
    </div>
  );

  return <Layout>{mainContent}</Layout>;
}
