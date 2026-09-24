import {
  getAnalyticsConfig,
  hasAnyAnalytics,
} from "@/lib/analytics/config";
import { AnalyticsScripts } from "./AnalyticsScripts";
import { ConsentBanner } from "./ConsentBanner";

/** Server wrapper: reads env and mounts client analytics + consent UI. */
export function AnalyticsRoot() {
  const config = getAnalyticsConfig();
  const enabled = hasAnyAnalytics(config);

  return (
    <>
      <AnalyticsScripts config={config} />
      <ConsentBanner
        enabled={enabled}
        consentRequired={config.consentRequired}
      />
    </>
  );
}
