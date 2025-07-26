import express from "express";
import {
  chatWithAI,
  generateCareerRoadmap,
  analyzeResume,
  analyzeSkillGap,
  getMockInterviewQuestions,
  provideInterviewFeedback,
} from "../Controller/AIChatController.js";
import { authMiddleware } from "../Middleware/authMiddleware.js";

const router = express.Router();

// AI Chat routes
router.post("/chat", authMiddleware, chatWithAI);
router.post("/generate-roadmap", authMiddleware, generateCareerRoadmap);
router.post("/analyze-resume", authMiddleware, analyzeResume);

// NEW FEATURES: Skill Gap Analysis and Mock Interviews
router.post("/skill-gap-analysis", authMiddleware, analyzeSkillGap);
router.get(
  "/mock-interview-questions",
  authMiddleware,
  getMockInterviewQuestions
);
router.post("/interview-feedback", authMiddleware, provideInterviewFeedback);

export default router;
