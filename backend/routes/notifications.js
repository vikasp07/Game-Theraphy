const express = require("express");
const { sendSMS } = require("../services/twilioService");
const router = express.Router();

router.post("/send-sms", async (req, res) => {
  try {
    let { phone, message } = req.body;

    if (!phone || !message) {
      return res.status(400).json({ msg: "Phone and message are required" });
    }

    // Ensure proper phone format
    if (!phone.startsWith("+")) {
      phone = "+91" + phone; // Add country code if missing
    }

    const response = await sendSMS(phone, message);
    res.json({ msg: "SMS sent successfully", response });
  } catch (err) {
    console.error("❌ SMS Error:", err.message);
    res.status(500).json({ msg: "Failed to send SMS", error: err.message });
  }
});

module.exports = router;
