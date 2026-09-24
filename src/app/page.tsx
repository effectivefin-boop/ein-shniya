import { BlogTeaser } from "@/components/BlogTeaser";
import { CalculatorsGrid } from "@/components/CalculatorsGrid";
import { GapVisual } from "@/components/GapVisual";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { TrustBlock } from "@/components/TrustBlock";

export default function HomePage() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <CalculatorsGrid />
      <GapVisual />
      <BlogTeaser />
      <TrustBlock />
    </>
  );
}
