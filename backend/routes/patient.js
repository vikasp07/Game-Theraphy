const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

// Sample Games Data (including the Astray and Traffic Run games)
const games = [
  {
    id: 1,
    title: "Memory Match",
    description: "Match similar cards in the shortest time.",
    image: "/memory-match-logo.jpeg", // Ensure this path is correct
  },
  {
    id: 2,
    title: "Math Quiz",
    description: "Solve basic math problems under time pressure.",
    image: "/math-quiz-logo.jpeg", // Ensure this path is correct
  },
  {
    id: 3,
    title: "Word Scramble",
    description: "Rearrange letters to form a correct word.",
    image: "/word-scramble-logo.jpeg", // Ensure this path is correct
  },
  {
    id: 4,
    title: "Family Tree Game",
    description: "Rebuild your family tree and remember your loved ones!",
    image: "/family-tree-logo.png", // Ensure this path is correct
  },
  {
    id: 5,
    title: "Astray",
    description: "Navigate the maze and find your way out in Astray!",
    image: "/astray-logo.png", // Ensure this asset is in your public folder
  },
  {
    id: 6,
    title: "Traffic Run",
    description: "Guide your car safely through heavy traffic!",
    image: "/traffic-run-logo.png", // Ensure this asset is in your public folder
  },
  { id: 7, 
    title: "Story Game", 
    description: "Choose a story from each level and solve puzzles to complete the narrative.", 
    image: "/story-game-logo.png",
  },
   {
    id: 8, // Updated id for Memory Match game
    title: "Family Match",
    description: "Match similar cards in the shortest time.",
    image: "/family-match-logo.png", // Ensure this path is correct
  },
];

// GET Available Games
router.get("/games", authMiddleware, (req, res) => {
  console.log("Returning games:", games);
  res.json(games);
});

// Sample Progress Data
const progressData = {
  gamesPlayed: [
    { game: "Memory Match", score: 80 },
    { game: "Math Quiz", score: 90 },
    { game: "Traffic Run", score: 70 },
  ],
};

// GET User Progress
router.get("/progress", authMiddleware, (req, res) => {
  console.log("Returning progress:", progressData);
  res.json(progressData);
});

module.exports = router;
