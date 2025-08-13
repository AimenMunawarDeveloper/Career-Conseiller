import express from "express";
import {
  createVoiceAgent,
  handleLLMStream,
  handleWebhook,
  getCallStatus,
  endCall,
  startCall,
} from "../Controller/RetellService.js";
import { authMiddleware } from "../Middleware/authMiddleware.js";

const router = express.Router();

// Create a voice agent for mock interviews
router.post("/create-agent", authMiddleware, createVoiceAgent);

// Start a call with existing agent
router.post("/start-call", authMiddleware, startCall);

// Handle LLM streaming (no auth required as called by Retell)
router.post("/llm-stream", handleLLMStream);

// Handle webhook events from Retell (no auth required)
router.post("/webhook", handleWebhook);

// Get active call status
router.get("/call-status", authMiddleware, getCallStatus);

// End active call
router.post("/end-call", authMiddleware, endCall);

export default router;
