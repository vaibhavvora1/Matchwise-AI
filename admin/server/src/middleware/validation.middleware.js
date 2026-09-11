import mongoose from "mongoose";
import { z } from "zod";

/**
 * Validates MongoDB ObjectId param
 */
export const validateObjectId = (paramName = "id") => {
  return (req, res, next) => {
    const id = req.params[paramName];
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid ID format for parameter '${paramName}'.`,
        code: "INVALID_OBJECT_ID",
      });
    }
    next();
  };
};

/**
 * Generic Zod schema validation middleware for request body, query, or params
 */
export const validateRequest = ({ body, query, params }) => {
  return (req, res, next) => {
    try {
      if (body) {
        req.body = body.parse(req.body);
      }
      if (query) {
        req.query = query.parse(req.query);
      }
      if (params) {
        req.params = params.parse(req.params);
      }
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const issues = error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        }));
        return res.status(422).json({
          success: false,
          message: "Request validation failed.",
          code: "VALIDATION_ERROR",
          errors: issues,
        });
      }
      return res.status(400).json({
        success: false,
        message: "Malformed request payload.",
        code: "BAD_REQUEST",
      });
    }
  };
};
