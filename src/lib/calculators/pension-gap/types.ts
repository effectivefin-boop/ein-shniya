import type { Gender, RiskId } from "./constants";

export type FactorMode = "known" | "unknown";
export type ContributionDestination = "" | "pension" | "executive";
export type EntryStage = "fast" | "detailed";

export type Holding = {
  id: number;
  amount: string;
  risk: RiskId | "";
  exposure: string;
  assetLabel: string;
  /** Executive insurance only */
  factorMode?: FactorMode;
  knownFactor?: string;
  startYear?: string;
  /** Liquid savings — where managed */
  managedBy?: "" | "bank" | "investment_house";
};

export type PensionGapInputs = {
  age: number;
  gender: Gender;
  salary: number;
  yearsToRetirement: number;
  entryStage: EntryStage;
  /** Fast track */
  accumulationEstimate: number;
  fastTrackRisk: RiskId | "";
  fastAdditionalSavings: number;
  fastSavingsRisk: RiskId | "";
  /** Detailed */
  pensionFundOn: boolean;
  pensionFundHoldings: Holding[];
  executiveOn: boolean;
  executiveHoldings: Holding[];
  savingsOn: boolean;
  savingsHoldings: Holding[];
  cashOn: boolean;
  cashAmount: number;
  contributionDestination: ContributionDestination;
};

export type PensionGapResult = {
  years: number;
  monthlyIncome: number;
  gapPercent: number;
  gapAmount: number;
  currentSalary: number;
  isEstimatedMode: boolean;
  isGreenScenario: boolean;
  capitalActual: number;
  capitalOptimal: number;
  capitalGap: number;
  monthlyAtBenchmark: number;
  earlyRetirementAge: number | null;
  blendedExposure: number;
  benchmark: number;
  /** True when exposure comparison is reliable (no bare מנייתי default). */
  hasExplicitExposureData: boolean;
};

export type NoteType = "critical" | "warning" | "positive";

export type NoteIconKind =
  | "shield"
  | "sparkles"
  | "banknote"
  | "landmark"
  | "fileWarning";

export type ResultNote = {
  type: NoteType;
  icon: NoteIconKind;
  title: string;
  bigNumber?: string;
  text: string;
  impact: number;
};
