import React, { useState, useEffect } from "react";
import Sidebar from "../Components/Sidebar";
import TopBar from "../Components/TopBar";
import { useApp } from "../Context/AppContext";
import {
  BsMic,
  BsMicFill,
  BsPlay,
  BsPause,
  BsArrowRight,
  BsStar,
  BsCheckCircle,
} from "react-icons/bs";
import { MdQuestionAnswer, MdFeedback, MdTimer } from "react-icons/md";
import axios from "axios";
import { toast } from "react-hot-toast";

export default function MockInterview() {
  const { isOpen } = useApp();
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
            <option value="software_engineer">Software Engineer</option>
            <option value="data_scientist">Data Scientist</option>
            <option value="product_manager">Product Manager</option>
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

  const renderInterviewSession = () => (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Mock Interview</h2>
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
        <button
          onClick={() => setShowFeedback(false)}
          className="bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600 transition-colors"
        >
          View Interview
        </button>
      </div>
    </div>
  );

  const mainContent = (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
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
