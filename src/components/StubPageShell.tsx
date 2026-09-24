import type { ReactNode } from "react";
import { Button } from "./Button";
import { Container } from "./Container";

type StubPageShellProps = {
  title: string;
  description: string;
  children?: ReactNode;
  /** When false, hide the «עמוד בהכנה» badge (e.g. real legal pages). */
  showPreparingBadge?: boolean;
};

export function StubPageShell({
  title,
  description,
  children,
  showPreparingBadge = true,
}: StubPageShellProps) {
  return (
    <Container className="py-14 sm:py-16">
      <div className="mx-auto max-w-2xl">
        {showPreparingBadge ? (
          <p className="mb-4 inline-flex rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
            עמוד בהכנה
          </p>
        ) : null}
        <h1 className="text-3xl font-bold tracking-tight text-text sm:text-4xl">
          {title}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-text-muted">
          {description}
        </p>
        {children ? <div className="mt-8 space-y-4">{children}</div> : null}
        <div className="mt-10">
          <Button href="/" variant="secondary">
            חזרה לדף הבית
          </Button>
        </div>
      </div>
    </Container>
  );
}
