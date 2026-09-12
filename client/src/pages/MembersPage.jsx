import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import Header from "../components/Header";
import AdminNav from "../components/AdminNav";
import { useAuth } from "../context/AuthContext";
import { fetchMembers, addMember, bulkAddMembers, updateMember } from "../api";

export default function MembersPage() {
  const { user, loading: authLoading } = useAuth();

  const [members, setMembers] = useState(null);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [adding, setAdding] = useState(false);

  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [bulking, setBulking] = useState(false);

  async function load() {
    setError(null);
    try {
      setMembers(await fetchMembers());
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    if (user?.role === "admin") load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const filtered = useMemo(() => {
    if (!members) return [];
    const q = query.trim().toLowerCase();
    if (!q) return members;
    return members.filter(
      (m) => m.name.toLowerCase().includes(q) || m.collegeEmail.toLowerCase().includes(q)
    );
  }, [members, query]);

  const stats = useMemo(() => {
    if (!members) return null;
    return {
      total: members.length,
      active: members.filter((m) => m.active).length,
      admins: members.filter((m) => m.role === "admin" && m.active).length,
    };
  }, [members]);

  if (authLoading) return <div className="hub-loading">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") {
    return (
      <>
        <Header />
        <div className="editor-wrap">
          <h1>Admins only</h1>
          <p className="md-status">This page is for MIC leads.</p>
        </div>
      </>
    );
  }

  async function handleAdd(e) {
    e.preventDefault();
    setAdding(true);
    setError(null);
    setNotice(null);
    try {
      await addMember(name, email);
      setNotice(`Added ${email}. They can sign in straight away.`);
      setName("");
      setEmail("");
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setAdding(false);
    }
  }

  async function handleBulk(e) {
    e.preventDefault();
    setBulking(true);
    setError(null);
    setNotice(null);
    try {
      const r = await bulkAddMembers(bulkText);
      const bits = [`Added ${r.added}`];
      if (r.skipped) bits.push(`${r.skipped} already on the list`);
      if (r.invalid?.length) bits.push(`${r.invalid.length} couldn't be read`);
      setNotice(bits.join(" · "));
      if (r.invalid?.length) {
        setError(`Not imported: ${r.invalid.slice(0, 5).join(" | ")}${r.invalid.length > 5 ? " …" : ""}`);
      }
      setBulkText("");
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBulking(false);
    }
  }

  async function patch(id, changes) {
    setBusyId(id);
    setError(null);
    setNotice(null);
    try {
      await updateMember(id, changes);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <Header />
      <div className="editor-wrap">
        <h1>Members</h1>
        <AdminNav />

        {stats && (
          <p className="editor-note">
            {stats.total} on the list · {stats.active} active · {stats.admins} admin
            {stats.admins === 1 ? "" : "s"}. Anyone active here can sign in and edit pages.
          </p>
        )}

        {error && (
          <p className="login-error" role="alert">
            {error}
          </p>
        )}
        {notice && <p className="admin-notice">{notice}</p>}

        <form className="member-add" onSubmit={handleAdd}>
          <input
            type="text"
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="email@vitstudent.ac.in"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" className="editor-btn" disabled={adding}>
            {adding ? "Adding…" : "Add member"}
          </button>
          <button type="button" className="editor-cancel" onClick={() => setBulkOpen((o) => !o)}>
            {bulkOpen ? "Close bulk add" : "Bulk add"}
          </button>
        </form>

        {bulkOpen && (
          <form className="member-bulk" onSubmit={handleBulk}>
            <label>
              <span>Paste one member per line as <code>Name,email</code> — a header row is fine.</span>
              <textarea
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder={"Jane Doe,jane.doe2025@vitstudent.ac.in\nJohn Smith,john.smith2024@vitstudent.ac.in"}
                rows={8}
              />
            </label>
            <button type="submit" className="editor-btn" disabled={bulking || !bulkText.trim()}>
              {bulking ? "Importing…" : "Import"}
            </button>
          </form>
        )}

        <input
          className="member-search"
          type="search"
          placeholder={`Search ${members?.length || 0} members by name or email…`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        {!members && !error && <p className="md-status">Loading…</p>}

        {members && (
          <div className="member-table">
            {filtered.length === 0 && <p className="md-status">No members match “{query}”.</p>}
            {filtered.map((m) => {
              const isSelf = m.collegeEmail === user.email;
              return (
                <div className={`member-row${m.active ? "" : " is-inactive"}`} key={m._id}>
                  <div className="member-identity">
                    <strong>
                      {m.name}
                      {isSelf && <span className="member-you">you</span>}
                      {m.role === "admin" && <span className="member-badge">admin</span>}
                      {!m.active && <span className="member-badge member-badge--off">inactive</span>}
                    </strong>
                    <span className="member-email">{m.collegeEmail}</span>
                  </div>
                  <div className="member-actions">
                    <button
                      type="button"
                      className="editor-cancel"
                      disabled={busyId === m._id || isSelf}
                      title={isSelf ? "You can't change your own role" : ""}
                      onClick={() => patch(m._id, { role: m.role === "admin" ? "member" : "admin" })}
                    >
                      {m.role === "admin" ? "Make member" : "Make admin"}
                    </button>
                    <button
                      type="button"
                      className="editor-cancel"
                      disabled={busyId === m._id || isSelf}
                      title={isSelf ? "You can't deactivate yourself" : ""}
                      onClick={() => patch(m._id, { active: !m.active })}
                    >
                      {m.active ? "Deactivate" : "Reactivate"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
