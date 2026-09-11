import mongoose from "mongoose";
import Activity, { ACTIVITY_EVENT_TYPES } from "../models/activity.model.js";
import User from "../models/user.model.js";

const escapeRegex = (value) => {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const parsePagination = (query, defaultLimit = 20) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || defaultLimit));
  return { page, limit };
};

const toAdminActivityDto = (a) => ({
  id: a._id,
  eventType: a.eventType,
  description: a.description,
  metadata: a.metadata || {},
  ipAddress: a.ipAddress || "127.0.0.1",
  userAgent: a.userAgent || "",
  createdAt: a.createdAt,
  user: a.userId
    ? {
        id: a.userId._id,
        username: a.userId.username,
        email: a.userId.email,
        isActive: a.userId.isActive,
        role: a.userId.role,
        createdAt: a.userId.createdAt,
      }
    : null,
});

/**
 * @name listActivitiesController
 * @description List all user activities with server-side search, event type filtering, user filtering, date range, sorting, and pagination.
 * @route GET /api/admin/activity
 * @access Private (Admin only)
 */
export async function listActivitiesController(req, res) {
  try {
    const { page, limit } = parsePagination(req.query, 20);
    const search = String(req.query.search || "").trim();
    const eventType = String(req.query.eventType || "").trim();
    const userId = String(req.query.userId || "").trim();
    const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
    const endDate = req.query.endDate ? new Date(req.query.endDate) : null;
    const sortBy = String(req.query.sortBy || "createdAt").trim();
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

    const filter = {};

    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      filter.userId = new mongoose.Types.ObjectId(userId);
    }

    if (eventType && ACTIVITY_EVENT_TYPES.includes(eventType)) {
      filter.eventType = eventType;
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate && !isNaN(startDate.getTime())) {
        filter.createdAt.$gte = startDate;
      }
      if (endDate && !isNaN(endDate.getTime())) {
        filter.createdAt.$lte = endDate;
      }
    }

    if (search) {
      const safeSearch = escapeRegex(search);
      // Find matching users
      const matchingUsers = await User.find({
        $or: [
          { username: { $regex: safeSearch, $options: "i" } },
          { email: { $regex: safeSearch, $options: "i" } },
        ],
      })
        .select("_id")
        .lean();

      const userIds = matchingUsers.map((u) => u._id);

      filter.$or = [
        { description: { $regex: safeSearch, $options: "i" } },
        ...(userIds.length > 0 ? [{ userId: { $in: userIds } }] : []),
      ];
    }

    const validSortFields = ["createdAt", "eventType"];
    const sortField = validSortFields.includes(sortBy) ? sortBy : "createdAt";

    const [items, total] = await Promise.all([
      Activity.find(filter)
        .sort({ [sortField]: sortOrder })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("userId", "username email isActive role createdAt")
        .lean(),
      Activity.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      activities: items.map(toAdminActivityDto),
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
    console.error("[Activity Controller] List error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error loading activities.",
      code: "ACTIVITY_FETCH_FAILED",
    });
  }
}

/**
 * @name getActivityStatsController
 * @description Compute real-time analytics for user activities.
 * @route GET /api/admin/activity/stats
 * @access Private (Admin only)
 */
export async function getActivityStatsController(req, res) {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [
      totalActivities,
      todayActivities,
      activeUsersLast24h,
      eventBreakdownResult,
      recentActivities,
    ] = await Promise.all([
      // Total activities
      Activity.countDocuments(),

      // Activities today
      Activity.countDocuments({ createdAt: { $gte: todayStart } }),

      // Distinct active users in last 24 hours
      Activity.distinct("userId", { createdAt: { $gte: twentyFourHoursAgo } }),

      // Distribution by eventType
      Activity.aggregate([
        {
          $group: {
            _id: "$eventType",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ]),

      // 10 most recent activities
      Activity.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .populate("userId", "username email isActive role")
        .lean(),
    ]);

    const eventBreakdown = {};
    ACTIVITY_EVENT_TYPES.forEach((type) => {
      eventBreakdown[type] = 0;
    });
    eventBreakdownResult.forEach((item) => {
      eventBreakdown[item._id] = item.count;
    });

    return res.status(200).json({
      success: true,
      stats: {
        totalActivities,
        todayActivities,
        activeUsersCount24h: activeUsersLast24h.length,
        eventBreakdown,
        recentActivities: recentActivities.map(toAdminActivityDto),
      },
    });
  } catch (error) {
    console.error("[Activity Controller] Stats error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error calculating activity stats.",
      code: "ACTIVITY_STATS_FAILED",
    });
  }
}

/**
 * @name getUserActivitiesController
 * @description Get paginated activity timeline for a specific user.
 * @route GET /api/admin/users/:id/activities
 * @access Private (Admin only)
 */
export async function getUserActivitiesController(req, res) {
  try {
    const { id } = req.params;
    const { page, limit } = parsePagination(req.query, 15);
    const eventType = String(req.query.eventType || "").trim();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format.",
        code: "INVALID_ID",
      });
    }

    const filter = { userId: new mongoose.Types.ObjectId(id) };

    if (eventType && ACTIVITY_EVENT_TYPES.includes(eventType)) {
      filter.eventType = eventType;
    }

    const [items, total] = await Promise.all([
      Activity.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Activity.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      activities: items.map(toAdminActivityDto),
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
    console.error("[Activity Controller] User activities error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error fetching user activity timeline.",
      code: "USER_ACTIVITIES_FAILED",
    });
  }
}
