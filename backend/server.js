import dotenv from "dotenv";
dotenv.config();

// Debug environment variables
console.log("Environment variables check:");
console.log("RETELL_API_KEY:", process.env.RETELL_API_KEY ? "SET" : "NOT SET");
console.log("PORT:", process.env.PORT);
console.log("FRONTEND_URL:", process.env.FRONTEND_URL);
console.log("MONGO_URI:", process.env.MONGO_URI ? "SET" : "NOT SET");

import connectDB from "./Config/db.js";
import express from "express";
import userRoute from "./Route/UserRoute.js";
import cors from "cors";
import careerInformationRoute from "./Route/CareerRoute.js";
import aiRoute from "./Route/AIRoute.js";
import roadmapRoute from "./Route/RoadmapRoute.js";

import chatHistoryRoute from "./Route/ChatHistoryRoute.js";
import fileUploadRoute from "./Route/FileUploadRoute.js";
import retellRoute from "./Route/RetellRoute.js";

const app = express();
const port = process.env.PORT || 8080;

// Initialize database connection
const initializeApp = async () => {
  try {
    await connectDB();

    app.use(express.json());
    app.use(
      cors({
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
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
    app.use("/api/chat-history", chatHistoryRoute);
    app.use("/api/files", fileUploadRoute);
    app.use("/api/retell", retellRoute);

    // Health check endpoint
    app.get("/api/health", (req, res) => {
      res.status(200).json({ status: "OK", message: "Server is running" });
    });

    // For local development, start the server
    if (process.env.NODE_ENV !== "production") {
      app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
        console.log("Environment variables check:");
        console.log(
          "CLOUDINARY_CLOUD_NAME:",
          process.env.CLOUDINARY_CLOUD_NAME ? "SET" : "NOT SET"
        );
        console.log(
          "CLOUDINARY_API_KEY:",
          process.env.CLOUDINARY_API_KEY ? "SET" : "NOT SET"
        );
        console.log(
          "CLOUDINARY_API_SECRET:",
          process.env.CLOUDINARY_API_SECRET ? "SET" : "NOT SET"
        );
      });
    }
  } catch (error) {
    console.error("Failed to initialize app:", error);
    process.exit(1);
  }
};

// Initialize the app
initializeApp();

// Export the app for Vercel serverless deployment
export default app;
