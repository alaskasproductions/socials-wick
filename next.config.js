// Plain JS on purpose: a next.config.ts is transpiled with SWC at every
// server start, and Next's native SWC binary needs glibc >= 2.29 (the
// production host has 2.28). The WASM fallback crashes intermittently
// (out of memory), so keep this file .js to avoid loading SWC at runtime.

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
};

module.exports = nextConfig;
