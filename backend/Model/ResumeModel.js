import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      default: "My Resume",
    },
    personalInfo: {
      firstName: String,
      lastName: String,
      email: String,
      phone: String,
      location: String,
      linkedin: String,
      github: String,
      portfolio: String,
    },
    summary: {
      type: String,
      maxlength: 500,
    },
    experience: [
      {
        title: String,
        company: String,
        location: String,
        startDate: Date,
        endDate: Date,
        current: { type: Boolean, default: false },
        description: String,
        achievements: [String],
        skills: [String],
      },
    ],
    education: [
      {
        degree: String,
        institution: String,
        location: String,
        startDate: Date,
        endDate: Date,
        current: { type: Boolean, default: false },
        gpa: String,
        relevantCourses: [String],
      },
    ],
    skills: [
      {
        category: String,
        skills: [String],
      },
    ],
    certifications: [
      {
        name: String,
        issuer: String,
        date: Date,
        expiryDate: Date,
        credentialId: String,
        url: String,
      },
    ],
    projects: [
      {
        title: String,
        description: String,
        technologies: [String],
        url: String,
        githubUrl: String,
        image: String,
      },
    ],
    languages: [
      {
        language: String,
        proficiency: {
          type: String,
          enum: ["basic", "conversational", "fluent", "native"],
        },
      },
    ],
    volunteerWork: [
      {
        role: String,
        organization: String,
        startDate: Date,
        endDate: Date,
        current: { type: Boolean, default: false },
        description: String,
      },
    ],
    awards: [
      {
        title: String,
        issuer: String,
        date: Date,
        description: String,
      },
    ],
    template: {
      type: String,
      enum: ["modern", "classic", "creative", "minimal"],
      default: "modern",
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    shareLink: {
      type: String,
      unique: true,
      sparse: true,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Generate share link
resumeSchema.methods.generateShareLink = function () {
  const uuid = require("uuid").v4();
  this.shareLink = `resume-${uuid}`;
  return this.shareLink;
};

// Calculate resume score based on completeness
resumeSchema.methods.calculateScore = function () {
  let score = 0;
  let total = 0;

  // Personal info (20 points)
  total += 20;
  if (
    this.personalInfo.firstName &&
    this.personalInfo.lastName &&
    this.personalInfo.email
  ) {
    score += 20;
  }

  // Summary (10 points)
  total += 10;
  if (this.summary && this.summary.length > 50) {
    score += 10;
  }

  // Experience (30 points)
  total += 30;
  if (this.experience && this.experience.length > 0) {
    score += Math.min(30, this.experience.length * 10);
  }

  // Education (15 points)
  total += 15;
  if (this.education && this.education.length > 0) {
    score += Math.min(15, this.education.length * 15);
  }

  // Skills (15 points)
  total += 15;
  if (this.skills && this.skills.length > 0) {
    score += Math.min(15, this.skills.length * 5);
  }

  // Projects (10 points)
  total += 10;
  if (this.projects && this.projects.length > 0) {
    score += Math.min(10, this.projects.length * 5);
  }

  return Math.round((score / total) * 100);
};

export default mongoose.model("Resume", resumeSchema);
