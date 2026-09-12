const mongoose = require("mongoose");

// The allowlist: only Google accounts whose email matches an active member
// here (and is on the vitstudent.ac.in domain) are let past the login gate.
const memberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    collegeEmail: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Member", memberSchema);
