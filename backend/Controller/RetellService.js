// Retell client for making calls to existing agents
import RetellClient from "retell-sdk";
import axios from "axios";

// Initialize Retell client function
const getRetellClient = () => {
  if (!process.env.RETELL_API_KEY) {
    console.warn(
      "RETELL_API_KEY not found in environment variables. Voice calls will not work."
    );
    return null;
  }

  try {
    console.log("Initializing Retell client with API key...");
    const client = new RetellClient({
      apiKey: process.env.RETELL_API_KEY,
    });
    console.log("Retell client initialized successfully");
    return client;
  } catch (error) {
    console.error("Failed to initialize Retell client:", error.message);
    return null;
  }
};

// Store active voice calls
const activeCalls = new Map();

// Create a voice agent for mock interviews
export const createVoiceAgent = async (req, res) => {
  try {
    const { role, difficulty, questionCount } = req.body;
    const userId = req.user?.payload?.id || req.user?.id || "anonymous";

    if (!role) {
      return res.status(400).json({ error: "Role is required" });
    }

    // Store interview configuration for the user
    activeCalls.set(userId, {
      role,
      difficulty,
      questionCount,
      startTime: new Date(),
      questions: [],
      answers: [],
      currentQuestionIndex: 0,
      status: "ready",
    });

    res.json({
      success: true,
      agentId: "agent_184c9ac8f97c6ea900460895cb", // Your agent ID
      message: "Interview configuration saved successfully.",
      webhookUrl: `${process.env.BACKEND_URL}/api/retell/webhook`,
      instructions: [
        "1. Your agent ID: agent_184c9ac8f97c6ea900460895cb",
        "2. Set webhook URL in Retell dashboard to: " +
          `${process.env.BACKEND_URL}/api/retell/webhook`,
        "3. Use the Test Call feature in Retell dashboard",
        "4. Monitor webhook events in your backend console",
      ],
    });
  } catch (error) {
    console.error("Error creating voice agent:", error);
    res.status(500).json({
      error: "Failed to create voice agent",
      details: error.message,
    });
  }
};

// Handle LLM streaming for voice agent (simplified - not needed with built-in models)
export const handleLLMStream = async (req, res) => {
  try {
    // This endpoint is not needed when using Retell's built-in AI models
    // The LLM processing is handled directly by Retell
    res.json({
      message: "LLM streaming not needed with built-in models",
      status: "success",
    });
  } catch (error) {
    console.error("Error in LLM stream:", error);
    res.status(500).json({
      error: "LLM streaming not configured",
      details: error.message,
    });
  }
};

// Handle webhook events from Retell
export const handleWebhook = async (req, res) => {
  try {
    const { event_type, data } = req.body;
    const userId = req.user?.payload?.id || req.user?.id || "anonymous";

    console.log("Webhook received:", event_type, data);

    switch (event_type) {
      case "call_started":
        console.log("Call started for user:", userId);
        break;

      case "call_ended":
        console.log("Call ended for user:", userId);
        // Generate final interview feedback
        const activeCall = activeCalls.get(userId);
        if (activeCall) {
          const feedback = await generateInterviewFeedback(activeCall);
          // Store feedback or send to frontend
          activeCall.feedback = feedback;
          activeCalls.set(userId, activeCall);
        }
        break;

      case "conversation_intelligence":
        console.log("Conversation intelligence data:", data);
        break;

      default:
        console.log("Unknown event type:", event_type);
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Error handling webhook:", error);
    res.status(500).json({ error: "Webhook processing failed" });
  }
};

// Generate interview questions using existing AI service
const generateInterviewQuestions = async (role, difficulty, count) => {
  try {
    const { generateAIResponse } = await import("./AIChatController.js");

    const prompt = `Generate ${count} interview questions for a ${role} position at ${difficulty} difficulty level. 
    Return only the questions as a JSON array of strings.`;

    const response = await generateAIResponse(prompt, "system");

    // Try to parse JSON response
    try {
      const questions = JSON.parse(response);
      return Array.isArray(questions) ? questions : [];
    } catch {
      // Fallback to basic questions
      return [
        "Tell me about your experience with this role.",
        "What are your strengths and weaknesses?",
        "Where do you see yourself in 5 years?",
        "Why should we hire you?",
        "Describe a challenging project you worked on.",
      ].slice(0, count);
    }
  } catch (error) {
    console.error("Error generating questions:", error);
    return [];
  }
};

// Generate interview feedback
const generateInterviewFeedback = async (activeCall) => {
  try {
    const { generateAIResponse } = await import("./AIChatController.js");

    const prompt = `Based on the interview for ${activeCall.role} position, provide comprehensive feedback in JSON format:
    {
      "score": 85,
      "strengths": ["strength1", "strength2"],
      "areasForImprovement": ["area1", "area2"],
      "suggestions": ["suggestion1", "suggestion2"],
      "overallFeedback": "comprehensive feedback"
    }`;

    const response = await generateAIResponse(prompt, "system");

    try {
      return JSON.parse(response);
    } catch {
      return {
        score: 80,
        strengths: ["Good communication", "Relevant experience"],
        areasForImprovement: ["Could provide more specific examples"],
        suggestions: ["Practice STAR method responses"],
        overallFeedback:
          "Good interview performance with room for improvement.",
      };
    }
  } catch (error) {
    console.error("Error generating feedback:", error);
    return null;
  }
};

// Get active call status
export const getCallStatus = async (req, res) => {
  try {
    const userId = req.user?.payload?.id || req.user?.id || "anonymous";
    const activeCall = activeCalls.get(userId);

    if (!activeCall) {
      return res.status(404).json({ error: "No active call found" });
    }

    res.json({
      success: true,
      call: activeCall,
    });
  } catch (error) {
    console.error("Error getting call status:", error);
    res.status(500).json({
      error: "Failed to get call status",
      details: error.message,
    });
  }
};

// Start a call with existing Retell agent
export const startCall = async (req, res) => {
  try {
    console.log("=== BACKEND: startCall function called ===");
    console.log("Request body:", req.body);
    console.log(
      "User ID:",
      req.user?.payload?.id || req.user?.id || "anonymous"
    );

    const { role, difficulty, questionCount, agentId } = req.body;
    const userId = req.user?.payload?.id || req.user?.id || "anonymous";

    console.log("Extracted data:", {
      role,
      difficulty,
      questionCount,
      agentId,
      userId,
    });

    if (!agentId) {
      console.log("ERROR: Agent ID is missing");
      return res.status(400).json({ error: "Agent ID is required" });
    }

    console.log("Agent ID validation passed:", agentId);

    // Initialize Retell client
    console.log("Initializing Retell client...");
    const retellClient = getRetellClient();
    console.log("Retell client result:", retellClient ? "SUCCESS" : "FAILED");
    console.log("Retell client object:", retellClient);
    console.log(
      "Retell client methods:",
      Object.getOwnPropertyNames(retellClient || {})
    );
    console.log(
      "Retell client prototype methods:",
      Object.getOwnPropertyNames(Object.getPrototypeOf(retellClient || {}))
    );

    if (!retellClient) {
      console.log("ERROR: Retell client initialization failed");
      return res.status(500).json({
        error:
          "Retell client not initialized. Please check RETELL_API_KEY configuration.",
        details: "Voice calls are not available at the moment.",
      });
    }

    console.log("Retell client initialized successfully");

    // Store interview configuration for the user
    console.log("Storing interview configuration for user:", userId);
    activeCalls.set(userId, {
      role,
      difficulty,
      questionCount,
      agentId,
      startTime: new Date(),
      status: "connecting",
    });

    console.log("Interview configuration stored successfully");

    // Create a web call using Retell API
    console.log("Creating web call with agent ID:", agentId);

    try {
      // Try using the Retell SDK's built-in method for creating web calls
      console.log("Creating real web call with Retell SDK...");

      let webCallData;

      try {
        // Try to use the SDK's web call creation method
        if (retellClient.call && retellClient.call.createWebCall) {
          console.log("Using SDK call.createWebCall method");
          webCallData = await retellClient.call.createWebCall({
            agent_id: agentId, // Use snake_case as required by the API
            metadata: {
              role: role,
              difficulty: difficulty,
              questionCount: questionCount,
              userId: userId,
            },
            // Add custom parameters to pass to the agent
            custom_parameters: {
              interview_role: role,
              interview_difficulty: difficulty,
              interview_question_count: questionCount,
              instructions: `You are conducting a ${difficulty} level interview for a ${role} position. Ask exactly ${questionCount} specific technical questions related to ${role}. Focus on ${
                difficulty === "easy"
                  ? "basic concepts and fundamentals"
                  : difficulty === "medium"
                  ? "practical experience and problem-solving"
                  : "advanced topics and complex scenarios"
              }.`,
            },
          });
        } else {
          throw new Error("SDK web call method not available");
        }
      } catch (sdkError) {
        console.log("SDK method failed, trying REST API:", sdkError.message);

        // Fallback to REST API
        const response = await axios.post(
          "https://api.retellai.com/web-call",
          {
            agent_id: agentId, // Use snake_case as required by the API
            metadata: {
              role: role,
              difficulty: difficulty,
              questionCount: questionCount,
              userId: userId,
            },
            // Add custom parameters to pass to the agent
            custom_parameters: {
              interview_role: role,
              interview_difficulty: difficulty,
              interview_question_count: questionCount,
              instructions: `You are conducting a ${difficulty} level interview for a ${role} position. Ask exactly ${questionCount} specific technical questions related to ${role}. Focus on ${
                difficulty === "easy"
                  ? "basic concepts and fundamentals"
                  : difficulty === "medium"
                  ? "practical experience and problem-solving"
                  : "advanced topics and complex scenarios"
              }.`,
            },
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.RETELL_API_KEY}`,
            },
          }
        );

        console.log("REST API response status:", response.status);
        console.log("REST API response data:", response.data);

        if (response.status !== 200 && response.status !== 201) {
          throw new Error(
            `Retell API error: ${response.status} ${response.statusText}`
          );
        }

        webCallData = response.data;
      }

      console.log("Web call created successfully:", webCallData);

      // Update call status with the actual call ID
      const activeCall = activeCalls.get(userId);
      activeCall.callId = webCallData.call_id; // Use call_id from response
      activeCall.status = "active";
      activeCalls.set(userId, activeCall);

      console.log("Call status updated:", activeCall);

      const responseData = {
        success: true,
        agentId: agentId,
        callId: webCallData.call_id, // Use call_id from response
        accessToken: webCallData.access_token, // Use access_token from response
        message: "Voice interview ready. Click 'Join Voice Call' to start.",
      };

      console.log("Sending response to frontend:", {
        ...responseData,
        accessToken: responseData.accessToken ? "PRESENT" : "MISSING",
      });

      res.json(responseData);
      console.log("=== BACKEND: startCall function completed successfully ===");
    } catch (webCallError) {
      console.error("Error creating web call:", webCallError);
      console.error("Error details:", webCallError.response?.data);

      // If the API call fails, provide a helpful error message
      res.status(500).json({
        error: "Failed to create voice call",
        details: webCallError.response?.data?.message || webCallError.message,
        suggestion: "Please check your Retell agent configuration and API key.",
      });
    }
  } catch (error) {
    console.error("=== BACKEND: startCall function ERROR ===");
    console.error("Error details:", error);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      error: "Failed to start call",
      details: error.message,
    });
  }
};

// End active call
export const endCall = async (req, res) => {
  try {
    const userId = req.user?.payload?.id || req.user?.id || "anonymous";
    const activeCall = activeCalls.get(userId);

    if (!activeCall) {
      return res.status(404).json({ error: "No active call found" });
    }

    // End the call via Retell API
    if (activeCall.callId) {
      const retellClient = getRetellClient();
      if (retellClient) {
        await retellClient.call.endCall(activeCall.callId);
      }
    }

    // Remove from active calls
    activeCalls.delete(userId);

    res.json({
      success: true,
      message: "Call ended successfully",
    });
  } catch (error) {
    console.error("Error ending call:", error);
    res.status(500).json({
      error: "Failed to end call",
      details: error.message,
    });
  }
};
