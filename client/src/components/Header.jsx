import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import micLogo from "../assets/mic-logo.png";

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="hub-header">
      <div className="hub-header-inner">
        <Link className="hub-brand" to="/" aria-label="AI/ML Resource Hub — home">
          <img src={micLogo} alt="" />
          <span>AI/ML Resource Hub</span>
        </Link>
        {user && (
          <div className="hub-header-user">
            {user.role === "admin" && (
              <>
                <Link className="hub-header-link" to="/admin/pages">
                  Pages
                </Link>
                <Link className="hub-header-link" to="/admin">
                  Changes
                </Link>
              </>
            )}
            <Link className="hub-header-link" to="/my-edits">
              My edits
            </Link>
            <span className="hub-header-name">{user.name}</span>
            <button className="hub-header-signout" onClick={logout}>
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
