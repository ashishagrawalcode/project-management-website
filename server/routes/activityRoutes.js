import express from "express";
import { getProjectActivity, getAllActivities } from "../controllers/activityController.js";

const router = express.Router();

router.route("/project/:projectId").get(getProjectActivity);
router.route("/").get(getAllActivities);

export default router;