import { verifyAccessToken } from "../utils/token.utils.js";
import BlacklistedAccessToken from "../models/blacklistedAccessToken.model.js";
import usermodel from "../models/user.model.js";

const sendAuthError = (res, statusCode, message, code) => {
  return res.status(statusCode).json({ success: false, message, code });
};

/**
 * Express middleware to authenticate requests using an Access Token in the Authorization header.
 * If the access token is valid, it attaches the decoded user payload to `req.user` and proceeds.
 * If the token is expired, it returns 401 with a specific message so the frontend can trigger refresh.
 *
 * @param {import("express").Request} req - Express request object
 * @param {import("express").Response} res - Express response object
 * @param {import("express").NextFunction} next - Express next middleware function
 * @returns {void}
 */
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return sendAuthError(
        res,
        401,
        "Access token is missing or malformed. Format must be 'Bearer <token>'.",
        "UNAUTHORIZED",
      );
    }

    const token = authHeader.slice("Bearer ".length).trim();
    if (!token) {
      return sendAuthError(
        res,
        401,
        "Access token is missing or malformed. Format must be 'Bearer <token>'.",
        "UNAUTHORIZED",
      );
    }

    try {
      const decoded = verifyAccessToken(token);
      if (decoded && decoded.jti) {
        const blacklisted = await BlacklistedAccessToken.findOne({
          jti: decoded.jti,
        }).lean();
        if (blacklisted) {
          return sendAuthError(
            res,
            401,
            "This access token has been revoked.",
            "ACCESS_TOKEN_REVOKED",
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
          "Access token has expired",
          "ACCESS_TOKEN_EXPIRED",
        );
      }

      return sendAuthError(
        res,
        401,
        "Invalid access token",
        "INVALID_ACCESS_TOKEN",
      );
    }
  } catch (error) {
    console.error("[Auth Middleware] Error in authentication:", error.message);
    return sendAuthError(
      res,
      500,
      "Internal server error during authentication",
      "AUTHENTICATION_FAILED",
    );
  }
};

export const optionalAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;

    // No auth header — proceed anonymously, no error
    if (!authHeader) {
      return next();
    }

    // Malformed header format — proceed anonymously rather than blocking
    // This is "optional" auth: a bad/expired/missing token should never block the request
    if (!authHeader.startsWith("Bearer ")) {
      return next();
    }

    const token = authHeader.slice("Bearer ".length).trim();
    if (!token) {
      return next();
    }

    try {
      const decoded = verifyAccessToken(token);

      // Only reject if token is actively blacklisted (explicit revocation, e.g. logout)
      if (decoded?.jti) {
        const blacklisted = await BlacklistedAccessToken.findOne({
          jti: decoded.jti,
        }).lean();
        if (blacklisted) {
          // Revoked token — proceed anonymously rather than erroring (optional auth)
          return next();
        }
      }

      req.user = decoded;
    } catch {
      // Token is expired, invalid, or tampered — proceed anonymously
      // The frontend interceptor will refresh the token and retry if needed,
      // but we never block this optional-auth endpoint on a token failure
    }

    return next();
  } catch (error) {
    // Unexpected server error — still proceed rather than blocking the request
    console.error("[Auth Middleware] Unexpected error in optionalAuth:", error.message);
    return next();
  }
};

export default authMiddleware;
