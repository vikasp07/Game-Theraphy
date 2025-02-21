const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const EDiary = require("../models/ediary");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Define uploads folder for e-diary voice notes
const uploadsFolder = path.join(__dirname, "../uploads/ediary");
if (!fs.existsSync(uploadsFolder)) {
  fs.mkdirSync(uploadsFolder, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsFolder);
  },
  filename: (req, file, cb) => {
    // Append timestamp to avoid collisions
    cb(null, Date.now() + "_" + file.originalname);
  },
});
const upload = multer({ storage: storage });

// GET /api/ediary - Get e-diary entries for the logged-in user
router.get("/", authMiddleware, async (req, res) => {
  try {
    // Find all diary entries for the user, sorted by timestamp (most recent first)
    const entries = await EDiary.find({ user: req.user.id }).sort({ timestamp: -1 });
    res.json(entries);
  } catch (error) {
    console.error("Error fetching e-diary entries:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// POST /api/ediary - Create a new e-diary entry
router.post("/", authMiddleware, upload.single("voiceNote"), async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) {
      return res.status(400).json({ msg: "Title is required." });
    }
    if (!req.file) {
      return res.status(400).json({ msg: "Voice note file is required." });
    }
    // Get the absolute path from multer
    const absolutePath = req.file.path;
    // Extract the relative path starting from "uploads"
    const relativeVoiceNotePath = absolutePath.substring(absolutePath.indexOf("uploads"));

    const entry = new EDiary({
      user: req.user.id,
      title,
      voiceNote: relativeVoiceNotePath, // store relative path
    });
    await entry.save();
    res.status(201).json({ msg: "e-Diary entry created successfully", ediary: entry });
  } catch (error) {
    console.error("Error creating e-diary entry:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
