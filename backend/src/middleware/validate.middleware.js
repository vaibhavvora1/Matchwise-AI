  import { z } from "zod";

  /**
   * Express middleware to validate request bodies against a Zod schema.
   * 
   * @param {import("zod").ZodSchema} schema - Zod schema to validate req.body against
   * @returns {import("express").RequestHandler} Express middleware handler
   */
  export const validateRequest = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: result.error.errors.map((err) => ({
          path: err.path.join("."),
          message: err.message,
        })),
      });
    }
    
    // Attach validated data to req.body
    req.body = result.data;
    next();
  };

  export default validateRequest;
