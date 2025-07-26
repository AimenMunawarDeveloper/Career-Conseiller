import Resume from "../Model/ResumeModel.js";
import { analyzeResume } from "./AIChatController.js";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createResume = async (req, res) => {
  try {
    const userId = req.user.id;
    const resumeData = req.body;

    const resume = new Resume({
      userId,
      ...resumeData,
    });

    await resume.save();

    res.status(201).json({
      success: true,
      resume,
      message: "Resume created successfully",
    });
  } catch (error) {
    console.error("Create Resume Error:", error);
    res.status(500).json({
      error: "Failed to create resume",
      details: error.message,
    });
  }
};

export const getResume = async (req, res) => {
  try {
    const userId = req.user.id;
    const { resumeId } = req.params;

    const resume = await Resume.findOne({
      _id: resumeId,
      userId,
    });

    if (!resume) {
      return res.status(404).json({
        error: "Resume not found",
      });
    }

    res.json({
      success: true,
      resume,
    });
  } catch (error) {
    console.error("Get Resume Error:", error);
    res.status(500).json({
      error: "Failed to retrieve resume",
      details: error.message,
    });
  }
};

export const getUserResumes = async (req, res) => {
  try {
    const userId = req.user.id;

    const resumes = await Resume.find({ userId }).select(
      "title template isPublic shareLink lastUpdated"
    );

    res.json({
      success: true,
      resumes,
    });
  } catch (error) {
    console.error("Get User Resumes Error:", error);
    res.status(500).json({
      error: "Failed to retrieve user resumes",
      details: error.message,
    });
  }
};

export const updateResume = async (req, res) => {
  try {
    const userId = req.user.id;
    const { resumeId } = req.params;
    const updateData = req.body;

    const resume = await Resume.findOne({
      _id: resumeId,
      userId,
    });

    if (!resume) {
      return res.status(404).json({
        error: "Resume not found",
      });
    }

    // Update resume fields
    Object.keys(updateData).forEach((key) => {
      if (key !== "userId" && key !== "_id") {
        resume[key] = updateData[key];
      }
    });

    resume.lastUpdated = new Date();
    await resume.save();

    res.json({
      success: true,
      resume,
      message: "Resume updated successfully",
    });
  } catch (error) {
    console.error("Update Resume Error:", error);
    res.status(500).json({
      error: "Failed to update resume",
      details: error.message,
    });
  }
};

export const deleteResume = async (req, res) => {
  try {
    const userId = req.user.id;
    const { resumeId } = req.params;

    const resume = await Resume.findOneAndDelete({
      _id: resumeId,
      userId,
    });

    if (!resume) {
      return res.status(404).json({
        error: "Resume not found",
      });
    }

    res.json({
      success: true,
      message: "Resume deleted successfully",
    });
  } catch (error) {
    console.error("Delete Resume Error:", error);
    res.status(500).json({
      error: "Failed to delete resume",
      details: error.message,
    });
  }
};

export const analyzeResumeWithAI = async (req, res) => {
  try {
    const { resumeId } = req.params;
    const { jobDescription } = req.body;
    const userId = req.user.id;

    const resume = await Resume.findOne({
      _id: resumeId,
      userId,
    });

    if (!resume) {
      return res.status(404).json({
        error: "Resume not found",
      });
    }

    // Convert resume to text format for analysis
    const resumeText = formatResumeForAnalysis(resume);

    // Create a mock request object for the AI analysis
    const mockReq = {
      body: {
        resumeText,
        jobDescription,
      },
    };

    const mockRes = {
      json: (data) => {
        res.json({
          success: true,
          analysis: data.analysis,
          resumeScore: resume.calculateScore(),
          suggestions: generateSuggestions(resume),
        });
      },
      status: (code) => ({
        json: (data) => res.status(code).json(data),
      }),
    };

    await analyzeResume(mockReq, mockRes);
  } catch (error) {
    console.error("Analyze Resume Error:", error);
    res.status(500).json({
      error: "Failed to analyze resume",
      details: error.message,
    });
  }
};

export const generatePDF = async (req, res) => {
  try {
    const { resumeId } = req.params;
    const userId = req.user.id;

    const resume = await Resume.findOne({
      _id: resumeId,
      userId,
    });

    if (!resume) {
      return res.status(404).json({
        error: "Resume not found",
      });
    }

    const doc = new PDFDocument();
    const filename = `${resume.title.replace(/\s+/g, "_")}_${Date.now()}.pdf`;
    const filepath = path.join(__dirname, "../uploads", filename);

    // Ensure uploads directory exists
    const uploadsDir = path.dirname(filepath);
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const stream = fs.createWriteStream(filepath);
    doc.pipe(stream);

    // Generate PDF content based on template
    generatePDFContent(doc, resume, resume.template);

    doc.end();

    stream.on("finish", () => {
      res.download(filepath, filename, (err) => {
        if (err) {
          console.error("Download error:", err);
        }
        // Clean up file after download
        fs.unlink(filepath, (unlinkErr) => {
          if (unlinkErr) console.error("File cleanup error:", unlinkErr);
        });
      });
    });
  } catch (error) {
    console.error("Generate PDF Error:", error);
    res.status(500).json({
      error: "Failed to generate PDF",
      details: error.message,
    });
  }
};

export const togglePublicAccess = async (req, res) => {
  try {
    const userId = req.user.id;
    const { resumeId } = req.params;

    const resume = await Resume.findOne({
      _id: resumeId,
      userId,
    });

    if (!resume) {
      return res.status(404).json({
        error: "Resume not found",
      });
    }

    resume.isPublic = !resume.isPublic;

    if (resume.isPublic && !resume.shareLink) {
      resume.generateShareLink();
    }

    await resume.save();

    res.json({
      success: true,
      resume: {
        isPublic: resume.isPublic,
        shareLink: resume.shareLink,
      },
      message: `Resume ${resume.isPublic ? "made public" : "made private"}`,
    });
  } catch (error) {
    console.error("Toggle Public Access Error:", error);
    res.status(500).json({
      error: "Failed to toggle public access",
      details: error.message,
    });
  }
};

export const getPublicResume = async (req, res) => {
  try {
    const { shareLink } = req.params;

    const resume = await Resume.findOne({
      shareLink,
      isPublic: true,
    });

    if (!resume) {
      return res.status(404).json({
        error: "Resume not found or not public",
      });
    }

    res.json({
      success: true,
      resume,
    });
  } catch (error) {
    console.error("Get Public Resume Error:", error);
    res.status(500).json({
      error: "Failed to retrieve public resume",
      details: error.message,
    });
  }
};

// Helper functions
function formatResumeForAnalysis(resume) {
  let text = "";

  // Personal Info
  if (resume.personalInfo) {
    text += `${resume.personalInfo.firstName} ${resume.personalInfo.lastName}\n`;
    text += `${resume.personalInfo.email} | ${resume.personalInfo.phone}\n`;
    text += `${resume.personalInfo.location}\n\n`;
  }

  // Summary
  if (resume.summary) {
    text += `SUMMARY\n${resume.summary}\n\n`;
  }

  // Experience
  if (resume.experience && resume.experience.length > 0) {
    text += "EXPERIENCE\n";
    resume.experience.forEach((exp) => {
      text += `${exp.title} at ${exp.company}\n`;
      text += `${exp.startDate} - ${exp.current ? "Present" : exp.endDate}\n`;
      text += `${exp.description}\n`;
      if (exp.achievements) {
        exp.achievements.forEach((achievement) => {
          text += `• ${achievement}\n`;
        });
      }
      text += "\n";
    });
  }

  // Education
  if (resume.education && resume.education.length > 0) {
    text += "EDUCATION\n";
    resume.education.forEach((edu) => {
      text += `${edu.degree} from ${edu.institution}\n`;
      text += `${edu.startDate} - ${edu.current ? "Present" : edu.endDate}\n\n`;
    });
  }

  // Skills
  if (resume.skills && resume.skills.length > 0) {
    text += "SKILLS\n";
    resume.skills.forEach((skillGroup) => {
      text += `${skillGroup.category}: ${skillGroup.skills.join(", ")}\n`;
    });
    text += "\n";
  }

  return text;
}

function generateSuggestions(resume) {
  const suggestions = [];

  if (!resume.summary || resume.summary.length < 50) {
    suggestions.push("Add a compelling professional summary");
  }

  if (!resume.experience || resume.experience.length === 0) {
    suggestions.push("Add work experience or internships");
  }

  if (!resume.skills || resume.skills.length === 0) {
    suggestions.push("Add relevant skills and technologies");
  }

  if (!resume.projects || resume.projects.length === 0) {
    suggestions.push("Add personal or academic projects");
  }

  return suggestions;
}

function generatePDFContent(doc, resume, template) {
  // Set up document
  doc.fontSize(12);
  doc.lineGap(2);

  // Header
  if (resume.personalInfo) {
    doc.fontSize(24).font("Helvetica-Bold");
    doc.text(
      `${resume.personalInfo.firstName} ${resume.personalInfo.lastName}`,
      { align: "center" }
    );

    doc.fontSize(12).font("Helvetica");
    doc.text(resume.personalInfo.email, { align: "center" });
    doc.text(resume.personalInfo.phone, { align: "center" });
    doc.text(resume.personalInfo.location, { align: "center" });
    doc.moveDown();
  }

  // Summary
  if (resume.summary) {
    doc.fontSize(16).font("Helvetica-Bold");
    doc.text("PROFESSIONAL SUMMARY");
    doc.fontSize(12).font("Helvetica");
    doc.text(resume.summary);
    doc.moveDown();
  }

  // Experience
  if (resume.experience && resume.experience.length > 0) {
    doc.fontSize(16).font("Helvetica-Bold");
    doc.text("PROFESSIONAL EXPERIENCE");
    doc.fontSize(12).font("Helvetica");

    resume.experience.forEach((exp) => {
      doc.font("Helvetica-Bold");
      doc.text(`${exp.title} - ${exp.company}`);
      doc.font("Helvetica");
      doc.text(`${exp.startDate} - ${exp.current ? "Present" : exp.endDate}`);
      doc.text(exp.description);
      if (exp.achievements) {
        exp.achievements.forEach((achievement) => {
          doc.text(`• ${achievement}`);
        });
      }
      doc.moveDown();
    });
  }

  // Education
  if (resume.education && resume.education.length > 0) {
    doc.fontSize(16).font("Helvetica-Bold");
    doc.text("EDUCATION");
    doc.fontSize(12).font("Helvetica");

    resume.education.forEach((edu) => {
      doc.font("Helvetica-Bold");
      doc.text(`${edu.degree} - ${edu.institution}`);
      doc.font("Helvetica");
      doc.text(`${edu.startDate} - ${edu.current ? "Present" : edu.endDate}`);
      doc.moveDown();
    });
  }

  // Skills
  if (resume.skills && resume.skills.length > 0) {
    doc.fontSize(16).font("Helvetica-Bold");
    doc.text("SKILLS");
    doc.fontSize(12).font("Helvetica");

    resume.skills.forEach((skillGroup) => {
      doc.font("Helvetica-Bold");
      doc.text(`${skillGroup.category}:`);
      doc.font("Helvetica");
      doc.text(skillGroup.skills.join(", "));
      doc.moveDown();
    });
  }
}
