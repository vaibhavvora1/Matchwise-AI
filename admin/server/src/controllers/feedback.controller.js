import mongoose from "mongoose";
import Feedback, {
  FEEDBACK_STATUSES,
  FEEDBACK_TYPES,
} from "../models/feedback.model.js";
import User from "../models/user.model.js";
import { broadcastAdminEvent } from "../services/socket.service.js";
import { logAdminAction } from "../services/audit.service.js";

const escapeRegex = (value) => {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const parsePagination = (query, defaultLimit = 15) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(query.limit, 10) || defaultLimit));
  return { page, limit };
};

const toAdminFeedbackDto = (f) => ({
  id: f._id,
  rating: f.rating,
  type: f.type,
  message: f.message,
  status: f.status,
  createdAt: f.createdAt,
  updatedAt: f.updatedAt,
  moderatedAt: f.moderatedAt,
  moderatedBy: f.moderatedBy
    ? {
        id: f.moderatedBy._id,
        username: f.moderatedBy.username,
        email: f.moderatedBy.email,
      }
    : null,
  user: f.userId
    ? {
        id: f.userId._id,
        username: f.userId.username,
        email: f.userId.email,
        isActive: f.userId.isActive,
        role: f.userId.role,
        createdAt: f.userId.createdAt,
      }
    : null,
});

/**
 * @name listFeedbackController
 * @description List feedback with server-side search, filtering, sorting, and pagination.
 * @route GET /api/admin/feedback
 */
export async function listFeedbackController(req, res) {
  try {
    const { page, limit } = parsePagination(req.query, 15);
    const status = String(req.query.status || "").trim();
    const type = String(req.query.type || "").trim();
    const rating = Number(req.query.rating);
    const search = String(req.query.search || "").trim();
    const sortBy = String(req.query.sortBy || "createdAt").trim();
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

    const filter = {};

    if (FEEDBACK_STATUSES.includes(status)) {
      filter.status = status;
    }

    if (FEEDBACK_TYPES.includes(type)) {
      filter.type = type;
    }

    if (Number.isInteger(rating) && rating >= 1 && rating <= 5) {
      filter.rating = rating;
    }

    if (search) {
      const safeSearch = escapeRegex(search);
      // Find users matching search by username or email
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
        { message: { $regex: safeSearch, $options: "i" } },
        ...(userIds.length > 0 ? [{ userId: { $in: userIds } }] : []),
      ];
    }

    // Allowed sort fields
    const validSortFields = ["createdAt", "rating", "status", "type", "updatedAt"];
    const sortField = validSortFields.includes(sortBy) ? sortBy : "createdAt";

    const [items, total] = await Promise.all([
      Feedback.find(filter)
        .sort({ [sortField]: sortOrder })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("userId", "username email isActive role createdAt")
        .populate("moderatedBy", "username email")
        .lean(),
      Feedback.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      feedback: items.map(toAdminFeedbackDto),
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
    console.error("[Feedback Controller] List error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error loading feedback records.",
      code: "FEEDBACK_FETCH_FAILED",
    });
  }
}

/**
 * @name getFeedbackByIdController
 * @description Retrieve full details of a single feedback submission.
 * @route GET /api/admin/feedback/:id
 */
export async function getFeedbackByIdController(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid feedback ID format.",
        code: "INVALID_ID",
      });
    }

    const feedback = await Feedback.findById(id)
      .populate("userId", "username email isActive role createdAt lastLoginAt")
      .populate("moderatedBy", "username email")
      .lean();

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback record not found.",
        code: "NOT_FOUND",
      });
    }

    return res.status(200).json({
      success: true,
      feedback: toAdminFeedbackDto(feedback),
    });
  } catch (error) {
    console.error("[Feedback Controller] Fetch by ID error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error fetching feedback details.",
      code: "FEEDBACK_FETCH_FAILED",
    });
  }
}

/**
 * @name updateFeedbackStatusController
 * @description Update moderation status (pending / approved / rejected).
 * @route PATCH /api/admin/feedback/:id/status
 */
export async function updateFeedbackStatusController(req, res) {
  try {
    const { id } = req.params;
    const status = String(req.body?.status || "").trim();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid feedback ID format.",
        code: "INVALID_ID",
      });
    }

    if (!FEEDBACK_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${FEEDBACK_STATUSES.join(", ")}.`,
        code: "INVALID_STATUS",
      });
    }

    const updated = await Feedback.findByIdAndUpdate(
      id,
      {
        status,
        moderatedBy: req.admin._id,
        moderatedAt: new Date(),
      },
      { new: true },
    )
      .populate("userId", "username email isActive role createdAt")
      .populate("moderatedBy", "username email")
      .lean();

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Feedback record not found.",
        code: "NOT_FOUND",
      });
    }

    const dto = toAdminFeedbackDto(updated);

    // Broadcast real-time update via Socket.IO
    broadcastAdminEvent("FEEDBACK_STATUS_UPDATED", {
      feedbackId: id,
      status,
      feedback: dto,
    });

    // Log admin audit entry
    await logAdminAction({
      adminId: req.admin._id,
      action: "FEEDBACK_STATUS_CHANGE",
      targetType: "feedback",
      targetId: id,
      details: { newStatus: status },
      req,
    });

    return res.status(200).json({
      success: true,
      message: `Feedback status successfully updated to '${status}'.`,
      feedback: dto,
    });
  } catch (error) {
    console.error("[Feedback Controller] Status update error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error updating feedback status.",
      code: "FEEDBACK_UPDATE_FAILED",
    });
  }
}

/**
 * @name deleteFeedbackController
 * @description Delete a feedback submission.
 * @route DELETE /api/admin/feedback/:id
 */
export async function deleteFeedbackController(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid feedback ID format.",
        code: "INVALID_ID",
      });
    }

    const deleted = await Feedback.findByIdAndDelete(id).lean();

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Feedback record not found.",
        code: "NOT_FOUND",
      });
    }

    // Broadcast real-time delete event via Socket.IO
    broadcastAdminEvent("FEEDBACK_DELETED", { feedbackId: id });

    // Log admin audit entry
    await logAdminAction({
      adminId: req.admin._id,
      action: "FEEDBACK_DELETED",
      targetType: "feedback",
      targetId: id,
      req,
    });

    return res.status(200).json({
      success: true,
      message: "Feedback successfully deleted.",
    });
  } catch (error) {
    console.error("[Feedback Controller] Delete error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error deleting feedback.",
      code: "FEEDBACK_DELETE_FAILED",
    });
  }
}
