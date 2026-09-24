import Link from "next/link";
import type { ReactNode } from "react";

/** Coral/gap accent is NOT a button variant — reserved for GapVisual / BrandMark. */
type Variant = "primary" | "secondary" | "ghost";

type ButtonProps = {
  href: string;
  children: ReactNode;
  variant?: Variant;
  className?: string;
  size?: "sm" | "md" | "lg";
};

const variants: Record<Variant, string> = {
  primary:
    "bg-primary text-white hover:bg-primary-hover shadow-sm",
  secondary:
    "bg-surface text-primary border border-border hover:bg-surface-muted",
  ghost: "bg-transparent text-primary hover:bg-primary-soft",
};

const sizes = {
  sm: "px-3.5 py-2 text-sm",
  md: "px-5 py-2.5 text-base",
  lg: "px-6 py-3.5 text-lg",
};

export function Button({
  href,
  children,
  variant = "primary",
  className = "",
  size = "md",
}: ButtonProps) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center gap-2 rounded-[var(--radius-btn)] font-semibold transition-colors focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-primary ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </Link>
  );
}
