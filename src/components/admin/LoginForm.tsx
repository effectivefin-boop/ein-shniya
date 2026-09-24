"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">(
    "idle",
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg(null);

    const trimmed = email.trim();

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };

      if (!res.ok || !data.ok) {
        if (data.error === "unauthorized_email") {
          setErrorMsg("אין הרשאה לכתובת זו.");
        } else {
          setErrorMsg("שליחת הקישור נכשלה. נסו שוב.");
        }
        setStatus("error");
        return;
      }

      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email: trimmed,
        options: {
          emailRedirectTo: `${window.location.origin}/api/auth/callback?next=/admin/leads`,
          shouldCreateUser: true,
        },
      });

      if (error) {
        console.error("[admin/login] otp failed", error.message);
        setErrorMsg("שליחת הקישור נכשלה. נסו שוב.");
        setStatus("error");
        return;
      }

      setStatus("sent");
    } catch {
      setErrorMsg("שגיאת רשת. נסו שוב.");
      setStatus("error");
    }
  };

  if (status === "sent") {
    return (
      <div className="rounded-[var(--radius-card)] border border-border bg-surface p-6 text-center shadow-[var(--shadow-card)] sm:p-8">
        <h1 className="text-xl font-bold text-text">בדקו את האימייל</h1>
        <p className="mt-2 text-sm text-text-muted">
          שלחנו קישור התחברות ל־{email.trim()}. הקישור תקף לזמן מוגבל.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-[var(--radius-card)] border border-border bg-surface p-6 shadow-[var(--shadow-card)] sm:p-8">
      <h1 className="text-xl font-bold text-text">כניסת מנהל</h1>
      <p className="mt-2 text-sm text-text-muted">
        התחברות עם קישור קסם לאימייל המורשה בלבד.
      </p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-text">
            אימייל
          </span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            className="w-full rounded-[var(--radius-btn)] border border-border bg-surface px-3 py-2.5 text-base text-text outline-none focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-primary"
            placeholder="admin@example.com"
            dir="ltr"
          />
        </label>

        {errorMsg ? (
          <p className="text-sm text-[var(--color-gap)]">{errorMsg}</p>
        ) : null}

        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full rounded-[var(--radius-btn)] bg-primary px-5 py-3 text-base font-semibold text-white transition-colors hover:bg-primary-hover disabled:opacity-60"
        >
          {status === "loading" ? "שולחים…" : "שלחו קישור התחברות"}
        </button>
      </form>
    </div>
  );
}
