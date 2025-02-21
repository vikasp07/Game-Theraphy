const express = require("express");
const { createMeeting } = require("../services/googleCalendar");
const router = express.Router();

router.post("/create", async (req, res) => {
  try {
    const meeting = await createMeeting(req.body);
    res.json(meeting);
  } catch (error) {
    res.status(500).json({ msg: "Failed to create meeting", error });
  }
});

module.exports = router;
