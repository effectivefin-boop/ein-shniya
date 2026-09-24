"use client";

import { useState } from "react";

export type LeadRow = {
  id: string;
  created_at: string;
  calculator_id: string;
  name: string;
  phone: string | null;
  email: string | null;
  traffic_source: string | null;
  inputs: Record<string, unknown>;
  results: Record<string, unknown>;
};

function formatWhen(iso: string): string {
  try {
    return new Intl.DateTimeFormat("he-IL", {
      dateStyle: "short",
      timeStyle: "short",
      timeZone: "Asia/Jerusalem",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function gapSummary(results: Record<string, unknown>): string {
  const gapAmount = results.gapAmount;
  const gapPercent = results.gapPercent;
  const monthlyIncome = results.monthlyIncome;
  const parts: string[] = [];
  if (typeof monthlyIncome === "number") {
    parts.push(`קצבה ≈ ${Math.round(monthlyIncome).toLocaleString("he-IL")} ₪`);
  }
  if (typeof gapAmount === "number") {
    parts.push(`פער ≈ ${Math.round(gapAmount).toLocaleString("he-IL")} ₪`);
  }
  if (typeof gapPercent === "number") {
    parts.push(`(${Math.round(gapPercent)}%)`);
  }
  return parts.length > 0 ? parts.join(" · ") : "—";
}

export function LeadsTable({ leads }: { leads: LeadRow[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  if (leads.length === 0) {
    return (
      <p className="rounded-[var(--radius-card)] border border-border bg-surface p-6 text-sm text-text-muted">
        עדיין אין לידים.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {leads.map((lead) => {
        const open = openId === lead.id;
        return (
          <article
            key={lead.id}
            className="rounded-[var(--radius-card)] border border-border bg-surface shadow-[var(--shadow-card)]"
          >
            <button
              type="button"
              onClick={() => setOpenId(open ? null : lead.id)}
              className="flex w-full flex-col gap-1 px-4 py-3 text-start sm:flex-row sm:items-center sm:justify-between sm:gap-4"
            >
              <div className="min-w-0">
                <p className="font-semibold text-text">{lead.name}</p>
                <p className="text-xs text-text-muted" dir="ltr">
                  {formatWhen(lead.created_at)} · {lead.calculator_id}
                  {lead.traffic_source ? ` · ${lead.traffic_source}` : ""}
                </p>
              </div>
              <div className="text-sm text-text-muted">
                <span dir="ltr">
                  {[lead.phone, lead.email].filter(Boolean).join(" · ") || "—"}
                </span>
                <p className="mt-0.5 text-xs">{gapSummary(lead.results)}</p>
              </div>
            </button>

            {open ? (
              <div className="border-t border-border px-4 py-3">
                <h3 className="text-sm font-semibold text-text">inputs</h3>
                <pre
                  className="mt-1 max-h-64 overflow-auto rounded-md bg-surface-muted p-3 text-xs text-text"
                  dir="ltr"
                >
                  {JSON.stringify(lead.inputs, null, 2)}
                </pre>
                <h3 className="mt-3 text-sm font-semibold text-text">results</h3>
                <pre
                  className="mt-1 max-h-64 overflow-auto rounded-md bg-surface-muted p-3 text-xs text-text"
                  dir="ltr"
                >
                  {JSON.stringify(lead.results, null, 2)}
                </pre>
              </div>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
