"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";

const links = [
  { href: "/calculators", label: "מחשבונים" },
  { href: "/blog", label: "בלוג" },
  { href: "/about", label: "אודות" },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const panel = panelRef.current;
    const previouslyFocused = document.activeElement as HTMLElement | null;

    const getFocusable = () => {
      if (!panel) return [] as HTMLElement[];
      return Array.from(
        panel.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => !el.hasAttribute("disabled") && el.tabIndex !== -1);
    };

    // Move focus into the dialog
    const focusables = getFocusable();
    (focusables[0] ?? panel)?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        return;
      }
      if (e.key !== "Tab" || !panel) return;
      const items = getFocusable();
      if (items.length === 0) {
        e.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey) {
        if (active === first || !panel.contains(active)) {
          e.preventDefault();
          last.focus();
        }
      } else if (active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      // Restore focus to trigger (or prior element)
      (triggerRef.current ?? previouslyFocused)?.focus();
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        ref={triggerRef}
        type="button"
        className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-btn)] border border-border bg-surface text-primary"
        aria-expanded={open}
        aria-controls={panelId}
        aria-haspopup="dialog"
        aria-label={open ? "סגירת תפריט" : "פתיחת תפריט"}
        onClick={() => setOpen((v) => !v)}
      >
        <span aria-hidden="true" className="text-xl leading-none">
          {open ? "✕" : "☰"}
        </span>
      </button>

      {open ? (
        <div
          ref={panelRef}
          id={panelId}
          className="absolute inset-x-0 top-full z-40 border-b border-border bg-surface shadow-[var(--shadow-card)]"
          role="dialog"
          aria-modal="true"
          aria-label="תפריט ניווט"
          tabIndex={-1}
        >
          <nav className="flex flex-col gap-1 p-4" aria-label="ניווט ראשי לנייד">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-[var(--radius-btn)] px-3 py-3 text-base font-medium text-text hover:bg-surface-muted"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/#calculators"
              className="mt-2 inline-flex items-center justify-center rounded-[var(--radius-btn)] bg-primary px-4 py-3 text-base font-semibold text-white hover:bg-primary-hover"
              onClick={() => setOpen(false)}
            >
              התחילו בדיקה
            </Link>
          </nav>
        </div>
      ) : null}
    </div>
  );
}
