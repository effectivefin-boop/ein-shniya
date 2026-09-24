/** Only this email may access /admin after Supabase Auth. */
export const ADMIN_EMAIL =
  (process.env.ADMIN_EMAIL ?? "effective.fin@gmail.com").trim().toLowerCase();

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === ADMIN_EMAIL;
}
