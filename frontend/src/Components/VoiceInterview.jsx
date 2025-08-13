import React, { useState, useEffect, useRef } from "react";
import { RetellWebClient } from "@retellai/retell-sdk";
import {
  BsMic,
  BsMicFill,
  BsTelephone,
  BsTelephoneFill,
  BsVolumeUp,
  BsVolumeMute,
  BsArrowLeft,
  BsCheckCircle,
  BsXCircle,
} from "react-icons/bs";
import { MdTimer, MdQuestionAnswer, MdFeedback } from "react-icons/md";
import axios from "axios";
import { toast } from "react-hot-toast";

const VoiceInterview = ({ interviewConfig, onInterviewComplete, onBack }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [callStatus, setCallStatus] = useState("idle");
  const [timer, setTimer] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [agentId, setAgentId] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);

  const retellClientRef = useRef(null);
  const timerIntervalRef = useRef(null);

  useEffect(() => {
    let interval;
    if (callStatus === "connected") {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
      timerIntervalRef.current = interval;
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [callStatus]);

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      if (retellClientRef.current) {
        retellClientRef.current.disconnect();
      }
    };
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const startVoiceInterview = async () => {
    if (!interviewConfig.role) {
      toast.error("Please select a role");
      return;
    }

    setIsLoading(true);
    setCallStatus("connecting");

    try {
      const token = localStorage.getItem("token");

      const agentResponse = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/retell/create-agent`,
        {
          role: interviewConfig.role,
          difficulty: interviewConfig.difficulty,
          questionCount: interviewConfig.questionCount,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const { agentId: newAgentId } = agentResponse.data;
      setAgentId(newAgentId);

      retellClientRef.current = new RetellWebClient({
        agentId: newAgentId,
        onCallStart: () => {
          setCallStatus("connected");
          setIsLoading(false);
          toast.success("Voice interview started!");
        },
        onCallEnd: () => {
          setCallStatus("ended");
          setIsConnected(false);
          if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
          }
          handleCallEnd();
        },
        onTranscript: (transcript) => {
          if (transcript.type === "question") {
            setCurrentQuestion(transcript.content);
          }
        },
        onError: (error) => {
          toast.error("Voice interview error: " + error.message);
          setCallStatus("idle");
          setIsLoading(false);
        },
      });

      await retellClientRef.current.connect();
      setIsConnected(true);
    } catch (error) {
      console.error("Error starting voice interview:", error);
      toast.error("Failed to start voice interview");
      setCallStatus("idle");
      setIsLoading(false);
    }
  };

  const endVoiceInterview = async () => {
    try {
      if (retellClientRef.current) {
        await retellClientRef.current.disconnect();
      }

      const token = localStorage.getItem("token");
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/retell/end-call`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setCallStatus("ended");
      setIsConnected(false);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    } catch (error) {
      console.error("Error ending call:", error);
      toast.error("Error ending call");
    }
  };

  const handleCallEnd = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/retell/call-status`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.call?.feedback) {
        setFeedback(response.data.call.feedback);
      }
    } catch (error) {
      console.error("Error getting call feedback:", error);
    }
  };

  const toggleMute = () => {
    if (retellClientRef.current) {
      if (isMuted) {
        retellClientRef.current.unmute();
      } else {
        retellClientRef.current.mute();
      }
      setIsMuted(!isMuted);
    }
  };

  const toggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
  };

  const renderInterviewSetup = () => (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="text-center mb-6">
        <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <BsTelephone className="text-3xl text-purple-600" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Voice Interview Setup
        </h2>
        <p className="text-gray-600">
          Practice your interview skills with our AI voice agent
        </p>
      </div>

      <div className="space-y-4 mb-6">
        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
          <BsCheckCircle className="text-blue-500" />
          <span className="text-sm text-blue-700">
            Role: {interviewConfig.role}
          </span>
        </div>
        <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
          <BsCheckCircle className="text-green-500" />
          <span className="text-sm text-green-700">
            Difficulty: {interviewConfig.difficulty}
          </span>
        </div>
        <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
          <BsCheckCircle className="text-purple-500" />
          <span className="text-sm text-purple-700">
            Questions: {interviewConfig.questionCount}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <button
          onClick={startVoiceInterview}
          disabled={isLoading}
          className="w-full bg-purple-500 text-white py-3 px-6 rounded-lg hover:bg-purple-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Starting Interview...
            </>
          ) : (
            <>
              <BsTelephone />
              Start Voice Interview
            </>
          )}
        </button>

        <button
          onClick={onBack}
          className="w-full bg-gray-500 text-white py-2 px-6 rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
        >
          <BsArrowLeft />
          Back to Setup
        </button>
      </div>
    </div>
  );

  const renderActiveCall = () => (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Voice Interview</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-gray-600">
            <MdTimer />
            <span>{formatTime(timer)}</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${
                isConnected ? "bg-green-500" : "bg-red-500"
              }`}
            ></div>
            <span className="text-sm text-gray-600">
              {isConnected ? "Connected" : "Disconnected"}
            </span>
          </div>
        </div>
      </div>

      {currentQuestion && (
        <div className="mb-6">
          <div className="flex items-start gap-3 mb-4">
            <MdQuestionAnswer className="text-purple-500 text-xl mt-1" />
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                Current Question:
              </h3>
              <p className="text-gray-700">{currentQuestion}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-center gap-4 mb-6">
        <button
          onClick={toggleMute}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            isMuted
              ? "bg-red-500 text-white hover:bg-red-600"
              : "bg-gray-500 text-white hover:bg-gray-600"
          }`}
        >
          {isMuted ? <BsMic /> : <BsMicFill />}
          {isMuted ? "Unmute" : "Mute"}
        </button>

        <button
          onClick={toggleSpeaker}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            isSpeakerOn
              ? "bg-blue-500 text-white hover:bg-blue-600"
              : "bg-gray-500 text-white hover:bg-gray-600"
          }`}
        >
          {isSpeakerOn ? <BsVolumeUp /> : <BsVolumeMute />}
          {isSpeakerOn ? "Speaker On" : "Speaker Off"}
        </button>
      </div>

      <button
        onClick={endVoiceInterview}
        className="w-full bg-red-500 text-white py-3 px-6 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
      >
        <BsTelephoneFill />
        End Interview
      </button>
    </div>
  );

  const renderFeedback = () => (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <MdFeedback className="text-purple-500" />
        Voice Interview Feedback
      </h2>

      {feedback ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-800 mb-3">Overall Score</h3>
              <div className="flex items-center gap-2 mb-4">
                <div className="text-3xl font-bold text-purple-600">
                  {feedback.score}
                </div>
                <div className="text-gray-600">/ 100</div>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-800 mb-3">
                Interview Summary
              </h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p>Duration: {formatTime(timer)}</p>
                <p>Role: {interviewConfig.role}</p>
                <p>Mode: Voice Interview</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium text-gray-800 mb-2">Strengths</h3>
            <ul className="space-y-1">
              {feedback.strengths?.map((strength, index) => (
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
              {feedback.areasForImprovement?.map((area, index) => (
                <li
                  key={index}
                  className="flex items-center gap-2 text-sm text-orange-700"
                >
                  <BsXCircle className="text-orange-500" />
                  {area}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2">Overall Feedback</h3>
            <p className="text-blue-700 text-sm">{feedback.overallFeedback}</p>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-gray-500 mb-4">Processing feedback...</div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
        </div>
      )}

      <div className="mt-6 flex gap-4">
        <button
          onClick={() => {
            setFeedback(null);
            setCallStatus("idle");
            setTimer(0);
            setCurrentQuestion("");
          }}
          className="bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600 transition-colors"
        >
          Practice Again
        </button>
        <button
          onClick={onBack}
          className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
        >
          Back to Setup
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto">
      {callStatus === "idle" && renderInterviewSetup()}
      {callStatus === "connecting" && (
        <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            Connecting to Voice Agent...
          </h3>
          <p className="text-gray-600">
            Please wait while we set up your interview
          </p>
        </div>
      )}
      {(callStatus === "connected" || isConnected) && renderActiveCall()}
      {callStatus === "ended" && renderFeedback()}
    </div>
  );
};

export default VoiceInterview;
