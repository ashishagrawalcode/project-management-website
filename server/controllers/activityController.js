import Activity from "../models/Activity.js";

// @desc    Get all activity for a project
// @route   GET /api/activity/project/:projectId
export const getProjectActivity = async (req, res, next) => {
  try {
    const activities = await Activity.find({ projectId: req.params.projectId })
      .sort({ createdAt: -1 })
      .limit(50);
    res.status(200).json(activities);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all activities for Dashboard graph
// @route   GET /api/activity
export const getAllActivities = async (req, res, next) => {
  try {
    const activities = await Activity.find({}).sort({ createdAt: -1 });
    res.status(200).json(activities);
  } catch (error) {
    next(error);
  }
};