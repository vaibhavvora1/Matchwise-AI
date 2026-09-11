import mongoose from "mongoose";

const blacklistedAccessTokenSchema = new mongoose.Schema(
  {
    jti: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    reason: {
      type: String,
      default: "logout",
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 },
    },
    createdAt: {
      type: Date,
      default: () => new Date(),
    },
  },
  {
    timestamps: false,
  },
);

const BlacklistedAccessToken =
  mongoose.models.BlacklistedAccessToken ||
  mongoose.model("BlacklistedAccessToken", blacklistedAccessTokenSchema);

export default BlacklistedAccessToken;
