import dotenv from "dotenv";
dotenv.config();
import connectDB from "./Config/db.js";
import express from "express";
import userRoute from "./Route/UserRoute.js";
import cors from "cors";
import careerInformationRoute from "./Route/CareerRoute.js";
import aiRoute from "./Route/AIRoute.js";
import roadmapRoute from "./Route/RoadmapRoute.js";
import resumeRoute from "./Route/ResumeRoute.js";
import mentorshipRoute from "./Route/MentorshipRoute.js";

const app = express();
connectDB();
const port = process.env.PORT || 8080;

app.use(express.json());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173", // Update this with your frontend URL
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Routes
app.use("/api/user", userRoute);
app.use("/api/career", careerInformationRoute);
app.use("/api/ai", aiRoute);
app.use("/api/roadmap", roadmapRoute);
app.use("/api/resume", resumeRoute);
app.use("/api/mentorship", mentorshipRoute);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log("Environment variables check:");
  console.log(
    "HUGGING_FACE_API_KEY exists:",
    !!process.env.HUGGING_FACE_API_KEY
  );
  console.log(
    "HUGGING_FACE_API_KEY value:",
    process.env.HUGGING_FACE_API_KEY ? "SET" : "NOT SET"
  );
});
// console.log(process.env.LIGHTCAST_CLIENT_ID);
// console.log(process.env.LIGHTCAST_CLIENT_SECRET);
