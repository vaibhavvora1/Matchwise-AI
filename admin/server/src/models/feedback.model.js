import mongoose from "mongoose";

export const FEEDBACK_TYPES = [
  "general",
  "bug",
  "feature",
  "ui_ux",
  "job_matching",
  "resume",
  "interview",
  "other",
];

export const FEEDBACK_STATUSES = ["pending", "approved", "rejected"];

const feedbackSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    type: {
      type: String,
      enum: FEEDBACK_TYPES,
      required: true,
      index: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 2000,
    },
    status: {
      type: String,
      enum: FEEDBACK_STATUSES,
      default: "pending",
      index: true,
    },
    messageHash: {
      type: String,
      required: true,
      select: false,
      index: true,
    },
    moderatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    moderatedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

feedbackSchema.index({ status: 1, createdAt: -1 });
feedbackSchema.index({ status: 1, rating: -1, createdAt: -1 });
feedbackSchema.index({ userId: 1, createdAt: -1 });
feedbackSchema.index({ type: 1, rating: 1, createdAt: -1 });
feedbackSchema.index({ message: "text" });

const Feedback = mongoose.models.Feedback || mongoose.model("Feedback", feedbackSchema);

export default Feedback;
