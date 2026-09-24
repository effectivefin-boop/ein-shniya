import type { NextConfig } from "next";

/**
 * CSP allows common analytics hubs (GTM → GA4, Meta, Clarity, Hotjar, LinkedIn).
 * Prefer wiring everything through GTM so you only need googletagmanager.com in practice;
 * the extra hosts keep direct env fallbacks and typical GTM tags from breaking CSP.
 */
const ContentSecurityPolicy = [
  "default-src 'self'",
  [
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "https://www.googletagmanager.com",
    "https://www.google-analytics.com",
    "https://ssl.google-analytics.com",
    "https://tagmanager.google.com",
    "https://connect.facebook.net",
    "https://www.clarity.ms",
    "https://scripts.clarity.ms",
    "https://static.hotjar.com",
    "https://script.hotjar.com",
    "https://snap.licdn.com",
  ].join(" "),
  "style-src 'self' 'unsafe-inline' https://tagmanager.google.com https://fonts.googleapis.com",
  [
    "img-src 'self' data: blob:",
    "https://www.googletagmanager.com",
    "https://www.google-analytics.com",
    "https://ssl.gstatic.com",
    "https://www.facebook.com",
    "https://www.facebook.com/tr",
    "https://c.clarity.ms",
    "https://c.bing.com",
    "https://px.ads.linkedin.com",
  ].join(" "),
  "font-src 'self' data: https://fonts.gstatic.com",
  [
    "connect-src 'self'",
    "https://www.googletagmanager.com",
    "https://www.google-analytics.com",
    "https://analytics.google.com",
    "https://region1.google-analytics.com",
    "https://stats.g.doubleclick.net",
    "https://www.facebook.com",
    "https://graph.facebook.com",
    "https://*.clarity.ms",
    "https://*.bing.com",
    "https://*.hotjar.com",
    "https://*.hotjar.io",
    "https://px.ads.linkedin.com",
    "https://www.linkedin.com",
    "https://*.supabase.co",
    "wss://*.supabase.co",
  ].join(" "),
  "frame-src 'self' https://www.googletagmanager.com https://td.doubleclick.net",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), interest-cohort=(), payment=(), usb=()",
  },
  { key: "Content-Security-Policy", value: ContentSecurityPolicy },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
