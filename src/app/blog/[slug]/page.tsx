import type { Metadata } from "next";
import { StubPageShell } from "@/components/StubPageShell";

type Props = { params: Promise<{ slug: string }> };

const titles: Record<string, string> = {
  "what-is-pension-gap": "מה זה בכלל ״פער פנסיה״?",
  "management-fees-explained": "דמי ניהול: למה אחוז קטן משנה הרבה",
  "checkup-vs-advice": "בדיקה זה לא ייעוץ — וזה בסדר",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return { title: titles[slug] ?? "כתבה" };
}

export default async function BlogPostStubPage({ params }: Props) {
  const { slug } = await params;
  const title = titles[slug] ?? "כתבה";

  return (
    <StubPageShell
      title={title}
      description="הכתבה בהכנה. התוכן יהיה הסבר קצר ודגרי — בלי המלצות ובלי שיווק מוצרים."
    />
  );
}
