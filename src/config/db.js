import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const databaseUrl = process.env.DATABASE_URL || process.env.MONGO_URI;

    if (!databaseUrl) {
      throw new Error("Database connection string is not configured");
    }

    const conn = await mongoose.connect(databaseUrl);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  }
};

export default connectDB;
export default connectDB;
