import { NavLink } from "react-router-dom";
import { nav } from "../content/nav";

export default function TopNav() {
  return (
    <nav className="hub-topnav">
      <div className="hub-topnav-inner">
        <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "")}>
          Home
        </NavLink>
        {nav.map((item) => (
          <NavLink key={item.path} to={`/${item.path}`} className={({ isActive }) => (isActive ? "active" : "")}>
            {item.title}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
