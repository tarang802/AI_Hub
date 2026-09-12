#!/usr/bin/env node
/**
 * Promote or demote a member. Admins can approve/reject pending edits and
 * revert published revisions.
 *
 * Usage:
 *   cd server
 *   node scripts/setRole.js someone@vitstudent.ac.in admin
 *   node scripts/setRole.js someone@vitstudent.ac.in member
 *   node scripts/setRole.js --list          # show all current admins
 */

require("dotenv").config();
const mongoose = require("mongoose");
const Member = require("../src/models/Member");

async function main() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not set — copy server/.env.example to server/.env.");
  }
  await mongoose.connect(process.env.MONGODB_URI);

  if (process.argv.includes("--list")) {
    const admins = await Member.find({ role: "admin" }).select("name collegeEmail active");
    if (!admins.length) {
      console.log("No admins yet. Promote one with: node scripts/setRole.js <email> admin");
    } else {
      console.log(`${admins.length} admin(s):`);
      for (const a of admins) {
        console.log(`  ${a.name} <${a.collegeEmail}>${a.active ? "" : "  (INACTIVE)"}`);
      }
    }
    await mongoose.disconnect();
    return;
  }

  const email = (process.argv[2] || "").trim().toLowerCase();
  const role = (process.argv[3] || "").trim();

  if (!email || !["admin", "member"].includes(role)) {
    console.error("Usage: node scripts/setRole.js <email> <admin|member>");
    console.error("       node scripts/setRole.js --list");
    process.exit(1);
  }

  const member = await Member.findOne({ collegeEmail: email });
  if (!member) {
    console.error(`No member found with email ${email}.`);
    console.error("They must be on the member list first — add them to members.csv and import.");
    process.exit(1);
  }

  member.role = role;
  await member.save();
  console.log(`✓ ${member.name} <${member.collegeEmail}> is now a ${role}.`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
