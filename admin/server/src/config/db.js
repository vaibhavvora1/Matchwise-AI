import mongoose from "mongoose";

let listenersRegistered = false;

const registerConnectionListeners = () => {
  if (listenersRegistered) return;

  mongoose.connection.on("connected", () => {
    console.log("[Admin DB] MongoDB connected successfully to database:", mongoose.connection.name);
  });

  mongoose.connection.on("error", (error) => {
    console.error("[Admin DB] MongoDB connection error:", error.message);
  });

  mongoose.connection.on("disconnected", () => {
    console.warn("[Admin DB] MongoDB connection lost. Reconnecting...");
  });

  process.on("SIGINT", async () => {
    try {
      await mongoose.connection.close();
      console.log("[Admin DB] MongoDB connection closed on SIGINT.");
      process.exit(0);
    } catch (error) {
      console.error("[Admin DB] Error closing MongoDB connection:", error.message);
      process.exit(1);
    }
  });

  listenersRegistered = true;
};

/**
 * Connect to the single source of truth MatchWise MongoDB database.
 * Supports both MONGODB_URI and MONGO_URI environment variables.
 */
export const connectAdminDB = async () => {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (!mongoUri) {
    console.error(
      "[Admin DB Error]: Neither MONGODB_URI nor MONGO_URI is set in environment variables.",
    );
    throw new Error("MONGODB_URI is required to start the Admin Server.");
  }

  registerConnectionListeners();

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (mongoose.connection.readyState === 2) {
    console.log("[Admin DB] Connection already in progress...");
    return mongoose.connection;
  }

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000,
    });
    return mongoose.connection;
  } catch (error) {
    console.error("[Admin DB Startup Error]: Failed to connect to MongoDB:", error.message);
    throw error;
  }
};

export default connectAdminDB;
