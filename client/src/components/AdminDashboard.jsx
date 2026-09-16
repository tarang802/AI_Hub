import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { isStaff, isLead } from "../lib/roles";
import { fetchAdminSummary } from "../api";

function when(iso) {
  const secs = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (secs < 60) return "just now";
  if (secs < 3600) return `${Math.round(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.round(secs / 3600)}h ago`;
  return `${Math.round(secs / 86400)}d ago`;
}

// Shown on the home page to admins and leads only. It is a summary with a way
// in, not a second copy of the admin tools — the panels themselves stay where
// they are.
export default function AdminDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const staff = isStaff(user?.role);

  useEffect(() => {
    if (!staff) return;
    fetchAdminSummary()
      .then(setData)
      .catch((err) => setError(err.message));
  }, [staff]);

  if (!staff) return null;

  return (
    <section className="dash">
      <div className="dash-head">
        <h2>Dashboard</h2>
        <span className="dash-role">
          {isLead(user.role) ? "Lead — full access" : "Admin — pages and members"}
        </span>
      </div>

      {error && (
        <p className="login-error" role="alert">
          {error}
        </p>
      )}
      {!data && !error && <p className="md-status">Loading…</p>}

      {data && (
        <>
          <dl className="dash-stats">
            <div>
              <dt>Pages</dt>
              <dd>
                {data.pages.total}
                {data.pages.hidden > 0 && <small>{data.pages.hidden} hidden</small>}
              </dd>
            </div>
            <div>
              <dt>Members</dt>
              <dd>
                {data.members.active}
                <small>{data.members.total - data.members.active} inactive</small>
              </dd>
            </div>
            <div>
              <dt>Staff</dt>
              <dd>
                {data.members.leads + data.members.admins}
                <small>
                  {data.members.leads} lead{data.members.leads === 1 ? "" : "s"} ·{" "}
                  {data.members.admins} admin{data.members.admins === 1 ? "" : "s"}
                </small>
              </dd>
            </div>
            <div>
              <dt>Edits this week</dt>
              <dd>
                {data.activity.editsThisWeek}
                <small>{data.activity.contributors} contributors all-time</small>
              </dd>
            </div>
          </dl>

          <div className="dash-actions">
            <Link to="/admin/pages">
              <strong>Pages</strong>
              <span>Create, reorder, hide or delete</span>
            </Link>
            <Link to="/admin/members">
              <strong>Members</strong>
              <span>{isLead(user.role) ? "Add people, manage admins and leads" : "Add people, manage members"}</span>
            </Link>
            <Link to="/admin">
              <strong>Changes</strong>
              <span>Review recent edits and revert</span>
            </Link>
            <Link to="/contributors">
              <strong>Contributors</strong>
              <span>Who is writing the hub</span>
            </Link>
          </div>

          {data.latest?.length > 0 && (
            <div className="dash-recent">
              <h3>Latest edits</h3>
              <ul>
                {data.latest.map((r) => (
                  <li key={r._id}>
                    <Link to={`/${r.slug}`}>{r.slug}</Link>
                    <span className="dash-recent-who">
                      {r.authorName || r.authorEmail}
                      {r.wordsAdded > 0 && ` · +${r.wordsAdded}w`}
                    </span>
                    <time dateTime={r.createdAt} title={new Date(r.createdAt).toLocaleString()}>
                      {when(r.createdAt)}
                    </time>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </section>
  );
}
