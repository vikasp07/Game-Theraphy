const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const router = express.Router();

// Google Login Route
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

// Google Callback Route
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "http://localhost:3000/login",
  }),
  async (req, res) => {
    try {
      const { email } = req.user;

      // Check if user exists in the database
      const existingUser = await User.findOne({ email });

      if (!existingUser) {
        return res.redirect("http://localhost:3000/login?error=unregistered");
      }

      // Generate JWT token for registered users
      const token = jwt.sign({ id: existingUser._id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      res.redirect(`http://localhost:3000/dashboard?token=${token}`);
    } catch (error) {
      console.error("Google authentication error:", error);
      res.status(500).json({ msg: "Server error" });
    }
  },
);

module.exports = router;
