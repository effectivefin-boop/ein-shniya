/**
 * Pure pension-gap math — faithful port of App.jsx useMemo engine,
 * with OLD_AGE_BENEFIT (קצבת זקנה) removed from every path.
 */
import {
  BOND_RATE,
  CASH_REAL_RATE,
  CONTRIBUTION_RATE,
  DEFAULT_FACTOR,
  EARLY_RETIREMENT_TARGET_RATIO,
  EQUITY_RATE,
  EXEC_MGMT_FEE,
  GAP_MODERATE,
  PENSION_FUND_FACTOR,
  RISK_LEVELS,
  type Gender,
  type RiskId,
} from "./constants";
import type { Holding, PensionGapInputs, PensionGapResult } from "./types";

export function formatILS(num: number): string {
  return Math.round(num).toLocaleString("he-IL");
}

/** Round to nearest 100 — for model-estimated figures only. */
export function formatILSApprox(num: number): string {
  return formatILS(Math.round(num / 100) * 100);
}

export function exposureToRate(exposurePct: number): number {
  const e = Math.max(0, Math.min(100, exposurePct)) / 100;
  return e * EQUITY_RATE + (1 - e) * BOND_RATE;
}

export function benchmarkExposure(years: number): number {
  if (years > 10) return 100;
  if (years >= 5) return 70;
  if (years >= 2) return 40;
  return 15;
}

export function resolveExposureAndRate(holding: Pick<Holding, "risk" | "exposure">): {
  exposure: number;
  rate: number;
} {
  const riskConfig =
    RISK_LEVELS.find((r) => r.id === holding.risk) || RISK_LEVELS[1];
  const exposure =
    holding.exposure !== "" ? Number(holding.exposure) : riskConfig.exposure;
  return { exposure, rate: exposureToRate(exposure) };
}

/** Future value of a level annual contribution growing at `rate` for `yrs` years. */
export function annuityFV(annualAmount: number, rate: number, yrs: number): number {
  const g = Math.pow(1 + rate, yrs);
  return rate > 0 ? annualAmount * ((g - 1) / rate) : annualAmount * yrs;
}

export function weightedRateOf(holdings: Holding[]): number | null {
  const amountSum = holdings.reduce((s, h) => s + (Number(h.amount) || 0), 0);
  if (amountSum <= 0) return null;
  let weighted = 0;
  holdings.forEach((h) => {
    const amount = Number(h.amount) || 0;
    const { rate } = resolveExposureAndRate(h);
    weighted += amount * rate;
  });
  return weighted / amountSum;
}

const DEFAULT_CONTRIBUTION_RATE = exposureToRate(RISK_LEVELS[1].exposure);

export function getExecutiveFactor(
  holding: Pick<Holding, "factorMode" | "startYear" | "knownFactor">,
  gender: Gender,
): number {
  if (holding.factorMode === "unknown") {
    const year = Number(holding.startYear) || 0;
    if (year > 0 && year < 2003) return gender === "female" ? 177 : 157;
    if (year >= 2003 && year <= 2013) return 200;
    if (year > 2013) return 220;
    return DEFAULT_FACTOR;
  }
  const known = Number(holding.knownFactor);
  return known > 0 ? known : DEFAULT_FACTOR;
}

export function makeHolding(
  extra: Partial<Holding> & { id: number },
): Holding {
  return {
    amount: "",
    risk: "",
    exposure: "",
    assetLabel: "",
    ...extra,
  };
}

/**
 * Core result computation — identical formulas to App.jsx except:
 * monthlyIncome and monthlyAtBenchmark do NOT add OLD_AGE_BENEFIT.
 */
export function computePensionGap(input: PensionGapInputs): PensionGapResult | null {
  const {
    age: ageNum,
    gender,
    salary: salaryNum,
    yearsToRetirement: years,
    pensionFundOn,
    executiveOn,
    savingsOn,
    cashOn,
    contributionDestination,
    accumulationEstimate,
    fastTrackRisk,
    fastAdditionalSavings,
    fastSavingsRisk,
  } = input;

  if (
    !(ageNum > 0) ||
    !(salaryNum > 0) ||
    !(years > 0) ||
    !Number.isFinite(ageNum) ||
    !Number.isFinite(salaryNum)
  ) {
    return null;
  }

  const isEstimatedMode = !pensionFundOn && !executiveOn && !savingsOn && !cashOn;

  let activePensionHoldings: Holding[] = pensionFundOn
    ? input.pensionFundHoldings
    : [];
  const activeExecutiveHoldings: Holding[] = executiveOn
    ? input.executiveHoldings
    : [];
  let activeSavingsHoldings: Holding[] = savingsOn ? input.savingsHoldings : [];
  const cashNum = cashOn ? input.cashAmount || 0 : 0;

  if (isEstimatedMode) {
    activePensionHoldings = [
      {
        id: 0,
        amount: String(Number(accumulationEstimate) || 0),
        risk: (fastTrackRisk || "meuzan") as RiskId,
        exposure: "",
        assetLabel: "",
      },
    ];
    if (fastAdditionalSavings > 0) {
      activeSavingsHoldings = [
        {
          id: 0,
          amount: String(fastAdditionalSavings),
          risk: (fastSavingsRisk || "meuzan") as RiskId,
          exposure: "",
          assetLabel: "FastTrackSavings",
        },
      ];
    }
  }

  let monthlyFromExisting = 0;
  let weightedExposureSum = 0;
  let weightedAmountSum = 0;

  activePensionHoldings.forEach((h) => {
    const amount = Number(h.amount) || 0;
    const { rate, exposure } = resolveExposureAndRate(h);
    const fv = amount * Math.pow(1 + rate, years);
    monthlyFromExisting += fv / PENSION_FUND_FACTOR;
    weightedExposureSum += amount * exposure;
    weightedAmountSum += amount;
  });

  activeExecutiveHoldings.forEach((h) => {
    const amount = Number(h.amount) || 0;
    const { rate, exposure } = resolveExposureAndRate(h);
    const factor = getExecutiveFactor(h, gender);
    const netRate = rate - EXEC_MGMT_FEE;
    const fv = amount * Math.pow(1 + netRate, years);
    monthlyFromExisting += fv / factor;
    weightedExposureSum += amount * exposure;
    weightedAmountSum += amount;
  });

  activeSavingsHoldings.forEach((h) => {
    const amount = Number(h.amount) || 0;
    const { rate, exposure } = resolveExposureAndRate(h);
    const fv = amount * Math.pow(1 + rate, years);
    monthlyFromExisting += fv / DEFAULT_FACTOR;
    weightedExposureSum += amount * exposure;
    weightedAmountSum += amount;
  });

  if (cashNum > 0) {
    const fv = cashNum * Math.pow(1 + CASH_REAL_RATE, years);
    monthlyFromExisting += fv / DEFAULT_FACTOR;
    weightedAmountSum += cashNum;
  }

  const contributesToExecutive =
    executiveOn && (!pensionFundOn || contributionDestination === "executive");

  let contributionFactor = PENSION_FUND_FACTOR;
  const execAmount = activeExecutiveHoldings.reduce(
    (s, h) => s + (Number(h.amount) || 0),
    0,
  );
  if (contributesToExecutive) {
    if (execAmount > 0) {
      let weightedFactor = 0;
      activeExecutiveHoldings.forEach((h) => {
        const amount = Number(h.amount) || 0;
        const factor = getExecutiveFactor(h, gender);
        weightedFactor += amount * factor;
      });
      contributionFactor = weightedFactor / execAmount;
    } else {
      contributionFactor = DEFAULT_FACTOR;
    }
  }

  const contributionGrowthRate = contributesToExecutive
    ? (weightedRateOf(activeExecutiveHoldings) ?? DEFAULT_CONTRIBUTION_RATE) -
      EXEC_MGMT_FEE
    : weightedRateOf(activePensionHoldings) ?? DEFAULT_CONTRIBUTION_RATE;

  const annualContribution = salaryNum * 12 * CONTRIBUTION_RATE;
  const monthlyFromContributions =
    annuityFV(annualContribution, contributionGrowthRate, years) /
    contributionFactor;

  // APPROVED CHANGE: no OLD_AGE_BENEFIT (קצבת זקנה) added here.
  const monthlyIncome = monthlyFromExisting + monthlyFromContributions;
  const gapPercent = ((salaryNum - monthlyIncome) / salaryNum) * 100;
  const gapAmount = salaryNum - monthlyIncome;

  const blendedExposure =
    weightedAmountSum > 0 ? weightedExposureSum / weightedAmountSum : 0;
  const benchmark = benchmarkExposure(years);
  const isGreenScenario = gapPercent < GAP_MODERATE;

  // Early retirement — optimal-exposure simulation (same as App.jsx).
  const EARLY_WITHDRAWAL_AGE_FLOOR = 60;
  let earlyRetirementAge: number | null = null;
  for (let a = ageNum + 1; a < ageNum + years; a++) {
    const yrs = a - ageNum;
    const optimalRate = exposureToRate(benchmarkExposure(yrs));
    let monthlyE = 0;
    let meetsTarget = false;

    if (a < EARLY_WITHDRAWAL_AGE_FLOOR) {
      const yearsToSixty = EARLY_WITHDRAWAL_AGE_FLOOR - a;
      const rateAfterRetiring = exposureToRate(benchmarkExposure(yearsToSixty));

      let bridgeCapital = 0;
      activeSavingsHoldings.forEach((h) => {
        const amount = Number(h.amount) || 0;
        bridgeCapital += amount * Math.pow(1 + optimalRate, yrs);
      });
      if (cashNum > 0) {
        bridgeCapital += cashNum * Math.pow(1 + optimalRate, yrs);
      }
      const bridgeMonths = yearsToSixty * 12;
      const bridgeMonthlyRate = Math.pow(1 + rateAfterRetiring, 1 / 12) - 1;
      const bridgeMonthlyIncome =
        bridgeMonthlyRate > 0
          ? (bridgeCapital * bridgeMonthlyRate) /
            (1 - Math.pow(1 + bridgeMonthlyRate, -bridgeMonths))
          : bridgeCapital / bridgeMonths;

      let pensionOnlyMonthlyAt60 = 0;
      activePensionHoldings.forEach((h) => {
        const amount = Number(h.amount) || 0;
        const valueAtA = amount * Math.pow(1 + optimalRate, yrs);
        const valueAt60 =
          valueAtA * Math.pow(1 + rateAfterRetiring, yearsToSixty);
        pensionOnlyMonthlyAt60 += valueAt60 / PENSION_FUND_FACTOR;
      });
      activeExecutiveHoldings.forEach((h) => {
        const amount = Number(h.amount) || 0;
        const factor = getExecutiveFactor(h, gender);
        const netOptimalRate = optimalRate - EXEC_MGMT_FEE;
        const netRateAfterRetiring = rateAfterRetiring - EXEC_MGMT_FEE;
        const valueAtA = amount * Math.pow(1 + netOptimalRate, yrs);
        const valueAt60 =
          valueAtA * Math.pow(1 + netRateAfterRetiring, yearsToSixty);
        pensionOnlyMonthlyAt60 += valueAt60 / factor;
      });
      const contributionRateAtOptimal = contributesToExecutive
        ? optimalRate - EXEC_MGMT_FEE
        : optimalRate;
      const netRateAfterRetiringForContrib = contributesToExecutive
        ? rateAfterRetiring - EXEC_MGMT_FEE
        : rateAfterRetiring;
      const fvContribAt60 =
        annuityFV(annualContribution, contributionRateAtOptimal, yrs) *
        Math.pow(1 + netRateAfterRetiringForContrib, yearsToSixty);
      pensionOnlyMonthlyAt60 += fvContribAt60 / contributionFactor;

      monthlyE = bridgeMonthlyIncome;
      meetsTarget =
        bridgeMonthlyIncome / salaryNum >= EARLY_RETIREMENT_TARGET_RATIO &&
        pensionOnlyMonthlyAt60 / salaryNum >= EARLY_RETIREMENT_TARGET_RATIO;
    } else {
      activePensionHoldings.forEach((h) => {
        const amount = Number(h.amount) || 0;
        monthlyE +=
          (amount * Math.pow(1 + optimalRate, yrs)) / PENSION_FUND_FACTOR;
      });
      activeExecutiveHoldings.forEach((h) => {
        const amount = Number(h.amount) || 0;
        const factor = getExecutiveFactor(h, gender);
        const netOptimalRate = optimalRate - EXEC_MGMT_FEE;
        monthlyE += (amount * Math.pow(1 + netOptimalRate, yrs)) / factor;
      });
      activeSavingsHoldings.forEach((h) => {
        const amount = Number(h.amount) || 0;
        monthlyE += (amount * Math.pow(1 + optimalRate, yrs)) / DEFAULT_FACTOR;
      });
      if (cashNum > 0) {
        monthlyE += (cashNum * Math.pow(1 + optimalRate, yrs)) / DEFAULT_FACTOR;
      }
      const contributionRateAtOptimal = contributesToExecutive
        ? optimalRate - EXEC_MGMT_FEE
        : optimalRate;
      monthlyE +=
        annuityFV(annualContribution, contributionRateAtOptimal, yrs) /
        contributionFactor;
      meetsTarget = monthlyE / salaryNum >= EARLY_RETIREMENT_TARGET_RATIO;
    }

    if (meetsTarget) {
      earlyRetirementAge = a;
      break;
    }
  }

  const benchmarkRate = exposureToRate(benchmark);
  let capitalActual = 0;
  let capitalOptimal = 0;
  [...activePensionHoldings, ...activeSavingsHoldings].forEach((h) => {
    const amount = Number(h.amount) || 0;
    const { rate } = resolveExposureAndRate(h);
    capitalActual += amount * Math.pow(1 + rate, years);
    capitalOptimal += amount * Math.pow(1 + benchmarkRate, years);
  });
  activeExecutiveHoldings.forEach((h) => {
    const amount = Number(h.amount) || 0;
    const { rate } = resolveExposureAndRate(h);
    const netRate = rate - EXEC_MGMT_FEE;
    const netBenchmarkRate = benchmarkRate - EXEC_MGMT_FEE;
    capitalActual += amount * Math.pow(1 + netRate, years);
    capitalOptimal += amount * Math.pow(1 + netBenchmarkRate, years);
  });
  if (cashNum > 0) {
    capitalActual += cashNum * Math.pow(1 + CASH_REAL_RATE, years);
    capitalOptimal += cashNum * Math.pow(1 + benchmarkRate, years);
  }
  const contributionRateOptimal = contributesToExecutive
    ? benchmarkRate - EXEC_MGMT_FEE
    : benchmarkRate;
  const fvContribActual = annuityFV(
    annualContribution,
    contributionGrowthRate,
    years,
  );
  const fvContribOptimal = annuityFV(
    annualContribution,
    contributionRateOptimal,
    years,
  );
  capitalActual += fvContribActual;
  capitalOptimal += fvContribOptimal;
  const capitalGap = Math.max(capitalOptimal - capitalActual, 0);

  let monthlyAtBenchmark = 0;
  activePensionHoldings.forEach((h) => {
    const amount = Number(h.amount) || 0;
    monthlyAtBenchmark +=
      (amount * Math.pow(1 + benchmarkRate, years)) / PENSION_FUND_FACTOR;
  });
  activeExecutiveHoldings.forEach((h) => {
    const amount = Number(h.amount) || 0;
    const factor = getExecutiveFactor(h, gender);
    const netBenchmarkRate = benchmarkRate - EXEC_MGMT_FEE;
    monthlyAtBenchmark +=
      (amount * Math.pow(1 + netBenchmarkRate, years)) / factor;
  });
  activeSavingsHoldings.forEach((h) => {
    const amount = Number(h.amount) || 0;
    monthlyAtBenchmark +=
      (amount * Math.pow(1 + benchmarkRate, years)) / DEFAULT_FACTOR;
  });
  // Note: App.jsx does not annuitize cash into monthlyAtBenchmark (cash stays in capital path).
  monthlyAtBenchmark +=
    annuityFV(annualContribution, contributionRateOptimal, years) /
    contributionFactor;
  // APPROVED CHANGE: no OLD_AGE_BENEFIT added to monthlyAtBenchmark.

  return {
    years,
    monthlyIncome,
    gapPercent,
    gapAmount,
    currentSalary: salaryNum,
    isEstimatedMode,
    isGreenScenario,
    capitalActual,
    capitalOptimal,
    capitalGap,
    monthlyAtBenchmark,
    earlyRetirementAge,
    blendedExposure,
    benchmark,
  };
}
