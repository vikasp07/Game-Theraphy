const mongoose = require("mongoose");

const SeminarSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const Seminar = mongoose.model("Seminar", SeminarSchema);

module.exports = Seminar;
