import Project from "../models/Project.js";
import Task from "../models/Task.js";
import Activity from "../models/Activity.js";

// @desc    Get all projects
// @route   GET /api/projects
export const getProjects = async (req, res, next) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.status(200).json(projects);
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single project by ID
// @route   GET /api/projects/:id
export const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id).populate("tasks");
    if (!project) {
      res.status(404);
      throw new Error("Project not found");
    }
    res.status(200).json(project);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new project
// @route   POST /api/projects
export const createProject = async (req, res, next) => {
  try {
    const { title, description, status, deadline } = req.body;

    if (!title || !description) {
      res.status(400);
      throw new Error("Title and description are required");
    }

    const project = await Project.create({ title, description, status, deadline });

    await Activity.create({
      action: `Project "${project.title}" was created`,
      type: "Project",
      projectId: project._id,
    });

    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a project
// @route   PUT /api/projects/:id
export const updateProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      res.status(404);
      throw new Error("Project not found");
    }

    const { title, description, status, deadline } = req.body;
    const oldStatus = project.status;

    project.title = title ?? project.title;
    project.description = description ?? project.description;
    project.status = status ?? project.status;
    project.deadline = deadline ?? project.deadline;

    const updated = await project.save();

    if (status && status !== oldStatus) {
      await Activity.create({
        action: `Project "${updated.title}" status changed from "${oldStatus}" to "${status}"`,
        type: "Project",
        projectId: updated._id,
      });
    } else {
      await Activity.create({
        action: `Project "${updated.title}" was updated`,
        type: "Project",
        projectId: updated._id,
      });
    }

    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a project and its tasks/activities
// @route   DELETE /api/projects/:id
export const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      res.status(404);
      throw new Error("Project not found");
    }

    // Cascade delete tasks and activities
    await Task.deleteMany({ projectId: project._id });
    await Activity.deleteMany({ projectId: project._id });
    await project.deleteOne();

    res.status(200).json({ message: "Project deleted successfully" });
  } catch (error) {
    next(error);
  }
};