import express from "express";
import {
  createMentorProfile,
  getMentorProfile,
  updateMentorProfile,
  searchMentors,
  requestMentorship,
  respondToMentorshipRequest,
  getUserMentorships,
  createCareerEvent,
  getCareerEvents,
  registerForEvent,
  getUserEvents,
  cancelEventRegistration,
} from "../Controller/MentorshipController.js";
import { authMiddleware } from "../Middleware/authMiddleware.js";

const router = express.Router();

// Mentor Profile routes
router.post("/profile", authMiddleware, createMentorProfile);
router.get("/profile", authMiddleware, getMentorProfile);
router.put("/profile", authMiddleware, updateMentorProfile);
router.get("/search", searchMentors);

// Mentorship routes
router.post("/request", authMiddleware, requestMentorship);
router.patch(
  "/request/:mentorshipId",
  authMiddleware,
  respondToMentorshipRequest
);
router.get("/user", authMiddleware, getUserMentorships);

// Career Events routes
router.post("/events", authMiddleware, createCareerEvent);
router.get("/events", getCareerEvents);
router.post("/events/:eventId/register", authMiddleware, registerForEvent);
router.get("/events/user", authMiddleware, getUserEvents);
router.delete(
  "/events/:eventId/register",
  authMiddleware,
  cancelEventRegistration
);

export default router;
