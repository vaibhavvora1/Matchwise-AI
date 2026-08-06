import AnalysisHistory from "../models/analysisHistory.model.js";

/**
 * @route GET /api/user/history
 * @desc Get paginated analysis history for the authenticated user
 * @access Private
 * @query {number} page - page number (default: 1)
 * @query {number} limit - items per page (default: 10, max: 50)
 * @query {string} search - search by resumeName or jobTitle
 * @query {string} type - filter by "ats_resume" or "interview_report"
 */
export async function getUserHistoryController(req, res) {
  try {
    const userId = req.user.id;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const search = req.query.search?.trim() || "";
    const type = req.query.type || "";

    const filter = { userId };
    if (type && ["ats_resume", "interview_report"].includes(type)) {
      filter.type = type;
    }
    if (search) {
      filter.$or = [
        { resumeName: { $regex: search, $options: "i" } },
        { jobTitle: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
      ];
    }

    const [items, total] = await Promise.all([
      AnalysisHistory.find(filter)
        .select("-reportData") // Exclude large reportData for list view
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      AnalysisHistory.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      history: items,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("[History Controller] Fetch error:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal server error fetching analysis history",
    });
  }
}

/**
 * @route GET /api/user/history/:id
 * @desc Get full report data for a single history item
 * @access Private
 */
export async function getHistoryItemController(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const item = await AnalysisHistory.findOne({ _id: id, userId }).lean();
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "History item not found.",
      });
    }

    res.status(200).json({ success: true, item });
  } catch (error) {
    console.error("[History Controller] Get item error:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal server error fetching history item",
    });
  }
}

/**
 * @route DELETE /api/user/history/:id
 * @desc Delete a history item (owner-verified)
 * @access Private
 */
export async function deleteHistoryItemController(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await AnalysisHistory.findOneAndDelete({ _id: id, userId });
    if (!result) {
      return res.status(404).json({
        success: false,
        message: "History item not found or you do not have permission to delete it.",
      });
    }

    res.status(200).json({
      success: true,
      message: "History item deleted successfully.",
    });
  } catch (error) {
    console.error("[History Controller] Delete error:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal server error deleting history item",
    });
  }
}
