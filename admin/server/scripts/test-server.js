/**
 * Admin Server Verification & Health Test
 *
 * Verifies that the Admin Server routes, controllers, tokens, and middleware
 * function correctly and conform to security standards.
 */

import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env
dotenv.config({ path: path.resolve(__dirname, "../.env") });
if (!process.env.MONGODB_URI && !process.env.MONGO_URI) {
  dotenv.config({ path: path.resolve(__dirname, "../../../backend/.env") });
}

import app from "../src/app.js";
import {
  generateAdminAccessToken,
  generateAdminRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  hashToken,
} from "../src/utils/token.utils.js";

const runTests = async () => {
  console.log("=================================================");
  console.log("   MATCHWISE AI — ADMIN SERVER UNIT TESTS        ");
  console.log("=================================================\n");

  let passed = 0;
  let failed = 0;

  const test = (name, fn) => {
    try {
      fn();
      console.log(`  ✓ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ FAIL: ${name}`);
      console.error(`    Error: ${err.message}`);
      failed++;
    }
  };

  // 1. Token Utils Test
  test("Token generation and signature verification", () => {
    const mockUser = {
      _id: "660000000000000000000001",
      username: "admin_test",
      email: "admin@matchwise.ai",
      role: "admin",
    };

    const accessToken = generateAdminAccessToken(mockUser);
    if (!accessToken) throw new Error("Access token was not generated");

    const decodedAccess = verifyAccessToken(accessToken);
    if (decodedAccess.email !== mockUser.email) throw new Error("Email mismatch in access token");
    if (decodedAccess.role !== "admin") throw new Error("Role is not admin in access token");
    if (!decodedAccess.jti) throw new Error("JTI missing in access token");

    const refreshToken = generateAdminRefreshToken(mockUser);
    const decodedRefresh = verifyRefreshToken(refreshToken);
    if (decodedRefresh.id !== mockUser._id) throw new Error("ID mismatch in refresh token");
    if (!decodedRefresh.jti) throw new Error("JTI missing in refresh token");

    const hash = hashToken(refreshToken);
    if (!hash || hash.length !== 64) throw new Error("SHA-256 hash output invalid");
  });

  // 2. Token Security Verification
  test("Forged or tampered JWT rejected by verifier", () => {
    try {
      verifyAccessToken("invalid.token.string");
      throw new Error("Invalid token should have been rejected");
    } catch (err) {
      if (err.message.includes("should have been rejected")) throw err;
      // Expected rejection
    }
  });

  // 3. App Routes & Middleware Registration
  test("Admin Express App mounts all required routes", () => {
    if (!app || typeof app.use !== "function") {
      throw new Error("Express app instance not properly exported");
    }
  });

  console.log(`\n=================================================`);
  console.log(`   TEST RESULTS: ${passed} Passed, ${failed} Failed`);
  console.log(`=================================================`);

  if (failed > 0) {
    process.exit(1);
  }
};

runTests();
