import mongoose from "mongoose";

const careerRoadmapSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    currentEducation: {
      type: String,
      required: true,
    },
    currentSkills: [
      {
        type: String,
      },
    ],
    interests: [
      {
        type: String,
      },
    ],
    targetRole: {
      type: String,
      default: "To be determined",
    },
    experienceLevel: {
      type: String,
      enum: ["entry", "mid", "senior", "expert"],
      default: "entry",
    },
    roadmap: {
      shortTermGoals: [
        {
          goal: String,
          timeline: String,
          completed: { type: Boolean, default: false },
          completedDate: Date,
        },
      ],
      mediumTermGoals: [
        {
          goal: String,
          timeline: String,
          completed: { type: Boolean, default: false },
          completedDate: Date,
        },
      ],
      longTermGoals: [
        {
          goal: String,
          timeline: String,
          completed: { type: Boolean, default: false },
          completedDate: Date,
        },
      ],
      courses: [
        {
          name: String,
          provider: String,
          url: String,
          completed: { type: Boolean, default: false },
          completedDate: Date,
        },
      ],
      skillsToDevelop: [
        {
          skill: String,
          priority: {
            type: String,
            enum: ["low", "medium", "high"],
            default: "medium",
          },
          completed: { type: Boolean, default: false },
          completedDate: Date,
        },
      ],
      networkingOpportunities: [
        {
          opportunity: String,
          type: { type: String, enum: ["event", "platform", "organization"] },
          completed: { type: Boolean, default: false },
          completedDate: Date,
        },
      ],
      targetJobTitles: [
        {
          title: String,
          priority: {
            type: String,
            enum: ["low", "medium", "high"],
            default: "medium",
          },
        },
      ],
    },
    progress: {
      shortTermProgress: { type: Number, default: 0 },
      mediumTermProgress: { type: Number, default: 0 },
      longTermProgress: { type: Number, default: 0 },
      overallProgress: { type: Number, default: 0 },
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

// Calculate progress percentages
careerRoadmapSchema.methods.calculateProgress = function () {
  const shortTermTotal = this.roadmap.shortTermGoals.length;
  const mediumTermTotal = this.roadmap.mediumTermGoals.length;
  const longTermTotal = this.roadmap.longTermGoals.length;

  const shortTermCompleted = this.roadmap.shortTermGoals.filter(
    (goal) => goal.completed
  ).length;
  const mediumTermCompleted = this.roadmap.mediumTermGoals.filter(
    (goal) => goal.completed
  ).length;
  const longTermCompleted = this.roadmap.longTermGoals.filter(
    (goal) => goal.completed
  ).length;

  this.progress.shortTermProgress =
    shortTermTotal > 0 ? (shortTermCompleted / shortTermTotal) * 100 : 0;
  this.progress.mediumTermProgress =
    mediumTermTotal > 0 ? (mediumTermCompleted / mediumTermTotal) * 100 : 0;
  this.progress.longTermProgress =
    longTermTotal > 0 ? (longTermCompleted / longTermTotal) * 100 : 0;

  const totalGoals = shortTermTotal + mediumTermTotal + longTermTotal;
  const totalCompleted =
    shortTermCompleted + mediumTermCompleted + longTermCompleted;
  this.progress.overallProgress =
    totalGoals > 0 ? (totalCompleted / totalGoals) * 100 : 0;

  return this.progress;
};

export default mongoose.model("CareerRoadmap", careerRoadmapSchema);
