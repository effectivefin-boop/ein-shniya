import Link from "next/link";
import { Container } from "./Container";

const posts = [
  {
    slug: "what-is-pension-gap",
    title: "מה זה בכלל ״פער פנסיה״?",
    excerpt:
      "הסבר פשוט על ההפרש בין מה שצפוי לכם לבין יעד סביר — בלי זargon מיותר.",
    tag: "פנסיה",
  },
  {
    slug: "management-fees-explained",
    title: "דמי ניהול: למה אחוז קטן משנה הרבה",
    excerpt:
      "איך פער של שבריר אחוז מצטבר לאורך שנים — ולמה שווה לבדוק.",
    tag: "חיסכון",
  },
  {
    slug: "when-to-check-savings",
    title: "מתי שווה לעצור ולבדוק את החיסכון",
    excerpt:
      "רגעים בחיים שבהם מספרים משתנים — ושווה להסתכל שוב על הפער.",
    tag: "חיסכון",
  },
];

export function BlogTeaser() {
  return (
    <section
      aria-labelledby="blog-heading"
      className="border-y border-border bg-surface py-16 sm:py-20"
    >
      <Container>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <h2
              id="blog-heading"
              className="text-2xl font-bold tracking-tight text-text sm:text-3xl"
            >
              מהבלוג
            </h2>
            <p className="mt-3 text-base text-text-muted sm:text-lg">
              הסברים קצרים על פערים ששווה להבין.
            </p>
          </div>
          <Link
            href="/blog"
            className="text-sm font-semibold text-primary hover:underline"
          >
            לכל הכתבות ←
          </Link>
        </div>

        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <li key={post.slug}>
              <article className="flex h-full flex-col rounded-[var(--radius-card)] border border-border bg-bg p-6 transition hover:border-primary/40">
                <span className="text-xs font-semibold uppercase tracking-wide text-primary">
                  {post.tag}
                </span>
                <h3 className="mt-2 text-lg font-semibold text-text">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="hover:text-primary hover:underline"
                  >
                    {post.title}
                  </Link>
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-text-muted">
                  {post.excerpt}
                </p>
                <Link
                  href={`/blog/${post.slug}`}
                  className="mt-4 text-sm font-semibold text-primary hover:underline"
                >
                  לקריאה
                </Link>
              </article>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
