import crypto from "crypto";
import Feedback, {
  FEEDBACK_TYPES,
} from "../models/feedback.model.js";
import usermodel from "../models/user.model.js";
import logActivity from "../services/activity.service.js";

const MIN_MESSAGE_LENGTH = 10;
const MAX_MESSAGE_LENGTH = 2000;
const PUBLIC_REVIEW_LIMIT = 10;

const sendError = (res, statusCode, message, code, details) => {
  return res.status(statusCode).json({
    success: false,
    message,
    code,
    ...(details ? { details } : {}),
  });
};

const normalizeMessage = (value) => {
  return String(value ?? "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/\n{4,}/g, "\n\n\n")
    .trim();
};

const hashMessage = ({ rating, type, message }) => {
  return crypto
    .createHash("sha256")
    .update(`${rating}:${type}:${message.toLowerCase()}`)
    .digest("hex");
};

const parsePageLimit = (query, defaultLimit) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(query.limit, 10) || defaultLimit));
  return { page, limit };
};

const validateFeedbackPayload = (body) => {
  const rating = Number(body?.rating);
  const type = String(body?.type || "").trim();
  const message = normalizeMessage(body?.message);
  const errors = [];

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    errors.push({ field: "rating", message: "Choose a rating from 1 to 5." });
  }

  if (!FEEDBACK_TYPES.includes(type)) {
    errors.push({ field: "type", message: "Choose a valid feedback type." });
  }

  if (message.length < MIN_MESSAGE_LENGTH) {
    errors.push({
      field: "message",
      message: `Feedback must be at least ${MIN_MESSAGE_LENGTH} characters.`,
    });
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    errors.push({
      field: "message",
      message: `Feedback must be ${MAX_MESSAGE_LENGTH} characters or fewer.`,
    });
  }

  return {
    data: { rating, type, message },
    errors,
  };
};

const toPublicReviewDto = (feedback) => ({
  id: feedback._id,
  rating: feedback.rating,
  type: feedback.type,
  message: feedback.message,
  displayName: feedback.userId?.username || "Anonymous",
  createdAt: feedback.createdAt,
});

/**
 * POST /api/feedback
 * Submit new feedback. Works for both authenticated users and anonymous visitors.
 * The user ID is determined server-side from req.user (populated by optionalAuthMiddleware).
 * The frontend must NOT send a userId in the body — always trust req.user.
 */
export async function createFeedbackController(req, res) {
  try {
    const { data, errors } = validateFeedbackPayload(req.body);

    if (errors.length > 0) {
      return sendError(
        res,
        400,
        "Please fix the highlighted feedback fields.",
        "VALIDATION_ERROR",
        errors,
      );
    }

    // Verify authenticated user if a token was provided (via optionalAuthMiddleware)
    let user = null;
    if (req.user?.id) {
      user = await usermodel
        .findById(req.user.id)
        .select("_id username isActive")
        .lean();

      // If the account lookup fails, continue as anonymous rather than erroring
      // (the account may have been deactivated, but the feedback is still valid)
      if (!user || !user.isActive) {
        user = null;
      }
    }

    const messageHash = hashMessage(data);
    const duplicateWindowStart = new Date(Date.now() - 2 * 60 * 1000);
    const duplicateFilter = {
      rating: data.rating,
      type: data.type,
      messageHash,
      createdAt: { $gte: duplicateWindowStart },
      userId: user?._id || null,
    };

    const duplicate = await Feedback.findOne(duplicateFilter)
      .select("_id")
      .lean();

    if (duplicate) {
      return sendError(
        res,
        409,
        "That feedback was already submitted. Thank you.",
        "DUPLICATE_FEEDBACK",
      );
    }

    const feedback = await Feedback.create({
      userId: user?._id || null,
      rating: data.rating,
      type: data.type,
      message: data.message,
      messageHash,
      status: "pending",
    });

    if (user?._id) {
      logActivity({
        userId: user._id,
        eventType: "FEEDBACK_SUBMITTED",
        description: `Submitted a ${data.rating}-star feedback for category "${data.type.replace("_", " ")}"`,
        metadata: {
          feedbackId: feedback._id,
          rating: data.rating,
          type: data.type,
          excerpt: data.message.slice(0, 100),
        },
        req,
      });
    }

    return res.status(201).json({
      success: true,
      message: "Thanks for your feedback!",
      feedback: {
        id: feedback._id,
        status: feedback.status,
        createdAt: feedback.createdAt,
      },
    });
  } catch (error) {
    console.error("[Feedback Controller] Create error:", error.message);
    return sendError(
      res,
      500,
      "Couldn't submit your feedback. Please try again.",
      "FEEDBACK_CREATE_FAILED",
    );
  }
}

/**
 * GET /api/feedback/reviews
 * Public endpoint — returns approved reviews for display on the landing page.
 */
export async function getApprovedReviewsController(req, res) {
  try {
    const { page, limit } = parsePageLimit(req.query, PUBLIC_REVIEW_LIMIT);

    const filter = { status: "approved" };
    const [reviews, total] = await Promise.all([
      Feedback.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("userId", "username")
        .lean(),
      Feedback.countDocuments(filter),
    ]);

    // Compute average rating from approved reviews for the landing page
    const ratingAgg = await Feedback.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          fiveStarReviews: { $sum: { $cond: [{ $eq: ["$rating", 5] }, 1, 0] } },
        },
      },
    ]);
    const stats = ratingAgg[0] || { averageRating: 0, fiveStarReviews: 0 };

    return res.status(200).json({
      success: true,
      reviews: reviews.map(toPublicReviewDto),
      stats: {
        totalReviews: total,
        averageRating: Math.round((stats.averageRating || 0) * 10) / 10,
        fiveStarReviews: stats.fiveStarReviews || 0,
      },
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("[Feedback Controller] Public reviews error:", error.message);
    return sendError(
      res,
      500,
      "Unable to load reviews right now.",
      "REVIEWS_FETCH_FAILED",
    );
  }
}
