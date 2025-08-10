import CareerRoadmap from "../Model/CareerRoadmapModel.js";
import { generateRoadmapData } from "./AIChatController.js";

export const createCareerRoadmap = async (req, res) => {
  try {
    const {
      currentEducation,
      currentSkills,
      interests,
      targetRole,
      experienceLevel,
      resumeContent,
      preferredIndustry,
      salaryExpectations,
      workStyle,
      locationPreferences,
      timeline,
    } = req.body;

    const userId = req.user?.payload?.id; // JWT token structure: { payload: { id, email, username } }

    // Debug logging
    console.log("Request user object:", req.user);
    console.log("Extracted userId:", userId);

    if (!userId) {
      return res.status(401).json({
        error: "User ID not found. Please ensure you are authenticated.",
      });
    }

    // Check if user already has a roadmap
    const existingRoadmap = await CareerRoadmap.findOne({ userId });
    if (existingRoadmap) {
      return res.status(400).json({
        error:
          "User already has a career roadmap. Use update endpoint to modify.",
      });
    }

    // Generate AI-powered roadmap
    console.log("Generating roadmap for user:", userId);
    const roadmapData = await generateRoadmapData(req.body, userId);
    console.log("Roadmap data generated:", roadmapData ? "Success" : "Failed");

    // Ensure roadmap data is properly structured
    if (!roadmapData || typeof roadmapData !== "object") {
      console.error("Invalid roadmap data received:", roadmapData);
      return res.status(500).json({
        error: "Failed to generate roadmap data",
        details: "Invalid roadmap structure received from AI",
      });
    }

    // Clean up any invalid enum values in networkingOpportunities
    if (roadmapData.networkingOpportunities) {
      roadmapData.networkingOpportunities.forEach((opportunity) => {
        if (
          opportunity.type &&
          !["event", "platform", "organization", "conference"].includes(
            opportunity.type
          )
        ) {
          console.log(
            `Fixing invalid networking type: ${opportunity.type} -> event`
          );
          opportunity.type = "event";
        }
      });
    }

    // Clean up experience level to match expected format
    let cleanExperienceLevel = experienceLevel;
    if (experienceLevel) {
      const levelMap = {
        "entry-level": "entry",
        "Entry-level": "entry",
        "Entry Level": "entry",
        "entry level": "entry",
        "mid-level": "mid",
        "Mid-level": "mid",
        "Mid Level": "mid",
        "mid level": "mid",
        "senior-level": "senior",
        "Senior-level": "senior",
        "Senior Level": "senior",
        "senior level": "senior",
        "expert-level": "expert",
        "Expert-level": "expert",
        "Expert Level": "expert",
        "expert level": "expert",
      };
      cleanExperienceLevel = levelMap[experienceLevel] || experienceLevel;
    }

    // Clean up roadmap data enum values
    if (roadmapData.skillsToDevelop) {
      roadmapData.skillsToDevelop.forEach((skill) => {
        if (skill.currentLevel) {
          const level = skill.currentLevel.split(" ")[0].toLowerCase(); // Take first word only
          if (["beginner", "intermediate", "advanced"].includes(level)) {
            skill.currentLevel = level;
          } else {
            skill.currentLevel = "beginner";
          }
        }
        if (skill.targetLevel) {
          const level = skill.targetLevel.split(" ")[0].toLowerCase(); // Take first word only
          if (["intermediate", "advanced", "expert"].includes(level)) {
            skill.targetLevel = level;
          } else {
            skill.targetLevel = "intermediate";
          }
        }
      });
    }

    console.log("Creating roadmap with userId:", userId);
    console.log("Experience level:", cleanExperienceLevel);

    const roadmap = new CareerRoadmap({
      userId,
      currentEducation,
      currentSkills: currentSkills.split(",").map((skill) => skill.trim()),
      interests: interests.split(",").map((interest) => interest.trim()),
      targetRole,
      experienceLevel: cleanExperienceLevel,
      resumeContent,
      preferredIndustry,
      salaryExpectations,
      workStyle,
      locationPreferences,
      timeline,
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
    const userId = req.user.payload.id;

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
    const userId = req.user.payload.id;
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
      roadmap.currentSkills = updateData.currentSkills
        .split(",")
        .map((skill) => skill.trim());
    if (updateData.interests)
      roadmap.interests = updateData.interests
        .split(",")
        .map((interest) => interest.trim());
    if (updateData.targetRole) roadmap.targetRole = updateData.targetRole;
    if (updateData.experienceLevel)
      roadmap.experienceLevel = updateData.experienceLevel;
    if (updateData.resumeContent)
      roadmap.resumeContent = updateData.resumeContent;
    if (updateData.preferredIndustry)
      roadmap.preferredIndustry = updateData.preferredIndustry;
    if (updateData.salaryExpectations)
      roadmap.salaryExpectations = updateData.salaryExpectations;
    if (updateData.workStyle) roadmap.workStyle = updateData.workStyle;
    if (updateData.locationPreferences)
      roadmap.locationPreferences = updateData.locationPreferences;
    if (updateData.timeline) roadmap.timeline = updateData.timeline;

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
    const userId = req.user.payload.id;
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
    const userId = req.user.payload.id;

    const roadmap = await CareerRoadmap.findOne({ userId });

    if (!roadmap) {
      return res.status(404).json({
        error: "No career roadmap found for this user",
      });
    }

    // Generate new AI-powered roadmap
    const newRoadmapData = await generateRoadmapData(req.body, userId);

    // Clean up any invalid enum values in networkingOpportunities
    if (newRoadmapData.networkingOpportunities) {
      newRoadmapData.networkingOpportunities.forEach((opportunity) => {
        if (
          opportunity.type &&
          !["event", "platform", "organization", "conference"].includes(
            opportunity.type
          )
        ) {
          console.log(
            `Fixing invalid networking type: ${opportunity.type} -> event`
          );
          opportunity.type = "event";
        }
      });
    }

    // Clean up roadmap data enum values
    if (newRoadmapData.skillsToDevelop) {
      newRoadmapData.skillsToDevelop.forEach((skill) => {
        if (skill.currentLevel) {
          const level = skill.currentLevel.split(" ")[0].toLowerCase(); // Take first word only
          if (["beginner", "intermediate", "advanced"].includes(level)) {
            skill.currentLevel = level;
          } else {
            skill.currentLevel = "beginner";
          }
        }
        if (skill.targetLevel) {
          const level = skill.targetLevel.split(" ")[0].toLowerCase(); // Take first word only
          if (["intermediate", "advanced", "expert"].includes(level)) {
            skill.targetLevel = level;
          } else {
            skill.targetLevel = "intermediate";
          }
        }
      });
    }

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
  // If aiResponse is already an object (from JSON.parse), return it directly
  if (typeof aiResponse === "object" && aiResponse !== null) {
    return aiResponse;
  }

  // This is a simplified parser - in production, you'd want more robust parsing
  const roadmap = {
    shortTermGoals: [],
    mediumTermGoals: [],
    longTermGoals: [],
    courses: [],
    skillsToDevelop: [],
    networkingOpportunities: [],
    targetJobTitles: [],
    industryInsights: {
      trends: [],
      growthAreas: [],
      challenges: [],
    },
    personalizedAdvice: "",
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
          roadmap[currentSection].push({
            title: goal,
            priority: "medium",
            salaryRange: "",
            requiredSkills: [],
            companies: [],
          });
        } else if (currentSection === "skillsToDevelop") {
          roadmap[currentSection].push({
            skill: goal,
            priority: "medium",
            completed: false,
            currentLevel: "beginner",
            targetLevel: "intermediate",
            resources: [],
          });
        } else if (currentSection === "courses") {
          roadmap[currentSection].push({
            name: goal,
            provider: "",
            url: "",
            completed: false,
            duration: "",
            cost: "",
            skillsCovered: [],
          });
        } else if (currentSection === "networkingOpportunities") {
          roadmap[currentSection].push({
            opportunity: goal,
            type: "event",
            completed: false,
            frequency: "",
            estimatedCost: "",
          });
        } else {
          roadmap[currentSection].push({
            goal,
            timeline: "",
            completed: false,
            priority: "medium",
            estimatedEffort: "",
          });
        }
      }
    }
  });

  return roadmap;
}
