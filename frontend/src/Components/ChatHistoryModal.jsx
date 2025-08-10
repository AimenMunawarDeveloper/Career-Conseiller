import React, { useState, useEffect } from "react";
import { IoClose, IoTrash, IoEye, IoAdd, IoPencil } from "react-icons/io5";
import { BsRobot } from "react-icons/bs";
import axios from "axios";
import { toast } from "react-hot-toast";

const ChatHistoryModal = ({ isOpen, onClose, onSelectSession, onNewChat }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTitle, setEditingTitle] = useState(null);
  const [newTitle, setNewTitle] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchChatSessions();
    }
  }, [isOpen]);

  const fetchChatSessions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/chat-history/sessions`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSessions(response.data.sessions);
    } catch (error) {
      console.error("Error fetching chat sessions:", error);
      toast.error("Failed to load chat history");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSession = async (sessionId, e) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this chat session?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/chat-history/sessions/${sessionId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Chat session deleted");
      fetchChatSessions();
    } catch (error) {
      console.error("Error deleting session:", error);
      toast.error("Failed to delete chat session");
    }
  };

  const handleUpdateTitle = async (sessionId, e) => {
    e.stopPropagation();
    if (!newTitle.trim()) {
      toast.error("Title cannot be empty");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/chat-history/sessions/${sessionId}/title`,
        { title: newTitle.trim() },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Title updated");
      setEditingTitle(null);
      setNewTitle("");
      fetchChatSessions();
    } catch (error) {
      console.error("Error updating title:", error);
      toast.error("Failed to update title");
    }
  };

  const startEditing = (session, e) => {
    e.stopPropagation();
    setEditingTitle(session.sessionId);
    setNewTitle(session.title);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 168) {
      return date.toLocaleDateString([], { weekday: "short" });
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  const handleSessionClick = (session) => {
    onSelectSession(session.sessionId);
    onClose();
  };

  const handleNewChat = () => {
    onNewChat();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Chat History</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <IoClose className="text-xl" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-4 border-b border-gray-200">
          <button
            onClick={handleNewChat}
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
          >
            <IoAdd className="text-lg" />
            New Chat
          </button>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <BsRobot className="text-4xl mx-auto mb-4 text-gray-300" />
              <p>No chat history yet</p>
              <p className="text-sm">Start a new conversation to see it here</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sessions.map((session) => (
                <div
                  key={session.sessionId}
                  onClick={() => handleSessionClick(session)}
                  className="group relative p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      {editingTitle === session.sessionId ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === "Enter") {
                                handleUpdateTitle(session.sessionId, e);
                              }
                            }}
                            className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                            autoFocus
                          />
                          <button
                            onClick={(e) =>
                              handleUpdateTitle(session.sessionId, e)
                            }
                            className="text-green-600 hover:text-green-700"
                          >
                            ✓
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingTitle(null);
                              setNewTitle("");
                            }}
                            className="text-red-600 hover:text-red-700"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <h3 className="font-medium text-gray-900 truncate">
                          {session.title}
                        </h3>
                      )}
                      <p className="text-sm text-gray-500 truncate mt-1">
                        {session.preview}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                        <span>{formatDate(session.lastActivity)}</span>
                        <span>{session.messageCount} messages</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => startEditing(session, e)}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        title="Edit title"
                      >
                        <IoPencil className="text-sm" />
                      </button>
                      <button
                        onClick={(e) =>
                          handleDeleteSession(session.sessionId, e)
                        }
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete session"
                      >
                        <IoTrash className="text-sm" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatHistoryModal;
