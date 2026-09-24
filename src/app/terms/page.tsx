import type { Metadata } from "next";
import { StubPageShell } from "@/components/StubPageShell";

export const metadata: Metadata = {
  title: "תנאי שימוש",
  description: "תנאי השימוש באתר עין שנייה.",
  robots: { index: false, follow: false },
};

export default function TermsPage() {
  return (
    <StubPageShell
      title="תנאי שימוש"
      description="כללים קצרים לשימוש באתר ובמחשבונים."
      showPreparingBadge={false}
    >
      <div className="space-y-4 text-sm leading-relaxed text-text-muted">
        <p>
          <strong className="text-text">שימוש באתר:</strong> האתר מספק כלי
          בדיקה והמחשה בלבד. התוצאות מבוססות על הנחות ואינן מהוות ייעוץ
          פנסיוני, השקעתי או פיננסי, ואינן המלצה לפעולה.
        </p>
        <p>
          <strong className="text-text">אין ייעוץ:</strong> מפעילת האתר אינה
          משווקת פנסיונית בעלת רישיון. אין באתר הצעה לשיווק מוצרים
          פנסיונים. לכל החלטה מומלץ להתייעץ עם איש מקצוע בעל רישיון.
        </p>
        <p>
          <strong className="text-text">אחריות:</strong> השימוש באתר על אחריות
          המשתמש. אין להסתמך על התוצאות כתחליף לייעוץ מקצועי מותאם אישית.
        </p>
      </div>
    </StubPageShell>
  );
}
