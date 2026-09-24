import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "ניהול",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[60vh] bg-surface-muted/40 py-10">
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6">{children}</div>
    </div>
  );
}
