import type { NextConfig } from "next";

// Baseline browser security headers for every route.
const SECURITY_HEADERS = [
  // Nobody may embed Guildry in a frame (clickjacking).
  { key: "X-Frame-Options", value: "DENY" },
  // Browsers must not guess content types (stops uploaded files running as scripts).
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Send only the origin to other sites, never full URLs with job / request ids.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Pros share location and may photograph documents; nothing needs the mic.
  { key: "Permissions-Policy", value: "camera=(self), geolocation=(self), microphone=(), payment=(self)" },
  // HTTPS only, for two years (.app is HSTS-preloaded anyway).
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  async headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS }];
  },
};

export default nextConfig;
