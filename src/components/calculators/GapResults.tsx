"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { SoftSketchGapChart } from "@/components/brand/SoftSketchGapChart";
import { NoteCard, NoteCardStyles } from "@/components/calculators/NoteCard";
import {
  GAP_CRITICAL,
  GAP_MODERATE,
  GAP_NEGLIGIBLE,
} from "@/lib/calculators/pension-gap/constants";
import {
  formatILS,
  formatILSApprox,
} from "@/lib/calculators/pension-gap/math";
import {
  buildPensionGapNotes,
  PENSION_GAP_LIMITATIONS,
} from "@/lib/calculators/pension-gap/notes";
import type {
  PensionGapInputs,
  PensionGapResult,
} from "@/lib/calculators/pension-gap/types";

const POSITIVE = "#2E7D4F";
const POSITIVE_BORDER = "#4E9D6E";

function SparklesIcon({ color }: { color: string }) {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="mt-0.5 shrink-0"
    >
      <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
      <path d="M19 13l.6 1.8L21.4 15.4l-1.8.6L19 17.8l-.6-1.8L16.6 15.4l1.8-.6L19 13z" />
    </svg>
  );
}

function severityHeading(gapPercent: number): string {
  if (gapPercent >= GAP_CRITICAL) {
    return "התראת פנסיה: זיהינו פער קריטי בהכנסה הצפויה";
  }
  if (gapPercent >= GAP_MODERATE) {
    return "צפויה ירידה משמעותית ברמת החיים בפרישה";
  }
  return "מצב פנסיוני תקין: רמת החיים שלכם תישמר";
}

function severityHeaderClass(gapPercent: number): string {
  if (gapPercent >= GAP_CRITICAL) {
    return "bg-[color-mix(in_srgb,var(--color-error)_12%,transparent)] text-[var(--color-error)]";
  }
  if (gapPercent >= GAP_MODERATE) {
    return "bg-[var(--color-gap-soft)] text-[var(--color-gap-text)]";
  }
  return "text-[#2E7D4F]";
}

function severityHeaderStyle(
  gapPercent: number,
): React.CSSProperties | undefined {
  if (gapPercent < GAP_MODERATE) {
    return { background: "rgba(46,125,79,0.1)" };
  }
  return undefined;
}

export function GapResults({
  result,
  inputs,
  onLeadReady,
}: {
  result: PensionGapResult;
  inputs: PensionGapInputs;
  /** Called when note cards have been seen (or there are none) — gate the lead form. */
  onLeadReady?: (ready: boolean) => void;
}) {
  const notes = useMemo(
    () => buildPensionGapNotes(inputs, result),
    [inputs, result],
  );
  // Source filters early-retirement card out of the notes list (shown in dream box).
  const visibleNotes = notes;

  const noteCardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [seenCardIndices, setSeenCardIndices] = useState<Set<number>>(
    () => new Set(),
  );
  const noteCount = visibleNotes.length;
  const reachedEnd =
    noteCount === 0 ? true : seenCardIndices.size >= noteCount;

  useEffect(() => {
    setSeenCardIndices(new Set());
    if (noteCount === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        setSeenCardIndices((prev) => {
          const next = new Set(prev);
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const idx = Number(
                (entry.target as HTMLElement).dataset.cardIndex,
              );
              if (!Number.isNaN(idx)) next.add(idx);
            }
          });
          return next;
        });
      },
      { threshold: 0.6 },
    );

    noteCardRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [noteCount, result.gapPercent]);

  useEffect(() => {
    onLeadReady?.(reachedEnd);
  }, [reachedEnd, onLeadReady]);

  const heading = severityHeading(result.gapPercent);
  const isDecrease = result.gapPercent > 0;
  const isNegligibleGap = Math.abs(result.gapPercent) < GAP_NEGLIGIBLE;
  const severityColor =
    result.gapPercent >= GAP_MODERATE
      ? "var(--color-error)"
      : result.gapPercent >= 0
        ? "var(--color-gap-text)"
        : POSITIVE;
  const amountText = `₪${formatILSApprox(Math.abs(result.gapAmount))}`;

  const dreamBullets: ReactNode[] = [];
  if (result.gapPercent > 0 && result.hasExplicitExposureData) {
    dreamBullets.push(
      <>
        תוספת של כ-
        <strong className="font-extrabold">
          ₪{formatILSApprox(Math.max(result.monthlyAtBenchmark - result.monthlyIncome, 0))}
        </strong>{" "}
        לקצבה שלכם מדי חודש.
      </>,
    );
  }
  if (result.capitalGap > 0) {
    const monthlyAddition = Math.max(
      result.monthlyAtBenchmark - result.monthlyIncome,
      0,
    );
    const pensionBulletShown =
      result.gapPercent > 0 && result.hasExplicitExposureData;
    dreamBullets.push(
      <>
        פוטנציאל לעוד כ-
        <strong className="font-extrabold">
          ₪{formatILSApprox(result.capitalGap)}
        </strong>{" "}
        שתוכלו לצבור עד הפרישה
        {!pensionBulletShown ? (
          <>
            {" "}
            (שיגדילו את הקצבה שלכם בכ-
            <strong className="font-extrabold">
              ₪{formatILSApprox(monthlyAddition)}
            </strong>{" "}
            נוספים כל חודש!)
          </>
        ) : null}
        , וכרגע הפוטנציאל מתפספס בגלל ניהול לא מותאם.
      </>,
    );
  }
  if (result.earlyRetirementAge !== null) {
    dreamBullets.push(
      <>
        אפשרות אמיתית לפרישה מוקדמת כבר בגיל{" "}
        <strong className="font-extrabold">{result.earlyRetirementAge}</strong>.
      </>,
    );
  }

  return (
    <div className="overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface shadow-[var(--shadow-card)]">
      <NoteCardStyles />

      <div className="border-b border-border/70 bg-[var(--color-bg)] px-4 pt-6 sm:px-8 sm:pt-8">
        <SoftSketchGapChart className="mx-auto w-full max-w-lg" />
      </div>

      <div
        className={`px-5 py-4 text-center text-[17px] font-bold leading-snug sm:px-6 ${severityHeaderClass(result.gapPercent)}`}
        style={severityHeaderStyle(result.gapPercent)}
        role="status"
        aria-live="polite"
      >
        {heading}
      </div>

      <div className="space-y-5 p-5 sm:p-6">
        <div
          className="rounded-lg border px-4 py-3.5"
          style={{
            background: isDecrease
              ? "color-mix(in srgb, var(--color-error) 5%, transparent)"
              : "var(--color-surface-muted)",
            borderColor: isDecrease
              ? "color-mix(in srgb, var(--color-error) 35%, transparent)"
              : "var(--color-border)",
          }}
        >
          <p className="m-0 text-[17px] leading-relaxed text-text">
            השכר הנוכחי שלכם עומד על{" "}
            <strong className="font-bold text-text">
              ₪{formatILS(result.currentSalary)}
            </strong>{" "}
            בחודש. לעומת זאת, ההכנסה החודשית שתעמוד לרשותכם בפרישה צפויה להיות{" "}
            <strong className="font-bold text-text">
              כ-₪{formatILSApprox(result.monthlyIncome)}
            </strong>
            {result.gapPercent > 0 && !isNegligibleGap ? " בלבד." : "."}
          </p>
          <p className="mt-2 mb-0 text-[17px] leading-relaxed text-text">
            {isNegligibleGap ? (
              "זה אומר שרמת החיים שלכם צפויה להישמר כמעט בדיוק כפי שהיא כיום."
            ) : (
              <>
                {isDecrease
                  ? "זה אומר שברגע שתפסיקו לעבוד, רמת החיים שלכם תיחתך בכ-"
                  : "זה אומר שברגע שתפסיקו לעבוד, התקציב החודשי שלכם יוכל לזנק בכ-"}
                <strong
                  className="text-[22px] font-extrabold tabular-nums"
                  style={{ color: severityColor }}
                >
                  {amountText}
                </strong>{" "}
                מדי חודש.
              </>
            )}
          </p>
        </div>

        {visibleNotes.length > 0 ? (
          <section aria-labelledby="pension-notes-heading">
            <h3
              id="pension-notes-heading"
              className="mb-2.5 text-base font-bold text-text"
            >
              מה הנתונים שלכם מספרים לנו:
            </h3>
            <div className="flex flex-col gap-2.5">
              {visibleNotes.map((note, i) => (
                <div
                  key={`${note.title}-${i}`}
                  data-card-index={i}
                  ref={(el) => {
                    noteCardRefs.current[i] = el;
                  }}
                >
                  <NoteCard note={note} startDelay={i * 400} />
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {dreamBullets.length > 0 ? (
          <section
            className="rounded-xl border-[1.5px] px-4 py-[18px]"
            style={{
              background: "rgba(46,125,79,0.08)",
              borderColor: POSITIVE_BORDER,
            }}
            aria-labelledby="pension-improve-heading"
          >
            <h3
              id="pension-improve-heading"
              className="mb-3 text-base font-bold text-text"
            >
              {result.isGreenScenario
                ? "אתם בדרך הנכונה, אבל אפשר למקסם את הפוטנציאל עוד יותר:"
                : "אבל זה לא חייב להיות ככה. תכנון מותאם אישית יכול לשנות את התמונה:"}
            </h3>
            <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
              {dreamBullets.map((bullet, i) => (
                <li key={i} className="flex items-start gap-2">
                  <SparklesIcon color={POSITIVE} />
                  <p className="m-0 text-[15px] leading-relaxed text-text">
                    {bullet}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section
          className="rounded-lg border border-border bg-[var(--color-bg)]/60 px-4 py-3.5"
          aria-labelledby="pension-limitations-heading"
        >
          <h3
            id="pension-limitations-heading"
            className="mb-2 text-sm font-bold text-text"
          >
            {PENSION_GAP_LIMITATIONS.title}
          </h3>
          <ul className="m-0 list-disc space-y-1.5 pe-0 ps-5 text-xs leading-relaxed text-text-muted">
            {PENSION_GAP_LIMITATIONS.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
