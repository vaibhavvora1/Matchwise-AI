import mongoose from "mongoose";

export const ACTIVITY_EVENT_TYPES = [
  "USER_REGISTERED",
  "USER_LOGIN",
  "USER_LOGOUT",
  "USER_LOGOUT_ALL",
  "PROFILE_UPDATED",
  "RESUME_ANALYZED",
  "INTERVIEW_REPORT_GENERATED",
  "MATCH_SEARCHED",
  "MATCH_VIEWED",
  "MATCH_ACCEPTED",
  "MATCH_REJECTED",
  "FEEDBACK_SUBMITTED",
  "PAGE_VIEWED",
  "FEATURE_USED",
];

const activitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    eventType: {
      type: String,
      enum: ACTIVITY_EVENT_TYPES,
      required: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
      default: "127.0.0.1",
    },
    userAgent: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

// High-efficiency compound indexes
activitySchema.index({ createdAt: -1 });
activitySchema.index({ userId: 1, createdAt: -1 });
activitySchema.index({ eventType: 1, createdAt: -1 });
activitySchema.index({ userId: 1, eventType: 1, createdAt: -1 });

const Activity =
  mongoose.models.Activity || mongoose.model("Activity", activitySchema);

export default Activity;
