/** Risk / return / factor constants — ported from pension-calc App.jsx (minus OLD_AGE_BENEFIT). */

export type RiskId = "solid" | "meuzan" | "menayoti";
export type Gender = "male" | "female";

export const RISK_LEVELS: ReadonlyArray<{
  id: RiskId;
  label: string;
  exposure: number;
}> = [
  { id: "solid", label: "סולידי", exposure: 10 },
  { id: "meuzan", label: "מאוזן", exposure: 40 },
  { id: "menayoti", label: "מנייתי", exposure: 80 },
];

export const RETIREMENT_AGE_BY_GENDER: Record<Gender, number> = {
  male: 67,
  female: 65,
};

export const CONTRIBUTION_RATE = 0.2083;
export const PENSION_FUND_FACTOR = 200;
export const DEFAULT_FACTOR = 200;
export const EQUITY_RATE = 0.075;
export const BOND_RATE = 0.045;
export const CASH_REAL_RATE = -0.025;
export const EARLY_RETIREMENT_TARGET_RATIO = 0.85;
export const GAP_CRITICAL = 40;
export const GAP_MODERATE = 20;
export const GAP_NEGLIGIBLE = 5;
export const BENCHMARK_DEVIATION = 15;
export const SHORT_HORIZON_YEARS = 5;
/** Estimated annual management fee on accumulation for executive insurance only. */
export const EXEC_MGMT_FEE = 0.008;

export const SAVINGS_TYPES_WITH_MANAGER = [
  "תיק מניות מנוהל",
  "תיק השקעות עצמאי",
] as const;

export const SAVINGS_ASSET_OPTIONS = [
  "קרן השתלמות",
  "קופת גמל להשקעה",
  "פוליסת חיסכון",
  "תיק מניות מנוהל",
  "תיק השקעות עצמאי",
  "קופת גמל (תיקון 190)",
] as const;
