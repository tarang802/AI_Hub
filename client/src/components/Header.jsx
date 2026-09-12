import { useAuth } from "../context/AuthContext";
import micLogo from "../assets/mic-logo.png";

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="hub-header">
      <div className="hub-header-inner">
        <div className="hub-brand">
          <img src={micLogo} alt="MIC logo" />
          <span>AI/ML Resource Hub</span>
        </div>
        {user && (
          <div className="hub-header-user">
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
