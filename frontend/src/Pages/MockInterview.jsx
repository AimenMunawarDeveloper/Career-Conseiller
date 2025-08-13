import React, { useState, useEffect } from "react";
import Layout from "../Components/Layout";
import RetellWebCall from "../Components/RetellWebCall";
import {
  BsMic,
  BsMicFill,
  BsPlay,
  BsPause,
  BsArrowRight,
  BsStar,
  BsCheckCircle,
  BsTelephone,
  BsTelephoneFill,
  BsXCircle,
} from "react-icons/bs";
import { MdQuestionAnswer, MdFeedback, MdTimer } from "react-icons/md";
import axios from "axios";
import { toast } from "react-hot-toast";

export default function MockInterview() {
  const [interviewConfig, setInterviewConfig] = useState({
    role: "",
    difficulty: "medium",
    questionCount: 5,
  });
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [timer, setTimer] = useState(0);
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [interviewMode, setInterviewMode] = useState("text"); // "text" or "voice"
  const [isVoiceConnected, setIsVoiceConnected] = useState(false);
  const [voiceAgentId, setVoiceAgentId] = useState(null);
  const [isWebCallActive, setIsWebCallActive] = useState(false);
  const [retellAccessToken, setRetellAccessToken] = useState(null);

  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval((prev) => prev + 1);
  }, [isRecording]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const startInterview = async () => {
    if (!interviewConfig.role) {
      toast.error("Please select a role");
      return;
    }

    if (interviewMode === "voice") {
      await startVoiceInterview();
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/ai/mock-interview-questions`,
        {
          params: {
            role: interviewConfig.role,
            difficulty: interviewConfig.difficulty,
          },
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setQuestions(
        response.data.questions.slice(0, interviewConfig.questionCount)
      );
      setAnswers(
        new Array(
          response.data.questions.slice(0, interviewConfig.questionCount).length
        ).fill("")
      );
      setIsInterviewStarted(true);
      toast.success("Interview started!");
    } catch (error) {
      console.error("Interview error:", error);
      toast.error("Failed to start interview");
    } finally {
      setIsLoading(false);
    }
  };

  const startVoiceInterview = async () => {
    console.log("=== FRONTEND: startVoiceInterview function called ===");
    console.log("Interview config:", interviewConfig);

    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      console.log("Token present:", !!token);

      const requestData = {
        role: interviewConfig.role,
        difficulty: interviewConfig.difficulty,
        questionCount: interviewConfig.questionCount,
        agentId: "agent_184c9ac8f97c6ea900460895cb", // Your existing agent ID
      };

      console.log("Sending request to backend:", requestData);
      console.log(
        "Backend URL:",
        `${import.meta.env.VITE_BACKEND_URL}/api/retell/start-call`
      );

      // Connect to existing Retell agent and start call
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/retell/start-call`,
        requestData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("=== FRONTEND: Backend response received ===");
      console.log("Response status:", response.status);
      console.log("Response data:", response.data);

      setIsVoiceConnected(true);
      setIsInterviewStarted(true);

      // Store agent ID and API key for web call integration
      if (response.data.agentId) {
        console.log("Setting agent ID:", response.data.agentId);
        setVoiceAgentId(response.data.agentId);
      } else {
        console.log("WARNING: No agent ID in response");
      }

      if (response.data.accessToken) {
        console.log(
          "Setting access token:",
          response.data.accessToken ? "PRESENT" : "MISSING"
        );
        console.log("Access token value:", response.data.accessToken);
        console.log("Access token type:", typeof response.data.accessToken);
        console.log("Access token length:", response.data.accessToken?.length);
        setRetellAccessToken(response.data.accessToken);
      } else {
        console.log("WARNING: No access token in response");
      }

      toast.success("Voice interview started! Connecting to AI agent...");

      // Log technical details for debugging (hidden from user)
      console.log("Final state - Agent ID:", response.data.agentId);
      console.log("Final state - Call ID:", response.data.callId);
      console.log(
        "Final state - Access Token present:",
        !!response.data.accessToken
      );
      console.log(
        "=== FRONTEND: startVoiceInterview completed successfully ==="
      );
    } catch (error) {
      console.error("=== FRONTEND: startVoiceInterview ERROR ===");
      console.error("Error object:", error);
      console.error("Error message:", error.message);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      toast.error("Failed to start voice interview");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentAnswer.trim()) {
      const newAnswers = [...answers];
      newAnswers[currentQuestionIndex] = currentAnswer;
      setAnswers(newAnswers);
      setCurrentAnswer("");
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Interview completed
      handleFinishInterview();
    }
  };

  const handleFinishInterview = async () => {
    if (currentAnswer.trim()) {
      const newAnswers = [...answers];
      newAnswers[currentQuestionIndex] = currentAnswer;
      setAnswers(newAnswers);
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/ai/interview-feedback`,
        {
          question: questions[currentQuestionIndex],
          answer: currentAnswer || answers[currentQuestionIndex],
          role: interviewConfig.role,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setFeedback(response.data.feedback);
      setShowFeedback(true);
    } catch (error) {
      console.error("Feedback error:", error);
      toast.error("Failed to get feedback");
    } finally {
      setIsLoading(false);
    }
  };

  const resetInterview = () => {
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setCurrentAnswer("");
    setIsRecording(false);
    setShowFeedback(false);
    setFeedback(null);
    setTimer(0);
    setIsInterviewStarted(false);
  };

  const renderInterviewSetup = () => (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Interview Setup
      </h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Role/Position
          </label>
          <select
            value={interviewConfig.role}
            onChange={(e) =>
              setInterviewConfig({ ...interviewConfig, role: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
            <option value="machine learning engineer">
              Machine Learning Engineer
            </option>
            <option value="business analyst">Business Analyst</option>
            <option value="project manager">Project Manager</option>
            <option value="sales representative">Sales Representative</option>
            <option value="customer success manager">
              Customer Success Manager
            </option>
            <option value="human resources specialist">
              Human Resources Specialist
            </option>
            <option value="financial analyst">Financial Analyst</option>
            <option value="content writer">Content Writer</option>
            <option value="digital marketing specialist">
              Digital Marketing Specialist
            </option>
            <option value="general">General Interview</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Difficulty Level
          </label>
          <select
            value={interviewConfig.difficulty}
            onChange={(e) =>
              setInterviewConfig({
                ...interviewConfig,
                difficulty: e.target.value,
              })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Number of Questions
          </label>
          <select
            value={interviewConfig.questionCount}
            onChange={(e) =>
              setInterviewConfig({
                ...interviewConfig,
                questionCount: parseInt(e.target.value),
              })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value={3}>3 Questions</option>
            <option value={5}>5 Questions</option>
            <option value={10}>10 Questions</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Interview Mode
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setInterviewMode("text")}
              className={`p-4 border-2 rounded-lg transition-colors ${
                interviewMode === "text"
                  ? "border-purple-500 bg-purple-50 text-purple-700"
                  : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
              }`}
            >
              <div className="text-center">
                <BsMic className="text-2xl mx-auto mb-2" />
                <div className="font-medium">Text Interview</div>
                <div className="text-sm opacity-75">Type your answers</div>
              </div>
            </button>
            <button
              onClick={() => setInterviewMode("voice")}
              className={`p-4 border-2 rounded-lg transition-colors ${
                interviewMode === "voice"
                  ? "border-purple-500 bg-purple-50 text-purple-700"
                  : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
              }`}
            >
              <div className="text-center">
                <BsTelephone className="text-2xl mx-auto mb-2" />
                <div className="font-medium">Voice Interview</div>
                <div className="text-sm opacity-75">
                  Real-time AI conversation
                </div>
              </div>
            </button>
          </div>
        </div>

        <button
          onClick={startInterview}
          disabled={isLoading}
          className="w-full bg-purple-500 text-white py-3 px-6 rounded-lg hover:bg-purple-600 disabled:opacity-50 transition-colors"
        >
          {isLoading ? "Starting Interview..." : "Start Interview"}
        </button>
      </div>
    </div>
  );

  const renderInterviewSession = () => {
    if (interviewMode === "voice") {
      return renderVoiceInterviewSession();
    }

    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            Mock Interview
          </h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-gray-600">
              <MdTimer />
              <span>{formatTime(timer)}</span>
            </div>
            <div className="text-sm text-gray-600">
              Question {currentQuestionIndex + 1} of {questions.length}
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-start gap-3 mb-4">
            <MdQuestionAnswer className="text-purple-500 text-xl mt-1" />
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                Question:
              </h3>
              <p className="text-gray-700">{questions[currentQuestionIndex]}</p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Answer:
          </label>
          <textarea
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            placeholder="Type your answer here..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            rows="6"
          />
        </div>

        <div className="flex justify-between">
          <button
            onClick={() => setIsRecording(!isRecording)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              isRecording
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-gray-500 text-white hover:bg-gray-600"
            }`}
          >
            {isRecording ? <BsMicFill /> : <BsMic />}
            {isRecording ? "Stop Recording" : "Start Recording"}
          </button>

          <button
            onClick={handleNextQuestion}
            disabled={!currentAnswer.trim()}
            className="flex items-center gap-2 bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600 disabled:opacity-50 transition-colors"
          >
            {currentQuestionIndex < questions.length - 1
              ? "Next Question"
              : "Finish Interview"}
            <BsArrowRight />
          </button>
        </div>
      </div>
    );
  };

  const renderVoiceInterviewSession = () => {
    console.log("=== FRONTEND: renderVoiceInterviewSession called ===");
    console.log("isWebCallActive:", isWebCallActive);
    console.log("voiceAgentId:", voiceAgentId);
    console.log("retellAccessToken present:", !!retellAccessToken);
    console.log("retellAccessToken length:", retellAccessToken?.length);

    if (isWebCallActive) {
      console.log("Rendering RetellWebCall component");
      return (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <RetellWebCall
            agentId={voiceAgentId}
            accessToken={retellAccessToken}
            onCallEnd={() => {
              console.log("=== FRONTEND: Call ended callback triggered ===");
              setIsWebCallActive(false);
              setIsVoiceConnected(false);
              toast.success("Voice interview completed!");
            }}
          />
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            Voice Interview
          </h2>
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${
                isVoiceConnected ? "bg-green-500" : "bg-red-500"
              }`}
            ></div>
            <span className="text-sm text-gray-600">
              {isVoiceConnected ? "Connected" : "Connecting..."}
            </span>
          </div>
        </div>

        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BsTelephone className="text-3xl text-purple-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            Voice Interview Ready
          </h3>
          <p className="text-gray-600 mb-4">
            Your AI interview agent is ready to conduct a voice interview for
            the {interviewConfig.role} position.
          </p>

          <div className="bg-green-50 p-4 rounded-lg mb-6">
            <h4 className="font-medium text-green-800 mb-2">
              Interview Status:
            </h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Voice agent connected and ready</li>
              <li>
                • Interview questions configured for {interviewConfig.role}
              </li>
              <li>• Difficulty level: {interviewConfig.difficulty}</li>
              <li>• Questions: {interviewConfig.questionCount}</li>
            </ul>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <h4 className="font-medium text-blue-800 mb-2">How to Use:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Click "Start Voice Call" to begin the interview</li>
              <li>• Allow microphone access when prompted</li>
              <li>• Speak clearly when answering questions</li>
              <li>
                • The AI will conduct the interview based on your configuration
              </li>
            </ul>
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={() => {
                console.log(
                  "=== FRONTEND: Start Voice Call button clicked ==="
                );
                console.log("Setting isWebCallActive to true");
                console.log("Current voiceAgentId:", voiceAgentId);
                console.log(
                  "Current retellAccessToken present:",
                  !!retellAccessToken
                );
                setIsWebCallActive(true);
                toast.success("Starting voice call...");
              }}
              className="flex items-center gap-2 bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 transition-colors"
            >
              <BsTelephoneFill />
              Start Voice Call
            </button>

            <button
              onClick={() => {
                setIsVoiceConnected(false);
                setVoiceAgentId(null);
                setIsInterviewStarted(false);
              }}
              className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
            >
              <BsXCircle />
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderFeedback = () => (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <MdFeedback className="text-purple-500" />
        Interview Feedback
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-medium text-gray-800 mb-3">Overall Score</h3>
          <div className="flex items-center gap-2 mb-4">
            <div className="text-3xl font-bold text-purple-600">
              {feedback.score}
            </div>
            <div className="text-gray-600">/ 100</div>
          </div>
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <BsStar
                key={i}
                className={`text-xl ${
                  i < Math.floor(feedback.score / 20)
                    ? "text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-medium text-gray-800 mb-3">Interview Summary</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p>Duration: {formatTime(timer)}</p>
            <p>Questions Answered: {questions.length}</p>
            <p>Role: {interviewConfig.role.replace("_", " ")}</p>
          </div>
        </div>
      </div>

      {/* Detailed Scores */}
      {feedback.communicationScore &&
        feedback.technicalScore &&
        feedback.confidenceScore && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {feedback.communicationScore}
              </div>
              <div className="text-sm text-blue-700">Communication</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {feedback.technicalScore}
              </div>
              <div className="text-sm text-green-700">Technical</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {feedback.confidenceScore}
              </div>
              <div className="text-sm text-purple-700">Confidence</div>
            </div>
          </div>
        )}

      {/* STAR Method Analysis */}
      {feedback.starMethodAnalysis && (
        <div className="mt-6">
          <h3 className="font-medium text-gray-800 mb-3">
            STAR Method Analysis
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-3 bg-orange-50 rounded-lg">
              <div className="text-sm font-medium text-orange-800 mb-1">
                Situation
              </div>
              <div className="text-xs text-orange-700">
                {feedback.starMethodAnalysis.situation}
              </div>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="text-sm font-medium text-blue-800 mb-1">Task</div>
              <div className="text-xs text-blue-700">
                {feedback.starMethodAnalysis.task}
              </div>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="text-sm font-medium text-green-800 mb-1">
                Action
              </div>
              <div className="text-xs text-green-700">
                {feedback.starMethodAnalysis.action}
              </div>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <div className="text-sm font-medium text-purple-800 mb-1">
                Result
              </div>
              <div className="text-xs text-purple-700">
                {feedback.starMethodAnalysis.result}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 space-y-4">
        <div>
          <h3 className="font-medium text-gray-800 mb-2">Strengths</h3>
          <ul className="space-y-1">
            {feedback.strengths.map((strength, index) => (
              <li
                key={index}
                className="flex items-center gap-2 text-sm text-green-700"
              >
                <BsCheckCircle className="text-green-500" />
                {strength}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-medium text-gray-800 mb-2">
            Areas for Improvement
          </h3>
          <ul className="space-y-1">
            {feedback.areasForImprovement.map((area, index) => (
              <li
                key={index}
                className="flex items-center gap-2 text-sm text-orange-700"
              >
                <BsArrowRight className="text-orange-500" />
                {area}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-medium text-gray-800 mb-2">Suggestions</h3>
          <ul className="space-y-1">
            {feedback.suggestions.map((suggestion, index) => (
              <li
                key={index}
                className="flex items-center gap-2 text-sm text-blue-700"
              >
                <BsArrowRight className="text-blue-500" />
                {suggestion}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-medium text-blue-800 mb-2">Overall Feedback</h3>
          <p className="text-blue-700 text-sm">{feedback.overallFeedback}</p>
        </div>
      </div>

      <div className="mt-6 flex gap-4">
        <button
          onClick={resetInterview}
          className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
        >
          Practice Again
        </button>
      </div>
    </div>
  );

  const mainContent = (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Mock Interview Practice
          </h1>
          <p className="text-gray-600">
            Practice interviews with AI-generated questions and get personalized
            feedback
          </p>
        </div>

        {/* Content */}
        {!isInterviewStarted && !showFeedback && renderInterviewSetup()}
        {isInterviewStarted && !showFeedback && renderInterviewSession()}
        {showFeedback && renderFeedback()}
      </div>
    </div>
  );

  return <Layout>{mainContent}</Layout>;
}
