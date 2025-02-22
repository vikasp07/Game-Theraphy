// backend/routes/leaderboard.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Progress = require("../models/Progress");
const User = require("../models/user");

//
// GET /api/leaderboard
// This endpoint aggregates each player's progress data to compute:
// - totalScore: the sum of all scores from Progress documents,
// - bestScore: the maximum score from a single progress record,
// - averageScore: the average score.
// It then joins with the User collection to include the player's name and sorts by totalScore in descending order.
//
router.get("/", auth, async (req, res) => {
  try {
    const leaderboard = await Progress.aggregate([
      {
        $group: {
          _id: "$user",
          totalScore: { $sum: "$score" },
          bestScore: { $max: "$score" },
          averageScore: { $avg: "$score" },
        },
      },
      {
        $lookup: {
          from: "users", // MongoDB collection name for users (usually lowercase plural)
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          _id: 1,
          name: "$user.name",
          totalScore: 1,
          bestScore: { $ifNull: ["$bestScore", 0] },
          averageScore: { $ifNull: ["$averageScore", 0] },
        },
      },
      {
        $sort: { totalScore: -1 },
      },
    ]);
    res.json(leaderboard);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;