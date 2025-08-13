// AI Chat Controller with Gemini AI integration
import CareerRoadmap from "../Model/CareerRoadmapModel.js";
import ChatHistory from "../Model/ChatHistoryModel.js";
import { createChatSession, sendMessage } from "./GeminiService.js";

// Chat sessions storage (in production, use Redis or database)
const chatSessions = new Map();

// Initialize the AI model
async function initializeModel() {
  try {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    console.log("Checking GEMINI_API_KEY:", GEMINI_API_KEY ? "SET" : "NOT SET");

    if (!GEMINI_API_KEY) {
      throw new Error(
        "Gemini API key not found. Please set GEMINI_API_KEY in your .env file"
      );
    }
    console.log("Gemini API configured successfully");
    return true;
  } catch (error) {
    console.error("Error initializing Gemini API:", error);
    throw error;
  }
}

// Generate AI response using Gemini API
const generateAIResponse = async (
  message,
  userId,
  sessionId = null,
  fileContext = null
) => {
  try {
    await initializeModel();

    // Get or create chat session for user
    let chatSession = chatSessions.get(userId);
    if (!chatSession) {
      chatSession = createChatSession();
      chatSessions.set(userId, chatSession);
    }

    console.log("Generating response for:", message);

    // Prepare the message with file context if available
    let fullMessage = message;
    if (fileContext && fileContext.extractedText) {
      fullMessage = `User uploaded a file (${fileContext.fileName}) with the following content:\n\n${fileContext.extractedText}\n\nUser's question: ${message}`;
    }

    // Send message to Gemini
    const response = await sendMessage(chatSession, fullMessage);
    console.log("Gemini response:", response);

    // Save messages to database if sessionId is provided
    if (sessionId) {
      try {
        const dbSession = await ChatHistory.getSession(sessionId, userId);
        if (dbSession) {
          await dbSession.addMessage("user", message);
          await dbSession.addMessage("assistant", response);
        }
      } catch (error) {
        console.error("Error saving messages to database:", error);
      }
    }

    return response;
  } catch (error) {
    console.error("AI Response Generation Error:", error);
    return `I understand you're asking about "${message}". As your AI career counselor, I can help with career planning, skill development, resume writing, interview preparation, and networking. What specific aspect would you like to discuss?`;
  }
};

// Note: Hardcoded skill requirements and interview questions have been removed
// All skill gap analysis and mock interview questions are now generated using Gemini AI

export const chatWithAI = async (req, res) => {
  try {
    const {
      message,
      context = {},
      sessionId = null,
      fileData = null,
    } = req.body;
    const userId = req.user?.payload?.id || req.user?.id || "anonymous";

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // If no sessionId provided, create a new session
    let currentSessionId = sessionId;
    if (!currentSessionId) {
      try {
        const newSession = await ChatHistory.createSession(userId, "New Chat");
        currentSessionId = newSession.sessionId;

        // Update the session title based on the first message
        const title =
          message.length > 30 ? message.substring(0, 30) + "..." : message;
        await ChatHistory.updateTitle(currentSessionId, userId, title);
      } catch (error) {
        console.error("Error creating new chat session:", error);
      }
    }

    // Prepare file context if file data is provided
    let fileContext = null;
    if (fileData && fileData.extractedText) {
      fileContext = {
        fileName: fileData.originalName,
        extractedText: fileData.extractedText,
        textLength: fileData.textLength,
      };
    }

    // Generate AI response using Gemini
    const response = await generateAIResponse(
      message,
      userId,
      currentSessionId,
      fileContext
    );

    res.json({
      success: true,
      response,
      sessionId: currentSessionId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("AI Chat Error:", error);
    res.status(500).json({
      error: "Failed to process chat request",
      details: error.message,
    });
  }
};

// Generate personalized career roadmap
// Internal function to generate roadmap data (for use by other controllers)
export const generateRoadmapData = async (userData, userId) => {
  try {
    const {
      currentEducation,
      currentSkills,
      interests,
      targetRole,
      experienceLevel = "entry",
      resumeContent,
      preferredIndustry,
      salaryExpectations,
      workStyle,
      locationPreferences,
      timeline,
    } = userData;

    if (!currentEducation || !currentSkills || !interests) {
      throw new Error("Education, skills, and interests are required");
    }

    // Create a comprehensive prompt for Gemini AI
    let prompt = `As an expert career counselor, create a detailed and personalized career roadmap for a professional with the following profile:

Current Education: ${currentEducation}
Current Skills: ${currentSkills}
Career Interests: ${interests}
Target Role: ${targetRole || "Not specified"}
Experience Level: ${experienceLevel}
${resumeContent ? `Resume Content: ${resumeContent}` : ""}
${preferredIndustry ? `Preferred Industry: ${preferredIndustry}` : ""}
${salaryExpectations ? `Salary Expectations: ${salaryExpectations}` : ""}
${workStyle ? `Work Style Preference: ${workStyle}` : ""}
${locationPreferences ? `Location Preferences: ${locationPreferences}` : ""}
${timeline ? `Preferred Timeline: ${timeline}` : ""}

Please provide a comprehensive career roadmap in the following JSON format:

{
  "shortTermGoals": [
    {
      "goal": "specific actionable goal",
      "timeline": "3-6 months",
      "completed": false,
      "priority": "high/medium/low",
      "estimatedEffort": "hours per week"
    }
  ],
  "mediumTermGoals": [
    {
      "goal": "specific actionable goal", 
      "timeline": "6-12 months",
      "completed": false,
      "priority": "high/medium/low",
      "estimatedEffort": "hours per week"
    }
  ],
  "longTermGoals": [
    {
      "goal": "specific actionable goal",
      "timeline": "1-3 years", 
      "completed": false,
      "priority": "high/medium/low",
      "estimatedEffort": "hours per week"
    }
  ],
  "courses": [
    {
      "name": "course name",
      "provider": "platform/organization",
      "url": "course URL if available",
      "completed": false,
      "duration": "estimated duration",
      "cost": "estimated cost",
      "skillsCovered": ["skill1", "skill2"]
    }
  ],
  "skillsToDevelop": [
    {
      "skill": "skill name",
      "priority": "high/medium/low",
      "completed": false,
      "currentLevel": "beginner/intermediate/advanced",
      "targetLevel": "intermediate/advanced/expert",
      "resources": ["resource1", "resource2"]
    }
  ],
  "networkingOpportunities": [
    {
      "opportunity": "specific opportunity",
      "type": "event/organization/platform/conference",
      "completed": false,
      "frequency": "weekly/monthly/quarterly",
      "estimatedCost": "cost if any"
    }
  ],
  "targetJobTitles": [
    {
      "title": "job title",
      "priority": "high/medium/low",
      "salaryRange": "estimated salary range",
      "requiredSkills": ["skill1", "skill2"],
      "companies": ["company1", "company2"]
    }
  ],
  "industryInsights": {
    "trends": ["trend1", "trend2"],
    "growthAreas": ["area1", "area2"],
    "challenges": ["challenge1", "challenge2"]
  },
  "personalizedAdvice": "specific advice based on the profile"
}

IMPORTANT: For networkingOpportunities.type, only use these exact values: "event", "organization", "platform", or "conference". Do not use any other values like "community" or "event/community".

Make sure the roadmap is:
1. Highly personalized based on the provided information
2. Actionable with specific, measurable goals
3. Realistic given the current skills and experience level
4. Includes industry-relevant recommendations
5. Provides clear timelines and priorities
6. Considers the resume content if provided
7. Aligns with salary expectations and work preferences if specified

Return only the JSON response without any additional text.`;

    // Use Gemini AI to generate the roadmap
    console.log("Sending prompt to Gemini AI for userId:", userId);
    const aiResponse = await generateAIResponse(prompt, userId);
    console.log(
      "AI Response received, length:",
      aiResponse ? aiResponse.length : 0
    );

    // Try to parse the JSON response
    let roadmap;
    try {
      console.log("Attempting to parse AI response as JSON...");
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        console.log("Found JSON match, parsing...");
        roadmap = JSON.parse(jsonMatch[0]);
      } else {
        console.log("No JSON match found, trying to parse entire response...");
        roadmap = JSON.parse(aiResponse);
      }
      console.log("JSON parsing successful");
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", parseError);
      console.log("Using fallback roadmap template");
      // Fallback to a structured template if parsing fails
      roadmap = {
        shortTermGoals: [
          {
            goal: "Complete relevant online courses in your field",
            timeline: "3-6 months",
            completed: false,
            priority: "high",
            estimatedEffort: "5-10 hours per week",
          },
          {
            goal: "Build a portfolio project showcasing your skills",
            timeline: "3-6 months",
            completed: false,
            priority: "high",
            estimatedEffort: "8-12 hours per week",
          },
          {
            goal: "Network with professionals in your target industry",
            timeline: "3-6 months",
            completed: false,
            priority: "medium",
            estimatedEffort: "2-4 hours per week",
          },
        ],
        mediumTermGoals: [
          {
            goal: "Gain practical experience through internships or freelance work",
            timeline: "6-12 months",
            completed: false,
            priority: "high",
            estimatedEffort: "15-20 hours per week",
          },
          {
            goal: "Obtain relevant certifications for your target role",
            timeline: "6-12 months",
            completed: false,
            priority: "medium",
            estimatedEffort: "5-8 hours per week",
          },
        ],
        longTermGoals: [
          {
            goal: "Secure your target role in the industry",
            timeline: "1-2 years",
            completed: false,
            priority: "high",
            estimatedEffort: "varies",
          },
        ],
        courses: [
          {
            name: "Industry-specific certification course",
            provider: "Professional Organization",
            url: "",
            completed: false,
            duration: "3-6 months",
            cost: "$500-2000",
            skillsCovered: ["core skills", "industry knowledge"],
          },
        ],
        skillsToDevelop: [
          {
            skill: "Technical skills relevant to your field",
            priority: "high",
            completed: false,
            currentLevel: "beginner",
            targetLevel: "intermediate",
            resources: ["Online courses", "Practice projects"],
          },
        ],
        networkingOpportunities: [
          {
            opportunity: "Join professional associations",
            type: "organization",
            completed: false,
            frequency: "monthly",
            estimatedCost: "$50-200/year",
          },
        ],
        targetJobTitles: [
          {
            title: targetRole || "Your Target Role",
            priority: "high",
            salaryRange: "Industry standard",
            requiredSkills: ["Core skills", "Industry knowledge"],
            companies: ["Top companies in the field"],
          },
        ],
        industryInsights: {
          trends: ["Digital transformation", "Remote work"],
          growthAreas: ["Technology", "Healthcare"],
          challenges: ["Competition", "Skill requirements"],
        },
        personalizedAdvice:
          "Focus on building practical experience and networking in your target industry.",
      };
    }

    console.log("Roadmap generation completed successfully");
    return roadmap;
  } catch (error) {
    console.error("Roadmap Generation Error:", error);
    throw error;
  }
};

// API endpoint for generating career roadmap
export const generateCareerRoadmap = async (req, res) => {
  try {
    const roadmap = await generateRoadmapData(req.body);

    res.json({
      success: true,
      roadmap,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Roadmap Generation Error:", error);
    res.status(500).json({
      error: "Failed to generate career roadmap",
      details: error.message,
    });
  }
};

// API endpoint for analyzing resume and auto-filling form fields
export const analyzeResumeForAutoFill = async (req, res) => {
  try {
    const { resumeText } = req.body;

    if (!resumeText) {
      return res.status(400).json({
        error: "Resume text is required",
      });
    }

    const prompt = `Analyze the following resume text and extract key information to auto-fill a career roadmap form. Return the data in JSON format with the following fields:

Resume Text:
${resumeText}

Please extract and return a JSON object with these fields:
{
  "currentEducation": "extracted education level and field",
  "currentSkills": "comma-separated list of technical and soft skills",
  "targetRole": "most suitable target role based on experience",
  "experienceLevel": "entry/mid/senior/expert based on years of experience",
  "preferredIndustry": "industry that best matches the background",
  "interests": "career interests and goals inferred from the resume"
}

Focus on:
1. Education: Look for degrees, certifications, institutions
2. Skills: Extract technical skills, programming languages, tools, frameworks
3. Experience: Determine appropriate experience level based on work history
4. Target Role: Suggest the most suitable next role based on current experience
5. Industry: Identify the primary industry or suggest relevant industries
6. Interests: Infer career goals and interests from the resume content

Return only the JSON object without any additional text.`;

    const userId = req.user?.id || "temp";
    const aiResponse = await generateAIResponse(prompt, userId);

    // Try to parse the JSON response
    let autoFilledData;
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        autoFilledData = JSON.parse(jsonMatch[0]);
      } else {
        autoFilledData = JSON.parse(aiResponse);
      }
    } catch (parseError) {
      console.error(
        "Failed to parse AI response for resume analysis:",
        parseError
      );
      // Fallback to basic extraction
      autoFilledData = extractBasicInfoFromResume(resumeText);
    }

    res.json({
      success: true,
      autoFilledData,
      message: "Resume analyzed successfully",
    });
  } catch (error) {
    console.error("Resume Analysis Error:", error);
    res.status(500).json({
      error: "Failed to analyze resume",
      details: error.message,
    });
  }
};

// Fallback function for basic resume parsing
function extractBasicInfoFromResume(resumeText) {
  const autoFilledData = {};

  // Extract education
  const educationPatterns = [
    /(?:Bachelor|Master|PhD|B\.?S\.?|M\.?S\.?|B\.?A\.?|M\.?A\.?)[\s\w]*?(?:in|of|,)\s*([\w\s]+)/gi,
    /(?:University|College|Institute)[\s\w]*?(?:of|at|,)\s*([\w\s]+)/gi,
  ];

  for (const pattern of educationPatterns) {
    const match = resumeText.match(pattern);
    if (match) {
      autoFilledData.currentEducation = match[0].trim();
      break;
    }
  }

  // Extract skills
  const skillsPatterns = [
    /(?:Skills|Technologies|Programming Languages|Tools):\s*([^.\n]+)/gi,
    /(?:JavaScript|Python|Java|React|Node\.js|SQL|AWS|Docker|Git|HTML|CSS|TypeScript|Angular|Vue|MongoDB|PostgreSQL|MySQL|Redis|Kubernetes|Docker|Jenkins|Jira|Agile|Scrum)/gi,
  ];

  const skills = [];
  for (const pattern of skillsPatterns) {
    const matches = resumeText.match(pattern);
    if (matches) {
      skills.push(...matches.map((skill) => skill.replace(/[:\s]+$/, "")));
    }
  }

  if (skills.length > 0) {
    autoFilledData.currentSkills = [...new Set(skills)].join(", ");
  }

  // Extract job titles/roles
  const rolePatterns = [
    /(?:Software Engineer|Developer|Programmer|Data Scientist|Product Manager|Designer|Analyst|Architect|Lead|Senior|Junior|Full Stack|Frontend|Backend|DevOps|QA|Test)/gi,
  ];

  const roles = [];
  for (const pattern of rolePatterns) {
    const matches = resumeText.match(pattern);
    if (matches) {
      roles.push(...matches);
    }
  }

  if (roles.length > 0) {
    autoFilledData.targetRole = roles[0];
  }

  // Extract experience level based on years of experience
  const experiencePattern = /(\d+)\s*(?:years?|yrs?)\s*(?:of\s*)?experience/gi;
  const experienceMatch = resumeText.match(experiencePattern);
  if (experienceMatch) {
    const years = parseInt(experienceMatch[0].match(/\d+/)[0]);
    if (years < 2) autoFilledData.experienceLevel = "entry";
    else if (years < 5) autoFilledData.experienceLevel = "mid";
    else if (years < 10) autoFilledData.experienceLevel = "senior";
    else autoFilledData.experienceLevel = "expert";
  }

  return autoFilledData;
}

// Analyze resume and provide suggestions using Gemini AI
export const analyzeResume = async (req, res) => {
  try {
    const { resumeText, jobDescription } = req.body;

    if (!resumeText) {
      return res.status(400).json({ error: "Resume text is required" });
    }

    const userId = req.user?.payload?.id || req.user?.id || "anonymous";

    // Create a comprehensive prompt for Gemini AI
    const prompt = `As an expert resume writer and career counselor, provide a detailed analysis of this resume. 

Resume Text:
${resumeText}

${
  jobDescription
    ? `Job Description (for targeted analysis):
${jobDescription}`
    : ""
}

Please provide a comprehensive resume analysis in the following JSON format:

{
  "resumeScore": 85,
  "strengths": [
    "specific strength 1",
    "specific strength 2",
    "specific strength 3"
  ],
  "areasForImprovement": [
    "specific area for improvement 1",
    "specific area for improvement 2",
    "specific area for improvement 3"
  ],
  "suggestions": [
    "specific actionable suggestion 1",
    "specific actionable suggestion 2",
    "specific actionable suggestion 3"
  ],
  "keywords": [
    "relevant keyword 1",
    "relevant keyword 2",
    "relevant keyword 3"
  ],
  "overallFeedback": "comprehensive 2-3 sentence feedback summary"
}

IMPORTANT GUIDELINES:
1. Score should be between 0-100 based on resume quality
2. Provide specific, actionable feedback
3. Consider the job description if provided for targeted recommendations
4. Focus on both content and formatting
5. Include relevant industry keywords
6. Provide constructive criticism with specific examples
7. Consider ATS (Applicant Tracking System) optimization
8. Assess clarity, impact, and relevance
9. Include suggestions for quantifiable achievements
10. Consider the overall marketability of the resume

Return only the JSON response without any additional text.`;

    // Use Gemini AI to generate the analysis
    console.log(
      "Sending resume analysis prompt to Gemini AI for userId:",
      userId
    );
    const aiResponse = await generateAIResponse(prompt, userId);
    console.log(
      "AI Response received for resume analysis, length:",
      aiResponse ? aiResponse.length : 0
    );

    // Try to parse the JSON response
    let analysis;
    try {
      console.log("Attempting to parse AI response as JSON...");
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        console.log("Found JSON match, parsing...");
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        console.log("No JSON match found, trying to parse entire response...");
        analysis = JSON.parse(aiResponse);
      }
      console.log("JSON parsing successful for resume analysis");
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", parseError);
      console.log("Using fallback resume analysis template");

      // Fallback to a structured template if parsing fails
      analysis = {
        resumeScore: 85,
        strengths: [
          "Clear structure and formatting",
          "Relevant experience highlighted",
          "Good use of action verbs",
        ],
        areasForImprovement: [
          "Add more quantifiable achievements",
          "Include relevant keywords from job descriptions",
          "Enhance the professional summary",
        ],
        suggestions: [
          "Use numbers to quantify your achievements (e.g., 'Increased sales by 25%')",
          "Include industry-specific keywords naturally in your content",
          "Make your summary more compelling and specific to your target role",
          "Add relevant certifications and training programs",
        ],
        keywords: [
          "leadership",
          "project management",
          "problem solving",
          "communication",
          "teamwork",
        ],
        overallFeedback:
          "Your resume shows good potential but could benefit from more specific achievements and targeted keywords. Focus on quantifying your accomplishments and aligning your content with your target roles.",
      };
    }

    res.json({
      success: true,
      ...analysis,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Resume Analysis Error:", error);
    res.status(500).json({
      error: "Failed to analyze resume",
      details: error.message,
    });
  }
};

// NEW FEATURE: Skill Gap Analysis
export const analyzeSkillGap = async (req, res) => {
  try {
    const { currentSkills, targetRole } = req.body;

    if (!currentSkills || !targetRole) {
      return res
        .status(400)
        .json({ error: "Current skills and target role are required" });
    }

    const userId = req.user?.payload?.id || req.user?.id || "anonymous";

    // Create a comprehensive prompt for Gemini AI
    const prompt = `As an expert career counselor and skills analyst, perform a detailed skill gap analysis for a professional with the following profile:

Current Skills: ${currentSkills}
Target Role: ${targetRole}

Please provide a comprehensive skill gap analysis in the following JSON format:

{
  "skillGap": {
    "technical": [
      "specific technical skill needed",
      "another technical skill"
    ],
    "soft": [
      "specific soft skill needed",
      "another soft skill"
    ],
    "tools": [
      "specific tool or platform needed",
      "another tool"
    ]
  },
  "recommendations": {
    "courses": [
      {
        "skill": "skill name",
        "course": "specific course name",
        "provider": "platform or organization",
        "estimatedDuration": "duration estimate",
        "cost": "estimated cost if known"
      }
    ],
    "projects": [
      {
        "skill": "skill name",
        "project": "specific project idea",
        "description": "detailed project description",
        "difficulty": "beginner/intermediate/advanced"
      }
    ],
    "certifications": [
      {
        "skill": "skill name",
        "certification": "specific certification name",
        "provider": "certifying organization",
        "validity": "certification validity period"
      }
    ]
  },
  "currentSkills": [
    "parsed current skill 1",
    "parsed current skill 2"
  ],
  "targetRole": "${targetRole}",
  "analysis": {
    "overallGap": "high/medium/low",
    "prioritySkills": ["most important skill 1", "most important skill 2"],
    "timeline": "estimated time to acquire missing skills",
    "marketDemand": "high/medium/low for this role"
  }
}

IMPORTANT GUIDELINES:
1. Analyze the current skills against industry standards for the target role
2. Identify both technical and soft skills gaps
3. Consider tools and platforms commonly used in the target role
4. Provide specific, actionable recommendations
5. Include real course names and certification programs when possible
6. Consider the current market demand for the target role
7. Provide realistic timelines for skill acquisition
8. Focus on skills that are most critical for success in the target role

Return only the JSON response without any additional text.`;

    // Use Gemini AI to generate the analysis
    console.log(
      "Sending skill gap analysis prompt to Gemini AI for userId:",
      userId
    );
    const aiResponse = await generateAIResponse(prompt, userId);
    console.log(
      "AI Response received for skill gap analysis, length:",
      aiResponse ? aiResponse.length : 0
    );

    // Try to parse the JSON response
    let analysis;
    try {
      console.log("Attempting to parse AI response as JSON...");
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        console.log("Found JSON match, parsing...");
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        console.log("No JSON match found, trying to parse entire response...");
        analysis = JSON.parse(aiResponse);
      }
      console.log("JSON parsing successful for skill gap analysis");
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", parseError);
      console.log("Using fallback skill gap analysis template");

      // Fallback to a structured template if parsing fails
      const currentSkillsList = currentSkills
        .split(",")
        .map((skill) => skill.trim().toLowerCase());

      analysis = {
        skillGap: {
          technical: ["JavaScript", "React", "Node.js"],
          soft: ["Leadership", "Strategic Thinking"],
          tools: ["Docker", "AWS", "Git"],
        },
        recommendations: {
          courses: [
            {
              skill: "JavaScript",
              course: "JavaScript Fundamentals Course",
              provider: "Coursera/edX/Udemy",
              estimatedDuration: "4-8 weeks",
              cost: "$50-200",
            },
          ],
          projects: [
            {
              skill: "React",
              project: "Build a React Portfolio",
              description: "Create a personal portfolio website using React",
              difficulty: "intermediate",
            },
          ],
          certifications: [
            {
              skill: "AWS",
              certification: "AWS Certified Developer",
              provider: "Amazon Web Services",
              validity: "3 years",
            },
          ],
        },
        currentSkills: currentSkillsList,
        targetRole: targetRole,
        analysis: {
          overallGap: "medium",
          prioritySkills: ["JavaScript", "React"],
          timeline: "6-12 months",
          marketDemand: "high",
        },
      };
    }

    res.json({
      success: true,
      ...analysis,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Skill Gap Analysis Error:", error);
    res.status(500).json({
      error: "Failed to analyze skill gap",
      details: error.message,
    });
  }
};

// NEW FEATURE: Mock Interview Questions
export const getMockInterviewQuestions = async (req, res) => {
  try {
    const { role, difficulty = "medium" } = req.query;
    const userId = req.user?.payload?.id || req.user?.id || "anonymous";

    // Create a comprehensive prompt for Gemini AI
    const prompt = `As an expert interview coach and career counselor, generate a comprehensive set of interview questions for a ${role} role at ${difficulty} difficulty level.

Please provide the questions in the following JSON format:

{
  "technicalQuestions": [
    "specific technical question 1",
    "specific technical question 2",
    "specific technical question 3"
  ],
  "behavioralQuestions": [
    "specific behavioral question 1",
    "specific behavioral question 2",
    "specific behavioral question 3"
  ],
  "situationalQuestions": [
    "specific situational question 1",
    "specific situational question 2"
  ],
  "roleSpecificQuestions": [
    "question specific to ${role} responsibilities",
    "question about ${role} challenges"
  ]
}

IMPORTANT GUIDELINES:
1. For technical questions: Focus on skills and technologies relevant to ${role}
2. For behavioral questions: Use STAR method scenarios (Situation, Task, Action, Result)
3. For situational questions: Create realistic workplace scenarios
4. For role-specific questions: Address challenges and responsibilities specific to ${role}
5. Adjust difficulty based on the specified level (${difficulty})
6. Make questions specific and actionable
7. Include questions that test problem-solving, communication, and technical skills
8. Consider industry best practices and current trends

Return only the JSON response without any additional text.`;

    // Use Gemini AI to generate the questions
    console.log(
      "Sending mock interview questions prompt to Gemini AI for userId:",
      userId
    );
    const aiResponse = await generateAIResponse(prompt, userId);
    console.log(
      "AI Response received for mock interview questions, length:",
      aiResponse ? aiResponse.length : 0
    );

    // Try to parse the JSON response
    let questionsData;
    try {
      console.log("Attempting to parse AI response as JSON...");
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        console.log("Found JSON match, parsing...");
        questionsData = JSON.parse(jsonMatch[0]);
      } else {
        console.log("No JSON match found, trying to parse entire response...");
        questionsData = JSON.parse(aiResponse);
      }
      console.log("JSON parsing successful for mock interview questions");
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", parseError);
      console.log("Using fallback mock interview questions template");

      // Fallback to a structured template if parsing fails
      questionsData = {
        technicalQuestions: [
          "What programming languages are you most proficient in?",
          "How do you approach debugging a complex issue?",
          "Describe your experience with version control systems.",
        ],
        behavioralQuestions: [
          "Tell me about a time you had to work with a difficult team member.",
          "Describe a situation where you had to learn something quickly.",
          "Give me an example of when you went above and beyond for a project.",
        ],
        situationalQuestions: [
          "How would you handle a project that's behind schedule?",
          "What would you do if you disagreed with your manager's decision?",
        ],
        roleSpecificQuestions: [
          "What challenges do you think are unique to this role?",
          "How do you stay updated with industry trends?",
        ],
      };
    }

    // Combine all questions into a single array
    const allQuestions = [
      ...questionsData.technicalQuestions,
      ...questionsData.behavioralQuestions,
      ...questionsData.situationalQuestions,
      ...questionsData.roleSpecificQuestions,
    ];

    res.json({
      success: true,
      questions: allQuestions,
      questionCategories: questionsData,
      role: role || "general",
      difficulty,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Mock Interview Questions Error:", error);
    res.status(500).json({
      error: "Failed to get interview questions",
      details: error.message,
    });
  }
};

// NEW FEATURE: Interview Feedback
export const provideInterviewFeedback = async (req, res) => {
  try {
    const { question, answer, role } = req.body;

    if (!question || !answer) {
      return res
        .status(400)
        .json({ error: "Question and answer are required" });
    }

    const userId = req.user?.payload?.id || req.user?.id || "anonymous";

    // Create a comprehensive prompt for Gemini AI
    const prompt = `As an expert interview coach and career counselor, provide detailed, constructive feedback on this interview response.

Question: ${question}
Answer: ${answer}
${role ? `Role: ${role}` : ""}

Please provide feedback in the following JSON format:

{
  "score": 85,
  "strengths": [
    "specific strength 1",
    "specific strength 2",
    "specific strength 3"
  ],
  "areasForImprovement": [
    "specific area for improvement 1",
    "specific area for improvement 2",
    "specific area for improvement 3"
  ],
  "suggestions": [
    "specific actionable suggestion 1",
    "specific actionable suggestion 2",
    "specific actionable suggestion 3"
  ],
  "overallFeedback": "comprehensive 2-3 sentence feedback summary",
  "starMethodAnalysis": {
    "situation": "how well they described the situation",
    "task": "how well they explained the task",
    "action": "how well they described their actions",
    "result": "how well they explained the results"
  },
  "communicationScore": 85,
  "technicalScore": 80,
  "confidenceScore": 90
}

IMPORTANT GUIDELINES:
1. Score should be between 0-100 based on answer quality
2. Provide specific, actionable feedback
3. Use the STAR method (Situation, Task, Action, Result) framework
4. Consider the role context if provided
5. Focus on both content and delivery
6. Provide constructive criticism with specific examples
7. Include suggestions for improvement
8. Assess communication clarity and confidence
9. Consider technical accuracy if applicable
10. Be encouraging while being honest about areas for improvement

Return only the JSON response without any additional text.`;

    // Use Gemini AI to generate the feedback
    console.log(
      "Sending interview feedback prompt to Gemini AI for userId:",
      userId
    );
    const aiResponse = await generateAIResponse(prompt, userId);
    console.log(
      "AI Response received for interview feedback, length:",
      aiResponse ? aiResponse.length : 0
    );

    // Try to parse the JSON response
    let feedback;
    try {
      console.log("Attempting to parse AI response as JSON...");
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        console.log("Found JSON match, parsing...");
        feedback = JSON.parse(jsonMatch[0]);
      } else {
        console.log("No JSON match found, trying to parse entire response...");
        feedback = JSON.parse(aiResponse);
      }
      console.log("JSON parsing successful for interview feedback");
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", parseError);
      console.log("Using fallback interview feedback template");

      // Fallback to a structured template if parsing fails
      feedback = {
        score: Math.floor(Math.random() * 30) + 70,
        strengths: [
          "Good structure in your response",
          "Relevant examples provided",
          "Clear communication",
        ],
        areasForImprovement: [
          "Could provide more specific examples",
          "Consider adding quantifiable results",
          "Practice more concise responses",
        ],
        suggestions: [
          "Use the STAR method (Situation, Task, Action, Result)",
          "Include specific numbers and metrics",
          "Practice your response timing",
        ],
        overallFeedback:
          "Your answer demonstrates good understanding of the topic. Focus on providing more specific examples and quantifiable results to make your responses even stronger.",
        starMethodAnalysis: {
          situation: "Well described",
          task: "Could be more specific",
          action: "Good detail provided",
          result: "Needs more quantifiable outcomes",
        },
        communicationScore: 85,
        technicalScore: 80,
        confidenceScore: 90,
      };
    }

    res.json({
      success: true,
      feedback,
      question,
      answer,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Interview Feedback Error:", error);
    res.status(500).json({
      error: "Failed to provide interview feedback",
      details: error.message,
    });
  }
};
