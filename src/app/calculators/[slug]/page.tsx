import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { PensionGapCalculator } from "@/components/calculators/PensionGapCalculator";
import { StubPageShell } from "@/components/StubPageShell";

type Props = { params: Promise<{ slug: string }> };

const titles: Record<string, string> = {
  "pension-gap": "מחשבון פער פנסיה – כמה חסר לכם לפרישה?",
  "management-fees": "דמי ניהול",
  hishtalmut: "קרן השתלמות",
  "compound-interest": "ריבית דריבית",
  "savings-goal": "יעד חיסכון",
  "early-retirement": "פרישה מוקדמת",
};

const PENSION_GAP_META =
  "כמה חסר לכם לפרישה? בדקו את הפער בין הקצבה הצפויה מהחיסכון הפנסיוני לבין ההכנסה שתרצו. החישוב להמחשה בלבד ולא כולל קצבת זקנה מביטוח לאומי.";

/** Visible FAQ — exact wording from SEO pack FAQ section */
const PENSION_GAP_FAQ = [
  {
    q: "מה בודק מחשבון פער פנסיה?",
    a: "המחשבון משווה בין הקצבה החודשית המשוערת מהחיסכון הפנסיוני לבין ההכנסה החודשית שתרצו בפרישה. ההפרש ביניהן הוא פער הפנסיה. כך אפשר לראות מראש אם החיסכון הנוכחי צפוי להספיק.",
  },
  {
    q: "האם החישוב כולל קצבת זקנה?",
    a: "לא. קצבת זקנה (קצבת אזרח ותיק) מביטוח לאומי לא נכללת בחישוב בכלל, גם אם אתם זכאים לה. המחשבון בודק רק את החיסכון הפנסיוני. לכן אם תקבלו קצבת זקנה, ההכנסה שלכם בפרישה עשויה להיות גבוהה יותר מהתוצאה שמוצגת.",
  },
  {
    q: "על אילו נתונים החישוב מתבסס?",
    a: "על הנתונים שאתם מזינים, כמו גיל, גיל פרישה, צבירה נוכחית, הפקדה חודשית וההכנסה הרצויה. החישוב נשען גם על הנחות כלליות, כמו תשואה שנתית ומקדם המרה משוערים. ההנחות מוצגות ליד התוצאה.",
  },
  {
    q: "האם התוצאה מבטיחה קצבה או תשואה?",
    a: "לא. התוצאה היא המחשה בלבד, והיא לא מבטיחה קצבה, תשואה או תוצאה כלשהי. בפועל הקצבה תלויה בתשואות, בדמי ניהול, במקדם ההמרה ובשינויים בחיים ובחקיקה.",
  },
  {
    q: "האם עין שנייה נותנת ייעוץ פנסיוני?",
    a: "לא. עין שנייה אינה בעלת רישיון שיווק פנסיוני או ייעוץ פנסיוני. המחשבון והמידע בעמוד לא מהווים ייעוץ ולא מחליפים בדיקה אישית אצל בעל רישיון.",
  },
  {
    q: "מה עושים אם יצא פער?",
    a: "פער הוא נקודת פתיחה לבדיקה. אפשר ללחוץ על «רוצה לבדוק איך לשפר את התיק» ולהשאיר שם וטלפון או אימייל, ונחזור אליכם. הפנייה לא מחייבת לכלום.",
  },
] as const;

/** FAQPage JSON-LD — texts from pack JSON-LD section */
const PENSION_GAP_FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "מה בודק מחשבון פער פנסיה?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "המחשבון משווה בין הקצבה החודשית המשוערת מהחיסכון הפנסיוני לבין ההכנסה החודשית שתרצו בפרישה. ההפרש ביניהן הוא פער הפנסיה. כך אפשר לראות מראש אם החיסכון הנוכחי צפוי להספיק.",
      },
    },
    {
      "@type": "Question",
      name: "האם החישוב כולל קצבת זקנה?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "לא. קצבת זקנה (קצבת אזרח ותיק) מביטוח לאומי לא נכללת בחישוב בכלל, גם אם אתם זכאים לה. המחשבון בודק רק את החיסכון הפנסיוני. לכן אם תקבלו קצבת זקנה, ההכנסה שלכם בפרישה עשויה להיות גבוהה יותר מהתוצאה שמוצגת.",
      },
    },
    {
      "@type": "Question",
      name: "על אילו נתונים החישוב מתבסס?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "על הנתונים שאתם מזינים, כמו גיל, גיל פרישה, צבירה נוכחית, הפקדה חודשית וההכנסה הרצויה. החישוב נשען גם על הנחות כלליות, כמו תשואה שנתית ומקדם המרה משוערים. ההנחות מוצגות ליד התוצאה.",
      },
    },
    {
      "@type": "Question",
      name: "האם התוצאה מבטיחה קצבה או תשואה?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "לא. התוצאה היא המחשה בלבד, והיא לא מבטיחה קצבה, תשואה או תוצאה כלשהי. בפועל הקצבה תלויה בתשואות, בדמי ניהול, במקדם ההמרה ובשינויים בחיים ובחקיקה.",
      },
    },
    {
      "@type": "Question",
      name: "האם עין שנייה נותנת ייעוץ פנסיוני?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "לא. עין שנייה אינה בעלת רישיון שיווק פנסיוני או ייעוץ פנסיוני. המחשבון והמידע בעמוד לא מהווים ייעוץ ולא מחליפים בדיקה אישית אצל בעל רישיון.",
      },
    },
    {
      "@type": "Question",
      name: "מה עושים אם יצא פער?",
      acceptedAnswer: {
        "@type": "Answer",
        text: 'פער הוא נקודת פתיחה לבדיקה. אפשר ללחוץ על «רוצה לבדוק איך לשפר את התיק» ולהשאיר שם וטלפון או אימייל, ונחזור אליכם. הפנייה לא מחייבת לכלום.',
      },
    },
  ],
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (slug === "pension-gap") {
    // Root layout template appends " | עין שנייה" — omit suffix here to match pack title exactly
    return {
      title: "מחשבון פער פנסיה – כמה חסר לכם לפרישה?",
      description: PENSION_GAP_META,
    };
  }
  const name = titles[slug] ?? "מחשבון";
  return { title: name };
}

export default async function CalculatorPage({ params }: Props) {
  const { slug } = await params;
  const name = titles[slug] ?? "מחשבון";

  if (slug === "pension-gap") {
    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(PENSION_GAP_FAQ_JSON_LD),
          }}
        />
        <Container className="py-10 sm:py-14">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-3xl font-bold tracking-tight text-text sm:text-4xl">
              מחשבון פער פנסיה
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-text-muted">
              פער פנסיה הוא ההפרש בין הקצבה החודשית הצפויה מהחיסכון הפנסיוני
              לבין ההכנסה שתרצו לקבל אחרי הפרישה. מזינים כמה נתונים בסיסיים,
              ורואים אם יש פער ומה הגודל שלו.
            </p>
          </div>
          <div className="mt-10">
            <PensionGapCalculator />
          </div>

          <section
            className="mx-auto mt-14 max-w-2xl"
            aria-labelledby="pension-gap-faq-heading"
          >
            <h2
              id="pension-gap-faq-heading"
              className="text-2xl font-bold tracking-tight text-text"
            >
              שאלות נפוצות
            </h2>
            <dl className="mt-6 space-y-5">
              {PENSION_GAP_FAQ.map((item) => (
                <div
                  key={item.q}
                  className="rounded-[var(--radius-card)] border border-border bg-surface p-5 shadow-[var(--shadow-card)]"
                >
                  <dt className="text-base font-semibold text-text">
                    {item.q}
                  </dt>
                  <dd className="mt-2 text-sm leading-relaxed text-text-muted">
                    {item.q === "מה עושים אם יצא פער?" ? (
                      <>
                        פער הוא נקודת פתיחה לבדיקה. אפשר ללחוץ על{" "}
                        <a
                          href="#pension-gap-lead"
                          className="font-medium text-primary underline-offset-2 hover:underline"
                        >
                          «רוצה לבדוק איך לשפר את התיק»
                        </a>{" "}
                        ולהשאיר שם וטלפון או אימייל, ונחזור אליכם. הפנייה לא
                        מחייבת לכלום.
                      </>
                    ) : (
                      item.a
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        </Container>
      </>
    );
  }

  return (
    <StubPageShell
      title={name}
      description="המחשבון בהכנה. בקרוב תוכלו להזין מספרים ולראות את הפער."
    />
  );
}
