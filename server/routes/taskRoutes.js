import express from "express";
import { createTask, getTasksByProject, updateTask, deleteTask, getAllTasks } from "../controllers/taskController.js";

const router = express.Router();

router.route("/").post(createTask).get(getAllTasks);
router.route("/project/:projectId").get(getTasksByProject);
router.route("/:id").put(updateTask).delete(deleteTask);

export default router;