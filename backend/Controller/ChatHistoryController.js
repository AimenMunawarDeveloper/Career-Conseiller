import ChatHistory from "../Model/ChatHistoryModel.js";

// Get all chat sessions for a user
export const getUserChatSessions = async (req, res) => {
  try {
    const userId = req.user?.payload?.id || req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const sessions = await ChatHistory.getUserSessions(userId);
    
    // Format sessions for frontend
    const formattedSessions = sessions.map(session => ({
      sessionId: session.sessionId,
      title: session.title,
      lastActivity: session.lastActivity,
      messageCount: session.messages.length,
      preview: session.messages.length > 0 
        ? session.messages[session.messages.length - 1].content.substring(0, 100) + "..."
        : "No messages yet"
    }));

    res.json({
      success: true,
      sessions: formattedSessions
    });
  } catch (error) {
    console.error("Error fetching chat sessions:", error);
    res.status(500).json({
      error: "Failed to fetch chat sessions",
      details: error.message
    });
  }
};

// Get a specific chat session with all messages
export const getChatSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user?.payload?.id || req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const session = await ChatHistory.getSession(sessionId, userId);
    
    if (!session) {
      return res.status(404).json({ error: "Chat session not found" });
    }

    res.json({
      success: true,
      session: {
        sessionId: session.sessionId,
        title: session.title,
        messages: session.messages,
        lastActivity: session.lastActivity
      }
    });
  } catch (error) {
    console.error("Error fetching chat session:", error);
    res.status(500).json({
      error: "Failed to fetch chat session",
      details: error.message
    });
  }
};

// Create a new chat session
export const createChatSession = async (req, res) => {
  try {
    const userId = req.user?.payload?.id || req.user?.id;
    const { title = "New Chat" } = req.body;
    
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const session = await ChatHistory.createSession(userId, title);
    
    res.status(201).json({
      success: true,
      session: {
        sessionId: session.sessionId,
        title: session.title,
        messages: session.messages,
        lastActivity: session.lastActivity
      }
    });
  } catch (error) {
    console.error("Error creating chat session:", error);
    res.status(500).json({
      error: "Failed to create chat session",
      details: error.message
    });
  }
};

// Delete a chat session
export const deleteChatSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user?.payload?.id || req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const deletedSession = await ChatHistory.deleteSession(sessionId, userId);
    
    if (!deletedSession) {
      return res.status(404).json({ error: "Chat session not found" });
    }

    res.json({
      success: true,
      message: "Chat session deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting chat session:", error);
    res.status(500).json({
      error: "Failed to delete chat session",
      details: error.message
    });
  }
};

// Update chat session title
export const updateChatTitle = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { title } = req.body;
    const userId = req.user?.payload?.id || req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    if (!title || title.trim().length === 0) {
      return res.status(400).json({ error: "Title is required" });
    }

    const updatedSession = await ChatHistory.updateTitle(sessionId, userId, title.trim());
    
    if (!updatedSession) {
      return res.status(404).json({ error: "Chat session not found" });
    }

    res.json({
      success: true,
      session: {
        sessionId: updatedSession.sessionId,
        title: updatedSession.title,
        lastActivity: updatedSession.lastActivity
      }
    });
  } catch (error) {
    console.error("Error updating chat title:", error);
    res.status(500).json({
      error: "Failed to update chat title",
      details: error.message
    });
  }
};

// Add a message to a chat session
export const addMessageToSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { role, content } = req.body;
    const userId = req.user?.payload?.id || req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    if (!role || !content) {
      return res.status(400).json({ error: "Role and content are required" });
    }

    if (!["user", "assistant"].includes(role)) {
      return res.status(400).json({ error: "Invalid role. Must be 'user' or 'assistant'" });
    }

    const session = await ChatHistory.getSession(sessionId, userId);
    
    if (!session) {
      return res.status(404).json({ error: "Chat session not found" });
    }

    await session.addMessage(role, content);
    
    res.json({
      success: true,
      message: "Message added successfully"
    });
  } catch (error) {
    console.error("Error adding message to session:", error);
    res.status(500).json({
      error: "Failed to add message to session",
      details: error.message
    });
  }
};

// Clear all messages from a chat session
export const clearChatSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user?.payload?.id || req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const session = await ChatHistory.getSession(sessionId, userId);
    
    if (!session) {
      return res.status(404).json({ error: "Chat session not found" });
    }

    session.messages = [];
    session.lastActivity = new Date();
    await session.save();
    
    res.json({
      success: true,
      message: "Chat session cleared successfully"
    });
  } catch (error) {
    console.error("Error clearing chat session:", error);
    res.status(500).json({
      error: "Failed to clear chat session",
      details: error.message
    });
  }
};
