import type { Metadata } from "next";
import { StubPageShell } from "@/components/StubPageShell";

type Props = { params: Promise<{ slug: string }> };

const titles: Record<string, string> = {
  "pension-gap": "פער פנסיה",
  "management-fees": "דמי ניהול",
  hishtalmut: "קרן השתלמות",
  "compound-interest": "ריבית דריבית",
  "savings-goal": "יעד חיסכון",
  "early-retirement": "פרישה מוקדמת",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const name = titles[slug] ?? "מחשבון";
  return { title: name };
}

export default async function CalculatorStubPage({ params }: Props) {
  const { slug } = await params;
  const name = titles[slug] ?? "מחשבון";

  return (
    <StubPageShell
      title={name}
      description="המחשבון בהכנה. בקרוב תוכלו להזין מספרים ולראות את הפער."
    />
  );
}
