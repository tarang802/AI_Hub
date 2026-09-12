const mongoose = require("mongoose");

// The allowlist: only Google accounts whose verified email matches an active
// member here are let past the login gate. This is the sole access check.
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
    // Admins review the pending-edit queue and can revert published revisions.
    role: { type: String, enum: ["member", "admin"], default: "member" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Member", memberSchema);
