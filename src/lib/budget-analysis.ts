import type {
  BudgetPlan,
  BudgetAnalysis,
  BudgetVsActualLine,
  WalletRecord,
} from "@/types/budget";
import { getPeriodRecords } from "./data-processor";

/**
 * Determine how many days are in the given YYYY-MM month.
 */
function daysInMonth(yearMonth: string): number {
  const [y, m] = yearMonth.split("-").map(Number);
  return new Date(y, m, 0).getDate();
}

/**
 * Compute the number of days between two ISO date strings (inclusive).
 */
function daysBetween(start: string, end: string): number {
  const s = new Date(start.slice(0, 10));
  const e = new Date(end.slice(0, 10));
  return Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

/**
 * Get actual spending by NWS category for the period records.
 */
function getActualByNWS(records: WalletRecord[]) {
  const period = getPeriodRecords(records);
  const result = { Needs: 0, Wants: 0, Saves: 0, Income: 0 };

  for (const r of period) {
    if (r.nws === "Ignore" || r.nws === "Start") continue;
    if (r.type === "Receita") {
      result.Income += r.amount;
    } else {
      if (r.nws === "Needs") result.Needs += r.amount;
      else if (r.nws === "Wants") result.Wants += r.amount;
      else if (r.nws === "Saves") result.Saves += r.amount;
    }
  }

  return result;
}

/**
 * Get actual spending grouped by extraInfo or category, filtered by NWS.
 */
function getActualBreakdown(
  records: WalletRecord[],
  nws: "Needs" | "Wants"
): Map<string, number> {
  const period = getPeriodRecords(records);
  const map = new Map<string, number>();

  for (const r of period) {
    if (r.type !== "Despesa" || r.nws !== nws) continue;
    // Try to match by extraInfo first (more specific), then category
    const key = r.extraInfo || r.category;
    map.set(key, (map.get(key) || 0) + r.amount);
  }

  return map;
}

/**
 * Try to match a budget plan category name to actual spending.
 * Uses fuzzy matching: tries exact match, then case-insensitive, then substring.
 */
function findActualForCategory(
  categoryName: string,
  actualMap: Map<string, number>
): { matched: string | null; amount: number } {
  // Exact match
  if (actualMap.has(categoryName)) {
    return { matched: categoryName, amount: actualMap.get(categoryName)! };
  }

  // Case-insensitive match
  const lower = categoryName.toLowerCase();
  for (const [key, val] of actualMap) {
    if (key.toLowerCase() === lower) {
      return { matched: key, amount: val };
    }
  }

  // Substring match (budget category name contained in actual key or vice versa)
  for (const [key, val] of actualMap) {
    if (
      key.toLowerCase().includes(lower) ||
      lower.includes(key.toLowerCase())
    ) {
      return { matched: key, amount: val };
    }
  }

  return { matched: null, amount: 0 };
}

/**
 * Build a full budget vs actual analysis given a budget plan and CSV records.
 */
export function buildBudgetAnalysis(
  plan: BudgetPlan,
  records: WalletRecord[],
  dateRange: { start: string; end: string }
): BudgetAnalysis {
  const periodDays = daysBetween(dateRange.start, dateRange.end);
  const monthDays = daysInMonth(plan.month);
  const isPartial = periodDays < monthDays - 2; // allow 2 day tolerance
  const coveragePct = Math.min(100, Math.round((periodDays / monthDays) * 100));

  const actual = getActualByNWS(records);
  const actualNeedsMap = getActualBreakdown(records, "Needs");
  const actualWantsMap = getActualBreakdown(records, "Wants");

  // Build category-level comparison for Needs
  const budgetedNeedsCategories = plan.categoryBreakdown?.needs || [];
  const matchedNeedsKeys = new Set<string>();
  const needsBreakdown: BudgetVsActualLine[] = budgetedNeedsCategories.map((bc) => {
    const { matched, amount: actualAmount } = findActualForCategory(
      bc.category,
      actualNeedsMap
    );
    if (matched) matchedNeedsKeys.add(matched);
    const diff = bc.amount - actualAmount;
    return {
      category: bc.category,
      budgeted: bc.amount,
      actual: Math.round(actualAmount * 100) / 100,
      difference: Math.round(diff * 100) / 100,
      percentUsed: bc.amount > 0 ? Math.round((actualAmount / bc.amount) * 100) : actualAmount > 0 ? 999 : 0,
    };
  });
  // Add unmatched actual needs categories
  for (const [key, val] of actualNeedsMap) {
    if (!matchedNeedsKeys.has(key)) {
      needsBreakdown.push({
        category: key,
        budgeted: 0,
        actual: Math.round(val * 100) / 100,
        difference: -Math.round(val * 100) / 100,
        percentUsed: 999,
      });
    }
  }

  // Build category-level comparison for Wants
  const budgetedWantsCategories = plan.categoryBreakdown?.wants || [];
  const matchedWantsKeys = new Set<string>();
  const wantsBreakdown: BudgetVsActualLine[] = budgetedWantsCategories.map((bc) => {
    const { matched, amount: actualAmount } = findActualForCategory(
      bc.category,
      actualWantsMap
    );
    if (matched) matchedWantsKeys.add(matched);
    const diff = bc.amount - actualAmount;
    return {
      category: bc.category,
      budgeted: bc.amount,
      actual: Math.round(actualAmount * 100) / 100,
      difference: Math.round(diff * 100) / 100,
      percentUsed: bc.amount > 0 ? Math.round((actualAmount / bc.amount) * 100) : actualAmount > 0 ? 999 : 0,
    };
  });
  for (const [key, val] of actualWantsMap) {
    if (!matchedWantsKeys.has(key)) {
      wantsBreakdown.push({
        category: key,
        budgeted: 0,
        actual: Math.round(val * 100) / 100,
        difference: -Math.round(val * 100) / 100,
        percentUsed: 999,
      });
    }
  }

  // Savings goal progress
  const savingsGoalProgress = (plan.savings?.allocations || []).map((alloc) => ({
    goalName: alloc.goalName,
    planned: alloc.amount,
    achieved: 0, // We can't precisely track goal-level savings from CSV
  }));

  // Budget totals
  const totalBudgetedExpenses = plan.allocations.needs.amount + plan.allocations.wants.amount;
  const actualExpenses = actual.Needs + actual.Wants;

  // Compute wins and overages
  const wins: string[] = [];
  const overages: string[] = [];
  const warnings: string[] = [];

  for (const line of [...needsBreakdown, ...wantsBreakdown]) {
    if (line.budgeted > 0 && line.actual <= line.budgeted) {
      if (line.actual > 0) {
        const savedAmt = line.budgeted - line.actual;
        wins.push(
          `${line.category}: saved €${savedAmt.toFixed(2)} (used ${line.percentUsed}%)`
        );
      }
    } else if (line.actual > line.budgeted) {
      const overAmt = line.actual - line.budgeted;
      if (line.budgeted > 0) {
        overages.push(
          `${line.category}: over by €${overAmt.toFixed(2)} (${line.percentUsed}% of budget)`
        );
      } else {
        overages.push(
          `${line.category}: €${line.actual.toFixed(2)} unplanned spending`
        );
      }
    }
  }

  // Partial period warnings
  if (isPartial) {
    warnings.push(
      `This CSV covers only ${periodDays} of ${monthDays} days (${coveragePct}% of the month). Actuals may be incomplete.`
    );
    const projectedExpenses = actualExpenses * (monthDays / periodDays);
    if (projectedExpenses > totalBudgetedExpenses * 1.1) {
      warnings.push(
        `At this pace, projected monthly expenses would be €${projectedExpenses.toFixed(0)} vs €${totalBudgetedExpenses.toFixed(0)} budgeted.`
      );
    }
  }

  // Income warning
  if (actual.Income < plan.totalIncome * 0.9 && !isPartial) {
    warnings.push(
      `Actual income €${actual.Income.toFixed(2)} was ${Math.round(((plan.totalIncome - actual.Income) / plan.totalIncome) * 100)}% below expected €${plan.totalIncome.toFixed(2)}.`
    );
  }

  // Savings warning
  const savedActual = actual.Saves;
  const savedTarget = plan.allocations.saves.amount;
  if (savedActual < savedTarget * 0.5 && !isPartial) {
    warnings.push(
      `Only €${savedActual.toFixed(2)} saved vs €${savedTarget.toFixed(2)} target (${Math.round((savedActual / savedTarget) * 100)}%).`
    );
  }

  return {
    planMonth: plan.month,
    periodStart: dateRange.start,
    periodEnd: dateRange.end,
    daysInPeriod: periodDays,
    daysInMonth: monthDays,
    isPartialPeriod: isPartial,
    coveragePercentage: coveragePct,

    totalBudgetedIncome: plan.totalIncome,
    actualIncome: Math.round(actual.Income * 100) / 100,
    totalBudgetedExpenses: Math.round(totalBudgetedExpenses * 100) / 100,
    actualExpenses: Math.round(actualExpenses * 100) / 100,

    needsBudgeted: plan.allocations.needs.amount,
    needsActual: Math.round(actual.Needs * 100) / 100,
    wantsBudgeted: plan.allocations.wants.amount,
    wantsActual: Math.round(actual.Wants * 100) / 100,
    savesBudgeted: plan.allocations.saves.amount,
    savesActual: Math.round(actual.Saves * 100) / 100,

    needsBreakdown,
    wantsBreakdown,
    savingsGoalProgress,

    wins,
    overages,
    warnings,
  };
}
