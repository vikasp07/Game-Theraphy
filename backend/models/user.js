const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  googleId: { type: String, unique: true, sparse: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: {
    type: String,
    required: function () {
      return !this.googleId;
    },
  },
  mobile: {
    type: String,
    required: true,
    unique: true,
    match: [/^\d{10}$/, "Invalid phone number format"], // Ensures 10-digit mobile number
  },
  role: {
    type: String,
    enum: ["player", "doctor", "guardian"],
    required: true,
  },
  guardian: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  }, // Guardian field for players
});

const User = mongoose.models.User || mongoose.model("User", UserSchema);
module.exports = User;
