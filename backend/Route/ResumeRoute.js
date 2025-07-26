import express from "express";
import {
  createResume,
  getResume,
  getUserResumes,
  updateResume,
  deleteResume,
  analyzeResumeWithAI,
  generatePDF,
  togglePublicAccess,
  getPublicResume,
} from "../Controller/ResumeController.js";
import { authMiddleware } from "../Middleware/authMiddleware.js";

const router = express.Router();

// Resume routes
router.post("/", authMiddleware, createResume);
router.get("/", authMiddleware, getUserResumes);
router.get("/:resumeId", authMiddleware, getResume);
router.put("/:resumeId", authMiddleware, updateResume);
router.delete("/:resumeId", authMiddleware, deleteResume);

// Resume analysis and export
router.post("/:resumeId/analyze", authMiddleware, analyzeResumeWithAI);
router.get("/:resumeId/pdf", authMiddleware, generatePDF);
router.patch("/:resumeId/public", authMiddleware, togglePublicAccess);

// Public resume access
router.get("/public/:shareLink", getPublicResume);

export default router;
