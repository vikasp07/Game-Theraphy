const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid"); // Import UUID for session ID

const progressSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, default: uuidv4, unique: true }, // Ensure unique session ID
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  gameId: { type: String, required: true }, // e.g., "memory_match"
  gameName: { type: String, required: true }, // Store the game name
  startLevel: { type: Number, default: 1 }, // ✅ Track starting level
  endLevel: { type: Number, required: true }, // ✅ Track ending level
  totalTime: { type: String, required: true }, // ✅ Store total time (e.g., "120s")
  score: { type: Number, default: 0 },
  mistakes: { type: Number, default: 0 }, // ✅ Track mistakes
  completed: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now },
});

const Progress =
  mongoose.models.Progress || mongoose.model("Progress", progressSchema);

module.exports = Progress;
