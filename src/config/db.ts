import mongoose from "mongoose";
import env from "./env.ts";

const connectDB = async (): Promise<void> => {
  try {
    const connection = await mongoose.connect(env.MONGO_URI);
    console.log(`MongoDB connected: ${connection.connection.host}`);
  } catch (error) {
    const err = error instanceof Error ? error : new Error("Database related error occurred");
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  }
};

export default connectDB;