// Protects any API route that should only answer for a logged-in, still-active MIC member.
function ensureMember(req, res, next) {
  if (req.user) return next();
  res.status(401).json({ error: "Sign in with your member Google account to continue." });
}

// Review actions — approving/rejecting edits and reverting revisions.
function ensureAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: "Sign in to continue." });
  }
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Admins only." });
  }
  next();
}

module.exports = { ensureMember, ensureAdmin };
