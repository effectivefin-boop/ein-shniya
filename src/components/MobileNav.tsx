"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";

const links = [
  { href: "/calculators", label: "מחשבונים" },
  { href: "/blog", label: "בלוג" },
  { href: "/about", label: "אודות" },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-btn)] border border-border bg-surface text-primary"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? "סגירת תפריט" : "פתיחת תפריט"}
        onClick={() => setOpen((v) => !v)}
      >
        <span aria-hidden="true" className="text-xl leading-none">
          {open ? "✕" : "☰"}
        </span>
      </button>

      {open ? (
        <div
          id={panelId}
          className="absolute inset-x-0 top-full z-40 border-b border-border bg-surface shadow-[var(--shadow-card)]"
          role="dialog"
          aria-label="תפריט ניווט"
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
