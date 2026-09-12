// Protects any API route that should only answer for a logged-in, still-active MIC member.
function ensureMember(req, res, next) {
  if (req.user) return next();
  res.status(401).json({ error: "Sign in with your VIT Google account to continue." });
}

module.exports = { ensureMember };
