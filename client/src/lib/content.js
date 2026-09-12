// Loads every ported MkDocs page (client/src/content/**/*.md) at build time
// and prepares it for react-markdown: strips the leading H1 (the page's own
// nav title is rendered separately), rewrites relative *.md links into
// in-app routes, and turns the handful of `!!! type "title"` admonitions
// used in the source docs into plain blockquotes (real Markdown, so nested
// links still parse — no raw-HTML pipeline needed for just one use).

const files = import.meta.glob("../content/**/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

const ADMONITION_EMOJI = {
  tip: "💡",
  note: "📝",
  warning: "⚠️",
  danger: "🚫",
  info: "ℹ️",
  success: "✅",
  question: "❓",
};

// The raw path keeps "index" segments (e.g. "foundations/index") so its
// *directory* can still be recovered — routes collapse "index" away, which
// would otherwise make an index page's own directory look like "" instead
// of e.g. "foundations".
function fileKeyToRawPath(key) {
  return key.replace(/^.*\/content\//, "").replace(/\.md$/, "");
}

function rawPathToRoute(rawPath) {
  let p = rawPath;
  if (p.endsWith("/index")) p = p.slice(0, -"/index".length);
  if (p === "index") p = "";
  return p;
}

function dirOfRawPath(rawPath) {
  const idx = rawPath.lastIndexOf("/");
  return idx === -1 ? "" : rawPath.slice(0, idx);
}

function resolveRelativeLink(fromDir, target) {
  const hashIdx = target.indexOf("#");
  const pathPart = hashIdx === -1 ? target : target.slice(0, hashIdx);
  const hash = hashIdx === -1 ? "" : target.slice(hashIdx + 1);

  if (!pathPart || !pathPart.endsWith(".md")) return null; // not an internal doc link

  const segments = fromDir ? fromDir.split("/") : [];

  for (const part of pathPart.split("/")) {
    if (part === "." || part === "") continue;
    if (part === "..") segments.pop();
    else segments.push(part);
  }

  let resolved = segments.join("/").replace(/\.md$/, "");
  resolved = resolved.replace(/(^|\/)index$/, "$1").replace(/\/$/, "");

  const routePath = "/" + resolved;
  return hash ? `${routePath}#${hash}` : routePath;
}

function rewriteLinks(body, fromDir) {
  return body.replace(/\]\(([^)]+)\)/g, (match, target) => {
    const rewritten = resolveRelativeLink(fromDir, target.trim());
    return rewritten ? `](${rewritten})` : match;
  });
}

function preprocessAdmonitions(md) {
  const lines = md.split("\n");
  const out = [];
  let i = 0;

  while (i < lines.length) {
    const m = lines[i].match(/^(!!!|\?\?\?)\s+([\w-]+)\s+"([^"]*)"\s*$/);
    if (!m) {
      out.push(lines[i]);
      i++;
      continue;
    }

    const [, , type, title] = m;
    const bodyLines = [];
    i++;
    while (i < lines.length && (lines[i].startsWith("    ") || lines[i].trim() === "")) {
      bodyLines.push(lines[i].startsWith("    ") ? lines[i].slice(4) : "");
      i++;
    }
    while (bodyLines.length && bodyLines[bodyLines.length - 1].trim() === "") bodyLines.pop();

    const emoji = ADMONITION_EMOJI[type.toLowerCase()] || "📌";
    out.push(`> **${emoji} ${title}**`, ">");
    for (const line of bodyLines) out.push(line ? `> ${line}` : ">");
  }

  return out.join("\n");
}

function stripLeadingH1(body) {
  return body.replace(/^\s*#\s+.+\n+/, "");
}

const registry = {};
for (const [key, raw] of Object.entries(files)) {
  const rawPath = fileKeyToRawPath(key);
  const route = rawPathToRoute(rawPath);
  registry[route] = stripLeadingH1(raw.replace(/\r\n/g, "\n"));
}

// The bundled markdown is now only a fallback for local work before the
// database has been seeded — live content comes from the API.
export function getBundledBody(route) {
  const clean = route.replace(/^\/+|\/+$/g, "");
  return registry[clean] ?? null;
}

// Turns stored markdown into what react-markdown should render. Applied at
// display time (not on save), so the editor always shows the raw source a
// contributor wrote — relative `.md` links and `!!!` admonitions included.
//
// `linkBase` is the directory relative links resolve against; the server
// stores it per page because it can't be inferred from the slug.
export function renderBody(body, linkBase = "") {
  const out = preprocessAdmonitions((body || "").replace(/\r\n/g, "\n"));
  return rewriteLinks(out, linkBase);
}
