# Deploying to Hostinger

The app uses SQLite — a single file (`prisma/dev.db`), no separate database
server to provision. It's gitignored, so it won't come along with `git
pull`; it gets created fresh by `prisma migrate deploy` in step 4 below. The
app root needs to be a persistent path on the server (true for Hostinger's
Node.js hosting) since the file lives on disk between restarts — back it up
periodically since it holds all orders/users/settings.

## 1. Set up the Node.js app

hPanel → **Advanced → Node.js** → **Create Application**:

- **Node version**: 20 or newer
- **Application root**: the folder the app lives in (e.g. `domains/socialswick.com/public_html`, or wherever you connect the repo to)
- **Application startup file**: `server.js`

  Hostinger's Node.js hosting runs your app through Passenger, which expects
  a literal `.js` file to `require()`, not an npm script — `next start`
  alone won't work as the startup file. This repo already includes
  [`server.js`](server.js), a small wrapper that boots Next.js correctly
  under that model. Point Hostinger at it directly.

- **Connect the GitHub repo**: `alaskasproductions/socials-wick`, branch `main`
- Hostinger's panel has an "NPM Install" button — use it after connecting,
  or run it via SSH (below)

## 2. Environment variables

Set these in the Node.js app's environment variable panel:

| Variable | Value |
|---|---|
| `DATABASE_URL` | `file:./dev.db` (relative to `prisma/schema.prisma`) |
| `AUTH_SECRET` | a random 32+ byte string — generate with `openssl rand -base64 32` |
| `CRON_SECRET` | a random string — used to authenticate the sync-orders cron hit |
| `SITE_URL` | `https://socialswick.com` (your real domain) |
| `NODE_ENV` | `production` |

Everything else (Viva, Stripe, SMTP, MoreThanPanel, SEO, Tawk.to) is configured
from the **Admin → Settings** pages after first login — no other env vars are
required to get the app running.

## 3. First deploy — run once via SSH

Enable SSH in hPanel (**Advanced → SSH Access**) if it isn't already, connect,
`cd` into the application root, then:

```bash
npm install
npx prisma generate
npx prisma migrate deploy
npm run build
npx prisma db seed   # creates the admin/demo accounts and starter catalog
```

Then start (or restart) the app from hPanel's Node.js panel.

## 4. Change the seeded admin password

Log in as `admin@socialswick.com` / `admin123` immediately and change it —
or update it directly in `prisma/dev.db` before going live.

## 5. Point your domain + SSL

Standard hPanel step: attach the domain to the app, issue a free SSL
certificate (Let's Encrypt, one click in hPanel).

## 6. Set up the order-sync cron job

The app auto-syncs order statuses with MoreThanPanel every 5 minutes via an
in-process timer, but that only works while the Node process stays alive
continuously — not guaranteed on shared/cloud hosting. As a reliable backup,
add a Cron Job in hPanel (**Advanced → Cron Jobs**):

```
*/5 * * * * curl -s -H "Authorization: Bearer YOUR_CRON_SECRET" https://socialswick.com/api/cron/sync-orders
```

## 7. Post-deploy checklist

- [ ] Admin → Settings → Payment Gateways — add Viva Wallet and/or Stripe credentials, enable
- [ ] Admin → Provider (MTP) — add your MoreThanPanel API key
- [ ] Admin → Settings → Email — add real SMTP credentials, send a test email
- [ ] Admin → Settings → SEO — confirm Site URL, add Google Search Console + Analytics IDs
- [ ] Admin → Settings → Live Chat — add Tawk.to Property/Widget ID if using it
- [ ] Register the webhook URLs with Viva (`/api/webhooks/viva`) and Stripe (`/api/webhooks/stripe`)
- [ ] In your Viva payment source settings, set Success/Failure URLs to the real domain
- [ ] Change the default admin password

## Troubleshooting

**"UntrustedHost" error from NextAuth** — already fixed in the code
(`trustHost: true` in `src/lib/auth.ts`), but if you ever see this again
after future changes, it means the app doesn't recognize the domain it's
being accessed from.

**App won't start / "Cannot find module" errors** — usually means `npm install`
didn't run against the right Node version, or `npm run build` wasn't run
before starting. Re-run step 3.

**500 errors on any page that touches the database** — check the app root is
writable (SQLite needs to create/write `prisma/dev.db`), and that
`npx prisma migrate deploy` actually completed without errors.

**Data disappeared after a redeploy** — `prisma/dev.db` is gitignored on
purpose so a fresh `git pull` never overwrites real production data. If a
redeploy process wipes and re-clones the app root instead of pulling in
place, the database file goes with it — copy it out and back in around any
such redeploy, or switch to a real MySQL/Postgres if the host's deploy
flow can't guarantee a persistent file.
