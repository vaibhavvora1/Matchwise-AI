import dotenv from "dotenv";
import path from "path";

dotenv.config();

import app from "./src/app.js";
import connectDB from "./src/config/db.js";
import redisClient from "./src/utils/tokenCache.js";
import mongoose from "mongoose";

const PORT = 3099;
let serverInstance;

/**
 * Custom fetch client that manages cookies in memory
 */
class TestClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.cookies = {};
    this.accessToken = null;
    this.csrfToken = null;
  }

  setCookiesFromHeaders(headers) {
    const setCookieHeaders = headers.getSetCookie ? headers.getSetCookie() : [];
    setCookieHeaders.forEach(cookieStr => {
      const parts = cookieStr.split(";")[0].split("=");
      const name = parts[0].trim();
      const val = parts[1].trim();
      this.cookies[name] = val;
    });
  }

  getCookieHeaderString() {
    return Object.entries(this.cookies)
      .map(([name, val]) => `${name}=${val}`)
      .join("; ");
  }

  async request(method, endpoint, body = null, useCsrfHeader = false) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      "Content-Type": "application/json",
    };

    if (this.accessToken) {
      headers["Authorization"] = `Bearer ${this.accessToken}`;
    }

    if (useCsrfHeader && this.csrfToken) {
      headers["x-csrf-token"] = this.csrfToken;
    }

    const cookieStr = this.getCookieHeaderString();
    if (cookieStr) {
      headers["Cookie"] = cookieStr;
    }

    const options = {
      method,
      headers,
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const res = await fetch(url, options);
    this.setCookiesFromHeaders(res.headers);

    let json = {};
    try {
      json = await res.json();
    } catch (e) {}

    return { status: res.status, body: json };
  }
}

async function runTests() {
  try {
    console.log("Connecting to MongoDB...");
    await connectDB();
    console.log("Using in-memory Token Cache...");

    // Start server
    serverInstance = app.listen(PORT, () => {
      console.log(`Optimized test server running on port ${PORT}`);
    });

    const client = new TestClient(`http://localhost:${PORT}/api`);
    const rand = Math.floor(Math.random() * 100000);
    const testUsername = `user_opt_${rand}`;
    const testEmail = `user_opt_${rand}@example.com`;
    const testPassword = "Password123!";

    // --- STEP 1: REGISTER ---
    console.log("\n--- STEP 1: User Registration ---");
    const regRes = await client.request("POST", "/auth/register", {
      username: testUsername,
      email: testEmail,
      password: testPassword
    });
    console.log(`Status: ${regRes.status}`, regRes.body);
    if (regRes.status !== 201) throw new Error("Registration failed");

    // --- STEP 2: LOGIN (Verify Redis Storage) ---
    console.log("\n--- STEP 2: User Login & Redis Verification ---");
    const loginRes = await client.request("POST", "/auth/login", {
      email: testEmail,
      password: testPassword
    });
    console.log(`Status: ${loginRes.status}`);
    if (loginRes.status !== 200) throw new Error("Login failed");

    const userId = loginRes.body.user.id;
    
    // Scan Redis keys to verify the token was stored correctly
    const redisKeys = await redisClient.scan(0, { MATCH: `refresh_token:${userId}:*` });
    console.log("Stored Redis keys for user:", redisKeys.keys);
    if (redisKeys.keys.length !== 1) {
      throw new Error(`Expected exactly 1 Redis key for user session, found: ${redisKeys.keys.length}`);
    }

    const initialAccessToken = loginRes.body.accessToken;
    const initialCsrfToken = loginRes.body.csrfToken;
    const initialCookies = { ...client.cookies };

    // --- STEP 3: ACCESS PROTECTED PROFILE (Verify Projection) ---
    console.log("\n--- STEP 3: Access Profile & Check Selective Projections ---");
    const profileRes = await client.request("GET", "/user/profile");
    console.log(`Status: ${profileRes.status}`, profileRes.body);
    if (profileRes.status !== 200) throw new Error("Profile query failed");
    
    if (profileRes.body.user.password) {
      throw new Error("Security check failed: Password field was returned in profile query!");
    }
    console.log("Database select projection successfully verified (password excluded).");

    // --- STEP 4: CSRF MIDDLEWARE CHECK ---
    console.log("\n--- STEP 4: Verify CSRF Block ---");
    const csrfFailRes = await client.request("POST", "/auth/refresh", null, false);
    console.log(`Status: ${csrfFailRes.status}`, csrfFailRes.body);
    if (csrfFailRes.status !== 403) throw new Error("Expected CSRF check to return 403");

    // --- STEP 5: TOKEN ROTATION IN REDIS ---
    console.log("\n--- STEP 5: Silent Refresh & Rotation in Redis ---");
    console.log("Waiting 1.1 seconds for timestamp iat shift...");
    await new Promise((resolve) => setTimeout(resolve, 1100));

    const refreshRes = await client.request("POST", "/auth/refresh", null, true);
    console.log(`Status: ${refreshRes.status}`);
    if (refreshRes.status !== 200) throw new Error("Token refresh failed");

    // Scan Redis keys to verify rotation occurred (old is marked used/TTL, new is active)
    const afterRotationKeys = await redisClient.scan(0, { MATCH: `refresh_token:${userId}:*` });
    console.log("Redis keys for user after rotation:", afterRotationKeys.keys);
    if (afterRotationKeys.keys.length !== 2) {
      throw new Error(`Expected 2 Redis keys (1 active, 1 recently rotated), found: ${afterRotationKeys.keys.length}`);
    }

    console.log("Token rotation in Redis verified successfully!");

    // --- STEP 6: REUSE DETECTION IN REDIS ---
    console.log("\n--- STEP 6: Simulating Token Reuse (Theft Detection) ---");
    // Simulate attacker using the old initial refresh token
    const attackerClient = new TestClient(`http://localhost:${PORT}/api`);
    attackerClient.cookies["refresh-token"] = initialCookies["refresh-token"];
    attackerClient.cookies["csrf-token"] = initialCookies["csrf-token"];
    attackerClient.csrfToken = initialCsrfToken;

    const reuseRes = await attackerClient.request("POST", "/auth/refresh", null, true);
    console.log(`Status: ${reuseRes.status}`, reuseRes.body);
    if (reuseRes.status !== 403 || reuseRes.body.code !== "TOKEN_REUSE_DETECTED") {
      throw new Error("Expected TOKEN_REUSE_DETECTED block");
    }

    // Verify all keys for user were deleted from Redis as a result of compromise detection
    const afterCompromiseKeys = await redisClient.scan(0, { MATCH: `refresh_token:${userId}:*` });
    console.log("Redis keys remaining after theft revocation:", afterCompromiseKeys.keys);
    if (afterCompromiseKeys.keys.length !== 0) {
      throw new Error(`Expected all user session keys to be revoked, remaining: ${afterCompromiseKeys.keys.length}`);
    }
    console.log("Theft reuse detection and complete key revocation verified successfully!");

    // --- STEP 7: RATE LIMITING VERIFICATION ---
    console.log("\n--- STEP 7: Verifying Rate Limiting (Brute-force Protection) ---");
    console.log("Making 105 rapid authentication calls to check rate limiter...");
    let limitTriggered = false;
    
    // We send requests sequentially or in bulk. Since the limit is 100, we make 105 requests.
    for (let i = 0; i < 105; i++) {
      const res = await client.request("POST", "/auth/login", {
        email: testEmail,
        password: testPassword
      });
      if (res.status === 429) {
        console.log(`Rate limiter triggered on request #${i + 1} with status 429!`, res.body);
        limitTriggered = true;
        break;
      }
    }

    if (!limitTriggered) {
      throw new Error("Rate limiting failed to trigger after 100 requests");
    }
    console.log("Rate limiter verified successfully!");

    console.log("\nAll optimized security and performance test cases passed!");

  } catch (error) {
    console.error("Test execution failed:", error);
  } finally {
    if (serverInstance) {
      serverInstance.close(() => {
        console.log("Server closed.");
      });
    }
    await mongoose.connection.close();
    console.log("Database connection closed.");
    process.exit(0);
  }
}

runTests();
