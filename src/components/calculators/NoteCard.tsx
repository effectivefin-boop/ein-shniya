"use client";

import type { NoteIconKind, ResultNote } from "@/lib/calculators/pension-gap/types";

const POSITIVE = "#2E7D4F";
const POSITIVE_BORDER = "#4E9D6E";
const WARNING_TEXT = "#9A6B12";
const WARNING_BORDER = "#D8A93B";

function NoteIcon({ kind, color }: { kind: NoteIconKind; color: string }) {
  const props = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };

  switch (kind) {
    case "shield":
      return (
        <svg {...props}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="M12 8v4" />
          <path d="M12 16h.01" />
        </svg>
      );
    case "sparkles":
      return (
        <svg {...props}>
          <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
          <path d="M5 19l.75 2.25L8 22l-2.25.75L5 25l-.75-2.25L2 22l2.25-.75L5 19z" />
        </svg>
      );
    case "banknote":
      return (
        <svg {...props}>
          <rect x="2" y="6" width="20" height="12" rx="2" />
          <circle cx="12" cy="12" r="2" />
          <path d="M6 12h.01M18 12h.01" />
        </svg>
      );
    case "landmark":
      return (
        <svg {...props}>
          <path d="M3 21h18" />
          <path d="M6 21V10" />
          <path d="M10 21V10" />
          <path d="M14 21V10" />
          <path d="M18 21V10" />
          <path d="M12 3l9 7H3l9-7z" />
        </svg>
      );
    case "fileWarning":
      return (
        <svg {...props}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6" />
          <path d="M12 11v4" />
          <path d="M12 17h.01" />
        </svg>
      );
    default:
      return null;
  }
}

export function NoteCard({
  note,
  startDelay = 0,
}: {
  note: ResultNote;
  startDelay?: number;
}) {
  const solidColor =
    note.type === "critical"
      ? "var(--color-error)"
      : note.type === "positive"
        ? POSITIVE
        : WARNING_TEXT;
  const borderColor =
    note.type === "critical"
      ? "color-mix(in srgb, var(--color-error) 45%, transparent)"
      : note.type === "positive"
        ? POSITIVE_BORDER
        : WARNING_BORDER;
  const bgColor =
    note.type === "critical"
      ? "color-mix(in srgb, var(--color-error) 6%, transparent)"
      : note.type === "positive"
        ? "rgba(46,125,79,0.05)"
        : "var(--color-surface-muted)";

  return (
    <article
      className="note-fade-in rounded-xl border px-4 py-5"
      style={{
        background: bgColor,
        borderColor,
        animationDelay: `${startDelay}ms`,
      }}
      aria-label={note.title}
    >
      <div className="mb-3 flex items-center gap-2">
        <NoteIcon kind={note.icon} color={solidColor} />
        <span className="text-[13px] font-bold text-text-muted">{note.title}</span>
      </div>

      {note.bigNumber ? (
        <div
          className="mb-3 text-4xl font-extrabold leading-none tabular-nums"
          style={{ color: solidColor }}
        >
          {note.bigNumber}
        </div>
      ) : null}

      <p className="m-0 text-[15px] leading-relaxed text-text">{note.text}</p>
    </article>
  );
}

/** Injected once near results for fade-in animation. */
export function NoteCardStyles() {
  return (
    <style>{`
      @keyframes note-fade-in {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .note-fade-in {
        animation: note-fade-in 0.45s ease both;
      }
      @media (prefers-reduced-motion: reduce) {
        .note-fade-in {
          animation: none;
        }
      }
    `}</style>
  );
}
