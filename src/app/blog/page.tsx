import type { Metadata } from "next";
import Link from "next/link";
import { StubPageShell } from "@/components/StubPageShell";

export const metadata: Metadata = {
  title: "בלוג",
  description: "הסברים קצרים על פערים ששווה להבין — פנסיה, חיסכון ואמון.",
};

const posts = [
  { slug: "what-is-pension-gap", title: "מה זה בכלל ״פער פנסיה״?" },
  {
    slug: "management-fees-explained",
    title: "דמי ניהול: למה אחוז קטן משנה הרבה",
  },
  { slug: "checkup-vs-advice", title: "בדיקה זה לא ייעוץ — וזה בסדר" },
];

export default function BlogPage() {
  return (
    <StubPageShell
      title="בלוג"
      description="כתבות קצרות שמסבירות מושגים ופערים — בלי לשווק מוצרים ובלי להציג ייעוץ."
    >
      <ul className="space-y-3">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link
              href={`/blog/${post.slug}`}
              className="block rounded-[var(--radius-card)] border border-border bg-surface px-4 py-3 font-medium text-text transition-colors hover:border-primary/40 hover:bg-surface-muted"
            >
              {post.title}
            </Link>
          </li>
        ))}
      </ul>
    </StubPageShell>
  );
}
