import type { Metadata } from "next";
import { StubPageShell } from "@/components/StubPageShell";

export const metadata: Metadata = {
  title: "אודות",
  description: "מי מאחורי עין שנייה — כלים ותוכן לבדיקה, לא ייעוץ.",
};

export default function AboutPage() {
  return (
    <StubPageShell
      title="אודות עין שנייה"
      description="עין שנייה בונה מחשבונים ותוכן שמסייעים להבין מספרים — פנסיה, חיסכון והוצאות."
    >
      <div className="space-y-4 text-base leading-relaxed text-text-muted">
        <p>
          אנחנו לא מציעים ייעוץ פנסיוני, השקעתי או פיננסי, ואיננו משווקים
          מוצרים פנסיונים. המפעילה אינה משווקת פנסיונית בעלת רישיון.
        </p>
        <p className="rounded-xl border border-primary/15 bg-primary-soft/60 px-4 py-3 text-text">
          <strong className="font-semibold">
            כלי בדיקה והמחשה — לא ייעוץ.
          </strong>{" "}
          אפשר להמשיך לשיחה עם איש מקצוע בעל רישיון.
        </p>
      </div>
    </StubPageShell>
  );
}
