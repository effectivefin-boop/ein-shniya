import { Container } from "./Container";
import { SoftSketchGapChart } from "./brand/SoftSketchGapChart";

/**
 * Brand metaphor "הפער": soft-sketch comparison + coral ONLY on the gap.
 * Numbers are illustrative placeholders — not real customer data.
 * Coral token (--color-gap) is used only here and in BrandMark.
 */
export function GapVisual() {
  return (
    <section aria-labelledby="gap-heading" className="py-16 sm:py-20">
      <Container>
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <h2
              id="gap-heading"
              className="text-2xl font-bold tracking-tight text-text sm:text-3xl"
            >
              ככה נראית בדיקה בעין שנייה
            </h2>
          </div>

          <figure className="mt-10 overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface shadow-[var(--shadow-card)]">
            <figcaption className="sr-only">
              השוואה בסגנון סקיצה רכה: קצבה חודשית משוערת היום לעומת תרחיש
              אפשרי, עם הדגשת הפער באלמוג.
            </figcaption>

            <div className="border-b border-border/70 bg-[var(--color-bg)] px-4 pt-6 sm:px-8 sm:pt-8">
              <SoftSketchGapChart className="mx-auto w-full max-w-lg" />
            </div>

            <div className="space-y-5 p-6 sm:p-8">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-border bg-[var(--color-bg)]/60 px-4 py-3">
                  <p className="text-xs font-medium text-text-muted">היום</p>
                  <p className="mt-1 text-xl font-semibold tabular-nums text-text">
                    ‎₪6,200
                  </p>
                  <p className="text-xs text-text-muted">מצב נוכחי (המחשה)</p>
                </div>
                <div className="rounded-xl border border-border bg-[var(--color-bg)]/60 px-4 py-3">
                  <p className="text-xs font-medium text-text-muted">אפשרי</p>
                  <p className="mt-1 text-xl font-semibold tabular-nums text-text">
                    ‎₪8,400
                  </p>
                  <p className="text-xs text-text-muted">תרחיש לבדיקה (המחשה)</p>
                </div>
              </div>

              {/* Gap callout — ONLY place --color-gap / accent is used in page UI */}
              <div
                className="flex flex-col items-stretch gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between"
                style={{
                  borderColor: "color-mix(in srgb, var(--color-gap) 30%, transparent)",
                  background: "var(--color-gap-soft)",
                }}
              >
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                    style={{ background: "var(--color-gap)" }}
                  >
                    {/* Hand-drawn-ish gap glyph */}
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                      <path
                        d="M9 3.5c.4 1.6.55 3.3.4 5-.05.7-.15 1.4-.4 2"
                        stroke="white"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-text">הפער</p>
                  </div>
                </div>
                <p
                  className="text-2xl font-bold tabular-nums sm:text-3xl"
                  style={{ color: "var(--color-gap)" }}
                >
                  ‎₪2,200
                  <span className="ms-1 text-sm font-medium text-text-muted">
                    /חודש
                  </span>
                </p>
              </div>
            </div>
          </figure>
        </div>
      </Container>
    </section>
  );
}
