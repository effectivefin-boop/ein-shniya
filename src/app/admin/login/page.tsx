import { LoginForm } from "@/components/admin/LoginForm";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ error?: string }>;
};

export default async function AdminLoginPage({ searchParams }: Props) {
  const params = await searchParams;
  const error = params.error;

  return (
    <div className="mx-auto max-w-md">
      {error === "unauthorized" ? (
        <p className="mb-4 rounded-[var(--radius-btn)] border border-[var(--color-error)]/40 bg-[var(--color-error)]/10 px-3 py-2 text-sm text-[var(--color-error)]">
          אין הרשאה לחשבון זה.
        </p>
      ) : null}
      {error === "auth" ? (
        <p className="mb-4 rounded-[var(--radius-btn)] border border-[var(--color-error)]/40 bg-[var(--color-error)]/10 px-3 py-2 text-sm text-[var(--color-error)]">
          ההתחברות נכשלה. נסו שוב.
        </p>
      ) : null}
      <LoginForm />
    </div>
  );
}
