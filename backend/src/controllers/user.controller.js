import usermodel from "../models/user.model.js";
import logActivity from "../services/activity.service.js";
import { ACTIVITY_EVENT_TYPES } from "../models/activity.model.js";

/**
 * @name getUserProfilecontroller
 * @description Fetch and return profile details for the currently logged-in user.
 *              Optimized database query selecting only necessary fields.
 * @route GET /api/user/profile
 * @access Private (Requires valid Access Token)
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns {Promise<void>}
 */
export async function getUserProfilecontroller(req, res) {
  try {
    const userId = req.user.id;

    const user = await usermodel
      .findById(userId)
      .select("username email isActive role createdAt lastLoginAt loginCount previousWork");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User profile not found.",
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isActive: user.isActive,
        role: user.role,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
        loginCount: user.loginCount,
        previousWork: user.previousWork || [],
      },
    });
  } catch (error) {
    console.error("[User Controller] Profile fetch error:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal server error fetching user profile",
    });
  }
}

/**
 * @name recordUserActivityController
 * @description Endpoint for authenticated client-side activity recording (e.g. PAGE_VIEWED, MATCH_VIEWED).
 * @route POST /api/user/activity
 * @access Private
 */
export async function recordUserActivityController(req, res) {
  try {
    const userId = req.user.id;
    const { eventType, description, metadata } = req.body || {};

    if (!eventType || !description) {
      return res.status(400).json({
        success: false,
        message: "eventType and description are required.",
      });
    }

    if (!ACTIVITY_EVENT_TYPES.includes(eventType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid activity eventType.",
      });
    }

    const activity = await logActivity({
      userId,
      eventType,
      description: String(description).slice(0, 500),
      metadata: metadata || {},
      req,
    });

    return res.status(201).json({
      success: true,
      activity: activity
        ? {
            id: activity._id,
            eventType: activity.eventType,
            createdAt: activity.createdAt,
          }
        : null,
    });
  } catch (error) {
    console.error("[User Controller] Record activity error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to record user activity.",
    });
  }
}

