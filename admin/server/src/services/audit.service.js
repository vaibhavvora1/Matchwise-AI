import AuditLog from "../models/auditLog.model.js";

/**
 * Log an administrative event in MongoDB.
 *
 * @param {Object} params
 * @param {string} params.adminId - ID of the admin performing the action
 * @param {string} params.action - Action identifier (e.g. "LOGIN_SUCCESS", "FEEDBACK_STATUS_CHANGE")
 * @param {string} params.targetType - "feedback" | "user" | "auth" | "system"
 * @param {any} [params.targetId] - Target entity ID
 * @param {Object} [params.details] - Additional contextual details (no secrets)
 * @param {import("express").Request} [req] - Express request object for IP and User-Agent extraction
 */
export const logAdminAction = async ({
  adminId,
  action,
  targetType,
  targetId = null,
  details = {},
  req = null,
}) => {
  try {
    const ipAddress =
      req?.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      req?.socket?.remoteAddress ||
      "127.0.0.1";

    const userAgent = req?.headers["user-agent"] || "";

    // Sanitize details: strip out any potential passwords, hashes, tokens, or authorization headers
    const sanitizedDetails = { ...details };
    delete sanitizedDetails.password;
    delete sanitizedDetails.token;
    delete sanitizedDetails.accessToken;
    delete sanitizedDetails.refreshToken;
    delete sanitizedDetails.authorization;

    await AuditLog.create({
      adminId,
      action,
      targetType,
      targetId,
      details: sanitizedDetails,
      ipAddress,
      userAgent,
    });
  } catch (error) {
    // Non-blocking error logging
    console.error("[Admin Audit Service] Error recording audit log:", error.message);
  }
};
