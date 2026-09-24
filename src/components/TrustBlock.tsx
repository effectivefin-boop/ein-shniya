import { Container } from "./Container";

export function TrustBlock() {
  return (
    <section
      id="about"
      aria-labelledby="trust-heading"
      className="scroll-mt-20 py-16 sm:py-20"
    >
      <Container>
        <div className="mx-auto max-w-3xl rounded-[var(--radius-card)] border border-border bg-surface p-8 shadow-[var(--shadow-card)] sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            אמון
          </p>
          <h2
            id="trust-heading"
            className="mt-2 text-2xl font-bold tracking-tight text-text sm:text-3xl"
          >
            מי מאחורי עין שנייה
          </h2>
          <div className="mt-5 space-y-4 text-base leading-relaxed text-text-muted">
            <p>
              עין שנייה בונה כלים ותוכן שמסייעים להבין מספרים — פנסיה,
              חיסכון והוצאות — בצורה ברורה ושקטה. אנחנו לא מציעים ייעוץ
              ולא משווקים מוצרים פנסיונים.
            </p>
            <p>
              המפעילה אינה משווקת פנסיונית בעלת רישיון. המחשבונים הם כלי
              בדיקה והמחשה בלבד.
            </p>
            <p className="rounded-xl border border-primary/15 bg-primary-soft/60 px-4 py-3 text-text">
              <strong className="font-semibold">כלי בדיקה והמחשה — לא ייעוץ.</strong>{" "}
              אפשר להמשיך לשיחה עם איש מקצוע בעל רישיון.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
