import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Header from "../components/Header";
import { fetchPage, savePage } from "../api";
import { renderBody } from "../lib/content";

export default function EditPage() {
  const { "*": slug } = useParams();
  const navigate = useNavigate();

  const [page, setPage] = useState(null);
  const [body, setBody] = useState("");
  const [summary, setSummary] = useState("");
  const [preview, setPreview] = useState(false);
  const [status, setStatus] = useState({ loading: true, error: null, submitting: false });

  useEffect(() => {
    fetchPage(slug)
      .then((p) => {
        setPage(p);
        setBody(p.body);
        setStatus({ loading: false, error: null, submitting: false });
      })
      .catch((err) => setStatus({ loading: false, error: err.message, submitting: false }));
  }, [slug]);

  const dirty = page && body !== page.body;

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus((s) => ({ ...s, submitting: true, error: null }));
    try {
      await savePage(slug, body, summary);
      navigate(`/${slug}`);
    } catch (err) {
      setStatus((s) => ({ ...s, submitting: false, error: err.message }));
    }
  }

  if (status.loading) {
    return (
      <>
        <Header />
        <div className="editor-wrap">
          <p className="md-status">Loading…</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="editor-wrap">
        <div className="editor-head">
          <div>
            <p className="editor-eyebrow">Editing</p>
            <h1>{page?.title || slug}</h1>
          </div>
          <Link className="editor-cancel" to={`/${slug}`}>
            Cancel
          </Link>
        </div>

        <p className="editor-note">
          Your changes go live as soon as you save. Every save is recorded, so a lead can
          restore an earlier version if something goes wrong. Write in Markdown — headings with{" "}
          <code>##</code>, links as <code>[text](url)</code>.
        </p>

        {status.error && (
          <p className="login-error" role="alert">
            {status.error}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <div className="editor-tabs">
            <button type="button" className={!preview ? "active" : ""} onClick={() => setPreview(false)}>
              Write
            </button>
            <button type="button" className={preview ? "active" : ""} onClick={() => setPreview(true)}>
              Preview
            </button>
          </div>

          {preview ? (
            <div className="editor-preview md-content">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {renderBody(body, page?.linkBase)}
              </ReactMarkdown>
            </div>
          ) : (
            <textarea
              className="editor-textarea"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              spellCheck="false"
            />
          )}

          <label className="editor-summary">
            <span>What did you change? (optional, shows up in the page history)</span>
            <input
              type="text"
              value={summary}
              maxLength={300}
              placeholder="e.g. Added a link to the Stanford CS231n lectures"
              onChange={(e) => setSummary(e.target.value)}
            />
          </label>

          <div className="editor-actions">
            <button type="submit" className="editor-btn" disabled={!dirty || status.submitting}>
              {status.submitting ? "Saving…" : "Save changes"}
            </button>
            {!dirty && <span className="md-status">Make a change to save.</span>}
          </div>
        </form>
      </div>
    </>
  );
}
