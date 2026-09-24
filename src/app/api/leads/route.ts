import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type LeadBody = {
  calculator_id?: unknown;
  name?: unknown;
  phone?: unknown;
  email?: unknown;
  privacy_accepted?: unknown;
  marketing_opt_in?: unknown;
  inputs?: unknown;
  results?: unknown;
  traffic_source?: unknown;
  utm_source?: unknown;
  utm_medium?: unknown;
  utm_campaign?: unknown;
  referrer?: unknown;
};

const ALLOWED_TRAFFIC = new Set(["google", "facebook", "direct", "other"]);

/** Very light in-memory rate limit (per instance). */
const hits = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60_000;
const MAX_HITS = 12;

function rateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || entry.resetAt < now) {
    hits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (entry.count >= MAX_HITS) return false;
  entry.count += 1;
  return true;
}

function asTrimmedString(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t === "" ? null : t;
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  if (!rateLimit(ip)) {
    return NextResponse.json(
      { ok: false, error: "too_many_requests" },
      { status: 429 },
    );
  }

  let body: LeadBody;
  try {
    body = (await request.json()) as LeadBody;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const calculator_id = asTrimmedString(body.calculator_id);
  const name = asTrimmedString(body.name);
  const phone = asTrimmedString(body.phone);
  const email = asTrimmedString(body.email)?.toLowerCase() ?? null;
  const privacy_accepted = body.privacy_accepted === true;
  const marketing_opt_in = body.marketing_opt_in === true;

  if (!calculator_id) {
    return NextResponse.json(
      { ok: false, error: "calculator_id_required" },
      { status: 400 },
    );
  }
  if (!name) {
    return NextResponse.json({ ok: false, error: "name_required" }, { status: 400 });
  }
  if (!phone && !email) {
    return NextResponse.json(
      { ok: false, error: "phone_or_email_required" },
      { status: 400 },
    );
  }
  if (!privacy_accepted) {
    return NextResponse.json(
      { ok: false, error: "privacy_required" },
      { status: 400 },
    );
  }
  if (!isPlainObject(body.inputs) || !isPlainObject(body.results)) {
    return NextResponse.json(
      { ok: false, error: "inputs_results_required" },
      { status: 400 },
    );
  }

  let traffic_source = asTrimmedString(body.traffic_source);
  if (traffic_source && !ALLOWED_TRAFFIC.has(traffic_source)) {
    traffic_source = "other";
  }

  const row = {
    calculator_id,
    name,
    phone,
    email,
    privacy_accepted,
    marketing_opt_in,
    inputs: body.inputs,
    results: body.results,
    traffic_source,
    utm_source: asTrimmedString(body.utm_source),
    utm_medium: asTrimmedString(body.utm_medium),
    utm_campaign: asTrimmedString(body.utm_campaign),
    referrer: asTrimmedString(body.referrer),
  };

  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("leads")
      .insert(row)
      .select("id")
      .single();

    if (error) {
      console.error("[api/leads] insert failed", error.message);
      return NextResponse.json(
        { ok: false, error: "insert_failed" },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true, id: data.id });
  } catch (err) {
    console.error("[api/leads] unexpected", err);
    return NextResponse.json(
      { ok: false, error: "server_misconfigured" },
      { status: 500 },
    );
  }
}
