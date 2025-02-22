const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Seminar = require("../models/Seminar");
const { google } = require("googleapis");

// Google Calendar Setup
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI,
);
oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

const calendar = google.calendar({ version: "v3", auth: oauth2Client });

// ✅ Get all seminars
router.get("/seminars", auth, async (req, res) => {
  try {
    const seminars = await Seminar.find({ doctorId: req.user.id });
    res.json(seminars);
  } catch (error) {
    console.error("Error fetching seminars:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// ✅ Create a new seminar and add to Google Calendar
router.post("/seminars", auth, async (req, res) => {
  try {
    const { title, description, startTime, endTime } = req.body;
    const doctorId = req.user.id;

    // ✅ 1. Save Seminar in MongoDB
    const newSeminar = new Seminar({
      title,
      description,
      startTime,
      endTime,
      doctorId,
    });
    await newSeminar.save();

    // ✅ 2. Add Seminar to Google Calendar
    const event = {
      summary: title,
      description,
      start: { dateTime: startTime, timeZone: "Asia/Kolkata" },
      end: { dateTime: endTime, timeZone: "Asia/Kolkata" },
    };

    const response = await calendar.events.insert({
      calendarId: "primary",
      resource: event,
    });

    res.status(201).json({ seminar: newSeminar, calendarEvent: response.data });
  } catch (error) {
    console.error("Seminar scheduling error:", error);
    res.status(500).json({ msg: "Server error in scheduling seminar" });
  }
});

module.exports = router;
