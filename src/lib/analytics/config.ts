/**
 * Analytics IDs come only from env — never hard-code secrets/IDs in source.
 * Prefer GTM as the hub; optional direct IDs are fallbacks or for tools not in GTM yet.
 */
export type AnalyticsConfig = {
  gtmId: string | null;
  ga4Id: string | null;
  metaPixelId: string | null;
  clarityId: string | null;
  /** When true (default), tags wait for cookie consent. */
  consentRequired: boolean;
};

function read(name: string): string | null {
  const v = process.env[name]?.trim();
  return v ? v : null;
}

export function getAnalyticsConfig(): AnalyticsConfig {
  return {
    gtmId: read("NEXT_PUBLIC_GTM_ID"),
    ga4Id: read("NEXT_PUBLIC_GA4_ID"),
    metaPixelId: read("NEXT_PUBLIC_META_PIXEL_ID"),
    clarityId: read("NEXT_PUBLIC_CLARITY_ID"),
    consentRequired: read("NEXT_PUBLIC_ANALYTICS_CONSENT_REQUIRED") !== "false",
  };
}

export function hasAnyAnalytics(cfg: AnalyticsConfig = getAnalyticsConfig()): boolean {
  return Boolean(cfg.gtmId || cfg.ga4Id || cfg.metaPixelId || cfg.clarityId);
}
