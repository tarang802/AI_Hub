# MIC AI Hub — Wiki (deployment)

This is the login-gated, Wikipedia-style, editable knowledge base for MIC members — built on [Wiki.js](https://js.wiki/). It's a separate deployment from the public MkDocs site in the repo root: MkDocs needs no server (GitHub Pages), Wiki.js needs a real server with a database, because it's a full application with accounts, editing, and revision history.

Once this is live, the plan (per your "unify everything behind one login" decision) is for the wiki to become the single site members use — including the roadmap — and for the public MkDocs/GitHub Pages site to either redirect here or stay as a public teaser.

## What's in this folder

- `docker-compose.yml` — Wiki.js + Postgres, ready to run anywhere Docker runs.
- `.env.example` — copy to `.env` and fill in (never commit the real `.env`).
- `scripts/provision-members.js` — bulk-creates one Wiki.js account per MIC member from a CSV, so self-registration can stay OFF and only your member list ever gets in.

## 1. Try it locally first

```bash
cd wiki
cp .env.example .env
# edit .env — set a real DB_PASSWORD
docker compose up -d
```

Open `http://localhost:3000` — Wiki.js's setup wizard walks you through creating the first admin account (use your own email here; this is the account you'll use to lock things down in step 3).

## 2. Deploy somewhere real

Pick whichever you're most comfortable with — all of them can run this same `docker-compose.yml` with minor adjustments. Tell me which one and I'll write out the exact steps/config for it:

- **Render** — "Blueprint" or two services (a Postgres instance + a Docker web service pointing at `ghcr.io/requarks/wiki:2`), or a `render.yaml` I can generate from this compose file.
- **Railway** — deploy Postgres and Wiki.js as two services in one project; Railway can read a docker-compose-style setup or you add each service manually from its dashboard.
- **Fly.io** — needs a `fly.toml` plus a Fly Postgres (or external) database; more manual than Render/Railway but cheap and fast.
- **A VPS** (DigitalOcean, college server, etc.) — `docker compose up -d` directly, then put a reverse proxy (Caddy is easiest — automatic HTTPS) in front on port 443 pointing at Wiki.js's port 3000.

Whichever you pick, you'll need: the hosting account itself (I can't create one for you or enter payment details), and — for a VPS — a domain or subdomain pointed at it for HTTPS.

## 3. Lock down access (club-exclusive)

Once the instance is live and you have an admin account:

1. **Administration → Login** → under the "Local" strategy, turn **off** self-registration. This is what makes it "only pre-approved members" instead of "anyone can sign up."
2. **Administration → Utilities → API Access** → generate an admin API token. You'll need this for step 4.
3. Send me the member list (name + college email, one per line or as a CSV) — I'll turn it into `members.csv` here.

## 4. Provision member accounts

```bash
cd wiki/scripts
npm init -y --silent 2>/dev/null  # only if node_modules/fetch isn't already available (Node 18+ has fetch built in)
WIKI_URL=https://your-wiki-url WIKI_ADMIN_TOKEN=your-admin-token node provision-members.js members.csv --dry-run
# review the dry-run output, then re-run without --dry-run
WIKI_URL=https://your-wiki-url WIKI_ADMIN_TOKEN=your-admin-token node provision-members.js members.csv
```

This creates one account per member with a random temporary password (forced change on first login) and writes `members-provisioned.csv` with each member's temp password — share those over a private channel (not plaintext email/Slack), never post them anywhere public. **Before a real run**, sanity-check the `users.create` GraphQL mutation in the script against your instance's actual schema (Administration → Utilities → GraphQL Playground) — Wiki.js's API has shifted slightly across 2.x versions and I couldn't verify the exact current field names without a live instance to check against.

## 5. Bring in existing content

Wiki.js has a **Git storage** module (Administration → Storage) that can sync pages to/from a git repository — pointing it at this repo's `docs/` folder is the fastest way to pull in the ~40 existing pages instead of recreating them by hand. Expect some manual cleanup after the first sync: Wiki.js pages have their own path/metadata model that doesn't map 1:1 with MkDocs' nav structure in `mkdocs.yml`, so page ordering and the homepage will need rebuilding directly in Wiki.js.

The roadmap (`docs/assets/data/roadmap.json` + `docs/assets/js/roadmap.js`) is plain data-driven HTML/JS, so it can be dropped into a Wiki.js page (as an HTML-type page, or as an uploaded asset embedded via iframe) without rewriting it — exactly how it works on the current homepage today.

## Open items

- [ ] Pick a hosting platform (or confirm "not sure yet") so I can write exact deploy steps.
- [ ] Send the member email list when ready.
- [ ] Decide what happens to the current public MkDocs/GitHub Pages site once the wiki is live — retire it, or keep it as a public landing page that links to the login-gated wiki.
