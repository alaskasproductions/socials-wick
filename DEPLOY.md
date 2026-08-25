# Deploying to Hostinger

## 1. Create the MySQL database

In hPanel → **Databases → MySQL Databases**, create a new database and user.
Note down: host, port (usually 3306), database name, username, password.

Build the connection string:

```
mysql://USERNAME:PASSWORD@HOST:PORT/DATABASE_NAME
```

## 2. Set up the Node.js app

In hPanel → **Advanced → Node.js**:

- Node version: 20 or newer
- Application root: the folder your GitHub repo deploys into
- Application startup file: leave as the default entry Next.js expects, or set the start command to `npm start`
- Connect the GitHub repo (`alaskasproductions/socials-wick`, branch `main`)

## 3. Environment variables

Set these in the Node.js app's environment variable panel:

| Variable | Value |
|---|---|
| `DATABASE_URL` | the MySQL connection string from step 1 |
| `AUTH_SECRET` | a random 32+ byte string — generate with `openssl rand -base64 32` |
| `CRON_SECRET` | a random string — used to authenticate the sync-orders cron hit |
| `SITE_URL` | `https://socialswick.com` (your real domain) |

Everything else (Viva, Stripe, SMTP, MoreThanPanel, SEO, Tawk.to) is configured
from the **Admin → Settings** pages after first login — no other env vars are
required to get the app running.

## 4. First deploy — run once via SSH

```bash
npm install
npx prisma generate
npx prisma migrate deploy
npm run build
npx prisma db seed   # creates the admin/demo accounts and starter catalog
```

Then start (or restart) the app from hPanel's Node.js panel.

## 5. Change the seeded admin password

Log in as `admin@socialswick.com` / `admin123` immediately and change it —
or update it directly before going live.

## 6. Point your domain + SSL

Standard hPanel step: attach the domain to the app, issue a free SSL
certificate (Let's Encrypt, one click in hPanel).

## 7. Set up the order-sync cron job

The app auto-syncs order statuses with MoreThanPanel every 5 minutes via an
in-process timer, but that only works while the Node process stays alive
continuously — not guaranteed on shared/cloud hosting. As a reliable backup,
add a Cron Job in hPanel (**Advanced → Cron Jobs**):

```
*/5 * * * * curl -s -H "Authorization: Bearer YOUR_CRON_SECRET" https://socialswick.com/api/cron/sync-orders
```

## 8. Post-deploy checklist

- [ ] Admin → Settings → Payment Gateways — add Viva Wallet and/or Stripe credentials, enable
- [ ] Admin → Provider (MTP) — add your MoreThanPanel API key
- [ ] Admin → Settings → Email — add real SMTP credentials, send a test email
- [ ] Admin → Settings → SEO — confirm Site URL, add Google Search Console + Analytics IDs
- [ ] Admin → Settings → Live Chat — add Tawk.to Property/Widget ID if using it
- [ ] Register the webhook URLs with Viva (`/api/webhooks/viva`) and Stripe (`/api/webhooks/stripe`)
- [ ] In your Viva payment source settings, set Success/Failure URLs to the real domain
- [ ] Change the default admin password
