export const CONSENT_STORAGE_KEY = "ein-shniya-analytics-consent";

export type ConsentValue = "granted" | "denied";

export function readStoredConsent(): ConsentValue | null {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (v === "granted" || v === "denied") return v;
  } catch {
    /* private mode */
  }
  return null;
}

export function storeConsent(value: ConsentValue): void {
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, value);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(
    new CustomEvent("ein-shniya-consent", { detail: { value } }),
  );
}

/** Push Google Consent Mode v2 defaults / updates into dataLayer */
export function pushConsentToDataLayer(value: ConsentValue): void {
  const w = window as Window & { dataLayer?: Record<string, unknown>[] };
  w.dataLayer = w.dataLayer || [];
  const granted = value === "granted";
  w.dataLayer.push({
    event: "consent_update",
    analytics_storage: granted ? "granted" : "denied",
    ad_storage: granted ? "granted" : "denied",
    ad_user_data: granted ? "granted" : "denied",
    ad_personalization: granted ? "granted" : "denied",
  });
  // gtag consent API if present
  const gtag = (w as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
  if (typeof gtag === "function") {
    gtag("consent", "update", {
      analytics_storage: granted ? "granted" : "denied",
      ad_storage: granted ? "granted" : "denied",
      ad_user_data: granted ? "granted" : "denied",
      ad_personalization: granted ? "granted" : "denied",
    });
  }
}
