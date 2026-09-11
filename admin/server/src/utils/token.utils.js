import jwt from "jsonwebtoken";
import crypto from "crypto";

const DEFAULT_ACCESS_TOKEN_EXPIRY = "30m";
const DEFAULT_REFRESH_TOKEN_EXPIRY = "7d";

const parseExpiryToSeconds = (value) => {
  const match = String(value)
    .trim()
    .match(/^(\d+)([dhm])$/i);
  if (!match) return null;

  const amount = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();
  const multipliers = { m: 60, h: 3600, d: 86400 };

  return amount * multipliers[unit];
};

export const getAccessTokenExpiry = () => {
  return process.env.ACCESS_TOKEN_EXPIRY || DEFAULT_ACCESS_TOKEN_EXPIRY;
};

export const getRefreshTokenExpiry = () => {
  return process.env.REFRESH_TOKEN_EXPIRY || DEFAULT_REFRESH_TOKEN_EXPIRY;
};

export const getRefreshTokenExpirySeconds = () => {
  const expiry = getRefreshTokenExpiry();
  const seconds = parseExpiryToSeconds(expiry);
  return seconds || 7 * 24 * 60 * 60;
};

export const generateAdminAccessToken = (user) => {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) {
    throw new Error(
      "JWT_ACCESS_SECRET is not configured in environment variables.",
    );
  }

  const expiry = getAccessTokenExpiry();
  const jti = crypto.randomUUID();

  return jwt.sign(
    {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role || "admin",
      jti,
    },
    secret,
    { expiresIn: expiry },
  );
};

export const generateAdminRefreshToken = (user) => {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) {
    throw new Error(
      "JWT_REFRESH_SECRET is not configured in environment variables.",
    );
  }

  const jti = crypto.randomUUID();
  const expiry = getRefreshTokenExpiry();

  return jwt.sign({ id: user._id, role: user.role, jti }, secret, {
    expiresIn: expiry,
  });
};

export const hashToken = (token) => {
  if (!token) {
    throw new Error("Token string is required for hashing");
  }
  return crypto.createHash("sha256").update(token).digest("hex");
};

export const verifyAccessToken = (token) => {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) {
    throw new Error(
      "JWT_ACCESS_SECRET is not configured in environment variables.",
    );
  }
  return jwt.verify(token, secret);
};

export const verifyRefreshToken = (token) => {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) {
    throw new Error(
      "JWT_REFRESH_SECRET is not configured in environment variables.",
    );
  }
  return jwt.verify(token, secret);
};

export const getJwtExpirySeconds = (token) => {
  const decoded = jwt.decode(token);
  if (!decoded || typeof decoded.exp !== "number") {
    return null;
  }
  return Math.max(0, decoded.exp - Math.floor(Date.now() / 1000));
};

export const getAdminCookieOptions = (maxAgeMs) => {
  const isProduction = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "strict" : "lax",
    maxAge: maxAgeMs,
    path: "/",
  };
};
