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

app.prepare().then(() => {
  createServer((req, res) => handle(req, res)).listen(port, () => {
    console.log(`> Ready on port ${port}`);
  });
});
