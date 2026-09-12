require("dotenv").config();

const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const MongoStore = require("connect-mongo");

const { connectDb } = require("./config/db");
const passport = require("./config/passport");
const authRoutes = require("./routes/auth");
const pageRoutes = require("./routes/pages");
const memberRoutes = require("./routes/members");
const { ensureMember } = require("./middleware/ensureMember");

const PORT = process.env.PORT || 4000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

async function main() {
  await connectDb();

  const app = express();
  app.set("trust proxy", 1);

  app.use(cors({ origin: CLIENT_URL, credentials: true }));
  app.use(express.json());

  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 14, // 14 days
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      },
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  app.use("/auth", authRoutes);

  app.get("/api/health", (_req, res) => res.json({ ok: true }));

  // Example of a member-only API route — add real ones here as the app grows.
  app.get("/api/me/profile", ensureMember, (req, res) => {
    res.json({ member: req.user });
  });

  app.use("/api", pageRoutes);
  app.use("/api", memberRoutes);

  // In production the built React app is served from this same origin, so the
  // session cookie is first-party on every request. (Split domains would need
  // sameSite:"none", which browsers only honour over HTTPS.) Locally this is
  // skipped — Vite serves the client on its own port instead.
  const clientDist = path.join(__dirname, "../../client/dist");
  if (fs.existsSync(path.join(clientDist, "index.html"))) {
    app.use(express.static(clientDist));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(clientDist, "index.html"));
    });
  }

  app.listen(PORT, () => {
    console.log(`AI Hub auth server listening on http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
