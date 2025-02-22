// const express = require("express");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const passport = require("passport");
// const User = require("../models/user");
// const authMiddleware = require("../middleware/authMiddleware");

// const router = express.Router();

// // ✅ Login User (Manual Login)
// router.post("/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // 🔹 Find user by email
//     const user = await User.findOne({ email });
//     if (!user) return res.status(400).json({ msg: "User not found" });

//     // 🔹 Check if user registered with Google
//     if (!user.password)
//       return res.status(400).json({ msg: "Use Google login" });

//     // 🔹 Validate password
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

//     // 🔹 Generate JWT token
//     const token = jwt.sign(
//       { id: user._id, role: user.role },
//       process.env.JWT_SECRET,
//       {
//         expiresIn: "1h",
//       },
//     );

//     res.json({
//       token,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//       },
//     });
//   } catch (err) {
//     console.error("❌ Login error:", err.message);
//     res.status(500).json({ msg: "Server error" });
//   }
// });

// // ✅ Register User (Manual Registration)
// router.post("/register", async (req, res) => {
//   //console.log("Received Data:", req.body);
//   try {
//     // Fetch distinct roles from the database
//     const roles = await User.distinct("role");
//     //console.log("Roles in DB:", roles);

//     const { name, email, password, role, guardianEmail } = req.body;

//     if (!name || !email || !password || !role) {
//       return res.status(400).json({ msg: "All fields are required" });
//     }

//     if (!["player", "doctor", "guardian"].includes(role)) {
//       return res.status(400).json({ msg: "Invalid role" });
//     }

//     let user = await User.findOne({ email });
//     if (user) return res.status(400).json({ msg: "User already exists" });

//     let guardian = null;

//     // Check for guardian only if the role is "player"
//     if (role === "player" && guardianEmail) {
//       guardian = await User.findOne({ email: guardianEmail });
//       if (!guardian) {
//         return res.status(400).json({ msg: "Guardian not found" });
//       }
//       if (guardian.role !== "guardian") {
//         return res
//           .status(400)
//           .json({ msg: "Provided guardian is not registered as a Guardian" });
//       }
//     }

//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     user = new User({
//       name,
//       email,
//       password: hashedPassword,
//       role,
//       guardian: guardian ? guardian._id : null,
//     });

//     await user.save();

//     const token = jwt.sign(
//       { id: user._id, role: user.role },
//       process.env.JWT_SECRET,
//       { expiresIn: "1h" },
//     );

//     res.json({
//       msg: "User registered successfully",
//       token,
//       user: {
//         id: user._id,
//         name,
//         email,
//         role,
//         guardian: guardian ? guardian._id : null,
//       },
//     });
//   } catch (err) {
//     console.error("Registration error:", err.message);
//     res.status(500).json({ msg: "Server error" });
//   }
// });

// // ✅ Google Authentication (Login Only)
// router.get(
//   "/google",
//   passport.authenticate("google", { scope: ["profile", "email"] }),
// );

// router.get(
//   "/google/callback",
//   passport.authenticate("google", { failureRedirect: "/login" }),
//   async (req, res) => {
//     try {
//       const { email, name, googleId } = req.user;
//       let user = await User.findOne({ email });

//       if (!user) {
//         return res.redirect("http://localhost:3000/login?error=unregistered");
//       }

//       const token = jwt.sign(
//         { id: user._id, role: user.role },
//         process.env.JWT_SECRET,
//         {
//           expiresIn: "1h",
//         },
//       );

//       res.redirect(`http://localhost:3000/dashboard?token=${token}`);
//     } catch (error) {
//       console.error("Google authentication error:", error);
//       res.status(500).json({ msg: "Server error" });
//     }
//   },
// );

// // ✅ Logout User
// router.get("/logout", (req, res) => {
//   req.session.destroy((err) => {
//     if (err) return res.status(500).json({ msg: "Logout failed" });

//     res.clearCookie("connect.sid");
//     res.json({ msg: "Logged out successfully" });
//   });
// });

// // ✅ Get User Data (Protected Route)
// router.get("/user", authMiddleware, async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id).select("-password");
//     res.json(user);
//   } catch (err) {
//     console.error("Server error:", err.message);
//     res.status(500).json({ msg: "Server error" });
//   }
// });

// module.exports = router;


const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const User = require("../models/user");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// ✅ Login User (Manual Login)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 🔹 Find user by email
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "User not found" });

    // 🔹 Check if user registered with Google
    if (!user.password)
      return res.status(400).json({ msg: "Use Google login" });

    // 🔹 Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    // 🔹 Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile, // ✅ Include mobile number in response
        role: user.role,
      },
    });
  } catch (err) {
    console.error("❌ Login error:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
});

// ✅ Register User (Manual Registration)
router.post("/register", async (req, res) => {
  try {
    const roles = await User.distinct("role");

    const { name, email, password, mobile, role, guardianEmail } = req.body;

    if (!name || !email || !password || !mobile || !role) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    if (!["player", "doctor", "guardian"].includes(role)) {
      return res.status(400).json({ msg: "Invalid role" });
    }

    // 🔹 Check if user exists (by email or mobile)
    let existingUser = await User.findOne({ $or: [{ email }, { mobile }] });
    if (existingUser)
      return res
        .status(400)
        .json({ msg: "User already exists with this email or mobile number" });

    let guardian = null;

    // 🔹 Check guardian only if the role is "player"
    if (role === "player" && guardianEmail) {
      guardian = await User.findOne({ email: guardianEmail });
      if (!guardian) {
        return res.status(400).json({ msg: "Guardian not found" });
      }
      if (guardian.role !== "guardian") {
        return res
          .status(400)
          .json({ msg: "Provided guardian is not registered as a Guardian" });
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      name,
      email,
      password: hashedPassword,
      mobile,
      role,
      guardian: guardian ? guardian._id : null,
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      msg: "User registered successfully",
      token,
      user: {
        id: user._id,
        name,
        email,
        mobile, // ✅ Include mobile number in response
        role,
        guardian: guardian ? guardian._id : null,
      },
    });
  } catch (err) {
    console.error("❌ Registration error:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
});

// ✅ Google Authentication (Login Only)
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  async (req, res) => {
    try {
      const { email, name, googleId } = req.user;
      let user = await User.findOne({ email });

      if (!user) {
        return res.redirect("http://localhost:3000/login?error=unregistered");
      }

      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      res.redirect(`http://localhost:3000/dashboard?token=${token}`);
    } catch (error) {
      console.error("❌ Google authentication error:", error);
      res.status(500).json({ msg: "Server error" });
    }
  }
);

// ✅ Logout User
router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ msg: "Logout failed" });

    res.clearCookie("connect.sid");
    res.json({ msg: "Logged out successfully" });
  });
});

// ✅ Get User Data (Protected Route)
router.get("/user", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    console.error("❌ Server error:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
