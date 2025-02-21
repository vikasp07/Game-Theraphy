// veshackit/routes/tasks.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const Task = require("../models/Tasks");
const User = require("../models/user");

// POST /api/tasks/:patientId - Assign a new task to a patient
router.post("/:patientId", authMiddleware, async (req, res) => {
  try {
    // Ensure that the requester is a guardian
    if (req.user.role !== "guardian") {
      return res.status(403).json({ msg: "Access denied. Only guardians can assign tasks." });
    }

    const { patientId } = req.params;
    const { taskDescription, startTime, endTime, taskDate } = req.body;

    // Validate required fields
    if (!taskDescription || !startTime || !endTime) {
      return res.status(400).json({ msg: "Please provide task description, start time, and end time." });
    }

    // Verify that the patient exists and is a player.
    const patient = await User.findOne({ _id: patientId, role: "player" });
    if (!patient) {
      return res.status(404).json({ msg: "Patient not found or is not a player." });
    }

    const newTask = new Task({
      user: patientId,
      taskDescription,
      startTime,
      endTime,
      taskDate: taskDate ? new Date(taskDate) : Date.now(),
    });

    await newTask.save();
    res.status(201).json({ msg: "Task assigned successfully", task: newTask });
  } catch (error) {
    console.error("Error assigning task:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// GET /api/tasks/:patientId - Fetch tasks for a specific patient
router.get("/:patientId", authMiddleware, async (req, res) => {
  try {
    const { patientId } = req.params;
    const tasks = await Task.find({ user: patientId }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// PATCH /api/tasks/status/:taskId - Update task status (mark as completed)
// Allow update if user is a guardian OR if the task belongs to the logged in patient.
router.patch("/status/:taskId", authMiddleware, async (req, res) => {
  try {
    const { taskId } = req.params;
    const { completed } = req.body; // expects a boolean value

    // Find the task
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ msg: "Task not found." });
    }

    // Check if the logged-in user is either a guardian or the owner of the task
    if (req.user.role !== "guardian" && req.user.id !== task.user.toString()) {
      return res.status(403).json({
        msg: "Access denied. You are not allowed to update this task status.",
      });
    }

    // Update the task's status
    task.completed = completed;
    await task.save();

    res.json({ msg: "Task status updated successfully", task });
  } catch (error) {
    console.error("Error updating task status:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
