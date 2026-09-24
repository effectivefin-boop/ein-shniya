import type { Metadata } from "next";
import { StubPageShell } from "@/components/StubPageShell";

export const metadata: Metadata = {
  title: "מדיניות פרטיות",
  description: "מדיניות הפרטיות של עין שנייה.",
  robots: { index: false, follow: false },
};

export default function PrivacyPage() {
  return (
    <StubPageShell
      title="מדיניות פרטיות"
      description="איך אנחנו מתייחסים למידע שנאסף באתר."
      showPreparingBadge={false}
    >
      <div className="space-y-4 text-sm leading-relaxed text-text-muted">
        <p>
          <strong className="text-text">מה אנחנו אוספים:</strong> בעת שימוש
          במחשבונים ייתכן שיישמרו נתונים שהזנתם באופן מקומי בדפדפן או יישלחו
          לשרת לצורך חישוב. לא נמכור את המידע שלכם לצדדים שלישיים לשיווק.
        </p>
        <p>
          <strong className="text-text">מדידה ועוגיות:</strong> האתר עשוי
          להשתמש בכלי אנליטיקה מקובלים (למשל Google Tag Manager, Google
          Analytics, Meta Pixel, Microsoft Clarity וכדומה) כדי להבין שימוש
          באתר ולשפר אותו. כשההגדרה דורשת הסכמה, התגיות נטענות רק אחרי אישור
          במסך העוגיות. ניתן לדחות מדידה; ההעדפה נשמרת בדפדפן שלכם.
        </p>
        <p>
          <strong className="text-text">לידים ונתוני מחשבון:</strong> כשאתם
          משאירים פרטים, אנחנו שומרים את פרטי הקשר שלכם, את הנתונים שהזנתם
          במחשבון ואת התוצאה, רק כדי ליצור איתכם קשר. התוצאה היא הערכה בלבד.
          היא לא ייעוץ ולא הבטחה לתשואה. כדי לראות את המידע השמור עליכם או
          למחוק אותו, כתבו לנו:{" "}
          <a
            href="mailto:effective.fin@gmail.com"
            className="font-medium text-primary underline-offset-2 hover:underline"
            dir="ltr"
          >
            effective.fin@gmail.com
          </a>
          .
        </p>
        <p>
          <strong className="text-text">יצירת קשר:</strong>{" "}
          <a
            href="mailto:effective.fin@gmail.com"
            className="font-medium text-primary underline-offset-2 hover:underline"
            dir="ltr"
          >
            effective.fin@gmail.com
          </a>
        </p>
      </div>
    </StubPageShell>
  );
}
