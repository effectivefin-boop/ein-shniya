import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/leads/admin";
import { LeadsTable, type LeadRow } from "@/components/admin/LeadsTable";

export const dynamic = "force-dynamic";

export default async function AdminLeadsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdminEmail(user.email)) {
    redirect("/admin/login");
  }

  let leads: LeadRow[] = [];
  let loadError: string | null = null;

  try {
    const service = createServiceClient();
    const { data, error } = await service
      .from("leads")
      .select(
        "id, created_at, calculator_id, name, phone, email, traffic_source, inputs, results",
      )
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) {
      loadError = error.message;
    } else {
      leads = (data ?? []) as LeadRow[];
    }
  } catch (err) {
    loadError =
      err instanceof Error ? err.message : "שגיאה בטעינת לידים";
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text">לידים</h1>
          <p className="mt-1 text-sm text-text-muted" dir="ltr">
            {user.email}
          </p>
        </div>
        <form action="/api/admin/logout" method="post">
          <button
            type="submit"
            className="rounded-[var(--radius-btn)] border border-border bg-surface px-4 py-2 text-sm font-medium text-text hover:bg-surface-muted"
          >
            התנתקות
          </button>
        </form>
      </div>

      {loadError ? (
        <p className="mb-4 rounded-[var(--radius-btn)] border border-[var(--color-gap)]/40 bg-[var(--color-gap)]/10 px-3 py-2 text-sm text-[var(--color-gap)]">
          לא ניתן לטעון לידים: {loadError}
        </p>
      ) : null}

      <LeadsTable leads={leads} />
    </div>
  );
}
