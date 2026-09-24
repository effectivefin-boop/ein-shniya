import Link from "next/link";
import { BrandLogo } from "./brand/BrandLogo";
import { Container } from "./Container";

const footerLinks = [
  { href: "/calculators", label: "מחשבונים" },
  { href: "/blog", label: "בלוג" },
  { href: "/about", label: "אודות" },
  { href: "/privacy", label: "פרטיות" },
  { href: "/terms", label: "תנאי שימוש" },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-surface" role="contentinfo">
      <Container className="py-12">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-sm">
            <BrandLogo markSize={26} />
            <p className="mt-3 text-sm leading-relaxed text-text-muted">
              מחשבונים פשוטים לפנסיה, לחיסכון ולהוצאות — כדי לראות איפה אתם
              עומדים ואיפה יש פער ששווה לבדוק.
            </p>
          </div>

          <nav aria-label="קישורי תחתית">
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm font-medium text-text-muted transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-10 space-y-3 border-t border-border pt-6 text-xs leading-relaxed text-text-muted">
          <p>
            <strong className="font-semibold text-text">הבהרה חשובה:</strong>{" "}
            עין שנייה מספקת כלי בדיקה והמחשה בלבד. המידע באתר אינו ייעוץ
            פנסיוני, השקעתי או פיננסי, ואינו מהווה המלצה לפעולה. התוצאות
            מבוססות על הנחות והערכות — לא על נתונים אישיים מאומתים.
          </p>
          <p>
            מפעילת האתר אינה משווקת פנסיונית בעלת רישיון. אם תרצו להמשיך
            לשיחה מקצועית, תוכלו לפנות לאיש מקצוע בעל רישיון מתאים. אין
            באתר הצעה לשיווק מוצרים פנסיונים.
          </p>
          <p className="rounded-lg bg-surface-muted px-3 py-2 text-text-muted">
            טקסטים משפטיים בדפי{" "}
            <Link href="/privacy" className="underline hover:text-primary">
              פרטיות
            </Link>{" "}
            ו
            <Link href="/terms" className="underline hover:text-primary">
              תנאי שימוש
            </Link>{" "}
            הם <strong className="font-semibold">טיוטה לאישור עו״ד</strong> —
            לא ייעוץ משפטי ולא נוסח סופי.
          </p>
          <p className="pt-2">
            © {new Date().getFullYear()} עין שנייה. כל הזכויות שמורות.
          </p>
        </div>
      </Container>
    </footer>
  );
}
