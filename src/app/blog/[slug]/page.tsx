import type { Metadata } from "next";
import { StubPageShell } from "@/components/StubPageShell";

type Props = { params: Promise<{ slug: string }> };

const titles: Record<string, string> = {
  "what-is-pension-gap": "מה זה בכלל ״פער פנסיה״?",
  "management-fees-explained": "דמי ניהול: למה אחוז קטן משנה הרבה",
  "when-to-check-savings": "מתי שווה לעצור ולבדוק את החיסכון",
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
      description="הכתבה בהכנה. בקרוב יופיע כאן הסבר קצר וברור."
    />
  );
}
