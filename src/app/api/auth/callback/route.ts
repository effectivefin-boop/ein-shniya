import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/leads/admin";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = searchParams.get("next") ?? "/admin/leads";
  const safeNext = next.startsWith("/") ? next : "/admin/leads";

  const supabase = await createClient();
  let authError: { message: string } | null = null;

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    authError = error;
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type: type as EmailOtpType,
      token_hash: tokenHash,
    });
    authError = error;
  } else {
    return NextResponse.redirect(`${origin}/admin/login?error=auth`);
  }

  if (authError) {
    console.error("[auth/callback] session exchange failed", authError.message);
    return NextResponse.redirect(`${origin}/admin/login?error=auth`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdminEmail(user.email)) {
    await supabase.auth.signOut();
    return NextResponse.redirect(`${origin}/admin/login?error=unauthorized`);
  }

  return NextResponse.redirect(`${origin}${safeNext}`);
}
