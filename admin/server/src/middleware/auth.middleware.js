import { verifyAccessToken } from "../utils/token.utils.js";
import BlacklistedAccessToken from "../models/blacklistedAccessToken.model.js";
import User from "../models/user.model.js";

const sendAuthError = (res, statusCode, message, code) => {
  return res.status(statusCode).json({
    success: false,
    message,
    code,
  });
};

/**
 * Admin Authentication Middleware
 * Extracts JWT token from Authorization header ('Bearer <token>') or from httpOnly cookie.
 * Verifies validity, checks if token was revoked, and attaches decoded payload to req.user.
 */
export const adminAuth = async (req, res, next) => {
  try {
    let token = null;

    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.slice("Bearer ".length).trim();
    } else if (req.cookies && req.cookies["admin-access-token"]) {
      token = req.cookies["admin-access-token"];
    }

    if (!token) {
      return sendAuthError(
        res,
        401,
        "Authentication required. Access token missing.",
        "UNAUTHORIZED",
      );
    }

    try {
      const decoded = verifyAccessToken(token);

      if (decoded && decoded.jti) {
        const isBlacklisted = await BlacklistedAccessToken.findOne({
          jti: decoded.jti,
        }).lean();

        if (isBlacklisted) {
          return sendAuthError(
            res,
            401,
            "This session has been revoked. Please sign in again.",
            "TOKEN_REVOKED",
          );
        }
      }

      req.user = decoded;
      return next();
    } catch (jwtError) {
      if (jwtError.name === "TokenExpiredError") {
        return sendAuthError(
          res,
          401,
          "Session expired. Please sign in again.",
          "ACCESS_TOKEN_EXPIRED",
        );
      }

      return sendAuthError(
        res,
        401,
        "Invalid authentication token.",
        "INVALID_ACCESS_TOKEN",
      );
    }
  } catch (error) {
    console.error("[Admin Auth Middleware] Uncaught error:", error.message);
    return sendAuthError(
      res,
      500,
      "Internal server error during authentication.",
      "AUTHENTICATION_ERROR",
    );
  }
};

/**
 * Admin Role & Status Authorization Middleware
 * Queries database to guarantee that the authenticated account is currently active and has role="admin".
 * Never trusts role sent in headers or payload alone.
 */
export const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return sendAuthError(
        res,
        401,
        "Authentication required.",
        "UNAUTHORIZED",
      );
    }

    const user = await User.findById(req.user.id)
      .select("_id username email role isActive lastLoginAt")
      .lean();

    if (!user) {
      return sendAuthError(
        res,
        401,
        "User account not found.",
        "USER_NOT_FOUND",
      );
    }

    if (!user.isActive) {
      return sendAuthError(
        res,
        403,
        "This account is deactivated. Contact an administrator.",
        "ACCOUNT_DEACTIVATED",
      );
    }

    if (user.role !== "admin") {
      return sendAuthError(
        res,
        403,
        "Access denied. Administrator privileges required.",
        "ADMIN_REQUIRED",
      );
    }

    req.admin = user;
    return next();
  } catch (error) {
    console.error("[Admin Role Middleware] Authorization error:", error.message);
    return sendAuthError(
      res,
      500,
      "Internal server error during authorization.",
      "AUTHORIZATION_ERROR",
    );
  }
};

export default [adminAuth, requireAdmin];
