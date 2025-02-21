const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  difficulty: {
    type: String,
    enum: ["Easy", "Medium", "Hard"],
    required: true,
  },
  imageUrl: { type: String }, // Optional: Add game cover image
  createdAt: { type: Date, default: Date.now },
});

const Game = mongoose.models.Game || mongoose.model("Game", gameSchema); // Prevents overwriting

module.exports = Game;
