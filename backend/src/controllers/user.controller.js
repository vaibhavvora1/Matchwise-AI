import usermodel from "../models/user.model.js";

/**
 * @name getUserProfilecontroller
 * @description Fetch and return profile details for the currently logged-in user.
 *              Optimized database query selecting only necessary fields.
 * @route GET /api/user/profile
 * @access Private (Requires valid Access Token)
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns {Promise<void>}
 */
export async function getUserProfilecontroller(req, res) {
  try {
    const userId = req.user.id;

    const user = await usermodel
      .findById(userId)
      .select("username email isActive role createdAt lastLoginAt loginCount previousWork");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User profile not found.",
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isActive: user.isActive,
        role: user.role,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
        loginCount: user.loginCount,
        previousWork: user.previousWork || [],
      },
    });
  } catch (error) {
    console.error("[User Controller] Profile fetch error:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal server error fetching user profile",
    });
  }
}

export async function getUserAggregationController(req, res) {
  try {
    const aggregation = await usermodel.getUserStats();

    res.status(200).json({
      success: true,
      aggregation,
    });
  } catch (error) {
    console.error("[User Controller] Aggregation error:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal server error fetching aggregation data",
    });
  }
}
