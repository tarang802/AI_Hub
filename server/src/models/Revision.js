const mongoose = require("mongoose");

// One published version of a page. A revision is written every time content
// actually goes live — on the initial seed, on an approved edit, and on a
// revert — so `body` is a full snapshot an admin can restore in one step.
const revisionSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, index: true },
    body: { type: String, required: true },
    // Who wrote the content. On a revert this is the original author, so
    // attribution follows the text rather than the person restoring it.
    authorEmail: { type: String, default: null },
    authorName: { type: String, default: null },
    publishedBy: { type: String, default: null },
    note: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Revision", revisionSchema);
