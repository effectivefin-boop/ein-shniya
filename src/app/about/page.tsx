import type { Metadata } from "next";
import { StubPageShell } from "@/components/StubPageShell";

export const metadata: Metadata = {
  title: "אודות",
  description: "מי מאחורי עין שנייה — מחשבונים ותוכן להבנת מספרים.",
};

export default function AboutPage() {
  return (
    <StubPageShell
      title="אודות עין שנייה"
      description="עין שנייה בונה מחשבונים ותוכן שמסייעים להבין מספרים — פנסיה, חיסכון והוצאות."
    >
      <div className="space-y-4 text-base leading-relaxed text-text-muted">
        <p>
          הרעיון פשוט: להראות איפה אתם עומדים ואיפה יש פער ששווה לבדוק —
          בשפה ברורה ובלי רעש.
        </p>
        <p>
          פרטים משפטיים והבהרות מופיעים בדיסקליימר בתחתית האתר ובדפי
          הפרטיות ותנאי השימוש.
        </p>
      </div>
    </StubPageShell>
  );
}
