import CareerRoadmap from "../Model/CareerRoadmapModel.js";
import { generateCareerRoadmap } from "./AIChatController.js";

export const createCareerRoadmap = async (req, res) => {
  try {
    const {
      currentEducation,
      currentSkills,
      interests,
      targetRole,
      experienceLevel,
    } = req.body;

    const userId = req.user.id; // Assuming auth middleware sets this

    // Check if user already has a roadmap
    const existingRoadmap = await CareerRoadmap.findOne({ userId });
    if (existingRoadmap) {
      return res.status(400).json({
        error:
          "User already has a career roadmap. Use update endpoint to modify.",
      });
    }

    // Generate AI-powered roadmap
    const aiResponse = await generateCareerRoadmap(req, res);

    // Parse the AI response to extract structured data
    const roadmapData = parseRoadmapResponse(aiResponse.roadmap);

    const roadmap = new CareerRoadmap({
      userId,
      currentEducation,
      currentSkills,
      interests,
      targetRole,
      experienceLevel,
      roadmap: roadmapData,
    });

    await roadmap.save();
    roadmap.calculateProgress();

    res.status(201).json({
      success: true,
      roadmap,
      message: "Career roadmap created successfully",
    });
  } catch (error) {
    console.error("Create Roadmap Error:", error);
    res.status(500).json({
      error: "Failed to create career roadmap",
      details: error.message,
    });
  }
};

export const getCareerRoadmap = async (req, res) => {
  try {
    const userId = req.user.id;

    const roadmap = await CareerRoadmap.findOne({ userId });

    if (!roadmap) {
      return res.status(404).json({
        error: "No career roadmap found for this user",
      });
    }

    roadmap.calculateProgress();

    res.json({
      success: true,
      roadmap,
    });
  } catch (error) {
    console.error("Get Roadmap Error:", error);
    res.status(500).json({
      error: "Failed to retrieve career roadmap",
      details: error.message,
    });
  }
};

export const updateCareerRoadmap = async (req, res) => {
  try {
    const userId = req.user.id;
    const updateData = req.body;

    const roadmap = await CareerRoadmap.findOne({ userId });

    if (!roadmap) {
      return res.status(404).json({
        error: "No career roadmap found for this user",
      });
    }

    // Update basic info if provided
    if (updateData.currentEducation)
      roadmap.currentEducation = updateData.currentEducation;
    if (updateData.currentSkills)
      roadmap.currentSkills = updateData.currentSkills;
    if (updateData.interests) roadmap.interests = updateData.interests;
    if (updateData.targetRole) roadmap.targetRole = updateData.targetRole;
    if (updateData.experienceLevel)
      roadmap.experienceLevel = updateData.experienceLevel;

    // Update specific roadmap items
    if (updateData.roadmap) {
      if (updateData.roadmap.shortTermGoals) {
        roadmap.roadmap.shortTermGoals = updateData.roadmap.shortTermGoals;
      }
      if (updateData.roadmap.mediumTermGoals) {
        roadmap.roadmap.mediumTermGoals = updateData.roadmap.mediumTermGoals;
      }
      if (updateData.roadmap.longTermGoals) {
        roadmap.roadmap.longTermGoals = updateData.roadmap.longTermGoals;
      }
      if (updateData.roadmap.courses) {
        roadmap.roadmap.courses = updateData.roadmap.courses;
      }
      if (updateData.roadmap.skillsToDevelop) {
        roadmap.roadmap.skillsToDevelop = updateData.roadmap.skillsToDevelop;
      }
      if (updateData.roadmap.networkingOpportunities) {
        roadmap.roadmap.networkingOpportunities =
          updateData.roadmap.networkingOpportunities;
      }
      if (updateData.roadmap.targetJobTitles) {
        roadmap.roadmap.targetJobTitles = updateData.roadmap.targetJobTitles;
      }
    }

    roadmap.lastUpdated = new Date();
    await roadmap.save();
    roadmap.calculateProgress();

    res.json({
      success: true,
      roadmap,
      message: "Career roadmap updated successfully",
    });
  } catch (error) {
    console.error("Update Roadmap Error:", error);
    res.status(500).json({
      error: "Failed to update career roadmap",
      details: error.message,
    });
  }
};

export const markGoalComplete = async (req, res) => {
  try {
    const userId = req.user.id;
    const { goalType, goalIndex, completed } = req.body;

    const roadmap = await CareerRoadmap.findOne({ userId });

    if (!roadmap) {
      return res.status(404).json({
        error: "No career roadmap found for this user",
      });
    }

    const goalTypes = [
      "shortTermGoals",
      "mediumTermGoals",
      "longTermGoals",
      "courses",
      "skillsToDevelop",
      "networkingOpportunities",
    ];

    if (!goalTypes.includes(goalType)) {
      return res.status(400).json({
        error: "Invalid goal type",
      });
    }

    if (roadmap.roadmap[goalType] && roadmap.roadmap[goalType][goalIndex]) {
      roadmap.roadmap[goalType][goalIndex].completed = completed;
      if (completed) {
        roadmap.roadmap[goalType][goalIndex].completedDate = new Date();
      } else {
        roadmap.roadmap[goalType][goalIndex].completedDate = null;
      }
    } else {
      return res.status(404).json({
        error: "Goal not found",
      });
    }

    await roadmap.save();
    roadmap.calculateProgress();

    res.json({
      success: true,
      roadmap,
      message: `Goal ${
        completed ? "marked as complete" : "marked as incomplete"
      }`,
    });
  } catch (error) {
    console.error("Mark Goal Complete Error:", error);
    res.status(500).json({
      error: "Failed to update goal status",
      details: error.message,
    });
  }
};

export const regenerateRoadmap = async (req, res) => {
  try {
    const userId = req.user.id;

    const roadmap = await CareerRoadmap.findOne({ userId });

    if (!roadmap) {
      return res.status(404).json({
        error: "No career roadmap found for this user",
      });
    }

    // Generate new AI-powered roadmap
    const aiResponse = await generateCareerRoadmap(req, res);
    const newRoadmapData = parseRoadmapResponse(aiResponse.roadmap);

    // Update roadmap with new AI-generated content
    roadmap.roadmap = newRoadmapData;
    roadmap.lastUpdated = new Date();

    await roadmap.save();
    roadmap.calculateProgress();

    res.json({
      success: true,
      roadmap,
      message: "Career roadmap regenerated successfully",
    });
  } catch (error) {
    console.error("Regenerate Roadmap Error:", error);
    res.status(500).json({
      error: "Failed to regenerate career roadmap",
      details: error.message,
    });
  }
};

// Helper function to parse AI response into structured data
function parseRoadmapResponse(aiResponse) {
  // This is a simplified parser - in production, you'd want more robust parsing
  const roadmap = {
    shortTermGoals: [],
    mediumTermGoals: [],
    longTermGoals: [],
    courses: [],
    skillsToDevelop: [],
    networkingOpportunities: [],
    targetJobTitles: [],
  };

  // Extract goals from AI response
  const lines = aiResponse.split("\n");
  let currentSection = "";

  lines.forEach((line) => {
    const trimmedLine = line.trim();

    if (trimmedLine.toLowerCase().includes("short-term")) {
      currentSection = "shortTermGoals";
    } else if (trimmedLine.toLowerCase().includes("medium-term")) {
      currentSection = "mediumTermGoals";
    } else if (trimmedLine.toLowerCase().includes("long-term")) {
      currentSection = "longTermGoals";
    } else if (
      trimmedLine.toLowerCase().includes("course") ||
      trimmedLine.toLowerCase().includes("certification")
    ) {
      currentSection = "courses";
    } else if (trimmedLine.toLowerCase().includes("skill")) {
      currentSection = "skillsToDevelop";
    } else if (trimmedLine.toLowerCase().includes("network")) {
      currentSection = "networkingOpportunities";
    } else if (trimmedLine.toLowerCase().includes("job title")) {
      currentSection = "targetJobTitles";
    } else if (
      trimmedLine.startsWith("-") ||
      trimmedLine.startsWith("•") ||
      trimmedLine.match(/^\d+\./)
    ) {
      const goal = trimmedLine.replace(/^[-•\d\.\s]+/, "").trim();
      if (goal && currentSection && roadmap[currentSection]) {
        if (currentSection === "targetJobTitles") {
          roadmap[currentSection].push({ title: goal, priority: "medium" });
        } else if (currentSection === "skillsToDevelop") {
          roadmap[currentSection].push({
            skill: goal,
            priority: "medium",
            completed: false,
          });
        } else if (currentSection === "courses") {
          roadmap[currentSection].push({
            name: goal,
            provider: "",
            url: "",
            completed: false,
          });
        } else if (currentSection === "networkingOpportunities") {
          roadmap[currentSection].push({
            opportunity: goal,
            type: "event",
            completed: false,
          });
        } else {
          roadmap[currentSection].push({
            goal,
            timeline: "",
            completed: false,
          });
        }
      }
    }
  });

  return roadmap;
}
