export type TrafficSource = "google" | "facebook" | "direct" | "other";

export type TrafficFields = {
  traffic_source: TrafficSource;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  referrer: string | null;
};

const UTM_STORAGE_KEY = "ein-shniya:utm";

function normalize(value: string | null | undefined): string | null {
  if (!value) return null;
  const t = value.trim();
  return t === "" ? null : t;
}

export function deriveTrafficSource(
  utmSource: string | null,
  referrer: string | null,
): TrafficSource {
  const src = (utmSource ?? "").toLowerCase();
  if (
    src.includes("google") ||
    src === "gclid" ||
    src.includes("adwords") ||
    src.includes("youtube")
  ) {
    return "google";
  }
  if (
    src.includes("facebook") ||
    src === "fb" ||
    src.includes("meta") ||
    src.includes("instagram") ||
    src.includes("ig")
  ) {
    return "facebook";
  }
  if (!utmSource && !referrer) return "direct";
  return "other";
}

/** Capture UTM + referrer on first land; persist UTM in sessionStorage. */
export function captureAndPersistTraffic(): TrafficFields {
  if (typeof window === "undefined") {
    return {
      traffic_source: "direct",
      utm_source: null,
      utm_medium: null,
      utm_campaign: null,
      referrer: null,
    };
  }

  const params = new URLSearchParams(window.location.search);
  let utm_source = normalize(params.get("utm_source"));
  let utm_medium = normalize(params.get("utm_medium"));
  let utm_campaign = normalize(params.get("utm_campaign"));

  try {
    const raw = sessionStorage.getItem(UTM_STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw) as {
        utm_source?: string | null;
        utm_medium?: string | null;
        utm_campaign?: string | null;
      };
      if (!utm_source && saved.utm_source) utm_source = normalize(saved.utm_source);
      if (!utm_medium && saved.utm_medium) utm_medium = normalize(saved.utm_medium);
      if (!utm_campaign && saved.utm_campaign)
        utm_campaign = normalize(saved.utm_campaign);
    } else if (utm_source || utm_medium || utm_campaign) {
      sessionStorage.setItem(
        UTM_STORAGE_KEY,
        JSON.stringify({ utm_source, utm_medium, utm_campaign }),
      );
    }
  } catch {
    // sessionStorage may be blocked
  }

  const referrer = normalize(document.referrer);
  return {
    traffic_source: deriveTrafficSource(utm_source, referrer),
    utm_source,
    utm_medium,
    utm_campaign,
    referrer,
  };
}
