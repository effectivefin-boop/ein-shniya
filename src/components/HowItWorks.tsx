import { Container } from "./Container";

const steps = [
  {
    n: "1",
    title: "מזינים מספרים",
    body: "מספרים בסיסיים שיש לכם — בלי טפסים ארוכים ובלי מונחים מסובכים.",
  },
  {
    n: "2",
    title: "רואים את הפער",
    body: "המחשבון מציג איפה אתם עומדים היום מול מה שאפשר לשפר — בצורה ויזואלית וברורה.",
  },
  {
    n: "3",
    title: "מבינים מה שווה לשפר",
    body: "מקבלים כיוון לבדיקה נוספת. אם תרצו — אפשר להמשיך לשיחה עם איש מקצוע בעל רישיון.",
  },
];

export function HowItWorks() {
  return (
    <section aria-labelledby="how-heading" className="py-16 sm:py-20">
      <Container>
        <div className="max-w-2xl">
          <h2
            id="how-heading"
            className="text-2xl font-bold tracking-tight text-text sm:text-3xl"
          >
            איך זה עובד
          </h2>
          <p className="mt-3 text-base text-text-muted sm:text-lg">
            שלושה צעדים פשוטים — מהמספרים שלכם עד לפער ששווה לבדוק.
          </p>
        </div>

        <ol className="mt-10 grid gap-6 sm:grid-cols-3">
          {steps.map((step) => (
            <li
              key={step.n}
              className="relative rounded-[var(--radius-card)] border border-border bg-surface p-6 shadow-[var(--shadow-card)]"
            >
              <span
                aria-hidden="true"
                className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-white"
              >
                {step.n}
              </span>
              <h3 className="text-lg font-semibold text-text">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-text-muted">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
