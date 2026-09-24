/**
 * Result note cards — ported from pension-calc App.jsx notes.push logic.
 * Skips notes when required inputs are unavailable; does not invent numbers.
 * Does NOT include קצבת זקנה in any figure.
 */
import {
  BENCHMARK_DEVIATION,
  CASH_REAL_RATE,
  EXEC_MGMT_FEE,
  SHORT_HORIZON_YEARS,
} from "./constants";
import {
  formatILS,
  formatILSApprox,
  getExecutiveFactor,
  resolveExposureAndRate,
} from "./math";
import type {
  Holding,
  PensionGapInputs,
  PensionGapResult,
  ResultNote,
} from "./types";

function categoryExposure(holdings: Holding[]): number | null {
  let amountSum = 0;
  let exposureSum = 0;
  holdings.forEach((h) => {
    const amount = Number(h.amount) || 0;
    const { exposure } = resolveExposureAndRate(h);
    amountSum += amount;
    exposureSum += amount * exposure;
  });
  return amountSum > 0 ? exposureSum / amountSum : null;
}

/**
 * Build insight cards for the detailed (non-estimated) path.
 * Early-retirement note is omitted here — it appears in the green improvement box.
 */
export function buildPensionGapNotes(
  inputs: PensionGapInputs,
  result: PensionGapResult,
): ResultNote[] {
  if (result.isEstimatedMode) return [];

  const {
    years,
    monthlyIncome,
    monthlyAtBenchmark,
    isGreenScenario,
    blendedExposure,
    benchmark,
    hasExplicitExposureData,
    currentSalary: salaryNum,
  } = result;

  const gender = inputs.gender;
  const activePensionHoldings = inputs.pensionFundOn
    ? inputs.pensionFundHoldings
    : [];
  const activeExecutiveHoldings = inputs.executiveOn
    ? inputs.executiveHoldings
    : [];
  const activeSavingsHoldings = inputs.savingsOn ? inputs.savingsHoldings : [];
  const cashOn = inputs.cashOn;
  const cashNum = cashOn ? inputs.cashAmount || 0 : 0;

  let weightedAmountSum = 0;
  [...activePensionHoldings, ...activeExecutiveHoldings, ...activeSavingsHoldings].forEach(
    (h) => {
      weightedAmountSum += Number(h.amount) || 0;
    },
  );
  if (cashNum > 0) weightedAmountSum += cashNum;

  const notes: ResultNote[] = [];

  const categoryLabels: string[] = [];
  const pensionExp = categoryExposure(activePensionHoldings);
  if (pensionExp !== null && pensionExp < benchmark - BENCHMARK_DEVIATION) {
    categoryLabels.push("קרן הפנסיה");
  }
  const executiveExp = categoryExposure(activeExecutiveHoldings);
  if (executiveExp !== null && executiveExp < benchmark - BENCHMARK_DEVIATION) {
    categoryLabels.push("ביטוח המנהלים");
  }
  const savingsExp = categoryExposure(activeSavingsHoldings);
  if (savingsExp !== null && savingsExp < benchmark - BENCHMARK_DEVIATION) {
    categoryLabels.push("החיסכון וההשקעות הנזילות");
  }
  let conservativeSourceLabel = "בתיק שלכם";
  if (categoryLabels.length === 1) {
    conservativeSourceLabel = `ב${categoryLabels[0]}`;
  } else if (categoryLabels.length === 2) {
    conservativeSourceLabel = `ב${categoryLabels[0]} וב${categoryLabels[1]}`;
  } else if (categoryLabels.length >= 3) {
    conservativeSourceLabel = `ב${categoryLabels[0]}, ב${categoryLabels[1]} וב${categoryLabels[2]}`;
  }

  if (
    hasExplicitExposureData &&
    weightedAmountSum > 0 &&
    blendedExposure < benchmark - BENCHMARK_DEVIATION
  ) {
    const potentialGain = Math.max(monthlyAtBenchmark - monthlyIncome, 0);

    if (!isGreenScenario) {
      notes.push({
        type: "warning",
        icon: "shield",
        title: "חשיפה שמרנית מדי",
        bigNumber: `₪${formatILSApprox(potentialGain)}+`,
        text: `זהו פוטנציאל הקצבה החודשית שאתם מוותרים עליו. מסלול ההשקעה ${conservativeSourceLabel} סולידי מדי ביחס לזמן שנותר לכם עד הפרישה. התאמת רמת הסיכון למשך תקופת החיסכון היא קריטית כדי לעזור לסגור את הפער שנוצר.`,
        impact: potentialGain,
      });
    } else {
      notes.push({
        type: "positive",
        icon: "sparkles",
        title: "אפשר להוציא מהתיק יותר",
        bigNumber: `₪${formatILSApprox(potentialGain)}+`,
        text: `זהו הסכום הנוסף שיכולתם לקבל בכל חודש בפרישה. למרות שתמונת הפרישה שלכם נראית טוב, התאמת המסלול ${conservativeSourceLabel} לזמן שנותר יכולה לשדרג משמעותית את רמת החיים שלכם מעבר לציפיות, ללא שינוי בהפקדות.`,
        impact: potentialGain,
      });
    }
  } else if (
    hasExplicitExposureData &&
    !isGreenScenario &&
    weightedAmountSum > 0 &&
    years < SHORT_HORIZON_YEARS &&
    blendedExposure > benchmark + BENCHMARK_DEVIATION
  ) {
    notes.push({
      type: "warning",
      icon: "shield",
      title: "חשיפת יתר סמוך לפרישה",
      bigNumber: `${years} שנים`,
      text: `זה כל הזמן שנותר לכם עד הפרישה, אך הוא אינו תואם את פרופיל הסיכון הגבוה של התיק כיום. ניהול סיכונים מקצועי דורש הפחתה הדרגתית של החשיפה למניות לקראת מועד הפרישה, כדי למנוע זעזועים בלתי הפיכים בערך הקצבה.`,
      impact: weightedAmountSum * 0.1,
    });
  }

  if (cashOn && cashNum > 0) {
    const cashCumulativeErosion =
      cashNum - cashNum * Math.pow(1 + CASH_REAL_RATE, years);
    notes.push({
      type: "critical",
      icon: "banknote",
      title: "שחיקת כסף במזומן",
      bigNumber: `₪${formatILSApprox(cashCumulativeErosion)}-`,
      text: `זהו אובדן הערך הצפוי של ה-₪${formatILS(cashNum)} שיושבים כרגע בעובר ושב ללא השקעה. כסף שלא צובר תשואה נשחק בהדרגה מול האינפלציה, ועד גיל הפרישה הפגיעה בכוח הקנייה שלו תהיה משמעותית.`,
      impact: cashCumulativeErosion,
    });
  }

  const bankHoldings = activeSavingsHoldings.filter(
    (h) => h.managedBy === "bank",
  );
  if (bankHoldings.length > 0) {
    notes.push({
      type: "warning",
      icon: "landmark",
      title: "חיסכון יקר דרך הבנק",
      text: `מודל התמחור הבנקאי מבוסס על עמלות מסחר ודמי משמרת שנוגסים באופן עקבי בתשואה שלכם, במקום שהכסף ינוהל בשקיפות וביעילות בפלטפורמות פיננסיות מודרניות. לאורך זמן, העלויות האלו עלולות לפגוע משמעותית בפוטנציאל הצמיחה של הכסף.`,
      impact: 1,
    });
  }

  const goodFactorHoldings = activeExecutiveHoldings.filter(
    (h) => getExecutiveFactor(h, gender) < 200,
  );
  const otherFactorHoldings = activeExecutiveHoldings.filter(
    (h) => getExecutiveFactor(h, gender) >= 200,
  );

  if (goodFactorHoldings.length > 0) {
    const goodFactorAmount = goodFactorHoldings.reduce(
      (s, h) => s + (Number(h.amount) || 0),
      0,
    );
    notes.push({
      type: "positive",
      icon: "sparkles",
      title: "פוליסת מנהלים בעלת ערך",
      text: `הפוליסה הוותיקה שלכם אוצרת בתוכה יתרון פנסיוני משמעותי – הגנת מקדם. ההבטחה הזו מתורגמת לקצבה גבוהה ויציבה יותר עבור כל שקל שנחסך בה, ומהווה נכס שחובה לקחת בחשבון כשבוחנים את כדאיות דמי הניהול.`,
      impact: goodFactorAmount,
    });
    notes.push({
      type: "warning",
      icon: "fileWarning",
      title: "דמי ניהול יקרים",
      text: `החזקת פוליסת מנהלים ותיקה מלווה לרוב בעלויות ניהול עודפות. כדי שהפוליסה באמת תשתלם, יש לוודא שהרווח העתידי מהמקדם המובטח גובר על השחיקה הוודאית של דמי הניהול לאורך שנות החיסכון.`,
      impact: goodFactorAmount,
    });
  }

  if (otherFactorHoldings.length > 0) {
    const otherFactorAmount = otherFactorHoldings.reduce(
      (s, h) => s + (Number(h.amount) || 0),
      0,
    );
    notes.push({
      type: "warning",
      icon: "fileWarning",
      title: "ביטוח מנהלים ללא הגנה",
      text: `ביטוחי מנהלים מהשנים האחרונות איבדו את היתרון המרכזי שלהם – הבטחת המקדם. נכון להיום, אתם משלמים דמי ניהול של מוצר פרימיום, אך מקבלים תנאים דומים מאוד למוצרים פנסיוניים זולים בהרבה.`,
      impact: otherFactorAmount,
    });
  }

  if (goodFactorHoldings.length > 0) {
    const oldAmount = goodFactorHoldings.reduce(
      (s, h) => s + (Number(h.amount) || 0),
      0,
    );
    let oldPolicyMonthlyIncome = 0;
    goodFactorHoldings.forEach((h) => {
      const amount = Number(h.amount) || 0;
      const { rate } = resolveExposureAndRate(h);
      const factor = getExecutiveFactor(h, gender);
      const netRate = rate - EXEC_MGMT_FEE;
      oldPolicyMonthlyIncome +=
        (amount * Math.pow(1 + netRate, years)) / factor;
    });
    const incomeFromOtherSources = monthlyIncome - oldPolicyMonthlyIncome;
    if (incomeFromOtherSources >= salaryNum) {
      notes.push({
        type: "warning",
        icon: "fileWarning",
        title: "כפילות בביטוח הוותיק",
        text: `מצבכם הפנסיוני מצוין, מה שמעלה שאלה אסטרטגית: האם נכון להמשיך לשלם דמי ניהול יקרים על פוליסת המנהלים? כשהקצבה הבסיסית מובטחת ממקורות אחרים, שווה לבדוק אפשרות לייעל את התיק למוצרים חסכוניים יותר.`,
        impact: oldAmount,
      });
    }
  }

  notes.sort((a, b) => {
    const aGreen = a.type === "positive" ? 1 : 0;
    const bGreen = b.type === "positive" ? 1 : 0;
    if (aGreen !== bGreen) return aGreen - bGreen;
    return (b.impact || 0) - (a.impact || 0);
  });

  return notes;
}

/** Limitations list — source copy, adapted: קצבת זקנה is NOT in the calculation. */
export const PENSION_GAP_LIMITATIONS = {
  title: "החישוב המוצג לא כולל",
  items: [
    "דמי ניהול מהפקדה ומצבירה בפועל (למעט הנחה כללית של 0.8% מצבירה בביטוחי מנהלים, שנלקחה בחשבון בחישוב)",
    "רציפות ההפרשה ההיסטורית והעתידית",
    "עליית שכר עתידית",
    "זכויות פטור ממס בפרישה וקיבוע זכויות",
    "קצבת אזרח ותיק (קצבת זקנה) מביטוח לאומי — אינה נכללת בחישוב, גם אם אתם זכאים לה",
    "מקדם ההמרה המדויק — מוצג קירוב כללי; המקדם הסופי תלוי בגיל המדויק, במגדר ובמבנה המשפחתי בפרישה. מקדם נמוך בפוליסות ותיקות בדרך כלל משקף הגנה מובנית מפני התארכות תוחלת חיים",
    "תרחיש החשיפה לפי טווח הזמן במערכת הוא הערכה כללית להמחשה בלבד, ואינו מהווה המלצת השקעה מותאמת אישית",
    "ניהול חיסכון דרך הבנק כרוך לרוב בעמלות ודמי ניהול גבוהים יותר, ובגמישות מוגבלת להגיב בזמן אמת לשינויי שוק",
    "מזומן שאינו מושקע נשחק בהדרגה תחת אינפלציה ריאלית שלילית",
    "סימולציית הפרישה המוקדמת מבוססת על אופטימיזציה של חשיפה בלבד, ואינה כוללת הנחת הפחתת דמי ניהול",
  ],
} as const;

export const CALC_STEPS = [
  "מנתחים את הצבירה...",
  "מחשבים הפקדות עתידיות...",
  "מחשבים את הקצבה החודשית...",
  "מרכיבים את תמונת המצב...",
] as const;

export const CALC_STEP_MS = 1500;
export const CALC_ANIMATION_MS = CALC_STEPS.length * CALC_STEP_MS;
