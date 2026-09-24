import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { PensionGapCalculator } from "@/components/calculators/PensionGapCalculator";
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

export default async function CalculatorPage({ params }: Props) {
  const { slug } = await params;
  const name = titles[slug] ?? "מחשבון";

  if (slug === "pension-gap") {
    return (
      <Container className="py-10 sm:py-14">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-4 inline-flex rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
            מחשבון
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-text sm:text-4xl">
            פער פנסיה
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-text-muted">
            המשכורת שלכם היום היא לא ערובה לגובה הקצבה בפרישה. מלאו את
            המחשבון וגלו איפה אתם עומדים — ואיפה יש פער ששווה לבדוק. גם לכסף
            מגיע עין שנייה.
          </p>
        </div>
        <div className="mt-10">
          <PensionGapCalculator />
        </div>
      </Container>
    );
  }

  return (
    <StubPageShell
      title={name}
      description="המחשבון בהכנה. בקרוב תוכלו להזין מספרים ולראות את הפער."
    />
  );
}
