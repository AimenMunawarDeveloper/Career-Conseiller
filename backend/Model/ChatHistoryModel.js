import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ["user", "assistant"],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const chatHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sessionId: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      default: "New Chat",
    },
    messages: [messageSchema],
    lastActivity: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying (removed duplicate)
chatHistorySchema.index({ userId: 1, lastActivity: -1 });

// Method to add a message to the chat
chatHistorySchema.methods.addMessage = function (role, content) {
  this.messages.push({
    role,
    content,
    timestamp: new Date(),
  });
  this.lastActivity = new Date();
  return this.save();
};

// Method to get recent messages for context
chatHistorySchema.methods.getRecentMessages = function (limit = 10) {
  return this.messages.slice(-limit);
};

// Static method to create a new chat session
chatHistorySchema.statics.createSession = function (
  userId,
  title = "New Chat"
) {
  const sessionId = `chat_${Date.now()}_${Math.random()
    .toString(36)
    .substr(2, 9)}`;
  return this.create({
    userId,
    sessionId,
    title,
    messages: [],
  });
};

// Static method to get user's chat sessions
chatHistorySchema.statics.getUserSessions = function (userId, limit = 20) {
  return this.find({ userId, isActive: true })
    .sort({ lastActivity: -1 })
    .limit(limit)
    .select("sessionId title lastActivity messages")
    .lean();
};

// Static method to get a specific chat session
chatHistorySchema.statics.getSession = function (sessionId, userId) {
  return this.findOne({ sessionId, userId, isActive: true });
};

// Static method to delete a chat session
chatHistorySchema.statics.deleteSession = function (sessionId, userId) {
  return this.findOneAndUpdate(
    { sessionId, userId },
    { isActive: false },
    { new: true }
  );
};

// Static method to update chat title
chatHistorySchema.statics.updateTitle = function (sessionId, userId, title) {
  return this.findOneAndUpdate({ sessionId, userId }, { title }, { new: true });
};

const ChatHistory = mongoose.model("ChatHistory", chatHistorySchema);

export default ChatHistory;
