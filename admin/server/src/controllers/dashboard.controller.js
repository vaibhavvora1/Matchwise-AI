import User from "../models/user.model.js";
import Feedback, { FEEDBACK_STATUSES, FEEDBACK_TYPES } from "../models/feedback.model.js";
import Activity from "../models/activity.model.js";

/**
 * @name getDashboardStatsController
 * @description Compute real-time dashboard statistics across users and feedback.
 * @route GET /api/admin/dashboard/stats
 */
export async function getDashboardStatsController(req, res) {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Parallel aggregate queries directly against MongoDB
    const [
      userStatsResult,
      feedbackStatsResult,
      ratingDistributionResult,
      typeDistributionResult,
      statusDistributionResult,
      recentFeedback,
      recentUsers,
      todayFeedbackCount,
      weeklyFeedbackTrend,
      recentActivities,
      todayActivitiesCount,
    ] = await Promise.all([
      // 1. User stats
      User.aggregate([
        {
          $group: {
            _id: null,
            totalUsers: { $sum: 1 },
            activeUsers: { $sum: { $cond: ["$isActive", 1, 0] } },
            adminCount: { $sum: { $cond: [{ $eq: ["$role", "admin"] }, 1, 0] } },
          },
        },
      ]),

      // 2. Feedback global stats
      Feedback.aggregate([
        {
          $group: {
            _id: null,
            totalFeedback: { $sum: 1 },
            averageRating: { $avg: "$rating" },
            pendingCount: {
              $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
            },
            approvedCount: {
              $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] },
            },
            rejectedCount: {
              $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] },
            },
            bugCount: {
              $sum: { $cond: [{ $eq: ["$type", "bug"] }, 1, 0] },
            },
            fiveStarCount: {
              $sum: { $cond: [{ $eq: ["$rating", 5] }, 1, 0] },
            },
          },
        },
      ]),

      // 3. Rating breakdown (1-5 stars)
      Feedback.aggregate([
        {
          $group: {
            _id: "$rating",
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: -1 } },
      ]),

      // 4. Feedback type distribution
      Feedback.aggregate([
        {
          $group: {
            _id: "$type",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ]),

      // 5. Feedback status distribution
      Feedback.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),

      // 6. 5 Most recent feedback submissions
      Feedback.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("userId", "username email")
        .select("_id rating type message status createdAt userId")
        .lean(),

      // 7. 5 Most recent users registered
      User.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("_id username email role isActive createdAt lastLoginAt")
        .lean(),

      // 8. Feedback submitted today
      Feedback.countDocuments({ createdAt: { $gte: todayStart } }),

      // 9. Feedback submitted in the last 7 days grouped by date
      Feedback.aggregate([
        { $match: { createdAt: { $gte: sevenDaysAgo } } },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
            count: { $sum: 1 },
            avgRating: { $avg: "$rating" },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // 10. 8 Most recent user activities
      Activity.find()
        .sort({ createdAt: -1 })
        .limit(8)
        .populate("userId", "username email isActive role")
        .lean(),

      // 11. Total activities today
      Activity.countDocuments({ createdAt: { $gte: todayStart } }),
    ]);

    const userStats = userStatsResult[0] || {
      totalUsers: 0,
      activeUsers: 0,
      adminCount: 0,
    };

    const feedbackStats = feedbackStatsResult[0] || {
      totalFeedback: 0,
      averageRating: 0,
      pendingCount: 0,
      approvedCount: 0,
      rejectedCount: 0,
      bugCount: 0,
      fiveStarCount: 0,
    };

    // Format rating breakdown
    const ratingBreakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratingDistributionResult.forEach((item) => {
      if (item._id >= 1 && item._id <= 5) {
        ratingBreakdown[item._id] = item.count;
      }
    });

    // Format type distribution
    const typeBreakdown = {};
    FEEDBACK_TYPES.forEach((type) => {
      typeBreakdown[type] = 0;
    });
    typeDistributionResult.forEach((item) => {
      typeBreakdown[item._id] = item.count;
    });

    // Format status distribution
    const statusBreakdown = { pending: 0, approved: 0, rejected: 0 };
    statusDistributionResult.forEach((item) => {
      statusBreakdown[item._id] = item.count;
    });

    const recentActivitiesList = (recentActivities || []).map((a) => ({
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
          }
        : null,
    }));

    return res.status(200).json({
      success: true,
      stats: {
        users: {
          total: userStats.totalUsers,
          active: userStats.activeUsers,
          admins: userStats.adminCount,
        },
        feedback: {
          total: feedbackStats.totalFeedback,
          today: todayFeedbackCount,
          averageRating: Number(feedbackStats.averageRating?.toFixed(1) || 0),
          pending: feedbackStats.pendingCount,
          approved: feedbackStats.approvedCount,
          rejected: feedbackStats.rejectedCount,
          bugReports: feedbackStats.bugCount,
          fiveStar: feedbackStats.fiveStarCount,
        },
        activities: {
          today: todayActivitiesCount || 0,
        },
        breakdowns: {
          ratings: ratingBreakdown,
          types: typeBreakdown,
          statuses: statusBreakdown,
        },
        trends: {
          weekly: weeklyFeedbackTrend.map((t) => ({
            date: t._id,
            count: t.count,
            avgRating: Number(t.avgRating?.toFixed(1) || 0),
          })),
        },
        recentFeedback: recentFeedback.map((f) => ({
          id: f._id,
          rating: f.rating,
          type: f.type,
          message: f.message,
          status: f.status,
          createdAt: f.createdAt,
          user: f.userId
            ? {
                id: f.userId._id,
                username: f.userId.username,
                email: f.userId.email,
              }
            : null,
        })),
        recentUsers: recentUsers.map((u) => ({
          id: u._id,
          username: u.username,
          email: u.email,
          role: u.role,
          isActive: u.isActive,
          createdAt: u.createdAt,
          lastLoginAt: u.lastLoginAt,
        })),
        recentActivities: recentActivitiesList,
      },
    });
  } catch (error) {
    console.error("[Dashboard Controller] Stats aggregation error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error aggregating dashboard data.",
      code: "DASHBOARD_STATS_FAILED",
    });
  }
}
