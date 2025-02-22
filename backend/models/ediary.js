const mongoose = require("mongoose");

const ediarySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  voiceNote: {
    type: String,
    required: true, // This will store the file path or URL of the uploaded voice note
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const EDiary = mongoose.models.EDiary || mongoose.model("EDiary", ediarySchema);
module.exports = EDiary;
