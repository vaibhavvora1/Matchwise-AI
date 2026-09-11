import Activity from "../models/activity.model.js";

const SENSITIVE_KEYS = new Set([
  "password",
  "newpassword",
  "oldpassword",
  "token",
  "accesstoken",
  "refreshtoken",
  "authorization",
  "cookie",
  "cookies",
  "secret",
  "jwt",
  "csrftoken",
  "creditcard",
]);

/**
 * Sanitizes metadata recursively to prevent logging sensitive secrets, passwords, or tokens.
 *
 * @param {any} data
 * @param {number} depth
 * @returns {any}
 */
const sanitizeMetadata = (data, depth = 0) => {
  if (depth > 4 || data === null || data === undefined) {
    return data;
  }

  if (typeof data !== "object") {
    return data;
  }

  if (Array.isArray(data)) {
    return data.slice(0, 20).map((item) => sanitizeMetadata(item, depth + 1));
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (SENSITIVE_KEYS.has(lowerKey)) {
      sanitized[key] = "[REDACTED]";
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = sanitizeMetadata(value, depth + 1);
    } else if (typeof value === "string" && value.length > 500) {
      sanitized[key] = `${value.slice(0, 500)}... [truncated]`;
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
};

/**
 * Extracts a safe client IP address from an Express request object.
 *
 * @param {import("express").Request} req
 * @returns {string}
 */
const getClientIp = (req) => {
  if (!req) return "127.0.0.1";
  const forwarded = req.headers?.["x-forwarded-for"];
  if (forwarded && typeof forwarded === "string") {
    return forwarded.split(",")[0].trim();
  }
  return req.ip || req.socket?.remoteAddress || "127.0.0.1";
};

/**
 * Logs a user activity event safely and asynchronously.
 * Guaranteed not to throw or interrupt the primary user action.
 *
 * @param {Object} params
 * @param {string|import("mongoose").Types.ObjectId} params.userId - Unique identifier of the authenticated user
 * @param {string} params.eventType - Event type (e.g. USER_LOGIN, FEEDBACK_SUBMITTED)
 * @param {string} params.description - Human-readable explanation of the action
 * @param {Object} [params.metadata] - Optional event metadata (will be cleansed of secrets)
 * @param {import("express").Request} [params.req] - Optional Express request for IP / user-agent
 * @returns {Promise<Activity|null>}
 */
export async function logActivity({
  userId,
  eventType,
  description,
  metadata = {},
  req = null,
}) {
  if (!userId || !eventType || !description) {
    return null;
  }

  try {
    const ipAddress = getClientIp(req);
    const userAgent = req?.headers?.["user-agent"] || "";
    const cleanMetadata = sanitizeMetadata(metadata);

    const activity = await Activity.create({
      userId,
      eventType,
      description: String(description).slice(0, 500),
      metadata: cleanMetadata,
      ipAddress,
      userAgent: String(userAgent).slice(0, 300),
    });

    return activity;
  } catch (error) {
    // Non-blocking log warning — primary transaction continues unhindered
    console.warn(
      `[Activity Logger] Failed to log user activity (${eventType}):`,
      error.message,
    );
    return null;
  }
}

export default logActivity;
