import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ADMIN_EMAIL, isAdminEmail } from "@/lib/leads/admin";

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

  // Reject non-allowlisted emails server-side — do not send OTP.
  if (!isAdminEmail(email)) {
    return NextResponse.json(
      { ok: false, error: "unauthorized_email" },
      { status: 403 },
    );
  }

  const origin = new URL(request.url).origin;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithOtp({
    email: ADMIN_EMAIL,
    options: {
      emailRedirectTo: `${origin}/api/auth/callback?next=/admin/leads`,
      shouldCreateUser: true,
    },
  });

  if (error) {
    console.error("[admin/login] otp failed", error.message);
    return NextResponse.json({ ok: false, error: "otp_failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
