require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const passport = require("passport");
const session = require("express-session");
const path = require("path");
const http = require("http"); // Create HTTP server
const { Server } = require("socket.io"); // Import socket.io
const Message = require("./models/Message");

// Import Passport authentication
require("./auth/googleAuth");
const auth = require("./middleware/auth");

const app = express();
const server = http.createServer(app); // Attach HTTP server
const io = new Server(server, {
  cors: {
    origin: "*", // Adjust for security in production
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Serve uploads folder as static assets
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Express session middleware (Required for Passport)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "thisshouldbeabettersecret!",
    resave: false,
    saveUninitialized: false,
  })
);

// Initialize Passport.js
app.use(passport.initialize());
app.use(passport.session());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Import Routes
const authRoutes = require("./routes/auth");
const googleAuthRoutes = require("./routes/googleAuthRoutes");
const gameRoutes = require("./routes/games");
const doctorRoutes = require("./routes/doctor");
const patientRoutes = require("./routes/patient");
const guardianRoutes = require("./routes/guardian");
const tasksRoutes = require("./routes/tasks");
const familyRoutes = require("./routes/family");
const detailRoutes = require("./routes/detail");
const notificationsRoutes = require("./routes/notifications");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chat");
const ediaryRoutes = require("./routes/ediary");
const leaderboardRoutes = require("./routes/leaderboard");


// Use Routes
app.use("/api/auth", authRoutes);
app.use("/api/auth", googleAuthRoutes);
app.use("/api/games", gameRoutes);
app.use("/api/doctor", doctorRoutes);
app.use("/api/patient", patientRoutes);
app.use("/api/guardian", guardianRoutes);
app.use("/api/tasks", tasksRoutes);
app.use("/api/family", familyRoutes);
app.use("/api/detail", detailRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api", userRoutes);
app.use("/api/chat", auth, chatRoutes);
app.use("/api/ediary", ediaryRoutes);
app.use("/api/leaderboard", leaderboardRoutes);

// Create a global object to track online users
const onlineUsers = {};

// Socket.IO Chatroom and Task Notification Logic
io.on("connection", (socket) => {
  console.log("🟢 New user connected:", socket.id);

  // Handle user registration
  socket.on("register", (username) => {
    onlineUsers[username] = socket.id;
    socket.username = username;
    io.emit("userList", Object.keys(onlineUsers));
    console.log(`User registered: ${username} with socket id ${socket.id}`);
  });

  // Handle sending and receiving messages
  socket.on("sendMessage", async (msgData) => {
    try {
      const newMessage = new Message({
        ...msgData,
        sender: socket.username,
        timestamp: new Date(),
      });
      await newMessage.save();
      io.emit("receiveMessage", newMessage);
    } catch (error) {
      console.error("Error handling message:", error);
      socket.emit("messageError", { error: "Failed to send message" });
    }
  });

  // Handle task notifications for patients
  socket.on("newTaskAssigned", ({ patientId, message }) => {
    io.emit(`taskNotification-${patientId}`, message); // Notify specific patient
  });

  // Handle user disconnection
  socket.on("disconnect", () => {
    if (socket.username) {
      delete onlineUsers[socket.username];
      io.emit("userList", Object.keys(onlineUsers));
      console.log(`User disconnected: ${socket.username}`);
    }
    console.log("🔴 User disconnected:", socket.id);
  });
});

// Default Route
app.get("/", (req, res) => {
  res.send("✅ Server is running...");
});

// Start the Server - Use `server.listen` instead of `app.listen`
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
