/**
 * CSRF Protection Middleware using the Double Submit Cookie pattern.
 * Checks that the custom header `x-csrf-token` matches the `csrf-token` cookie
 * for state-mutating requests (POST, PUT, DELETE, PATCH).
 * 
 * Excludes safe HTTP methods (GET, HEAD, OPTIONS) and initial login/register endpoints.
 * 
 * @param {import("express").Request} req - Express request object
 * @param {import("express").Response} res - Express response object
 * @param {import("express").NextFunction} next - Express next middleware function
 * @returns {void}
 */
const csrfMiddleware = (req, res, next) => {
  // 1. Skip check for safe methods
  const safeMethods = ["GET", "HEAD", "OPTIONS"];
  if (safeMethods.includes(req.method)) {
    return next();
  }

  // 2. Skip check for public authentication entry points (login, register)
  // These routes establish the CSRF token and do not consume existing cookies for security actions.
  const path = req.path || req.originalUrl;
  if (path.endsWith("/login") || path.endsWith("/register")) {
    return next();
  }

  // 3. Extract CSRF token from cookies and request headers
  const cookieCsrfToken = req.cookies ? req.cookies["csrf-token"] : null;
  const headerCsrfToken = req.headers["x-csrf-token"];

  // 4. Validate presence
  if (!cookieCsrfToken) {
    return res.status(403).json({
      success: false,
      message: "CSRF token cookie is missing. Request aborted.",
      code: "CSRF_COOKIE_MISSING"
    });
  }

  if (!headerCsrfToken) {
    return res.status(403).json({
      success: false,
      message: "CSRF header token is missing. Request aborted.",
      code: "CSRF_HEADER_MISSING"
    });
  }

  // 5. Compare tokens
  if (cookieCsrfToken !== headerCsrfToken) {
    return res.status(403).json({
      success: false,
      message: "CSRF validation failed. Token mismatch.",
      code: "CSRF_MISMATCH"
    });
  }

  // Tokens match, proceed
  next();
};

export default csrfMiddleware;
