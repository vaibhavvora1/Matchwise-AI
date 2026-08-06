import { verifyAccessToken } from "../utils/token.utils.js";
import BlacklistedAccessToken from "../models/blacklistedAccessToken.model.js";

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

export default authMiddleware;
