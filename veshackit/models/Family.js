const mongoose = require("mongoose");

const FamilySchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true,
    index: true 
  }, // The patient (player) ID
  name: { 
    type: String, 
    required: true 
  },
  relation: { 
    type: String, 
    required: true 
  },
  imageUrl: { 
    type: String, 
    default: "" 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Avoid model re-compilation issues
const Family = mongoose.models.Family || mongoose.model("Family", FamilySchema);
module.exports = Family;
