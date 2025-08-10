import React, { useState, useRef, useEffect } from "react";
import Sidebar from "../Components/Sidebar";
import TopBar from "../Components/TopBar";
import { useApp } from "../Context/AppContext";
import { IoSearchOutline, IoSend } from "react-icons/io5";
import { MdOutlineAttachFile } from "react-icons/md";
import { BsRobot, BsPerson } from "react-icons/bs";
import axios from "axios";
import { toast } from "react-hot-toast";

export default function AlChat() {
  const { isOpen } = useApp();
  const [messages, setMessages] = useState([
    {
      id: Date.now(),
      content:
        "Hello! I'm CareerBot, your AI career counselor. I'm here to help you with resume advice, interview tips, career path exploration, and more. How can I assist you today?",
      role: "assistant",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      content: inputMessage,
      role: "user",
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentMessage = inputMessage;
    setInputMessage("");
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/ai/chat`,
        {
          message: currentMessage,
          context: {
            history: messages.slice(-10).map((msg) => ({
              role: msg.role,
              content: msg.content,
            })),
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const aiMessage = {
        id: Date.now() + 1,
        content: response.data.response,
        role: "assistant",
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      toast.error("Failed to send message. Please try again.");

      const errorMessage = {
        id: Date.now() + 1,
        content:
          "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.",
        role: "assistant",
        timestamp: new Date().toISOString(),
        isError: true,
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Handle file upload logic here
      toast.success(`File "${file.name}" selected`);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderMessage = (message) => {
    const isUser = message.role === "user";

    return (
      <div
        key={message.id}
        className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}
      >
        <div
          className={`flex ${
            isUser ? "flex-row-reverse" : "flex-row"
          } items-start gap-3 max-w-[80%]`}
        >
          <div
            className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              isUser ? "bg-purple-500" : "bg-gray-500"
            }`}
          >
            {isUser ? (
              <BsPerson className="text-white text-sm" />
            ) : (
              <BsRobot className="text-white text-sm" />
            )}
          </div>

          <div
            className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
          >
            <div
              className={`px-4 py-3 rounded-lg ${
                isUser
                  ? "bg-purple-500 text-white"
                  : message.isError
                  ? "bg-red-100 text-red-800 border border-red-200"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              <div className="whitespace-pre-wrap">{message.content}</div>
            </div>
            <span className="text-xs text-gray-500 mt-1">
              {formatTime(message.timestamp)}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const chatContent = (
    <div className="flex-1 flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <BsRobot className="text-6xl mb-4 text-purple-500" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Career Counselor AI
            </h3>
            <p className="text-center max-w-md">
              Ask me anything about career planning, job search, skill
              development, or professional growth. I'm here to help guide your
              career journey!
            </p>
            <div className="mt-6 space-y-2">
              <p className="text-sm font-medium">Try asking:</p>
              <div className="space-y-1 text-sm">
                <p>
                  • "What skills should I develop for a software engineering
                  career?"
                </p>
                <p>• "How can I transition from marketing to data science?"</p>
                <p>• "What are the best practices for resume writing?"</p>
                <p>• "How should I prepare for a technical interview?"</p>
              </div>
            </div>
          </div>
        ) : (
          messages.map(renderMessage)
        )}

        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="flex items-start gap-3 max-w-[80%]">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center">
                <BsRobot className="text-white text-sm" />
              </div>
              <div className="px-4 py-3 rounded-lg bg-gray-100">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-500 hover:text-purple-500 transition-colors"
            title="Attach file"
          >
            <MdOutlineAttachFile className="text-xl" />
          </button>

          <div className="flex-1 relative">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your career question..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              rows="1"
              style={{ minHeight: "48px", maxHeight: "120px" }}
            />
          </div>

          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="p-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Send message"
          >
            <IoSend className="text-lg" />
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileUpload}
          className="hidden"
          accept=".pdf,.doc,.docx,.txt"
        />
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
            {chatContent}
          </div>
        </div>
      ) : (
        <div className="w-full h-screen flex flex-col">
          <TopBar />
          {chatContent}
        </div>
      )}
    </div>
  );
}
