import type { ReactNode } from "react";
import { Button } from "./Button";
import { Container } from "./Container";

type StubPageShellProps = {
  title: string;
  description: string;
  children?: ReactNode;
  draftLegal?: boolean;
};

export function StubPageShell({
  title,
  description,
  children,
  draftLegal = false,
}: StubPageShellProps) {
  return (
    <Container className="py-14 sm:py-16">
      <div className="mx-auto max-w-2xl">
        {draftLegal ? (
          <p className="mb-4 inline-flex rounded-full border border-border bg-surface-muted px-3 py-1 text-xs font-semibold text-text-muted">
            טיוטה לאישור עו״ד — לא ייעוץ משפטי
          </p>
        ) : (
          <p className="mb-4 inline-flex rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
            עמוד בהכנה
          </p>
        )}
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
