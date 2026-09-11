/**
 * Admin Creation Script
 *
 * Secure CLI utility to create a new administrator account or promote an existing user.
 *
 * Usage:
 *   node scripts/create-admin.js --email=admin@example.com --password=Secret123! --username=AdminUser
 *   npm run create-admin
 */

import dns from "dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);

import readline from "readline";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcrypt";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from admin/server/.env or backend/.env
dotenv.config({ path: path.resolve(__dirname, "../.env") });
if (!process.env.MONGODB_URI && !process.env.MONGO_URI) {
  dotenv.config({ path: path.resolve(__dirname, "../../../backend/.env") });
}

import User from "../src/models/user.model.js";

const parseArg = (flag) => {
  const arg = process.argv.find((a) => a.startsWith(`--${flag}=`));
  return arg ? arg.slice(`--${flag}=`.length).trim() : null;
};

const promptInput = (questionText, isHidden = false) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(questionText, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
};

const run = async () => {
  console.log("=================================================");
  console.log("   MATCHWISE AI — SECURE ADMIN CREATION TOOL     ");
  console.log("=================================================");

  let email = parseArg("email") || process.env.ADMIN_EMAIL;
  let username = parseArg("username") || parseArg("name");
  let password = parseArg("password");

  if (!email) {
    email = await promptInput("Enter Admin Email: ");
  }

  email = String(email || "").trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    console.error("\n[Error]: A valid email address is required.");
    process.exit(1);
  }

  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!mongoUri) {
    console.error("\n[Error]: MONGODB_URI is not configured in .env.");
    process.exit(1);
  }

  try {
    console.log("\nConnecting to MongoDB database...");
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });
    console.log("Connected to MongoDB successfully.");
  } catch (err) {
    console.error("[Database Connection Error]:", err.message);
    process.exit(1);
  }

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      console.log(`\nExisting user found: "${existingUser.username}" (Role: ${existingUser.role})`);

      if (existingUser.role === "admin" && existingUser.isActive) {
        console.log("[Notice]: This user is already an active administrator.");
        if (password) {
          const saltRounds = 12;
          existingUser.password = await bcrypt.hash(password, saltRounds);
          await existingUser.save();
          console.log("[Success]: Admin password updated successfully.");
        }
        process.exit(0);
      }

      const confirm = await promptInput(
        `Promote existing user "${existingUser.username}" to ADMIN role? (y/N): `,
      );

      if (confirm.toLowerCase() === "y" || confirm.toLowerCase() === "yes") {
        existingUser.role = "admin";
        existingUser.isActive = true;

        if (password && password.length >= 6) {
          const saltRounds = 12;
          existingUser.password = await bcrypt.hash(password, saltRounds);
          console.log("Password also updated.");
        }

        await existingUser.save();
        console.log(`\n[Success]: Successfully promoted "${existingUser.username}" to ADMIN role.`);
      } else {
        console.log("Operation cancelled.");
      }
    } else {
      // New user creation
      if (!username) {
        username = await promptInput("Enter Username for new admin: ");
      }
      if (!username) {
        username = email.split("@")[0] + "_admin";
      }

      if (!password) {
        password = await promptInput("Enter Password (min 6 chars): ");
      }

      if (!password || password.length < 6) {
        console.error("\n[Error]: Password must be at least 6 characters long.");
        process.exit(1);
      }

      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const newAdmin = new User({
        username,
        email,
        password: hashedPassword,
        role: "admin",
        isActive: true,
      });

      await newAdmin.save();
      console.log(`\n[Success]: Administrator account created successfully!`);
      console.log(`  - Username: ${newAdmin.username}`);
      console.log(`  - Email:    ${newAdmin.email}`);
      console.log(`  - Role:     ${newAdmin.role}`);
    }
  } catch (error) {
    console.error("\n[Admin Creation Error]:", error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("\nDatabase connection closed.");
    process.exit(0);
  }
};

run();
