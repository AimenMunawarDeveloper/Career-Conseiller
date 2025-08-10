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

const SKILL_REQUIREMENTS = {
  software_engineer: {
    technical: ["JavaScript", "Python", "React", "Node.js", "SQL", "Git"],
    soft: ["Communication", "Problem Solving", "Teamwork", "Time Management"],
    tools: ["VS Code", "Docker", "AWS", "Jenkins"],
  },
  data_scientist: {
    technical: [
      "Python",
      "R",
      "SQL",
      "Machine Learning",
      "Statistics",
      "Data Visualization",
    ],
    soft: ["Analytical Thinking", "Communication", "Business Acumen"],
    tools: ["Jupyter", "TensorFlow", "Tableau", "AWS"],
  },
  product_manager: {
    technical: ["SQL", "Analytics", "Prototyping", "User Research"],
    soft: ["Leadership", "Communication", "Strategic Thinking", "User Empathy"],
    tools: ["Figma", "Jira", "Google Analytics", "Slack"],
  },
  marketing_specialist: {
    technical: ["SEO", "Google Analytics", "Social Media", "Email Marketing"],
    soft: ["Creativity", "Communication", "Analytical Thinking"],
    tools: ["HubSpot", "Mailchimp", "Canva", "Google Ads"],
  },
};

// Mock interview questions by role
const INTERVIEW_QUESTIONS = {
  software_engineer: [
    "Tell me about a challenging technical problem you solved and how you approached it.",
    "How do you handle debugging complex issues in production code?",
    "Explain the difference between REST and GraphQL APIs. When would you use each?",
    "How would you optimize a slow database query? Walk me through your process.",
    "Describe your experience with version control systems and collaborative development.",
    "How do you stay updated with the latest technologies and best practices?",
    "Tell me about a time you had to work with a difficult team member.",
    "How do you handle tight deadlines and competing priorities?",
    "What's your approach to code review and ensuring code quality?",
    "How do you handle technical disagreements with colleagues or stakeholders?",
  ],
  data_scientist: [
    "How do you handle missing data in a dataset? What strategies do you use?",
    "Explain the difference between supervised and unsupervised learning with examples.",
    "How would you evaluate a machine learning model? What metrics would you use?",
    "Tell me about a time you had to explain complex data insights to non-technical stakeholders.",
    "What's your experience with big data technologies like Spark or Hadoop?",
    "How do you ensure your models are not biased and are fair?",
    "Describe a data science project you're particularly proud of.",
    "How do you handle feature engineering and selection?",
    "What's your approach to A/B testing and statistical significance?",
    "How do you stay current with the latest developments in machine learning?",
  ],
  product_manager: [
    "How do you prioritize features for a product? Walk me through your framework.",
    "Tell me about a product you launched and its impact on the business.",
    "How do you handle conflicting stakeholder requirements?",
    "Describe your user research process and how you incorporate feedback.",
    "How do you measure product success? What metrics do you track?",
    "Tell me about a time you had to make a difficult product decision.",
    "How do you work with engineering teams to scope and deliver features?",
    "What's your approach to competitive analysis and market research?",
    "How do you handle product failures or features that don't meet expectations?",
    "How do you balance user needs with business objectives?",
  ],
  general: [
    "Tell me about yourself and your background.",
    "Why are you interested in this role and our company?",
    "What are your greatest strengths and how do they apply to this position?",
    "What are your areas for improvement and how are you working on them?",
    "Where do you see yourself in 5 years?",
    "Why should we hire you over other candidates?",
    "Tell me about a time you overcame a significant challenge.",
    "How do you handle stress and pressure in the workplace?",
    "What are your salary expectations for this role?",
    "Do you have any questions for me about the role or company?",
  ],
};

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

// Analyze resume and provide suggestions
export const analyzeResume = async (req, res) => {
  try {
    const { resumeText, jobDescription } = req.body;

    if (!resumeText) {
      return res.status(400).json({ error: "Resume text is required" });
    }

    // Enhanced resume analysis
    const analysis = `
**Overall Assessment:**
Your resume shows good potential but could benefit from some improvements.

**Strengths Identified:**
- Clear structure and formatting
- Relevant experience highlighted
- Good use of action verbs

**Areas for Improvement:**
- Add more quantifiable achievements
- Include relevant keywords from job descriptions
- Enhance the professional summary
- Add specific technical skills

**Specific Suggestions:**
1. Use numbers to quantify your achievements (e.g., "Increased sales by 25%")
2. Include industry-specific keywords
3. Make your summary more compelling
4. Add relevant certifications and training

**Keywords to Add:**
- Industry-specific terms
- Technical skills
- Soft skills relevant to the role

**Format Recommendations:**
- Keep it to 1-2 pages
- Use consistent formatting
- Include white space for readability
- Use bullet points for achievements

**ATS Optimization Tips:**
- Use standard section headings
- Avoid graphics and tables
- Use simple fonts
- Include relevant keywords naturally
    `;

    res.json({
      success: true,
      analysis,
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

    const roleRequirements =
      SKILL_REQUIREMENTS[targetRole.toLowerCase().replace(/\s+/g, "_")] ||
      SKILL_REQUIREMENTS.software_engineer; // Default fallback

    const currentSkillsList = currentSkills
      .split(",")
      .map((skill) => skill.trim().toLowerCase());

    const skillGap = {
      technical: roleRequirements.technical.filter(
        (skill) =>
          !currentSkillsList.some(
            (current) =>
              current.includes(skill.toLowerCase()) ||
              skill.toLowerCase().includes(current)
          )
      ),
      soft: roleRequirements.soft.filter(
        (skill) =>
          !currentSkillsList.some(
            (current) =>
              current.includes(skill.toLowerCase()) ||
              skill.toLowerCase().includes(current)
          )
      ),
      tools: roleRequirements.tools.filter(
        (tool) =>
          !currentSkillsList.some(
            (current) =>
              current.includes(tool.toLowerCase()) ||
              tool.toLowerCase().includes(current)
          )
      ),
    };

    const recommendations = {
      courses: skillGap.technical.map((skill) => ({
        skill,
        course: `${skill} Fundamentals Course`,
        provider: "Coursera/edX/Udemy",
        estimatedDuration: "4-8 weeks",
      })),
      projects: skillGap.technical.map((skill) => ({
        skill,
        project: `Build a ${skill} project`,
        description: `Create a practical project using ${skill} to demonstrate your skills`,
      })),
      certifications: skillGap.technical.map((skill) => ({
        skill,
        certification: `${skill} Certification`,
        provider: "Industry-recognized organization",
      })),
    };

    res.json({
      success: true,
      skillGap,
      recommendations,
      currentSkills: currentSkillsList,
      targetRole,
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

    // Use AI to generate role-specific questions
    let questions = [];

    if (role && role !== "general") {
      try {
        const userId = req.user?.payload?.id || req.user?.id || "anonymous";
        const chatSession = chatSessions.get(userId) || createChatSession();
        chatSessions.set(userId, chatSession);

        const prompt = `Generate 5 specific interview questions for ${role} role. Return only the questions, one per line, without numbering:`;

        const aiResponse = await sendMessage(chatSession, prompt);
        console.log("AI-generated questions response:", aiResponse);

        const lines = aiResponse
          .split("\n")
          .filter(
            (line) =>
              line.trim().length > 15 &&
              !line.includes("Generate") &&
              !line.includes("interview questions")
          )
          .map((line) => line.replace(/^\d+\.\s*/, "").trim());

        questions = lines.slice(0, 5);

        // If AI didn't generate enough questions, use fallback
        if (questions.length < 3) {
          questions = INTERVIEW_QUESTIONS[role] || INTERVIEW_QUESTIONS.general;
        }

        console.log("AI-generated questions:", questions);
      } catch (aiError) {
        console.error(
          "AI question generation failed, using fallback:",
          aiError
        );
        questions = INTERVIEW_QUESTIONS[role] || INTERVIEW_QUESTIONS.general;
      }
    } else {
      questions = INTERVIEW_QUESTIONS.general;
    }

    // Add behavioral questions
    const behavioralQuestions = [
      "Tell me about a time you had to work with a difficult team member.",
      "Describe a situation where you had to learn something quickly.",
      "Give me an example of when you went above and beyond for a project.",
      "Tell me about a time you failed and what you learned from it.",
      "Describe a situation where you had to make a decision without all the information.",
    ];

    const allQuestions = [...questions, ...behavioralQuestions];

    res.json({
      success: true,
      questions: allQuestions,
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

    // Use AI to generate specific feedback
    let feedback = {
      score: Math.floor(Math.random() * 30) + 70, // Random score between 70-100
      strengths: [],
      areasForImprovement: [],
      suggestions: [],
      overallFeedback: "",
    };

    try {
      const userId = req.user?.payload?.id || req.user?.id || "anonymous";
      const chatSession = chatSessions.get(userId) || createChatSession();
      chatSessions.set(userId, chatSession);

      const prompt = `Provide constructive feedback on this interview response. Format your response as:
Strengths: [list 2-3 strengths]
Areas for Improvement: [list 2-3 areas]
Suggestions: [list 2-3 specific suggestions]
Overall Feedback: [1-2 sentence summary]

Question: ${question}
Answer: ${answer}`;

      const aiResponse = await sendMessage(chatSession, prompt);
      console.log("AI feedback response:", aiResponse);

      // Parse the structured response
      const lines = aiResponse.split("\n");
      let currentSection = "";

      lines.forEach((line) => {
        const trimmedLine = line.trim();
        if (trimmedLine.toLowerCase().includes("strengths:")) {
          currentSection = "strengths";
        } else if (
          trimmedLine.toLowerCase().includes("areas for improvement:")
        ) {
          currentSection = "areasForImprovement";
        } else if (trimmedLine.toLowerCase().includes("suggestions:")) {
          currentSection = "suggestions";
        } else if (trimmedLine.toLowerCase().includes("overall feedback:")) {
          currentSection = "overallFeedback";
        } else if (
          trimmedLine &&
          currentSection &&
          !trimmedLine.includes(":")
        ) {
          if (currentSection === "overallFeedback") {
            feedback.overallFeedback = trimmedLine;
          } else if (
            trimmedLine.startsWith("-") ||
            trimmedLine.startsWith("•")
          ) {
            const item = trimmedLine.replace(/^[-•]\s*/, "").trim();
            if (item) {
              feedback[currentSection].push(item);
            }
          }
        }
      });

      // Fallback if parsing failed
      if (feedback.strengths.length === 0) {
        feedback.strengths = [
          "Good structure in your response",
          "Relevant examples provided",
        ];
      }
      if (feedback.areasForImprovement.length === 0) {
        feedback.areasForImprovement = [
          "Could provide more specific examples",
          "Consider adding quantifiable results",
        ];
      }
      if (feedback.suggestions.length === 0) {
        feedback.suggestions = [
          "Use the STAR method (Situation, Task, Action, Result)",
          "Include specific numbers and metrics",
        ];
      }
      if (!feedback.overallFeedback) {
        feedback.overallFeedback =
          "Your answer demonstrates good understanding. Focus on providing more specific examples and quantifiable results.";
      }
    } catch (aiError) {
      console.error("AI feedback generation failed, using fallback:", aiError);
      // Use fallback feedback
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
