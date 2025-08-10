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
      default: "entry",
    },
    resumeContent: {
      type: String,
    },
    preferredIndustry: {
      type: String,
    },
    salaryExpectations: {
      type: String,
    },
         workStyle: {
       type: String,
       default: "flexible",
     },
    locationPreferences: {
      type: String,
    },
    timeline: {
      type: String,
    },
    roadmap: {
      shortTermGoals: [
        {
          goal: String,
          timeline: String,
          completed: { type: Boolean, default: false },
          completedDate: Date,
          priority: {
            type: String,
            default: "medium",
          },
          estimatedEffort: String,
        },
      ],
      mediumTermGoals: [
        {
          goal: String,
          timeline: String,
          completed: { type: Boolean, default: false },
          completedDate: Date,
          priority: {
            type: String,
            default: "medium",
          },
          estimatedEffort: String,
        },
      ],
      longTermGoals: [
        {
          goal: String,
          timeline: String,
          completed: { type: Boolean, default: false },
          completedDate: Date,
          priority: {
            type: String,
            default: "medium",
          },
          estimatedEffort: String,
        },
      ],
      courses: [
        {
          name: String,
          provider: String,
          url: String,
          completed: { type: Boolean, default: false },
          completedDate: Date,
          duration: String,
          cost: String,
          skillsCovered: [String],
        },
      ],
      skillsToDevelop: [
        {
          skill: String,
          priority: {
            type: String,
            default: "medium",
          },
          completed: { type: Boolean, default: false },
          completedDate: Date,
          currentLevel: {
            type: String,
            default: "beginner",
          },
          targetLevel: {
            type: String,
            default: "intermediate",
          },
          resources: [String],
        },
      ],
      networkingOpportunities: [
        {
          opportunity: String,
          type: {
            type: String,
            default: "event",
          },
          completed: { type: Boolean, default: false },
          completedDate: Date,
          frequency: String,
          estimatedCost: String,
        },
      ],
      targetJobTitles: [
        {
          title: String,
          priority: {
            type: String,
            default: "medium",
          },
          salaryRange: String,
          requiredSkills: [String],
          companies: [String],
        },
      ],
      industryInsights: {
        trends: [String],
        growthAreas: [String],
        challenges: [String],
      },
      personalizedAdvice: String,
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
