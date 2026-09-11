import crypto from "crypto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import usermodel from "../models/user.model.js";
import BlacklistedAccessToken from "../models/blacklistedAccessToken.model.js";
import RefreshToken from "../models/refreshToken.model.js";
import logActivity from "../services/activity.service.js";
import {
  generateAccessToken,
  generateRefreshToken,
  getRefreshTokenExpirySeconds,
  getJwtExpirySeconds,
  hashToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "../utils/token.utils.js";

/**
 * Returns configuration settings for secure cookies.
 *
 * @param {number} maxAge - Expiry time of the cookie in milliseconds
 * @returns {import("express").CookieOptions} Express cookie options
 */
const getCookieOptions = (maxAge) => {
  const useSecureCookies = process.env.COOKIE_SECURE === "true";

  return {
    httpOnly: true,
    secure: useSecureCookies,
    sameSite: useSecureCookies ? "none" : "lax",
    maxAge,
    path: "/",
  };
};

const sendAuthError = (res, statusCode, message, code) => {
  return res.status(statusCode).json({ success: false, message, code });
};

const clearAuthCookies = (res) => {
  res.clearCookie("refresh-token", getCookieOptions(0));
  res.clearCookie("csrf-token", getCookieOptions(0));
};

/**
 * @name registerUsercontroller
 * @description Controller to handle user registration
 * @route POST /api/auth/register
 * @access Public
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns {Promise<void>}
 */
export async function registerUsercontroller(req, res) {
  try {
    const username = String(req.body.username || "").trim();
    const email = String(req.body.email || "")
      .trim()
      .toLowerCase();
    const password = String(req.body.password || "");

    if (!username || !email || !password) {
      return sendAuthError(
        res,
        400,
        "All fields are required",
        "VALIDATION_ERROR",
      );
    }

    if (password.length < 6) {
      return sendAuthError(
        res,
        400,
        "Password must be at least 6 characters long",
        "VALIDATION_ERROR",
      );
    }

    const existingUser = await usermodel
      .findOne({ $or: [{ email }, { username }] })
      .select("_id");
    if (existingUser) {
      return sendAuthError(
        res,
        400,
        "Username or Email already exists",
        "USER_EXISTS",
      );
    }

    const saltRounds = Math.min(
      12,
      Math.max(10, parseInt(process.env.BCRYPT_SALT_ROUNDS || "10", 10) || 10),
    );
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = new usermodel({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    const accessToken = generateAccessToken(newUser);
    const refreshTokenString = generateRefreshToken(newUser);
    const csrfToken = crypto.randomBytes(32).toString("hex");

    const decodedRefresh = jwt.decode(refreshTokenString);
    const jti = decodedRefresh?.jti || crypto.randomUUID();
    const hashedRefreshToken = hashToken(refreshTokenString);
    const refreshTokenTtlSeconds = getRefreshTokenExpirySeconds();

    await RefreshToken.create({
      userId: newUser._id,
      jti,
      tokenHash: hashedRefreshToken,
      isUsed: false,
      expiresAt: new Date(Date.now() + refreshTokenTtlSeconds * 1000),
    });

    res.cookie(
      "refresh-token",
      refreshTokenString,
      getCookieOptions(refreshTokenTtlSeconds * 1000),
    );
    res.cookie(
      "csrf-token",
      csrfToken,
      getCookieOptions(refreshTokenTtlSeconds * 1000),
    );

    // Asynchronously log user registration
    logActivity({
      userId: newUser._id,
      eventType: "USER_REGISTERED",
      description: `User "${newUser.username}" registered successfully`,
      metadata: { username: newUser.username, email: newUser.email },
      req,
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully.",
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
      },
      accessToken,
      csrfToken,
    });
  } catch (error) {
    console.error("[Auth Controller] Register error:", error.message);
    return sendAuthError(
      res,
      500,
      "Internal server error during registration",
      "REGISTRATION_FAILED",
    );
  }
}

/**
 * @name loginUsercontroller
 * @description Authenticate user, store refresh token in MongoDB, configure cookies, and return tokens
 * @route POST /api/auth/login
 * @access Public
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns {Promise<void>}
 */
export async function loginUsercontroller(req, res) {
  try {
    const email = String(req.body.email || "")
      .trim()
      .toLowerCase();
    const password = String(req.body.password || "");

    if (!email || !password) {
      return sendAuthError(
        res,
        400,
        "Email and password are required",
        "VALIDATION_ERROR",
      );
    }

    const user = await usermodel
      .findOne({ email })
      .select("_id username email password");
    if (!user) {
      return sendAuthError(
        res,
        401,
        "Invalid email or password",
        "INVALID_CREDENTIALS",
      );
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return sendAuthError(
        res,
        401,
        "Invalid email or password",
        "INVALID_CREDENTIALS",
      );
    }

    const accessToken = generateAccessToken(user);
    const refreshTokenString = generateRefreshToken(user);
    const csrfToken = crypto.randomBytes(32).toString("hex");

    const decodedRefresh = jwt.decode(refreshTokenString);
    const jti = decodedRefresh?.jti || crypto.randomUUID();
    const hashedRefreshToken = hashToken(refreshTokenString);
    const refreshTokenTtlSeconds = getRefreshTokenExpirySeconds();

    await RefreshToken.create({
      userId: user._id,
      jti,
      tokenHash: hashedRefreshToken,
      isUsed: false,
      expiresAt: new Date(Date.now() + refreshTokenTtlSeconds * 1000),
    });

    // Update user login timestamp & count in background
    usermodel
      .findByIdAndUpdate(user._id, {
        $set: { lastLoginAt: new Date() },
        $inc: { loginCount: 1 },
      })
      .catch((err) =>
        console.warn(
          "[Auth Controller] Login stats update failed:",
          err.message,
        ),
      );

    // Asynchronously log user login event
    logActivity({
      userId: user._id,
      eventType: "USER_LOGIN",
      description: `User "${user.username}" logged in`,
      metadata: { username: user.username, email: user.email },
      req,
    });

    res.cookie(
      "refresh-token",
      refreshTokenString,
      getCookieOptions(refreshTokenTtlSeconds * 1000),
    );
    res.cookie(
      "csrf-token",
      csrfToken,
      getCookieOptions(refreshTokenTtlSeconds * 1000),
    );

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
      accessToken,
      csrfToken,
    });
  } catch (error) {
    console.error("[Auth Controller] Login error:", error.message);
    return sendAuthError(
      res,
      500,
      "Internal server error during login",
      "LOGIN_FAILED",
    );
  }
}

/**
 * @name refreshUsercontroller
 * @description Validate refresh token, handle rotation, reuse detection (theft response)
 * @route POST /api/auth/refresh
 * @access Public (cookie authenticated)
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns {Promise<void>}
 */
export async function refreshUsercontroller(req, res) {
  try {
    const rawRefreshToken = req.cookies ? req.cookies["refresh-token"] : null;
    if (!rawRefreshToken) {
      return sendAuthError(
        res,
        401,
        "Refresh token is missing. Please log in.",
        "REFRESH_TOKEN_MISSING",
      );
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(rawRefreshToken);
    } catch (jwtError) {
      console.warn(
        "[Auth Controller] JWT refresh token signature check failed:",
        jwtError.message,
      );
      clearAuthCookies(res);
      return sendAuthError(
        res,
        401,
        "Session expired or invalid token. Please log in.",
        "REFRESH_TOKEN_EXPIRED",
      );
    }

    const { id: userId, jti } = decoded;
    const hashedToken = hashToken(rawRefreshToken);

    // Look up the stored token from MongoDB
    const storedToken = await RefreshToken.findOne({ userId, jti }).lean();

    if (!storedToken) {
      return sendAuthError(
        res,
        401,
        "Session expired or invalid token. Please log in.",
        "INVALID_REFRESH_TOKEN",
      );
    }

    // Reuse detection — token was already consumed
    if (storedToken.isUsed) {
      console.warn(
        `[Security Alert] Refresh token reuse detected for User: ${userId}! Revoking all sessions.`,
      );
      await RefreshToken.deleteMany({ userId });
      clearAuthCookies(res);
      return sendAuthError(
        res,
        403,
        "Security alert: Refresh token reuse detected. All sessions terminated.",
        "TOKEN_REUSE_DETECTED",
      );
    }

    // Hash mismatch — token tampered
    if (storedToken.tokenHash !== hashedToken) {
      return sendAuthError(
        res,
        401,
        "Invalid token credentials. Please log in.",
        "INVALID_REFRESH_TOKEN",
      );
    }

    const user = await usermodel.findById(userId).select("_id username email");
    if (!user) {
      return sendAuthError(res, 401, "User not found.", "USER_NOT_FOUND");
    }

    // Mark the old token as used (short 5-min window before TTL deletes it)
    await RefreshToken.findOneAndUpdate(
      { userId, jti },
      {
        isUsed: true,
        expiresAt: new Date(Date.now() + 300 * 1000),
      },
    );

    // Issue new tokens
    const newAccessToken = generateAccessToken(user);
    const newRefreshTokenString = generateRefreshToken(user);
    const newCsrfToken = crypto.randomBytes(32).toString("hex");

    const newDecodedRefresh = jwt.decode(newRefreshTokenString);
    const newJti = newDecodedRefresh?.jti || crypto.randomUUID();
    const newHashedToken = hashToken(newRefreshTokenString);
    const refreshTokenTtlSeconds = getRefreshTokenExpirySeconds();

    await RefreshToken.create({
      userId: user._id,
      jti: newJti,
      tokenHash: newHashedToken,
      isUsed: false,
      expiresAt: new Date(Date.now() + refreshTokenTtlSeconds * 1000),
    });

    res.cookie(
      "refresh-token",
      newRefreshTokenString,
      getCookieOptions(refreshTokenTtlSeconds * 1000),
    );
    res.cookie(
      "csrf-token",
      newCsrfToken,
      getCookieOptions(refreshTokenTtlSeconds * 1000),
    );

    res.status(200).json({
      success: true,
      accessToken: newAccessToken,
      csrfToken: newCsrfToken,
    });
  } catch (error) {
    console.error("[Auth Controller] Refresh error:", error.message);
    return sendAuthError(
      res,
      500,
      "Internal server error during token refresh",
      "REFRESH_FAILED",
    );
  }
}

/**
 * @name logoutUsercontroller
 * @description Terminate current user session by removing refresh token from MongoDB and clearing cookies
 * @route POST /api/auth/logout
 * @access Public (cookie authenticated)
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns {Promise<void>}
 */
export async function logoutUsercontroller(req, res) {
  try {
    const rawRefreshToken = req.cookies ? req.cookies["refresh-token"] : null;
    const authHeader = req.headers.authorization || req.headers.Authorization;

    // Delete the refresh token from MongoDB
    if (rawRefreshToken) {
      try {
        const decoded = jwt.decode(rawRefreshToken);
        if (decoded && decoded.id && decoded.jti) {
          await RefreshToken.findOneAndDelete({
            userId: decoded.id,
            jti: decoded.jti,
          });
        }
      } catch (err) {
        console.warn(
          "[Auth Controller] Non-fatal parse warning during logout token deletion:",
          err.message,
        );
      }
    }

    // Blacklist the access token so it can't be replayed within its remaining TTL
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const accessToken = authHeader.slice("Bearer ".length).trim();
      try {
        const decodedAccess = verifyAccessToken(accessToken);
        if (decodedAccess && decodedAccess.jti) {
          const ttl = getJwtExpirySeconds(accessToken);
          if (ttl && ttl > 0) {
            await BlacklistedAccessToken.findOneAndUpdate(
              { jti: decodedAccess.jti },
              {
                reason: "logout",
                expiresAt: new Date(Date.now() + ttl * 1000),
              },
              { upsert: true, new: true, setDefaultsOnInsert: true },
            );
          }
        }
      } catch (err) {
        console.warn(
          "[Auth Controller] Access token could not be blacklisted during logout:",
          err.message,
        );
      }
    }

    clearAuthCookies(res);

    const loggedOutUserId = rawRefreshToken
      ? (() => {
          try {
            return jwt.decode(rawRefreshToken)?.id;
          } catch {
            return null;
          }
        })()
      : null;

    if (loggedOutUserId) {
      logActivity({
        userId: loggedOutUserId,
        eventType: "USER_LOGOUT",
        description: "User logged out of session",
        req,
      });
    }

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("[Auth Controller] Logout error:", error.message);
    return sendAuthError(
      res,
      500,
      "Internal server error during logout",
      "LOGOUT_FAILED",
    );
  }
}

/**
 * @name logoutAllDevicescontroller
 * @description Invalidate all active sessions for the user across all devices
 * @route POST /api/auth/logout-all
 * @access Private (authenticated via Access Token)
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns {Promise<void>}
 */
export async function logoutAllDevicescontroller(req, res) {
  try {
    const userId = req.user.id;

    // Delete all refresh tokens for this user in a single query
    await RefreshToken.deleteMany({ userId });

    // Blacklist the current access token
    if (req.user && req.user.jti) {
      const token = req.headers.authorization?.slice("Bearer ".length).trim();
      const ttl = getJwtExpirySeconds(token);
      if (ttl && ttl > 0) {
        await BlacklistedAccessToken.findOneAndUpdate(
          { jti: req.user.jti },
          {
            reason: "logout_all",
            expiresAt: new Date(Date.now() + ttl * 1000),
          },
          { upsert: true, new: true, setDefaultsOnInsert: true },
        );
      }
    }

    clearAuthCookies(res);

    logActivity({
      userId,
      eventType: "USER_LOGOUT_ALL",
      description: "User logged out of all active sessions across devices",
      req,
    });

    res.status(200).json({
      success: true,
      message: "Logged out from all devices successfully.",
    });
  } catch (error) {
    console.error("[Auth Controller] Logout-all error:", error.message);
    return sendAuthError(
      res,
      500,
      "Internal server error during logout from all devices",
      "LOGOUT_ALL_FAILED",
    );
  }
}
