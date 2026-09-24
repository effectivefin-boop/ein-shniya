import Image from "next/image";
import Link from "next/link";
import { Container } from "./Container";

const calculators = [
  {
    slug: "pension-gap",
    name: "פער פנסיה",
    reveal: "כמה פחות (או יותר) תקבלו בחודש לעומת יעד סביר לפרישה.",
    image: "/illustrations/calc-pension-gap.png",
    alt: "סקיצה: מדרגות פנסיה עם סימון פער",
  },
  {
    slug: "management-fees",
    name: "דמי ניהול",
    reveal: "כמה עולה לכם לאורך השנים הפער בין דמי ניהול גבוהים לנמוכים.",
    image: "/illustrations/calc-management-fees.png",
    alt: "סקיצה: שתי עמודות דמי ניהול והפער ביניהן",
  },
  {
    slug: "hishtalmut",
    name: "קרן השתלמות",
    reveal: "איך הפקדות וריבית מצטברות — ואיפה נשאר מקום לשיפור.",
    image: "/illustrations/calc-hishtalmut.png",
    alt: "סקיצה: כלי חיסכון עם מפלס נוכחי ואפשרי",
  },
  {
    slug: "compound-interest",
    name: "ריבית דריבית",
    reveal: "מה קורה כשהחיסכון עובד לאורך זמן — ומה קורה כשלא.",
    image: "/illustrations/calc-compound-interest.png",
    alt: "סקיצה: שתי עקומות צמיחה והפער ביניהן",
  },
  {
    slug: "savings-goal",
    name: "יעד חיסכון",
    reveal: "כמה צריך להפקיד כדי להגיע ליעד — ומה הפער מהיום.",
    image: "/illustrations/calc-savings-goal.png",
    alt: "סקיצה: טבעת יעד מול התקדמות נוכחית",
  },
  {
    slug: "early-retirement",
    name: "פרישה מוקדמת",
    reveal: "מה נדרש כדי לפרוש מוקדם יותר — ואיפה הפער מהמסלול הנוכחי.",
    image: "/illustrations/calc-early-retirement.png",
    alt: "סקיצה: קו זמן בין פרישה מוקדמת לרגילה",
  },
];

export function CalculatorsGrid() {
  return (
    <section
      id="calculators"
      aria-labelledby="calculators-heading"
      className="scroll-mt-20 border-y border-border bg-surface-muted/60 py-16 sm:py-20"
    >
      <Container>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <h2
              id="calculators-heading"
              className="text-2xl font-bold tracking-tight text-text sm:text-3xl"
            >
              מחשבונים מובילים
            </h2>
            <p className="mt-3 text-base text-text-muted sm:text-lg">
              בחרו בדיקה — כל מחשבון מדגיש פער אחד ששווה להבין.
            </p>
          </div>
          <Link
            href="/calculators"
            className="text-sm font-semibold text-primary hover:underline"
          >
            לכל המחשבונים ←
          </Link>
        </div>

        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {calculators.map((calc) => (
            <li key={calc.slug}>
              <article className="group flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)]">
                <div className="relative aspect-[4/3] overflow-hidden border-b border-border/60 bg-[var(--color-bg)]">
                  <Image
                    src={calc.image}
                    alt={calc.alt}
                    fill
                    className="object-cover object-center transition duration-300 group-hover:scale-[1.02]"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  <h3 className="text-lg font-semibold text-text group-hover:text-primary">
                    {calc.name}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-text-muted">
                    {calc.reveal}
                  </p>
                  <Link
                    href={`/calculators/${calc.slug}`}
                    className="mt-5 inline-flex w-fit items-center rounded-[var(--radius-btn)] border border-border bg-surface px-4 py-2 text-sm font-semibold text-primary transition-colors hover:border-primary hover:bg-primary-soft"
                  >
                    לבדיקה
                  </Link>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
