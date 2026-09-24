import { NextResponse } from "next/server";
import { isAdminEmail } from "@/lib/leads/admin";

/**
 * Allowlist gate only — OTP must be triggered in the browser so PKCE
 * verifier cookies are set on the same client that opens the magic link.
 */
export async function POST(request: Request) {
  let email: string | undefined;
  try {
    const body = (await request.json()) as { email?: string };
    email = body.email?.trim().toLowerCase();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  if (!email) {
    return NextResponse.json({ ok: false, error: "email_required" }, { status: 400 });
  }

  if (!isAdminEmail(email)) {
    return NextResponse.json(
      { ok: false, error: "unauthorized_email" },
      { status: 403 },
    );
  }

  return NextResponse.json({ ok: true });
}
