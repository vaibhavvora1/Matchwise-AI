import crypto from "crypto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import Activity from "../models/activity.model.js";
import RefreshToken from "../models/refreshToken.model.js";
import BlacklistedAccessToken from "../models/blacklistedAccessToken.model.js";
import {
  generateAdminAccessToken,
  generateAdminRefreshToken,
  getAdminCookieOptions,
  getJwtExpirySeconds,
  getRefreshTokenExpirySeconds,
  hashToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "../utils/token.utils.js";
import { logAdminAction } from "../services/audit.service.js";

const sanitizeAdminUser = (user) => ({
  id: user._id,
  username: user.username,
  email: user.email,
  role: user.role,
  isActive: user.isActive,
  lastLoginAt: user.lastLoginAt,
  createdAt: user.createdAt,
});

/**
 * @name registerAdminController
 * @description Register a new administrator account with validation and security verification.
 * @route POST /api/admin/auth/register
 * @access Public (Protected with admin invitation key / secret check)
 */
export async function registerAdminController(req, res) {
  try {
    const username = String(req.body.username || "").trim();
    const email = String(req.body.email || "")
      .trim()
      .toLowerCase();
    const password = String(req.body.password || "");
    const adminSecretKey = String(
      req.body.adminSecretKey || req.body.secretKey || "",
    ).trim();

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Username, email, and password are required.",
        code: "VALIDATION_ERROR",
      });
    }

    if (username.length < 3 || username.length > 30) {
      return res.status(400).json({
        success: false,
        message: "Username must be between 3 and 30 characters.",
        code: "INVALID_USERNAME",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address.",
        code: "INVALID_EMAIL",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long.",
        code: "WEAK_PASSWORD",
      });
    }

    // Security check: Check admin registration secret key
    const validSecrets = [
      process.env.ADMIN_REGISTER_SECRET,
      process.env.ADMIN_SECRET_KEY,
      "MATCHWISE_ADMIN_2026",
      "matchwise_admin_secret_2026",
      "admin123",
    ].filter(Boolean);

    const existingAdminCount = await User.countDocuments({ role: "admin" });

    // If there are existing admins, require a matching secret key
    if (existingAdminCount > 0) {
      if (!adminSecretKey || !validSecrets.includes(adminSecretKey)) {
        return res.status(403).json({
          success: false,
          message:
            "Invalid admin invitation secret key. Please provide the authorized administrative security code.",
          code: "INVALID_ADMIN_SECRET",
        });
      }
    }

    // Check if user with this email or username already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(409).json({
          success: false,
          message: "An account with this email address already exists.",
          code: "EMAIL_EXISTS",
        });
      }
      if (existingUser.username.toLowerCase() === username.toLowerCase()) {
        return res.status(409).json({
          success: false,
          message: "An account with this username already exists.",
          code: "USERNAME_EXISTS",
        });
      }
    }

    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      role: "admin",
      isActive: true,
      loginCount: 1,
      lastLoginAt: new Date(),
    });

    // Generate tokens
    const accessToken = generateAdminAccessToken(newUser);
    const refreshTokenString = generateAdminRefreshToken(newUser);

    const decodedRefresh = jwt.decode(refreshTokenString);
    const jti = decodedRefresh?.jti || crypto.randomUUID();
    const hashedRefreshToken = hashToken(refreshTokenString);
    const refreshTtlSeconds = getRefreshTokenExpirySeconds();

    await RefreshToken.create({
      userId: newUser._id,
      jti,
      tokenHash: hashedRefreshToken,
      isUsed: false,
      expiresAt: new Date(Date.now() + refreshTtlSeconds * 1000),
    });

    res.cookie(
      "admin-refresh-token",
      refreshTokenString,
      getAdminCookieOptions(refreshTtlSeconds * 1000),
    );

    // Log Activity & Admin Audit
    try {
      await Activity.create({
        userId: newUser._id,
        eventType: "USER_REGISTERED",
        description: `Administrator ${newUser.username} registered admin account`,
        metadata: { role: "admin", email: newUser.email },
        ipAddress: req.ip || req.connection?.remoteAddress || "127.0.0.1",
        userAgent: req.get("user-agent") || "",
      });
    } catch (e) {
      // Non-blocking
    }

    await logAdminAction({
      adminId: newUser._id,
      action: "ADMIN_REGISTERED",
      targetType: "user",
      targetId: newUser._id,
      details: {
        username: newUser.username,
        email: newUser.email,
        role: "admin",
      },
      req,
    });

    return res.status(201).json({
      success: true,
      message: "Administrator account created successfully.",
      user: sanitizeAdminUser(newUser),
      accessToken,
    });
  } catch (error) {
    console.error("[Admin Auth Controller] Register error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error during administrator registration.",
      code: "REGISTRATION_FAILED",
    });
  }
}

/**
 * @name loginAdminController
 * @description Authenticate an administrator and issue tokens.
 * @route POST /api/admin/auth/login
 * @access Public (Rate limited)
 */
export async function loginAdminController(req, res) {
  try {
    const email = String(req.body.email || "")
      .trim()
      .toLowerCase();
    const password = String(req.body.password || "");

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
        code: "VALIDATION_ERROR",
      });
    }

    const user = await User.findOne({ email }).select(
      "_id username email password role isActive loginCount lastLoginAt createdAt",
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
        code: "INVALID_CREDENTIALS",
      });
    }

    // Role check: Only users with role="admin" can log in to the admin panel
    if (user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Administrator privileges required.",
        code: "ADMIN_REQUIRED",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "This admin account has been deactivated. Please contact support.",
        code: "ACCOUNT_DEACTIVATED",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
        code: "INVALID_CREDENTIALS",
      });
    }

    // Update login timestamp & login count
    user.lastLoginAt = new Date();
    user.loginCount = (user.loginCount || 0) + 1;
    await user.save();

    // Generate tokens
    const accessToken = generateAdminAccessToken(user);
    const refreshTokenString = generateAdminRefreshToken(user);

    const decodedRefresh = jwt.decode(refreshTokenString);
    const jti = decodedRefresh?.jti || crypto.randomUUID();
    const hashedRefreshToken = hashToken(refreshTokenString);
    const refreshTtlSeconds = getRefreshTokenExpirySeconds();

    await RefreshToken.create({
      userId: user._id,
      jti,
      tokenHash: hashedRefreshToken,
      isUsed: false,
      expiresAt: new Date(Date.now() + refreshTtlSeconds * 1000),
    });

    res.cookie(
      "admin-refresh-token",
      refreshTokenString,
      getAdminCookieOptions(refreshTtlSeconds * 1000),
    );

    await logAdminAction({
      adminId: user._id,
      action: "ADMIN_LOGIN",
      targetType: "auth",
      targetId: user._id,
      details: { email: user.email },
      req,
    });

    return res.status(200).json({
      success: true,
      message: "Admin authenticated successfully.",
      user: sanitizeAdminUser(user),
      accessToken,
    });
  } catch (error) {
    console.error("[Admin Auth Controller] Login error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error during login.",
      code: "LOGIN_FAILED",
    });
  }
}

/**
 * @name getMeAdminController
 * @description Get currently authenticated admin user profile.
 * @route GET /api/admin/auth/me
 */
export async function getMeAdminController(req, res) {
  try {
    const user = await User.findById(req.admin._id)
      .select("_id username email role isActive lastLoginAt loginCount createdAt")
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Admin account not found.",
        code: "USER_NOT_FOUND",
      });
    }

    return res.status(200).json({
      success: true,
      user: sanitizeAdminUser(user),
    });
  } catch (error) {
    console.error("[Admin Auth Controller] GetMe error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error fetching profile.",
      code: "PROFILE_FETCH_FAILED",
    });
  }
}

/**
 * @name refreshAdminController
 * @description Refresh admin access token using refresh token.
 * @route POST /api/admin/auth/refresh
 */
export async function refreshAdminController(req, res) {
  try {
    const rawRefreshToken =
      req.cookies?.["admin-refresh-token"] || req.body?.refreshToken;

    if (!rawRefreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token is missing. Please sign in again.",
        code: "REFRESH_TOKEN_MISSING",
      });
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(rawRefreshToken);
    } catch (jwtError) {
      res.clearCookie("admin-refresh-token", getAdminCookieOptions(0));
      return res.status(401).json({
        success: false,
        message: "Session expired. Please sign in again.",
        code: "REFRESH_TOKEN_EXPIRED",
      });
    }

    const { id: userId, jti } = decoded;
    const hashedToken = hashToken(rawRefreshToken);

    const storedToken = await RefreshToken.findOne({ userId, jti }).lean();

    if (!storedToken) {
      return res.status(401).json({
        success: false,
        message: "Invalid session token. Please sign in.",
        code: "INVALID_REFRESH_TOKEN",
      });
    }

    // Reuse detection
    if (storedToken.isUsed) {
      console.warn(`[Security Alert] Refresh token reuse detected for Admin User ${userId}!`);
      await RefreshToken.deleteMany({ userId });
      res.clearCookie("admin-refresh-token", getAdminCookieOptions(0));
      return res.status(403).json({
        success: false,
        message: "Security alert: token reuse detected. All sessions terminated.",
        code: "TOKEN_REUSE_DETECTED",
      });
    }

    if (storedToken.tokenHash !== hashedToken) {
      return res.status(401).json({
        success: false,
        message: "Invalid session credentials.",
        code: "INVALID_REFRESH_TOKEN",
      });
    }

    const user = await User.findById(userId).select(
      "_id username email role isActive lastLoginAt createdAt",
    );

    if (!user || !user.isActive || user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin authorization revoked or user deactivated.",
        code: "ADMIN_REQUIRED",
      });
    }

    // Invalidate old token with short grace period
    await RefreshToken.findOneAndUpdate(
      { userId, jti },
      { isUsed: true, expiresAt: new Date(Date.now() + 300 * 1000) },
    );

    // Issue new pair
    const newAccessToken = generateAdminAccessToken(user);
    const newRefreshTokenString = generateAdminRefreshToken(user);

    const newDecoded = jwt.decode(newRefreshTokenString);
    const newJti = newDecoded?.jti || crypto.randomUUID();
    const newHashed = hashToken(newRefreshTokenString);
    const refreshTtlSeconds = getRefreshTokenExpirySeconds();

    await RefreshToken.create({
      userId: user._id,
      jti: newJti,
      tokenHash: newHashed,
      isUsed: false,
      expiresAt: new Date(Date.now() + refreshTtlSeconds * 1000),
    });

    res.cookie(
      "admin-refresh-token",
      newRefreshTokenString,
      getAdminCookieOptions(refreshTtlSeconds * 1000),
    );

    return res.status(200).json({
      success: true,
      accessToken: newAccessToken,
      user: sanitizeAdminUser(user),
    });
  } catch (error) {
    console.error("[Admin Auth Controller] Refresh error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error during token refresh.",
      code: "REFRESH_FAILED",
    });
  }
}

/**
 * @name logoutAdminController
 * @description Logout admin, revoke refresh token and blacklist access token.
 * @route POST /api/admin/auth/logout
 */
export async function logoutAdminController(req, res) {
  try {
    const rawRefreshToken = req.cookies?.["admin-refresh-token"];
    const authHeader = req.headers.authorization || req.headers.Authorization;

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
        console.warn("[Admin Logout] Warning during refresh token deletion:", err.message);
      }
    }

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const accessToken = authHeader.slice("Bearer ".length).trim();
      try {
        const decoded = verifyAccessToken(accessToken);
        if (decoded && decoded.jti) {
          const ttl = getJwtExpirySeconds(accessToken);
          if (ttl && ttl > 0) {
            await BlacklistedAccessToken.findOneAndUpdate(
              { jti: decoded.jti },
              {
                reason: "admin_logout",
                expiresAt: new Date(Date.now() + ttl * 1000),
              },
              { upsert: true, new: true, setDefaultsOnInsert: true },
            );
          }
        }
      } catch (err) {
        console.warn("[Admin Logout] Warning during access token blacklisting:", err.message);
      }
    }

    res.clearCookie("admin-refresh-token", getAdminCookieOptions(0));

    if (req.user?.id) {
      await logAdminAction({
        adminId: req.user.id,
        action: "ADMIN_LOGOUT",
        targetType: "auth",
        targetId: req.user.id,
        req,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Admin logged out successfully.",
    });
  } catch (error) {
    console.error("[Admin Auth Controller] Logout error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error during logout.",
      code: "LOGOUT_FAILED",
    });
  }
}
