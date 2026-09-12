const express = require("express");
const Member = require("../models/Member");
const { ensureAdmin } = require("../middleware/ensureMember");

const router = express.Router();

// Member management is admin-only, all of it.
router.use(ensureAdmin);

router.get("/members", async (req, res, next) => {
  try {
    const members = await Member.find()
      .sort({ name: 1 })
      .limit(2000)
      .select("name collegeEmail active role createdAt");
    res.json({ members });
  } catch (err) {
    next(err);
  }
});

router.post("/members", async (req, res, next) => {
  try {
    const name = (req.body.name || "").trim();
    const email = (req.body.email || "").trim().toLowerCase();

    if (!name || !email) return res.status(400).json({ error: "Name and email are both required." });
    if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ error: "That doesn't look like an email address." });

    const existing = await Member.findOne({ collegeEmail: email });
    if (existing) return res.status(409).json({ error: `${email} is already on the list.` });

    const member = await Member.create({ name, collegeEmail: email });
    res.status(201).json({ member });
  } catch (err) {
    next(err);
  }
});

// Paste-in bulk add, so onboarding a whole recruitment intake doesn't mean
// typing 250 rows one at a time. Accepts "Name,email" per line, with or
// without a header row.
router.post("/members/bulk", async (req, res, next) => {
  try {
    const text = typeof req.body.text === "string" ? req.body.text : "";
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

    const added = [];
    const skipped = [];
    const invalid = [];

    for (const line of lines) {
      const parts = line.split(",");
      if (parts.length < 2) {
        invalid.push(line);
        continue;
      }
      const name = parts[0].trim();
      const email = parts[1].trim().toLowerCase();

      // Tolerate a header row without reporting it as an error.
      if (name.toLowerCase() === "name" && email === "email") continue;

      if (!name || !/^\S+@\S+\.\S+$/.test(email)) {
        invalid.push(line);
        continue;
      }

      const existing = await Member.findOne({ collegeEmail: email });
      if (existing) {
        skipped.push(email);
        continue;
      }

      await Member.create({ name, collegeEmail: email });
      added.push(email);
    }

    res.json({ added: added.length, skipped: skipped.length, invalid });
  } catch (err) {
    next(err);
  }
});

router.patch("/members/:id", async (req, res, next) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) return res.status(404).json({ error: "Member not found." });

    // Guard against an admin locking themselves — and potentially everyone —
    // out of the review tools.
    const isSelf = member.collegeEmail === req.user.email;
    if (isSelf && (req.body.role === "member" || req.body.active === false)) {
      return res.status(400).json({
        error: "You can't demote or deactivate your own account. Ask another admin to do it.",
      });
    }

    if (req.body.role === "admin" || req.body.role === "member") {
      if (req.body.role === "member") {
        const admins = await Member.countDocuments({ role: "admin", active: true });
        if (admins <= 1 && member.role === "admin") {
          return res.status(400).json({ error: "That's the last admin — promote someone else first." });
        }
      }
      member.role = req.body.role;
    }

    if (typeof req.body.active === "boolean") member.active = req.body.active;

    await member.save();
    res.json({ member });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
