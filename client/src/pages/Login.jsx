import { useSearchParams, Navigate } from "react-router-dom";
import { googleLoginUrl } from "../api";
import { useAuth } from "../context/AuthContext";
import micLogo from "../assets/mic-logo.png";

export default function Login() {
  const { user, loading } = useAuth();
  const [params] = useSearchParams();
  const denied = params.get("error") === "not_allowed";

  if (!loading && user) return <Navigate to="/" replace />;

  return (
    <div className="login-screen">
      <div className="login-card">
        <img src={micLogo} alt="MIC logo" className="login-logo" />
        <span className="hub-eyebrow">Microsoft Innovation Club — VIT Chennai</span>
        <h1>AI/ML Resource Hub</h1>
        <p className="login-copy">
          Members-only. Sign in with your VIT student Google account
          (<code>@vitstudent.ac.in</code>) to get in — access is limited to
          people on the current MIC member list.
        </p>

        {denied && (
          <p className="login-error" role="alert">
            That account can't get in — either it's not a
            <code> @vitstudent.ac.in</code> address, or it's not on the MIC
            member list yet. Ask a lead to add you if you think this is wrong.
          </p>
        )}

        <a className="google-signin-btn" href={googleLoginUrl()}>
          <svg viewBox="0 0 48 48" width="20" height="20" aria-hidden="true">
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34.9 5.1 29.7 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.4-.1-2.7-.4-3.5z" />
            <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.6 16 19 13 24 13c3.1 0 5.8 1.1 8 3l6-6C34.9 5.1 29.7 3 24 3c-7.4 0-13.8 4-17.3 9.9z" />
            <path fill="#4CAF50" d="M24 45c5.6 0 10.7-1.9 14.6-5.2l-6.7-5.7c-2 1.4-4.7 2.4-7.9 2.4-5.2 0-9.6-3.3-11.3-7.9l-6.6 5.1C9.9 40.9 16.4 45 24 45z" />
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.6l6.7 5.7C41.7 36 45 30.7 45 24c0-1.4-.1-2.7-.4-3.5z" />
          </svg>
          Sign in with Google
        </a>
      </div>
    </div>
  );
}
