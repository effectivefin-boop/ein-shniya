import Link from "next/link";
import { BrandMark } from "./BrandMark";

type BrandLogoProps = {
  className?: string;
  /** Mark pixel size */
  markSize?: number;
  /** Link to home (default true) */
  href?: string | false;
  /** Show wordmark text (Heebo via CSS — never baked into bitmaps) */
  showWordmark?: boolean;
};

/**
 * Full logo: Soft-sketch BrandMark + "עין שנייה" wordmark in Heebo (code/SVG text only).
 */
export function BrandLogo({
  className = "",
  markSize = 28,
  href = "/",
  showWordmark = true,
}: BrandLogoProps) {
  const content = (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <BrandMark size={markSize} title={false} />
      {showWordmark ? (
        <span
          className="text-xl font-bold tracking-tight text-primary"
          style={{ fontFamily: "var(--font-heebo), Heebo, system-ui, sans-serif" }}
        >
          עין שנייה
        </span>
      ) : null}
    </span>
  );

  if (href === false) {
    return (
      <span className="inline-flex" aria-label="עין שנייה">
        {content}
      </span>
    );
  }

  return (
    <Link
      href={href}
      className="inline-flex items-center rounded-[var(--radius-btn)] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-primary"
      aria-label="עין שנייה — דף הבית"
    >
      {content}
    </Link>
  );
}
