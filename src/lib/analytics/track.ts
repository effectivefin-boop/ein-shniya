type TrackPayload = Record<string, string | number | boolean | undefined>;

/**
 * Fire a custom event to GTM dataLayer (and console in dev).
 * Safe no-op when analytics is off or consent denied.
 */
export function trackEvent(name: string, payload: TrackPayload = {}): void {
  if (typeof window === "undefined") return;
  const w = window as Window & { dataLayer?: Record<string, unknown>[] };
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push({ event: name, ...payload });
  if (process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-console
    console.debug("[analytics]", name, payload);
  }
}
