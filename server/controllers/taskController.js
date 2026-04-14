import Task from "../models/Task.js";
import Project from "../models/Project.js";
import Activity from "../models/Activity.js";

// @desc    Create a new task
// @route   POST /api/tasks
export const createTask = async (req, res, next) => {
  try {
    const { title, status, priority, assignedTo, projectId } = req.body;

    if (!title || !projectId) {
      res.status(400);
      throw new Error("Title and Project ID are required");
    }

    const project = await Project.findById(projectId);
    if (!project) {
      res.status(404);
      throw new Error("Project not found");
    }

    const task = await Task.create({ title, status, priority, assignedTo, projectId });

    await Project.findByIdAndUpdate(projectId, { $push: { tasks: task._id } });

    await Activity.create({
      action: `Task "${task.title}" was added`,
      type: "Task",
      projectId,
    });

    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all tasks for a project
// @route   GET /api/tasks/project/:projectId
export const getTasksByProject = async (req, res, next) => {
  try {
    const tasks = await Task.find({ projectId: req.params.projectId }).sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all tasks (Global for Dashboard)
// @route   GET /api/tasks
export const getAllTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({}).sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
export const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      res.status(404);
      throw new Error("Task not found");
    }

    const oldStatus = task.status;
    const { title, status, priority, assignedTo } = req.body;

    task.title = title ?? task.title;
    task.status = status ?? task.status;
    task.priority = priority ?? task.priority;
    task.assignedTo = assignedTo ?? task.assignedTo;

    const updated = await task.save();

    if (status && status !== oldStatus) {
      await Activity.create({
        action: `Task "${updated.title}" status changed to "${status}"`,
        type: "Task",
        projectId: updated.projectId,
      });
    } else {
      await Activity.create({
        action: `Task "${updated.title}" was updated`,
        type: "Task",
        projectId: updated.projectId,
      });
    }

    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      res.status(404);
      throw new Error("Task not found");
    }

    await Project.findByIdAndUpdate(task.projectId, { $pull: { tasks: task._id } });

    await Activity.create({
      action: `Task "${task.title}" was deleted`,
      type: "Task",
      projectId: task.projectId,
    });

    await task.deleteOne();
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    next(error);
  }
};