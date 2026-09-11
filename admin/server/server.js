import dns from "dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]); // Public DNS resolvers

import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Try loading local admin .env first
const localEnvPath = path.join(__dirname, ".env");
const dotenvResult = dotenv.config({ path: localEnvPath });

// If MONGODB_URI or MONGO_URI is missing, try loading from backend/.env as fallback
if (!process.env.MONGODB_URI && !process.env.MONGO_URI) {
  const backendEnvPath = path.resolve(__dirname, "../../backend/.env");
  dotenv.config({ path: backendEnvPath });
}

import app from "./src/app.js";
import connectAdminDB from "./src/config/db.js";
import { initSocketIO } from "./src/services/socket.service.js";

const PORT = parseInt(process.env.ADMIN_SERVER_PORT || "4000", 10);
const CLIENT_URL = process.env.ADMIN_CLIENT_URL || "http://localhost:3001";

const httpServer = http.createServer(app);

// Initialize Socket.IO on the HTTP server
initSocketIO(httpServer, [CLIENT_URL]);

const startAdminServer = async () => {
  try {
    console.log("[Admin Server] Initializing database connection...");
    await connectAdminDB();

    httpServer.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`   MATCHWISE AI — DEDICATED ADMIN SERVER           `);
      console.log(`   Server running on: http://localhost:${PORT}      `);
      console.log(`   Admin Client URL:  ${CLIENT_URL}                 `);
      console.log(`   Environment:       ${process.env.NODE_ENV || "development"}`);
      console.log(`====================================================`);
    });
  } catch (error) {
    console.error("[Admin Server Startup Error]: Fatal failure during startup:", error.message);
    process.exit(1);
  }
};

startAdminServer();

const handleShutdown = async (signal) => {
  console.log(`\n[Admin Server] Received ${signal}. Shutting down gracefully...`);
  httpServer.close(() => {
    console.log("[Admin Server] HTTP server closed.");
    process.exit(0);
  });
};

process.on("SIGTERM", () => handleShutdown("SIGTERM"));
process.on("SIGINT", () => handleShutdown("SIGINT"));
