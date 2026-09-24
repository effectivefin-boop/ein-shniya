"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import type { AnalyticsConfig } from "@/lib/analytics/config";
import {
  pushConsentToDataLayer,
  readStoredConsent,
  type ConsentValue,
} from "@/lib/analytics/consent";

type Props = {
  config: AnalyticsConfig;
};

/**
 * Loads GTM / GA4 / Meta / Clarity only after consent (when required).
 * GTM is the preferred hub — wire GA4, Meta, etc. inside the GTM container.
 */
export function AnalyticsScripts({ config }: Props) {
  const [consent, setConsent] = useState<ConsentValue | null>(null);

  useEffect(() => {
    setConsent(readStoredConsent());
    const onConsent = (e: Event) => {
      const detail = (e as CustomEvent<{ value: ConsentValue }>).detail;
      if (detail?.value) setConsent(detail.value);
    };
    window.addEventListener("ein-shniya-consent", onConsent);
    return () => window.removeEventListener("ein-shniya-consent", onConsent);
  }, []);

  const allowed =
    !config.consentRequired || consent === "granted";

  useEffect(() => {
    if (!allowed || !consent) return;
    pushConsentToDataLayer(consent);
  }, [allowed, consent]);

  if (!allowed) return null;

  return (
    <>
      {config.gtmId ? <GtmScripts gtmId={config.gtmId} /> : null}
      {!config.gtmId && config.ga4Id ? <Ga4Scripts ga4Id={config.ga4Id} /> : null}
      {config.metaPixelId ? <MetaPixel id={config.metaPixelId} /> : null}
      {config.clarityId ? <ClarityScript id={config.clarityId} /> : null}
    </>
  );
}

function GtmScripts({ gtmId }: { gtmId: string }) {
  return (
    <>
      <Script id="gtm-consent-default" strategy="beforeInteractive">{`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('consent', 'default', {
          analytics_storage: 'denied',
          ad_storage: 'denied',
          ad_user_data: 'denied',
          ad_personalization: 'denied',
          wait_for_update: 500
        });
      `}</Script>
      <Script id="gtm-loader" strategy="afterInteractive">{`
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','${gtmId}');
      `}</Script>
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
          height="0"
          width="0"
          style={{ display: "none", visibility: "hidden" }}
          title="Google Tag Manager"
        />
      </noscript>
    </>
  );
}

function Ga4Scripts({ ga4Id }: { ga4Id: string }) {
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">{`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${ga4Id}', { anonymize_ip: true });
      `}</Script>
    </>
  );
}

function MetaPixel({ id }: { id: string }) {
  return (
    <Script id="meta-pixel" strategy="afterInteractive">{`
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '${id}');
      fbq('track', 'PageView');
    `}</Script>
  );
}

function ClarityScript({ id }: { id: string }) {
  return (
    <Script id="ms-clarity" strategy="afterInteractive">{`
      (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
      })(window, document, "clarity", "script", "${id}");
    `}</Script>
  );
}
