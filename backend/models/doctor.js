const mongoose = require("mongoose");

const DoctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  specialization: { type: String, required: true }, // Doctor's field of expertise
  googleCalendarId: { type: String, default: null }, // Google Calendar Integration
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Doctor", DoctorSchema);
