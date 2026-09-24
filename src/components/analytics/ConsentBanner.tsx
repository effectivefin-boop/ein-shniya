"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import {
  pushConsentToDataLayer,
  readStoredConsent,
  storeConsent,
  type ConsentValue,
} from "@/lib/analytics/consent";

type Props = {
  /** When false, banner is hidden (no analytics configured). */
  enabled: boolean;
  consentRequired: boolean;
};

export function ConsentBanner({ enabled, consentRequired }: Props) {
  const [visible, setVisible] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    if (!enabled || !consentRequired) return;
    if (readStoredConsent() === null) setVisible(true);
  }, [enabled, consentRequired]);

  useEffect(() => {
    if (!visible) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current;

    const getFocusable = () => {
      if (!dialog) return [] as HTMLElement[];
      return Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
    };

    const focusables = getFocusable();
    // Prefer the deny button (first) so focus lands in the action group
    (focusables[0] ?? dialog)?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        // Temporary dismiss — do not store consent; banner may reappear next visit
        setVisible(false);
        return;
      }
      if (e.key !== "Tab" || !dialog) return;
      const items = getFocusable();
      if (items.length === 0) {
        e.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey) {
        if (active === first || !dialog.contains(active)) {
          e.preventDefault();
          last.focus();
        }
      } else if (active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previouslyFocused.current?.focus();
    };
  }, [visible]);

  if (!visible) return null;

  function choose(value: ConsentValue) {
    storeConsent(value);
    pushConsentToDataLayer(value);
    setVisible(false);
  }

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descId}
      tabIndex={-1}
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-surface/95 p-4 shadow-[0_-8px_30px_rgba(26,43,44,0.12)] backdrop-blur-sm sm:p-5"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <h2 id={titleId} className="text-base font-semibold text-text">
            עוגיות ומדידה
          </h2>
          <p
            id={descId}
            className="mt-1 text-sm leading-relaxed text-text-muted"
          >
            אנחנו משתמשים בכלי מדידה (למשל Google Tag Manager / Analytics)
            כדי להבין איך האתר עובד ולשפר אותו. אפשר לאשר או לדחות. פרטים
            נוספים ב־
            <Link href="/privacy" className="font-medium text-primary underline-offset-2 hover:underline">
              מדיניות הפרטיות
            </Link>
            .
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            type="button"
            onClick={() => choose("denied")}
            className="rounded-[var(--radius-btn)] border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-text transition-colors hover:bg-surface-muted focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            לדחות
          </button>
          <button
            type="button"
            onClick={() => choose("granted")}
            className="rounded-[var(--radius-btn)] bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            לאשר מדידה
          </button>
        </div>
      </div>
    </div>
  );
}
