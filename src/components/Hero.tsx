import Image from "next/image";
import { Button } from "./Button";
import { Container } from "./Container";

export function Hero() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative overflow-hidden border-b border-border bg-surface paper-dots"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--color-primary-soft)_0%,_transparent_55%)] opacity-40"
      />
      <Container className="relative py-14 sm:py-16 lg:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12">
          {/* RTL: copy first in DOM = right side visually */}
          <div className="order-1 max-w-xl">
            <h1
              id="hero-heading"
              className="text-4xl font-bold leading-tight tracking-tight text-text sm:text-5xl lg:text-[3.25rem] lg:leading-[1.15]"
            >
              גם לכסף מגיע עין שנייה.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-text-muted sm:text-xl">
              מחשבונים פשוטים לפנסיה, לחיסכון ולהוצאות. הם מראים איפה אתם
              עומדים ואיפה יש פער ששווה לבדוק.
            </p>
            <div className="mt-8">
              <Button href="/#calculators" size="lg">
                התחילו בדיקה
              </Button>
            </div>
          </div>

          <div className="order-2 relative mx-auto w-full max-w-lg lg:max-w-none">
            <div className="overflow-hidden rounded-[var(--radius-card)] border border-border/70 bg-surface shadow-[var(--shadow-card)]">
              <Image
                src="/illustrations/hero-gap.png"
                alt="איור סקיצה רכה: שני מצבים והפער ביניהם מסומן"
                width={1280}
                height={720}
                className="h-auto w-full"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
