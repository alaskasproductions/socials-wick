// Plain JS on purpose: a next.config.ts is transpiled with SWC at every
// server start, and Next's native SWC binary needs glibc >= 2.29 (the
// production host has 2.28). The WASM fallback crashes intermittently
// (out of memory), so keep this file .js to avoid loading SWC at runtime.

// NEXT_DIST_DIR lets a deploy build into a scratch folder (.next-build) and
// swap it in only after BUILD_ID exists, so a failed build can never leave the
// site without a production build. Runtime always serves the default .next.
const distDir = process.env.NEXT_DIST_DIR;

/** @type {import('next').NextConfig} */
const nextConfig = {
  ...(distDir ? { distDir } : {}),
};

module.exports = nextConfig;
