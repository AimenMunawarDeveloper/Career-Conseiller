import express from "express";
import {
  getUserChatSessions,
  getChatSession,
  createChatSession,
  deleteChatSession,
  updateChatTitle,
  addMessageToSession,
  clearChatSession,
} from "../Controller/ChatHistoryController.js";
import { authMiddleware } from "../Middleware/authMiddleware.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Get all chat sessions for the user
router.get("/sessions", getUserChatSessions);

// Create a new chat session
router.post("/sessions", createChatSession);

// Get a specific chat session
router.get("/sessions/:sessionId", getChatSession);

// Update chat session title
router.patch("/sessions/:sessionId/title", updateChatTitle);

// Delete a chat session
router.delete("/sessions/:sessionId", deleteChatSession);

// Add a message to a chat session
router.post("/sessions/:sessionId/messages", addMessageToSession);

// Clear all messages from a chat session
router.delete("/sessions/:sessionId/messages", clearChatSession);

export default router;
