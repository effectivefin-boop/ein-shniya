import type { Metadata } from "next";
import Link from "next/link";
import { StubPageShell } from "@/components/StubPageShell";

export const metadata: Metadata = {
  title: "מחשבונים",
  description: "מחשבוני עין שנייה — בדיקות פשוטות לפנסיה, חיסכון והוצאות.",
};

const items = [
  { slug: "pension-gap", name: "פער פנסיה" },
  { slug: "management-fees", name: "דמי ניהול" },
  { slug: "hishtalmut", name: "קרן השתלמות" },
  { slug: "compound-interest", name: "ריבית דריבית" },
  { slug: "savings-goal", name: "יעד חיסכון" },
  { slug: "early-retirement", name: "פרישה מוקדמת" },
];

export default function CalculatorsPage() {
  return (
    <StubPageShell
      title="מחשבונים"
      description="כאן יופיעו כל מחשבוני עין שנייה. בינתיים אפשר לבחור מהרשימה — העמודים בהכנה."
    >
      <ul className="divide-y divide-border rounded-[var(--radius-card)] border border-border bg-surface">
        {items.map((item) => (
          <li key={item.slug}>
            <Link
              href={`/calculators/${item.slug}`}
              className="flex items-center justify-between px-4 py-3 text-text transition-colors hover:bg-surface-muted"
            >
              <span className="font-medium">{item.name}</span>
              <span className="text-sm text-primary">לבדיקה ←</span>
            </Link>
          </li>
        ))}
      </ul>
    </StubPageShell>
  );
}
