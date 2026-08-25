# Deploying to a cPanel host (no SSH required)

This covers cPanel accounts that expose **Git™ Version Control** and
**Setup Node.js App** (the CloudLinux/Passenger Node selector most cPanel
hosts ship) but where you don't have a standalone SSH client. Everything
below is done through the cPanel web UI. If your host *does* give you SSH,
the [Hostinger guide](DEPLOY.md) steps 3/6 are simpler to run directly —
use this doc for the panel-specific parts (Git pull, Node app) and the SSH
doc's commands if you get a real shell.

## 1. Clone the repo with Git Version Control

The app uses SQLite — a single file (`prisma/dev.db`), so there's no
database server to create in cPanel at all. The file is gitignored (won't
come down with `git pull`); it gets created fresh by `prisma migrate
deploy` in step 5. It needs to live on a persistent path — true of the
application root cPanel gives you — since the file has to survive between
restarts. Back it up periodically once live, since it holds every
order/user/setting.

cPanel → **Git™ Version Control** → **Create**:

- **Clone a Repository**: on
- **Clone URL**: `https://github.com/alaskasproductions/socials-wick.git`
- **Repository Path**: where the app should live, e.g.
  `/home/CPANELUSER/socialswick.com` (does **not** need to be under
  `public_html` — the Node.js app step below serves it directly and proxies
  the domain to it)
- **Repository Name**: anything, e.g. `socials-wick`
- Click **Create**

This pulls `main` from GitHub. To pull future updates, come back to this
same screen, open the repo, and click **Pull or Deploy → Update from Remote**.

## 2. Create the Node.js app

cPanel → **Setup Node.js App** → **Create Application**:

- **Node.js version**: 20.x or newer
- **Application mode**: Production
- **Application root**: the same path you cloned into, e.g.
  `socialswick.com` (relative to your home directory)
- **Application URL**: pick the domain `socialswick.com`
- **Application startup file**: `server.js`

  cPanel's Node selector runs your app through Passenger, which requires a
  literal `.js` file to `require()` — not an npm script like `next start`.
  This repo already includes [`server.js`](server.js) for exactly this.
  Point the field at it directly.

Click **Create**. The app will show as "Stopped" — that's expected until
you install dependencies and build (next steps).

## 3. Set environment variables

Still on the Setup Node.js App page, scroll to your app and add these under
**Environment variables**:

| Variable | Value |
|---|---|
| `DATABASE_URL` | `file:./dev.db` (relative to `prisma/schema.prisma`) |
| `AUTH_SECRET` | a random 32+ byte string — generate one locally with `openssl rand -base64 32` (or use any password generator) |
| `CRON_SECRET` | a random string — authenticates the sync-orders cron hit |
| `SITE_URL` | `https://socialswick.com` |
| `NODE_ENV` | `production` |

Everything else (Viva, Stripe, SMTP, MoreThanPanel, SEO, Tawk.to) is
configured later from **Admin → Settings** in the running app — no other
env vars are required to get it running.

Click **Save**.

## 4. Install dependencies and build

The Setup Node.js App page has a command box that reads something like:

```
source /home/CPANELUSER/nodevenv/socialswick.com/20/bin/activate && cd /home/CPANELUSER/socialswick.com
```

Two ways to run the actual install/build commands with that environment active:

- **cPanel Terminal** (Advanced → Terminal, if your host enables it — many
  do even when they don't hand out a separate SSH client/key). Paste the
  activate command above, then run:

  ```bash
  npm install
  npx prisma generate
  npx prisma migrate deploy
  npm run build
  npx prisma db seed
  ```

- **No Terminal available**: on the Setup Node.js App page there's a **Run
  NPM Install** button — use it for `npm install`. For the remaining
  Prisma/build commands, which that button can't run, ask your host's
  support to enable cPanel Terminal or SSH for your account (this is a
  routine, low-risk request most cPanel hosts grant immediately) — Prisma's
  native binaries and the Next.js production build genuinely need to be
  generated on the server, so there's no way around running these commands
  there.

## 5. Start the app

Back on **Setup Node.js App**, click **Restart** (or **Start**) for the
application.

## 6. Change the seeded admin password

Log in at `https://socialswick.com` as `admin@socialswick.com` / `admin123`
immediately and change it, or update it directly in `prisma/dev.db` first.

## 7. Point the domain + SSL

If `socialswick.com` isn't already the primary domain on this cPanel
account, add it under **Domains**, then issue a free SSL certificate via
**SSL/TLS Status → AutoSSL** (or Let's Encrypt if your host offers it as a
separate plugin).

## 8. Set up the order-sync cron job

The app auto-syncs order statuses with MoreThanPanel every 5 minutes via an
in-process timer, which only works while the Node process stays alive
continuously. As a reliable backup, add a cron job under cPanel →
**Cron Jobs**:

- **Common Settings**: Every 5 Minutes
- **Command**:

  ```bash
  curl -s -H "Authorization: Bearer YOUR_CRON_SECRET" https://socialswick.com/api/cron/sync-orders
  ```

## 9. Post-deploy checklist

- [ ] Admin → Settings → Payment Gateways — add Viva Wallet and/or Stripe credentials, enable
- [ ] Admin → Provider (MTP) — add your MoreThanPanel API key
- [ ] Admin → Settings → Email — add real SMTP credentials, send a test email
- [ ] Admin → Settings → SEO — confirm Site URL, add Google Search Console + Analytics IDs
- [ ] Admin → Settings → Live Chat — add Tawk.to Property/Widget ID if using it
- [ ] Register webhook URLs with Viva (`/api/webhooks/viva`) and Stripe (`/api/webhooks/stripe`)
- [ ] In your Viva payment source settings, set Success/Failure URLs to the real domain
- [ ] Change the default admin password

## Troubleshooting

**"UntrustedHost" error from NextAuth** — already fixed in the code
(`trustHost: true` in `src/lib/auth.ts`).

**App won't start / "Cannot find module" errors** — `npm install` didn't
run against the app's own Node version (always use the activate command
from the Node.js app page, not a bare `npm install`), or `npm run build`
wasn't run before starting.

**500 errors on any page that touches the database** — check the app root
is writable (SQLite needs to create/write `prisma/dev.db`), and that
`npx prisma migrate deploy` completed without errors.

**Passenger shows a generic error page instead of your app** — check the
app's log file, linked from the Setup Node.js App page next to your
application (usually `stderr.log` in the application root).

**Data disappeared after a redeploy** — `prisma/dev.db` is gitignored on
purpose so **Update from Remote** never overwrites real production data.
If you ever delete and re-clone the repository path instead of pulling in
place, the database file goes with it — copy it out first.
