import type { Metadata } from "next";
import { StubPageShell } from "@/components/StubPageShell";

export const metadata: Metadata = {
  title: "הצהרת נגישות",
  description: "הצהרת הנגישות של אתר עין שנייה.",
  robots: { index: false, follow: false },
};

export default function AccessibilityPage() {
  return (
    <StubPageShell
      title="הצהרת נגישות"
      description="איך אנחנו פועלים לנגישות האתר ואיך אפשר לפנות אלינו."
      showPreparingBadge={false}
    >
      <div className="space-y-6 text-sm leading-relaxed text-text-muted">
        <section className="space-y-3" aria-labelledby="a11y-goal">
          <h2 id="a11y-goal" className="text-base font-semibold text-text">
            מחויבות לנגישות
          </h2>
          <p>
            אתר עין שנייה שואף לעמוד בדרישות תקן ישראלי ת״י 5568 חלק 1
            ובהנחיות WCAG 2.0 ברמת AA, בהתאם לתקנות שוויון זכויות לאנשים עם
            מוגבלות (התאמות נגישות לשירות) לעניין שירותי אינטרנט. אנו משקיעים
            מאמץ מתמשך בשיפור הנגישות — זו מטרה שאנו פועלים לקראתה, ולא הצהרה
            על עמידה מלאה בכל הדרישות.
          </p>
        </section>

        <section className="space-y-3" aria-labelledby="a11y-done">
          <h2 id="a11y-done" className="text-base font-semibold text-text">
            מה עשינו עד כה
          </h2>
          <ul className="list-disc space-y-2 pe-5">
            <li>שיפור ניגודיות לטקסט פערים ולהודעות שגיאה.</li>
            <li>
              תוויות ARIA לשדות טופס ולהודעות שגיאה, ואזורי עדכון חיים (live
              regions) לתוצאות ולשגיאות.
            </li>
            <li>
              קבוצות רדיו נגישות לבחירת מגדר ורמת סיכון, ומתגים נגישים.
            </li>
            <li>
              ניווט מובייל עם מלכודת מיקוד (focus trap) ויציאה ב־Escape;
              באנר עוגיות עם ניהול מיקוד.
            </li>
            <li>
              קישור דילוג «דלגו לתוכן הראשי», מבנה כותרות ברור ושמות קישור
              נגישים.
            </li>
          </ul>
        </section>

        <section className="space-y-3" aria-labelledby="a11y-limits">
          <h2 id="a11y-limits" className="text-base font-semibold text-text">
            מגבלות ידועות
          </h2>
          <ul className="list-disc space-y-2 pe-5">
            <li>טרם בוצע ביקורת נגישות חיצונית מלאה לאתר.</li>
            <li>
              דפים ומחשבונים חדשים עשויים לכלול פערים זמניים עד שיטופלו.
            </li>
            <li>
              רכיבים חיצוניים (embeds) של צד שלישי עלולים שלא להיות נגישים
              במלואם.
            </li>
            <li>
              אין כרגע תוכן וידאו או שמע באתר, ולכן אין סעיף כתוביות או
              תמלילים.
            </li>
          </ul>
        </section>

        <section className="space-y-3" aria-labelledby="a11y-contact">
          <h2 id="a11y-contact" className="text-base font-semibold text-text">
            דיווח על בעיות ובקשות נגישות
          </h2>
          <p>
            נתקלתם בבעיית נגישות או צריכים התאמה? כתבו לנו ל־{" "}
            <a
              href="mailto:effective.fin@gmail.com"
              className="font-medium text-primary underline-offset-2 hover:underline"
              dir="ltr"
            >
              effective.fin@gmail.com
            </a>
            . אנא ציינו את כתובת העמוד (URL) ומה לא עבד — נשתדל להגיב בזמן
            סביר.
          </p>
        </section>

        <section className="space-y-3" aria-labelledby="a11y-updated">
          <h2 id="a11y-updated" className="text-base font-semibold text-text">
            עדכון ההצהרה
          </h2>
          <p>
            הצהרה זו מתעדכנת כאשר מתווספים דפים משמעותיים או שינויים
            מהותיים באתר. עדכון אחרון: ספטמבר 2026.
          </p>
        </section>

      </div>
    </StubPageShell>
  );
}
