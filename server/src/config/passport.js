const passport = require("passport");
const { Strategy: GoogleStrategy } = require("passport-google-oauth20");
const Member = require("../models/Member");

const ALLOWED_DOMAIN = (process.env.ALLOWED_HOSTED_DOMAIN || "vitstudent.ac.in").toLowerCase();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.SERVER_URL}/auth/google/callback`,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails && profile.emails[0] && profile.emails[0].value.toLowerCase();
        if (!email) {
          return done(null, false, { message: "Google account has no verified email." });
        }

        // Reject anything outside the VIT student domain before ever touching
        // the member allowlist — the `hd` authorization param only steers
        // Google's account picker, it doesn't enforce anything by itself.
        if (!email.endsWith(`@${ALLOWED_DOMAIN}`)) {
          return done(null, false, { message: `Only @${ALLOWED_DOMAIN} accounts can sign in.` });
        }

        const member = await Member.findOne({ collegeEmail: email, active: true });
        if (!member) {
          return done(null, false, { message: "This email isn't on the MIC member list." });
        }

        return done(null, { email: member.collegeEmail, name: member.name });
      } catch (err) {
        return done(err);
      }
    }
  )
);

// Keep the session tiny (just the email) and re-check the allowlist on every
// deserialize — so revoking a member's access takes effect on their very
// next request, not only after their session cookie expires.
passport.serializeUser((user, done) => done(null, user.email));

passport.deserializeUser(async (email, done) => {
  try {
    const member = await Member.findOne({ collegeEmail: email, active: true });
    if (!member) return done(null, false);
    return done(null, { email: member.collegeEmail, name: member.name });
  } catch (err) {
    done(err);
  }
});

module.exports = passport;
