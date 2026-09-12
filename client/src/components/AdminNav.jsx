import { NavLink } from "react-router-dom";

export default function AdminNav() {
  return (
    <nav className="admin-nav">
      <NavLink to="/admin" end className={({ isActive }) => (isActive ? "active" : "")}>
        Recent changes
      </NavLink>
      <NavLink to="/admin/pages" className={({ isActive }) => (isActive ? "active" : "")}>
        Pages
      </NavLink>
      <NavLink to="/admin/members" className={({ isActive }) => (isActive ? "active" : "")}>
        Members
      </NavLink>
    </nav>
  );
}
