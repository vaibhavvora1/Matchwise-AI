import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: [true, "Username already exists"],
      trim: true,
      index: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: [true, "Email already exists"],
      trim: true,
      lowercase: true,
      index: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email"],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    lastLoginAt: {
      type: Date,
      default: null,
    },

    loginCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    jobSearchCount: {
      type: Number,
      default: 0,
    },

    jobSearchResetAt: {
      type: Date,
      default: null,
    },

    previousWork: [
      {
        title: { type: String, trim: true },
        company: { type: String, trim: true },
        period: { type: String, trim: true },
        description: { type: String, trim: true },
      },
    ],
  },
  {
    timestamps: true,
  },
);

userSchema.statics.getUserStats = async function () {
  const [stats] = await this.aggregate([
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        activeUsers: { $sum: { $cond: ["$isActive", 1, 0] } },
        adminUsers: { $sum: { $cond: [{ $eq: ["$role", "admin"] }, 1, 0] } },
      },
    },
    {
      $project: {
        _id: 0,
        totalUsers: 1,
        activeUsers: 1,
        adminUsers: 1,
      },
    },
  ]);

  return (
    stats || {
      totalUsers: 0,
      activeUsers: 0,
      adminUsers: 0,
    }
  );
};

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
