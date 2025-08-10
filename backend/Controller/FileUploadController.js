import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Cloudinary configuration
let cloudinaryInitialized = false;

const initializeCloudinary = () => {
  if (!cloudinaryInitialized) {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error(
        "Cloudinary environment variables are not properly configured. Please check CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env file."
      );
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });

    cloudinaryInitialized = true;
    console.log("Cloudinary configured successfully");
  }
};

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
      "text/plain",
      "text/csv",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid file type. Only PDF, DOC, DOCX, TXT, and CSV files are allowed."
        ),
        false
      );
    }
  },
});

// Upload file to Cloudinary
export const uploadToCloudinary = async (
  filePath,
  folder = "career-counselor",
  deleteLocalFile = true
) => {
  try {
    // Initialize Cloudinary if not already done
    initializeCloudinary();

    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      resource_type: "auto",
    });

    // Delete local file after upload only if requested
    if (deleteLocalFile && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      size: result.bytes,
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    // Clean up local file if upload fails
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    throw error;
  }
};

// Extract text from different file types
export const extractTextFromFile = async (filePath, fileType) => {
  try {
    let extractedText = "";

    // Verify file exists before processing
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    // Get file stats for debugging
    const fileStats = fs.statSync(filePath);
    console.log(`Processing file: ${filePath}`);
    console.log(`File size: ${fileStats.size} bytes`);
    console.log(`File type: ${fileType}`);

    switch (fileType) {
      case "pdf":
        try {
          console.log("Attempting PDF text extraction with pdf2json...");
          const { default: PDFParser } = await import("pdf2json");

          // Create a new PDFParser instance
          const pdfParser = new PDFParser();

          // Read the PDF file
          const pdfBuffer = fs.readFileSync(filePath);
          console.log(`PDF buffer size: ${pdfBuffer.length} bytes`);

          // Parse the PDF
          const pdfData = await new Promise((resolve, reject) => {
            pdfParser.on("pdfParser_dataReady", (pdfData) => {
              resolve(pdfData);
            });

            pdfParser.on("pdfParser_dataError", (errData) => {
              reject(new Error(`PDF parsing error: ${errData.parserError}`));
            });

            pdfParser.parseBuffer(pdfBuffer);
          });

          // Extract text from all pages
          let allText = "";
          if (pdfData.Pages && pdfData.Pages.length > 0) {
            pdfData.Pages.forEach((page, pageIndex) => {
              if (page.Texts && page.Texts.length > 0) {
                page.Texts.forEach((textItem) => {
                  if (textItem.R && textItem.R.length > 0) {
                    textItem.R.forEach((textRun) => {
                      if (textRun.T) {
                        // Decode the text (PDF text is often encoded)
                        const decodedText = decodeURIComponent(textRun.T);
                        allText += decodedText + " ";
                      }
                    });
                  }
                });
                allText += "\n"; // Add newline between pages
              }
            });
          }

          extractedText = allText.trim();
          console.log(
            `PDF extraction successful. Total text length: ${extractedText.length}`
          );

          // If text is too short, it might be an image-based PDF
          if (extractedText.length < 50) {
            console.log(
              "Warning: Extracted text is very short, might be image-based PDF"
            );
            extractedText =
              "This appears to be an image-based PDF. Please copy and paste the text content manually, or convert the PDF to a text-based format.";
          }
        } catch (pdfError) {
          console.error("PDF parsing error with pdf2json:", pdfError);

          // Fallback to pdf-parse if pdf2json fails
          try {
            console.log("Trying fallback with pdf-parse...");
            const pdfParse = await import("pdf-parse");
            const pdfBuffer = fs.readFileSync(filePath);

            const pdfData = await pdfParse.default(pdfBuffer);
            extractedText = pdfData.text;

            if (extractedText && extractedText.length > 0) {
              console.log("Fallback PDF parsing successful");
            } else {
              throw new Error("No text extracted");
            }
          } catch (fallbackError) {
            console.error("Fallback PDF parsing also failed:", fallbackError);
            extractedText =
              "Unable to extract text from this PDF. This might be an image-based PDF or the file may be corrupted. Please copy and paste the text content manually.";
          }
        }
        break;

      case "docx":
        try {
          console.log("Attempting DOCX text extraction...");
          const mammoth = await import("mammoth");
          const docxBuffer = fs.readFileSync(filePath);
          const docxResult = await mammoth.default.extractRawText({
            buffer: docxBuffer,
          });
          extractedText = docxResult.value;
          console.log(
            `DOCX extraction successful. Text length: ${extractedText.length}`
          );
        } catch (docxError) {
          console.error("DOCX parsing error:", docxError);
          extractedText =
            "Unable to extract text from DOCX file. Please ensure the file is not corrupted.";
        }
        break;

      case "doc":
        // For .doc files, we'll need a different approach
        // For now, we'll return a message asking to convert to .docx
        extractedText =
          "Please convert this .doc file to .docx format for better text extraction.";
        break;

      case "txt":
      case "csv":
        try {
          console.log("Attempting text file extraction...");
          extractedText = fs.readFileSync(filePath, "utf8");
          console.log(
            `Text file extraction successful. Text length: ${extractedText.length}`
          );
        } catch (textError) {
          console.error("Text file reading error:", textError);
          extractedText =
            "Unable to read text file. Please ensure the file is not corrupted.";
        }
        break;

      default:
        throw new Error("Unsupported file type for text extraction");
    }

    return {
      success: true,
      text: extractedText.trim(),
      length: extractedText.length,
    };
  } catch (error) {
    console.error("Text extraction error:", error);
    throw error;
  }
};

// Main file upload handler
export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const file = req.file;
    const userId = req.user?.payload?.id || req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // Extract text from file FIRST (before uploading to Cloudinary)
    const fileExtension = path.extname(file.originalname).toLowerCase();
    const fileType = fileExtension.substring(1); // Remove the dot

    let textExtractionResult = null;
    try {
      textExtractionResult = await extractTextFromFile(file.path, fileType);
      console.log(
        "Text extraction successful:",
        textExtractionResult.textLength,
        "characters"
      );
    } catch (extractionError) {
      console.error("Text extraction failed:", extractionError);
      // Continue without text extraction
    }

    // Upload to Cloudinary AFTER text extraction (don't delete local file yet)
    const cloudinaryResult = await uploadToCloudinary(
      file.path,
      `career-counselor/${userId}`,
      false // Don't delete local file yet
    );

    // For now, don't delete the local file to debug PDF extraction
    // if (fs.existsSync(file.path)) {
    //   fs.unlinkSync(file.path);
    // }

    res.json({
      success: true,
      file: {
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        cloudinaryUrl: cloudinaryResult.url,
        publicId: cloudinaryResult.publicId,
      },
      extractedText: textExtractionResult?.text || null,
      textLength: textExtractionResult?.length || 0,
      message: "File uploaded successfully",
    });
  } catch (error) {
    console.error("File upload error:", error);
    res.status(500).json({
      error: "Failed to upload file",
      details: error.message,
    });
  }
};

// Delete file from Cloudinary
export const deleteFile = async (req, res) => {
  try {
    const { publicId } = req.params;
    const userId = req.user?.payload?.id || req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // Initialize Cloudinary if not already done
    initializeCloudinary();

    const result = await cloudinary.uploader.destroy(publicId);

    res.json({
      success: true,
      message: "File deleted successfully",
      result: result,
    });
  } catch (error) {
    console.error("File deletion error:", error);
    res.status(500).json({
      error: "Failed to delete file",
      details: error.message,
    });
  }
};

// Get file info
export const getFileInfo = async (req, res) => {
  try {
    const { publicId } = req.params;
    const userId = req.user?.payload?.id || req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // Initialize Cloudinary if not already done
    initializeCloudinary();

    const result = await cloudinary.api.resource(publicId);

    res.json({
      success: true,
      file: {
        publicId: result.public_id,
        url: result.secure_url,
        format: result.format,
        size: result.bytes,
        createdAt: result.created_at,
        width: result.width,
        height: result.height,
      },
    });
  } catch (error) {
    console.error("Get file info error:", error);
    res.status(500).json({
      error: "Failed to get file info",
      details: error.message,
    });
  }
};

// Extract text from uploaded file
export const extractTextFromUploadedFile = async (req, res) => {
  try {
    const { fileName } = req.body;
    const userId = req.user?.payload?.id || req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    if (!fileName) {
      return res.status(400).json({ error: "File name is required" });
    }

    // Construct the file path
    const filePath = path.join(__dirname, "../uploads", fileName);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found" });
    }

    // Get file extension and type
    const fileExtension = path.extname(fileName).toLowerCase();
    const fileType = fileExtension.substring(1); // Remove the dot

    // Extract text from file
    const extractionResult = await extractTextFromFile(filePath, fileType);

    res.json({
      success: true,
      extractedText: extractionResult.text,
      textLength: extractionResult.length,
      message: "Text extracted successfully",
    });
  } catch (error) {
    console.error("Text extraction error:", error);
    res.status(500).json({
      error: "Failed to extract text from file",
      details: error.message,
    });
  }
};

// Export multer upload middleware
export { upload };
