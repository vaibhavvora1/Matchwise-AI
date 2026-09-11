import mongoose from "mongoose";

const analysisHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["ats_resume", "interview_report"],
      required: true,
      index: true,
    },
    resumeName: {
      type: String,
      trim: true,
      default: "Resume Analysis",
    },
    jobTitle: {
      type: String,
      trim: true,
      default: "",
    },
    company: {
      type: String,
      trim: true,
      default: "—",
    },
    matchScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    skills: {
      type: [String],
      default: [],
    },
    reportData: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

analysisHistorySchema.index({ userId: 1, createdAt: -1 });
analysisHistorySchema.index({ userId: 1, type: 1, createdAt: -1 });
analysisHistorySchema.index({ userId: 1, resumeName: "text", jobTitle: "text", company: "text" });

const AnalysisHistory = mongoose.model("AnalysisHistory", analysisHistorySchema);

export default AnalysisHistory;
