const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const Family = require("../models/Family");
const User = require("../models/user");

// POST /api/family/:patientId - Add a family member record for a patient
router.post("/:patientId", authMiddleware, async (req, res) => {
  try {
    // Ensure the requester is a guardian
    if (req.user.role !== "guardian") {
      return res.status(403).json({ msg: "Access denied. Only guardians can add family records." });
    }

    const { patientId } = req.params;
    const { name, relation, imageUrl } = req.body;

    // Validate required fields
    if (!name || !relation) {
      return res.status(400).json({ msg: "Name and relation are required." });
    }

    // Verify that the patient exists and is a player.
    const patient = await User.findOne({ _id: patientId, role: "player" });
    if (!patient) {
      return res.status(404).json({ msg: "Patient not found or is not a player." });
    }

    const familyRecord = new Family({
      user: patientId,
      name,
      relation,
      imageUrl: imageUrl || ""
    });

    await familyRecord.save();
    res.status(201).json({ msg: "Family member record added successfully", family: familyRecord });
  } catch (error) {
    console.error("Error adding family member record:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// Optional: GET /api/family/:patientId - Fetch family records for a patient
router.get("/:patientId", authMiddleware, async (req, res) => {
  try {
    const { patientId } = req.params;
    const familyRecords = await Family.find({ user: patientId });
    res.json(familyRecords);
  } catch (error) {
    console.error("Error fetching family records:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
