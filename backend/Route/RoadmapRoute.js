import express from "express";
import {
  createCareerRoadmap,
  getCareerRoadmap,
  updateCareerRoadmap,
  markGoalComplete,
  regenerateRoadmap,
} from "../Controller/CareerRoadmapController.js";
import { authMiddleware } from "../Middleware/authMiddleware.js";

const router = express.Router();

// Career Roadmap routes
router.post("/", authMiddleware, createCareerRoadmap);
router.get("/", authMiddleware, getCareerRoadmap);
router.put("/", authMiddleware, updateCareerRoadmap);
router.patch("/goal", authMiddleware, markGoalComplete);
router.post("/regenerate", authMiddleware, regenerateRoadmap);

export default router;
