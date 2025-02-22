const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

// Get Chat History
router.get("/", authMiddleware, async (req, res) => {
  try {
    const messages = await Message.find().sort({ timestamp: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Store Message
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { sender, message } = req.body;
    const newMessage = new Message({ sender, message });
    await newMessage.save();
    res.json(newMessage);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});


router.post("/upload", authMiddleware, upload.single("file"), (req, res) => {
  res.json({ filePath: `/uploads/${req.file.filename}` });
 });


module.exports = router;
