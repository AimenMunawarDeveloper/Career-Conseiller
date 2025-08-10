import React, { useState, useRef, useEffect } from "react";
import Layout from "../Components/Layout";
import ChatHistoryModal from "../Components/ChatHistoryModal";
import { IoSearchOutline, IoSend, IoTime, IoClose } from "react-icons/io5";
import { MdOutlineAttachFile } from "react-icons/md";
import { BsRobot, BsPerson } from "react-icons/bs";
import axios from "axios";
import { toast } from "react-hot-toast";

export default function AlChat() {
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
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [sessionTitle, setSessionTitle] = useState("New Chat");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChatSession = async (sessionId) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/chat-history/sessions/${sessionId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const session = response.data.session;
      setCurrentSessionId(sessionId);
      setSessionTitle(session.title);

      // Convert database messages to frontend format
      const formattedMessages = session.messages.map((msg, index) => ({
        id: Date.now() + index,
        content: msg.content,
        role: msg.role,
        timestamp: msg.timestamp,
      }));

      setMessages(formattedMessages);
    } catch (error) {
      console.error("Error loading chat session:", error);
      toast.error("Failed to load chat session");
    } finally {
      setIsLoading(false);
    }
  };

  const startNewChat = () => {
    setMessages([
      {
        id: Date.now(),
        content:
          "Hello! I'm CareerBot, your AI career counselor. I'm here to help you with resume advice, interview tips, career path exploration, and more. How can I assist you today?",
        role: "assistant",
        timestamp: new Date().toISOString(),
      },
    ]);
    setCurrentSessionId(null);
    setSessionTitle("New Chat");
    setUploadedFile(null);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    // Check file type
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
      "text/plain",
      "text/csv",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Only PDF, DOC, DOCX, TXT, and CSV files are allowed");
      return;
    }

    try {
      setUploadingFile(true);
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("file", file);

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

      const fileData = response.data;
      setUploadedFile({
        ...fileData.file,
        extractedText: fileData.extractedText,
        textLength: fileData.textLength,
      });

      toast.success(`File "${file.name}" uploaded successfully!`);

      // Add a system message about the uploaded file
      const fileMessage = {
        id: Date.now(),
        content: `📎 File uploaded: ${file.name}${
          fileData.extractedText
            ? ` (${fileData.textLength} characters extracted)`
            : ""
        }`,
        role: "system",
        timestamp: new Date().toISOString(),
        isFileUpload: true,
      };

      setMessages((prev) => [...prev, fileMessage]);
    } catch (error) {
      console.error("File upload error:", error);
      toast.error("Failed to upload file. Please try again.");
    } finally {
      setUploadingFile(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeUploadedFile = () => {
    setUploadedFile(null);
  };

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
      const requestData = {
        message: currentMessage,
        sessionId: currentSessionId,
        context: {
          history: messages.slice(-10).map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        },
      };

      // Add file data if a file is uploaded
      if (uploadedFile && uploadedFile.extractedText) {
        requestData.fileData = {
          originalName: uploadedFile.originalName,
          extractedText: uploadedFile.extractedText,
          textLength: uploadedFile.textLength,
        };
      }

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/ai/chat`,
        requestData,
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

      // Update session ID if this is a new chat
      if (response.data.sessionId && !currentSessionId) {
        setCurrentSessionId(response.data.sessionId);
        // Update title based on first message
        const title =
          currentMessage.length > 30
            ? currentMessage.substring(0, 30) + "..."
            : currentMessage;
        setSessionTitle(title);
      }

      // Clear uploaded file after sending message
      setUploadedFile(null);
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

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderMessage = (message) => {
    const isUser = message.role === "user";
    const isSystem = message.role === "system";

    if (isSystem) {
      return (
        <div key={message.id} className="flex justify-center mb-4">
          <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm">
            {message.content}
          </div>
        </div>
      );
    }

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
      {/* Header with session info and history button */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-900">
            {sessionTitle}
          </h2>
          {currentSessionId && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {messages.length - 1} messages
            </span>
          )}
        </div>
        <button
          onClick={() => setShowHistoryModal(true)}
          className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
        >
          <IoTime className="text-lg" />
          <span className="text-sm">History</span>
        </button>
      </div>

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

      {/* Uploaded File Display */}
      {uploadedFile && (
        <div className="px-4 py-3 bg-blue-50 border-t border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MdOutlineAttachFile className="text-blue-600 text-xl" />
              <div>
                <p className="text-sm font-medium text-blue-900">
                  {uploadedFile.originalName}
                </p>
                <p className="text-xs text-blue-600">
                  {uploadedFile.textLength} characters extracted
                </p>
              </div>
            </div>
            <button
              onClick={removeUploadedFile}
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              <IoClose className="text-lg" />
            </button>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingFile}
            className="p-2 text-gray-500 hover:text-purple-500 transition-colors disabled:opacity-50"
            title="Attach file"
          >
            {uploadingFile ? (
              <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <MdOutlineAttachFile className="text-xl" />
            )}
          </button>

          <div className="flex-1 relative">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                uploadedFile
                  ? "Ask about the uploaded file..."
                  : "Type your career question..."
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              rows="1"
              style={{ minHeight: "48px", maxHeight: "120px" }}
            />
          </div>

          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading || uploadingFile}
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
          accept=".pdf,.doc,.docx,.txt,.csv"
        />
      </div>
    </div>
  );

  return (
    <Layout>
      {chatContent}
      <ChatHistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        onSelectSession={loadChatSession}
        onNewChat={startNewChat}
      />
    </Layout>
  );
}
