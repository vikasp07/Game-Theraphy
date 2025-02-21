const mongoose = require("mongoose");

const detailSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true, 
    unique: true 
  },
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true 
  },
  age: {
    type: Number,
    default: null,
  },
  gender: {
    type: String,
    default: null,
  },
  birthdate: {
    type: Date,
    default: null,
  },
  profilePic: {
    type: String,
    default: "", // can be an empty string if no photo uploaded
  },
});

const Detail = mongoose.models.Detail || mongoose.model("Detail", detailSchema);
module.exports = Detail;
