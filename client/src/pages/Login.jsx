import { useSearchParams, Navigate } from "react-router-dom";
import { googleLoginUrl } from "../api";
import { useAuth } from "../context/AuthContext";
import micLogo from "../assets/mic-logo.png";

const HIGHLIGHTS = [
  "Foundations → Machine Learning → Deep Learning → Specializations & Research, in sequence.",
  "29 in-depth guides — Python, math, and stats through generative AI, RL, and MLOps.",
  "Check off topics as you go; progress is saved in your browser.",
  "Curated and kept current by the AI/ML Vertical Lead.",
];

const SOCIALS = [
  {
    label: "Website",
    href: "https://www.microsoftinnovations.club/",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c2.5 2.5 3.8 5.7 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.7-3.8-9s1.3-6.5 3.8-9z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/microsoft.innovations.vitc",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/microsoft-innovations-club-vitc/posts/?feedView=all",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <line x1="7.5" y1="10.5" x2="7.5" y2="16.5" />
        <circle cx="7.5" cy="7.3" r="0.9" fill="currentColor" stroke="none" />
        <path d="M11.5 16.5v-4c0-1.4 1-2.2 2.2-2.2 1.2 0 2 .8 2 2.2v4" />
      </svg>
    ),
  },
];

export default function Login() {
  const { user, loading } = useAuth();
  const [params] = useSearchParams();
  const denied = params.get("error") === "not_allowed";

  if (!loading && user) return <Navigate to="/" replace />;

  return (
    <div className="login-page">
      <div className="login-watermark" aria-hidden="true" />

      <div className="login-content">
        <div className="login-card">
          <div className="login-card-header">
            <img src={micLogo} alt="MIC logo" className="login-logo" />
            <div>
              <h1>Microsoft Innovations Club</h1>
              <p className="login-card-subtitle">AI/ML Resource Hub — VIT Chennai</p>
            </div>
          </div>

          <p className="login-copy">Members-only. Sign in with your Google account.</p>

          {denied && (
            <p className="login-error" role="alert">
              That account isn't on the current MIC AI/ML member list. If you're a member and
              think this is wrong, ask a lead to add the email you signed in with to the list.
            </p>
          )}

          <a className="google-signin-btn" href={googleLoginUrl()}>
            <svg viewBox="0 0 48 48" width="18" height="18" aria-hidden="true">
              <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34.9 5.1 29.7 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.4-.1-2.7-.4-3.5z" />
              <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.6 16 19 13 24 13c3.1 0 5.8 1.1 8 3l6-6C34.9 5.1 29.7 3 24 3c-7.4 0-13.8 4-17.3 9.9z" />
              <path fill="#4CAF50" d="M24 45c5.6 0 10.7-1.9 14.6-5.2l-6.7-5.7c-2 1.4-4.7 2.4-7.9 2.4-5.2 0-9.6-3.3-11.3-7.9l-6.6 5.1C9.9 40.9 16.4 45 24 45z" />
              <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.6l6.7 5.7C41.7 36 45 30.7 45 24c0-1.4-.1-2.7-.4-3.5z" />
            </svg>
            Sign in with Google
          </a>
          <p className="login-subtext">
            Access is limited to emails on the current MIC AI/ML member list.
          </p>
        </div>

        <div className="login-info">
          <div className="login-about">
            <p className="login-about-title">About the AI/ML Vertical</p>
            <p>
              MIC's AI/ML learning track — foundations through advanced research, curated and kept
              current instead of scattered across links.
            </p>
          </div>

          <ul className="login-highlights">
            {HIGHLIGHTS.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>

          <div className="login-socials">
            {SOCIALS.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noreferrer" aria-label={s.label}>
                {s.icon}
                <span>{s.label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
