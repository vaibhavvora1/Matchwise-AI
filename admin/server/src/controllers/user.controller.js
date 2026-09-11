import mongoose from "mongoose";
import User from "../models/user.model.js";
import Feedback from "../models/feedback.model.js";
import Activity from "../models/activity.model.js";
import { logAdminAction } from "../services/audit.service.js";

const escapeRegex = (value) => {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const parsePagination = (query, defaultLimit = 15) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(query.limit, 10) || defaultLimit));
  return { page, limit };
};

const toAdminUserDto = (u) => ({
  id: u._id,
  username: u.username,
  email: u.email,
  role: u.role,
  isActive: u.isActive,
  lastLoginAt: u.lastLoginAt,
  loginCount: u.loginCount || 0,
  jobSearchCount: u.jobSearchCount || 0,
  createdAt: u.createdAt,
  updatedAt: u.updatedAt,
});

/**
 * @name listUsersController
 * @description List users with search, role/status filter, and pagination.
 * @route GET /api/admin/users
 */
export async function listUsersController(req, res) {
  try {
    const { page, limit } = parsePagination(req.query, 15);
    const search = String(req.query.search || "").trim();
    const role = String(req.query.role || "").trim();
    const status = String(req.query.status || "").trim();
    const sortBy = String(req.query.sortBy || "createdAt").trim();
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

    const filter = {};

    if (["user", "admin"].includes(role)) {
      filter.role = role;
    }

    if (status === "active") {
      filter.isActive = true;
    } else if (status === "inactive") {
      filter.isActive = false;
    }

    if (search) {
      const safeSearch = escapeRegex(search);
      filter.$or = [
        { username: { $regex: safeSearch, $options: "i" } },
        { email: { $regex: safeSearch, $options: "i" } },
      ];
    }

    const validSortFields = [
      "createdAt",
      "username",
      "email",
      "role",
      "lastLoginAt",
      "loginCount",
    ];
    const sortField = validSortFields.includes(sortBy) ? sortBy : "createdAt";

    const [users, total] = await Promise.all([
      User.find(filter)
        .sort({ [sortField]: sortOrder })
        .skip((page - 1) * limit)
        .limit(limit)
        .select("-password")
        .lean(),
      User.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      users: users.map(toAdminUserDto),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("[User Controller] List error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error loading users.",
      code: "USERS_FETCH_FAILED",
    });
  }
}

/**
 * @name getUserByIdController
 * @description Get single user details along with activity summary.
 * @route GET /api/admin/users/:id
 */
export async function getUserByIdController(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format.",
        code: "INVALID_ID",
      });
    }

    const user = await User.findById(id).select("-password").lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
        code: "NOT_FOUND",
      });
    }

    // Fetch user's feedback, activity history, and counts in parallel
    const [
      feedbackCount,
      userFeedback,
      activityCount,
      recentActivities,
      matchActivityCount,
    ] = await Promise.all([
      Feedback.countDocuments({ userId: id }),
      Feedback.find({ userId: id })
        .sort({ createdAt: -1 })
        .limit(20)
        .select("_id rating type message status createdAt")
        .lean(),
      Activity.countDocuments({ userId: id }),
      Activity.find({ userId: id })
        .sort({ createdAt: -1 })
        .limit(20)
        .lean(),
      Activity.countDocuments({
        userId: id,
        eventType: {
          $in: [
            "MATCH_SEARCHED",
            "MATCH_VIEWED",
            "MATCH_ACCEPTED",
            "MATCH_REJECTED",
            "RESUME_ANALYZED",
            "INTERVIEW_REPORT_GENERATED",
          ],
        },
      }),
    ]);

    return res.status(200).json({
      success: true,
      user: {
        ...toAdminUserDto(user),
        feedbackCount,
        activityCount,
        matchActivityCount,
        recentFeedback: userFeedback.map((f) => ({
          id: f._id,
          rating: f.rating,
          type: f.type,
          message: f.message,
          status: f.status,
          createdAt: f.createdAt,
        })),
        recentActivities: recentActivities.map((a) => ({
          id: a._id,
          eventType: a.eventType,
          description: a.description,
          metadata: a.metadata || {},
          ipAddress: a.ipAddress || "127.0.0.1",
          userAgent: a.userAgent || "",
          createdAt: a.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error("[User Controller] Fetch by ID error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error fetching user details.",
      code: "USER_FETCH_FAILED",
    });
  }
}

/**
 * @name updateUserStatusController
 * @description Toggle active / deactivated status of a user.
 * @route PATCH /api/admin/users/:id/status
 */
export async function updateUserStatusController(req, res) {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format.",
        code: "INVALID_ID",
      });
    }

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "'isActive' boolean is required in request body.",
        code: "INVALID_PAYLOAD",
      });
    }

    // Prevent admin from deactivating their own account
    if (id === req.admin._id.toString() && isActive === false) {
      return res.status(400).json({
        success: false,
        message: "You cannot deactivate your own admin account.",
        code: "SELF_DEACTIVATION_FORBIDDEN",
      });
    }

    const updated = await User.findByIdAndUpdate(
      id,
      { isActive },
      { new: true },
    )
      .select("-password")
      .lean();

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
        code: "NOT_FOUND",
      });
    }

    await logAdminAction({
      adminId: req.admin._id,
      action: isActive ? "USER_ACTIVATED" : "USER_DEACTIVATED",
      targetType: "user",
      targetId: id,
      details: { isActive },
      req,
    });

    return res.status(200).json({
      success: true,
      message: `User account has been ${isActive ? "activated" : "deactivated"}.`,
      user: toAdminUserDto(updated),
    });
  } catch (error) {
    console.error("[User Controller] Status update error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error updating user status.",
      code: "USER_UPDATE_FAILED",
    });
  }
}

/**
 * @name updateUserRoleController
 * @description Change user role between 'user' and 'admin'.
 * @route PATCH /api/admin/users/:id/role
 */
export async function updateUserRoleController(req, res) {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format.",
        code: "INVALID_ID",
      });
    }

    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Role must be 'user' or 'admin'.",
        code: "INVALID_ROLE",
      });
    }

    // Prevent admin from demoting themselves to avoid accidental admin lockout
    if (id === req.admin._id.toString() && role !== "admin") {
      return res.status(400).json({
        success: false,
        message: "You cannot remove your own admin privileges.",
        code: "SELF_DEMOTION_FORBIDDEN",
      });
    }

    const updated = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true },
    )
      .select("-password")
      .lean();

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
        code: "NOT_FOUND",
      });
    }

    await logAdminAction({
      adminId: req.admin._id,
      action: "USER_ROLE_CHANGED",
      targetType: "user",
      targetId: id,
      details: { newRole: role },
      req,
    });

    return res.status(200).json({
      success: true,
      message: `User role updated to '${role}'.`,
      user: toAdminUserDto(updated),
    });
  } catch (error) {
    console.error("[User Controller] Role update error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error updating user role.",
      code: "USER_ROLE_UPDATE_FAILED",
    });
  }
}
