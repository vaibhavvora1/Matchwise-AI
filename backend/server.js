import dns from "dns";
dns.setServers(['8.8.8.8', '1.1.1.1']); // Google + Cloudflare DNS
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicit path — no longer depends on the current working directory
// you happen to launch the process from.
const dotenvResult = dotenv.config({ path: path.join(__dirname, ".env") });

if (dotenvResult.error) {
  console.error("[dotenv] Failed to load .env file:", dotenvResult.error.message);
} else {
  console.log("[dotenv] .env loaded. RAPID_API_KEY present:", !!process.env.RAPID_API_KEY);
}

import express from "express";
import app from "./src/app.js";
import connectDB from "./src/config/db.js";


app.use(express.static("public"));

const PORT = process.env.PORT || 3000;

/**
 * Boots the server by initializing connections to the MongoDB database
 * and Redis store, then starts the Express app.
 */
const startServer = async () => {
  try {
    // Connect to database once at startup
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error(
      "[Server Startup Error]: Fatal failure during startup sequence:",
      error.message,
    );
    process.exit(1);
  }
};

// Removed automatic AI generation at startup because it can fail due to
// quota/external API limits and should not prevent the app from running.
startServer();