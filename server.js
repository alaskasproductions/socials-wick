// Custom entry point for hosts (like Hostinger's Passenger-based Node.js
// app manager) that expect a literal startup .js file rather than running
// an npm script like `next start`. Point the host's "Application startup
// file" at this file instead.
const { createServer } = require("http");
const next = require("next");

const port = process.env.PORT || 3000;
const dev = process.env.NODE_ENV !== "production";

const app = next({ dev });
const handle = app.getRequestHandler();

// Behind a proxy chain (Cloudflare -> nginx -> Apache/Passenger) the
// X-Forwarded-* headers can arrive comma-joined, e.g. "https, https".
// Auth.js and our own URL helpers build URLs from them, and
// `new URL("https, https://host")` throws ERR_INVALID_URL, so keep only
// the first value.
const FORWARDED_HEADERS = ["x-forwarded-proto", "x-forwarded-host", "x-forwarded-port"];

function normalizeForwardedHeaders(req) {
  for (const name of FORWARDED_HEADERS) {
    const value = req.headers[name];
    if (typeof value === "string" && value.includes(",")) {
      req.headers[name] = value.split(",")[0].trim();
    }
  }
}

app.prepare().then(() => {
  createServer((req, res) => {
    normalizeForwardedHeaders(req);
    handle(req, res);
  }).listen(port, () => {
    console.log(`> Ready on port ${port}`);
  });
});
