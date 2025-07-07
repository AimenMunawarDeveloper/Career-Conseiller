import "dotenv/config";
import connectDB from "./Config/db.js";
import express from "express";
import userRoute from "./Route/UserRoute.js";
import cors from "cors";

const app = express();
connectDB();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173", // Update this with your frontend URL
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use("/api/user", userRoute);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
