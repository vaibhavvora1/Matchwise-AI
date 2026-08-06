import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars from backend/.env
dotenv.config({ path: path.join(__dirname, "../.env") });

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("Error: MONGO_URI is missing in backend/.env");
  process.exit(1);
}

const runMigration = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB. Starting migration...");

    const db = mongoose.connection.db;
    const collection = db.collection("interviewreports");

    // Perform the rename on all documents where selfDeclaration exists
    const result = await collection.updateMany(
      { selfDeclaration: { $exists: true } },
      { $rename: { selfDeclaration: "selfDescription" } }
    );

    console.log(`\nMigration completed successfully!`);
    console.log(`Matched: ${result.matchedCount} documents`);
    console.log(`Modified: ${result.modifiedCount} documents\n`);
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await mongoose.connection.close();
    console.log("MongoDB connection closed.");
    process.exit(0);
  }
};

runMigration();
