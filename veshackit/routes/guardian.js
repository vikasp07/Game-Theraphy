const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const User = require("../models/user");
const Progress = require("../models/Progress");

// GET all players (patients) associated with the guardian along with their game progress
router.get("/players/games", authMiddleware, async (req, res) => {
  try {
    // Verify that the logged-in user is a guardian
    if (req.user.role !== "guardian") {
      return res
        .status(403)
        .json({ msg: "Access denied. Only guardians can view this." });
    }

    // Find all players whose 'guardian' field equals the guardian's user id
    const players = await User.find({
      role: "player",
      guardian: req.user.id,
    }).select("-password");
    if (!players.length) {
      return res
        .status(404)
        .json({ msg: "No players found for this guardian." });
    }

    // For each player, fetch their progress data
    const data = await Promise.all(
      players.map(async (player) => {
        const progressData = await Progress.find({ user: player._id });
        return { player, progress: progressData };
      }),
    );

    res.json(data);
  } catch (error) {
    console.error("Error fetching players' game details:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// Existing endpoint to fetch progress for a patient by ID remains unchanged
router.get("/patient/:patientId", authMiddleware, async (req, res) => {
  const { patientId } = req.params;
  try {
    const progressData = await Progress.find({ user: patientId });
    if (!progressData.length) {
      return res
        .status(404)
        .json({ msg: "No progress data found for this patient." });
    }
    res.json(progressData);
  } catch (error) {
    console.error("Error fetching patient progress:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
