import express from "express";
import {
  uploadFile,
  deleteFile,
  getFileInfo,
  extractTextFromUploadedFile,
  upload,
} from "../Controller/FileUploadController.js";
import { authMiddleware } from "../Middleware/authMiddleware.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Upload a file
router.post("/upload", upload.single("file"), uploadFile);

// Delete a file
router.delete("/files/:publicId", deleteFile);

// Get file info
router.get("/files/:publicId", getFileInfo);

// Extract text from uploaded file
router.post("/extract-text", extractTextFromUploadedFile);

export default router;
