import mongoose from "mongoose";

const appUsageSchema = new mongoose.Schema(
    {
        key: {
            type: String, // e.g. "2026-07-13"
            required: true,
        },
        type: {
            type: String, // e.g. "job_search_daily
            required: true,
        },
        count: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true },
);

// One document per (key, type) pair — e.g. one per day per usage type
appUsageSchema.index({ key: 1, type: 1 }, { unique: true });

const AppUsage = mongoose.model("AppUsage", appUsageSchema);

export default AppUsage;