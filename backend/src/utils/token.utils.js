import jwt from "jsonwebtoken";
import crypto from "crypto";

const DEFAULT_ACCESS_TOKEN_EXPIRY = "15m";
const DEFAULT_REFRESH_TOKEN_EXPIRY = "7d";

const parseExpiryToSeconds = (value) => {
  const match = String(value)
    .trim()
    .match(/^(\d+)([dhm])$/i);
  if (!match) {
    return null;
  }

  const amount = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();
  const multipliers = { m: 60, h: 3600, d: 86400 };

  return amount * multipliers[unit];
};

/**
 * Parses and validates the ACCESS_TOKEN_EXPIRY environment variable.
 * Must be between 15 minutes and 45 minutes. Defaults to '15m'.
 *
 * @returns {string} The validated access token expiry string (e.g., '15m', '30m')
 */
export const getAccessTokenExpiry = () => {
  const rawExpiry =
    process.env.ACCESS_TOKEN_EXPIRY || DEFAULT_ACCESS_TOKEN_EXPIRY;

  const match = String(rawExpiry)
    .trim()
    .match(/^(\d+)(m)?$/i);
  if (!match) {
    console.warn(
      `[Token Utils] Invalid ACCESS_TOKEN_EXPIRY value: "${rawExpiry}". Defaulting to "15m".`,
    );
    return DEFAULT_ACCESS_TOKEN_EXPIRY;
  }

  const minutes = parseInt(match[1], 10);
  if (minutes >= 15 && minutes <= 45) {
    return `${minutes}m`;
  }

  console.warn(
    `[Token Utils] ACCESS_TOKEN_EXPIRY must be between 15 and 45 minutes. Received: "${rawExpiry}". Defaulting to "15m".`,
  );
  return DEFAULT_ACCESS_TOKEN_EXPIRY;
};

/**
 * Parses and validates the REFRESH_TOKEN_EXPIRY environment variable.
 * Must be between 7 and 30 days. Defaults to '7d'.
 *
 * @returns {string} The validated refresh token expiry string (e.g., '7d', '30d')
 */
export const getRefreshTokenExpiry = () => {
  const rawExpiry =
    process.env.REFRESH_TOKEN_EXPIRY || DEFAULT_REFRESH_TOKEN_EXPIRY;
  const match = String(rawExpiry)
    .trim()
    .match(/^(\d+)([dhm])$/i);

  if (!match) {
    console.warn(
      `[Token Utils] Invalid REFRESH_TOKEN_EXPIRY value: "${rawExpiry}". Defaulting to "7d".`,
    );
    return DEFAULT_REFRESH_TOKEN_EXPIRY;
  }

  const amount = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();

  if (unit === "d" && amount >= 7 && amount <= 30) {
    return `${amount}d`;
  }

  if (unit === "h" && amount >= 1 && amount <= 720) {
    return `${amount}h`;
  }

  if (unit === "m" && amount >= 1 && amount <= 43200) {
    return `${amount}m`;
  }

  console.warn(
    `[Token Utils] REFRESH_TOKEN_EXPIRY must be between 7 and 30 days. Received: "${rawExpiry}". Defaulting to "7d".`,
  );
  return DEFAULT_REFRESH_TOKEN_EXPIRY;
};

/**
 * Returns the refresh token TTL in seconds for Redis and cookie expiry.
 *
 * @returns {number} The refresh token lifetime in seconds
 */
export const getRefreshTokenExpirySeconds = () => {
  const expiry = getRefreshTokenExpiry();
  const seconds = parseExpiryToSeconds(expiry);

  if (!seconds) {
    return 7 * 24 * 60 * 60;
  }

  return seconds;
};

/**
 * Generates a short-lived JSON Web Token for user authorization.
 *
 * @param {Object} user - The user object
 * @param {string} user._id - The user's database ID
 * @param {string} user.username - The user's username
 * @param {string} user.email - The user's email
 * @returns {string} Signed access token
 */
export const generateAccessToken = (user) => {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) {
    throw new Error(
      "JWT_ACCESS_SECRET is not configured in environment variables.",
    );
  }

  const expiry = getAccessTokenExpiry();
  const jti = crypto.randomUUID();

  return jwt.sign(
    { id: user._id, username: user.username, email: user.email, jti },
    secret,
    { expiresIn: expiry },
  );
};

/**
 * Generates a long-lived JSON Web Token for token refreshing.
 * Includes a unique token identifier (jti) to aid in identification.
 *
 * @param {Object} user - The user object
 * @param {string} user._id - The user's database ID
 * @returns {string} Signed refresh token
 */
export const generateRefreshToken = (user) => {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) {
    throw new Error(
      "JWT_REFRESH_SECRET is not configured in environment variables.",
    );
  }

  const jti = crypto.randomUUID();
  const expiry = getRefreshTokenExpiry();

  return jwt.sign({ id: user._id, jti }, secret, { expiresIn: expiry });
};

/**
 * Computes the SHA-256 hash of a string.
 * Used to securely store refresh tokens in the database.
 *
 * @param {string} token - The raw token string to hash
 * @returns {string} Hashed hex string
 */
export const hashToken = (token) => {
  if (!token) {
    throw new Error("Token string is required for hashing");
  }
  return crypto.createHash("sha256").update(token).digest("hex");
};

/**
 * Verifies an Access Token.
 *
 * @param {string} token - The raw access token
 * @returns {Object} Decoded payload
 * @throws {Error} If t oken is expired, invalid, or signature verification fails
 */
export const verifyAccessToken = (token) => {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) {
    throw new Error(
      "JWT_ACCESS_SECRET is not configured in environment variables.",
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

/**
 * Verifies a Refresh Token.
 *
 * @param {string} token - The raw refresh token
 * @returns {Object} Decoded payload
 * @throws {Error} If token is expired, invalid, or signature verification fails
 */
export const verifyRefreshToken = (token) => {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) {
    throw new Error(
      "JWT_REFRESH_SECRET is not configured in environment variables.",
    );
  }
  return jwt.verify(token, secret);
};
