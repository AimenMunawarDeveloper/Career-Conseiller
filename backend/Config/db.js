import mongoose from "mongoose";

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error("MONGO_URI environment variable is not set");
      throw new Error("Database connection string not provided");
    }

    mongoose.connection.on("connected", () => {
      console.log("MongoDB connected successfully");
    });

    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("MongoDB disconnected");
    });

    await mongoose.connect(process.env.MONGO_URI);
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error.message);
    throw error;
  }
};

export default connectDB;
