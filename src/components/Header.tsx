import Link from "next/link";
import { BrandLogo } from "./brand/BrandLogo";
import { Container } from "./Container";
import { MobileNav } from "./MobileNav";

const navLinks = [
  { href: "/calculators", label: "מחשבונים" },
  { href: "/blog", label: "בלוג" },
  { href: "/about", label: "אודות" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-surface/90 backdrop-blur-md">
      <Container className="relative flex h-16 items-center justify-between gap-4">
        <BrandLogo markSize={28} />

        <nav className="hidden items-center gap-1 md:flex" aria-label="ניווט ראשי">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-[var(--radius-btn)] px-3 py-2 text-sm font-medium text-text-muted transition-colors hover:bg-surface-muted hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/#calculators"
            className="ms-2 inline-flex items-center rounded-[var(--radius-btn)] bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
          >
            התחילו בדיקה
          </Link>
        </nav>

        <MobileNav />
      </Container>
    </header>
  );
}
