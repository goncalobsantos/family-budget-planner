import type {
  WalletRecord,
  OpeningBalance,
  DailyBalance,
  CategoryTotal,
  ProjectData,
  ProjectYearData,
  ProjectMonthSummary,
  AccountType,
  DebtEntry,
  DebtWithPayments,
} from "@/types/budget";
import { ACCOUNT_DISPLAY_NAMES } from "@/types/budget";

// ── Opening Balances (NWS = "Start") ──
export function getOpeningBalances(records: WalletRecord[]): OpeningBalance[] {
  const startRecords = records.filter((r) => r.nws === "Start");
  const accounts: AccountType[] = ["Main", "Meal", "TradeRepublic"];

  return accounts.map((account) => {
    const record = startRecords.find((r) => r.account === account);
    return {
      account,
      displayName: ACCOUNT_DISPLAY_NAMES[account],
      amount: record?.amount ?? 0,
    };
  });
}

// ── Get the start date from Start records ──
export function getStartDate(records: WalletRecord[]): string {
  const startRecord = records.find((r) => r.nws === "Start");
  return startRecord?.date.slice(0, 10) || "";
}

// ── Period records (after Start date, excluding Start) ──
export function getPeriodRecords(records: WalletRecord[]): WalletRecord[] {
  const startDate = getStartDate(records);
  if (!startDate) return records.filter((r) => r.nws !== "Start");
  return records.filter(
    (r) => r.nws !== "Start" && r.date.slice(0, 10) >= startDate
  );
}

// ── Date Range (of the period only) ──
export function getDateRange(records: WalletRecord[]): {
  start: string;
  end: string;
} {
  const period = getPeriodRecords(records);
  if (period.length === 0) {
    return { start: "", end: "" };
  }
  const dates = period.map((r) => r.date).sort();
  return { start: dates[0], end: dates[dates.length - 1] };
}

// ── Daily Running Balances (period records only) ──
export function getDailyBalances(records: WalletRecord[]): DailyBalance[] {
  const openingBalances = getOpeningBalances(records);
  const balances: Record<string, number> = {
    Main: openingBalances.find((b) => b.account === "Main")?.amount ?? 0,
    Coverflex: openingBalances.find((b) => b.account === "Meal")?.amount ?? 0,
    Savings:
      openingBalances.find((b) => b.account === "TradeRepublic")?.amount ?? 0,
  };

  // Only use period records for the balance chart (exclude pending/future transfers)
  const transactions = getPeriodRecords(records)
    .filter((r) => !r.extraInfo.toLowerCase().includes("pending"))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Group by date
  const dateMap = new Map<
    string,
    { Main: number; Coverflex: number; Savings: number }
  >();

  // Add opening as the first day
  const firstDate = transactions[0]?.date;
  if (firstDate) {
    const dayKey = firstDate.slice(0, 10);
    dateMap.set(dayKey, { ...balances } as {
      Main: number;
      Coverflex: number;
      Savings: number;
    });
  }

  for (const record of transactions) {
    const dayKey = record.date.slice(0, 10);
    const accountKey =
      record.account === "Meal"
        ? "Coverflex"
        : record.account === "TradeRepublic"
          ? "Savings"
          : "Main";

    if (record.type === "Receita") {
      balances[accountKey] += record.amount;
    } else {
      balances[accountKey] -= record.amount;
    }

    dateMap.set(dayKey, { ...balances } as {
      Main: number;
      Coverflex: number;
      Savings: number;
    });
  }

  return Array.from(dateMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, bals]) => ({
      date,
      Main: Math.round(bals.Main * 100) / 100,
      Coverflex: Math.round(bals.Coverflex * 100) / 100,
      Savings: Math.round(bals.Savings * 100) / 100,
    }));
}

// ── Category Breakdown (Main account period expenses, excluding Ignore & Start) ──
export function getCategoryBreakdown(
  records: WalletRecord[]
): CategoryTotal[] {
  const expenses = getPeriodRecords(records).filter(
    (r) =>
      r.type === "Despesa" &&
      r.account === "Main" &&
      r.nws !== "Ignore"
  );

  const map = new Map<string, { total: number; records: WalletRecord[] }>();

  for (const r of expenses) {
    const existing = map.get(r.category) || { total: 0, records: [] };
    existing.total += r.amount;
    existing.records.push(r);
    map.set(r.category, existing);
  }

  return Array.from(map.entries())
    .map(([category, data]) => ({
      category,
      total: Math.round(data.total * 100) / 100,
      records: data.records,
    }))
    .sort((a, b) => b.total - a.total);
}

// ── Extra Info Breakdown (period expenses with extra info, excluding Ignore, Start, project-specific) ──
export function getExtraInfoBreakdown(
  records: WalletRecord[]
): CategoryTotal[] {
  const projectExtraInfos = [
    "LabStories - Pagamentos Freelancers",
    "LabStories - Compras material",
    "Despesas Dwellin'",
    "Pending transfer",
  ];
  const expenses = getPeriodRecords(records).filter(
    (r) =>
      r.type === "Despesa" &&
      r.nws !== "Ignore" &&
      r.extraInfo !== "" &&
      !projectExtraInfos.includes(r.extraInfo)
  );

  const map = new Map<string, { total: number; records: WalletRecord[] }>();

  for (const r of expenses) {
    const key = r.extraInfo;
    const existing = map.get(key) || { total: 0, records: [] };
    existing.total += r.amount;
    existing.records.push(r);
    map.set(key, existing);
  }

  return Array.from(map.entries())
    .map(([category, data]) => ({
      category,
      total: Math.round(data.total * 100) / 100,
      records: data.records,
    }))
    .sort((a, b) => b.total - a.total);
}

// ── Project Data for the current period (by label) ──
export function getProjectData(
  records: WalletRecord[],
  label: string,
  displayName: string
): ProjectData {
  const periodRecs = getPeriodRecords(records);
  const projectRecords = periodRecs.filter(
    (r) => r.labels.includes(label) && r.nws !== "Ignore"
  );

  const incomeRecords = projectRecords.filter((r) => r.type === "Receita");
  const expenseRecords = projectRecords.filter((r) => r.type === "Despesa");

  const income = incomeRecords.reduce((sum, r) => sum + r.amount, 0);
  const expenses = expenseRecords.reduce((sum, r) => sum + r.amount, 0);

  return {
    label,
    displayName,
    income: Math.round(income * 100) / 100,
    expenses: Math.round(expenses * 100) / 100,
    net: Math.round((income - expenses) * 100) / 100,
    incomeRecords,
    expenseRecords,
  };
}

// ── Project Year Data (all records in CSV for the project, grouped by month) ──
export function getProjectYearData(
  records: WalletRecord[],
  label: string,
  displayName: string
): ProjectYearData {
  const projectRecords = records.filter(
    (r) => r.labels.includes(label) && r.nws !== "Ignore" && r.nws !== "Start"
  );

  // Group by month
  const monthMap = new Map<string, { income: number; expenses: number }>();
  for (const r of projectRecords) {
    const month = r.date.slice(0, 7);
    const existing = monthMap.get(month) || { income: 0, expenses: 0 };
    if (r.type === "Receita") {
      existing.income += r.amount;
    } else {
      existing.expenses += r.amount;
    }
    monthMap.set(month, existing);
  }

  const months: ProjectMonthSummary[] = Array.from(monthMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({
      month,
      income: Math.round(data.income * 100) / 100,
      expenses: Math.round(data.expenses * 100) / 100,
      net: Math.round((data.income - data.expenses) * 100) / 100,
    }));

  const totalIncome = months.reduce((s, m) => s + m.income, 0);
  const totalExpenses = months.reduce((s, m) => s + m.expenses, 0);

  return {
    label,
    displayName,
    months,
    totalIncome: Math.round(totalIncome * 100) / 100,
    totalExpenses: Math.round(totalExpenses * 100) / 100,
    totalNet: Math.round((totalIncome - totalExpenses) * 100) / 100,
  };
}

// ── Totals (period only) ──
export function getIncomeTotal(records: WalletRecord[]): number {
  return Math.round(
    getPeriodRecords(records)
      .filter(
        (r) =>
          r.type === "Receita" && r.nws !== "Ignore"
      )
      .reduce((sum, r) => sum + r.amount, 0) * 100
  ) / 100;
}

export function getExpenseTotal(records: WalletRecord[]): number {
  return Math.round(
    getPeriodRecords(records)
      .filter(
        (r) =>
          r.type === "Despesa" && r.nws !== "Ignore"
      )
      .reduce((sum, r) => sum + r.amount, 0) * 100
  ) / 100;
}

// ── NWS Totals (for breakdown, period only) ──
export function getNWSBreakdown(
  records: WalletRecord[]
): Record<string, number> {
  const expenses = getPeriodRecords(records).filter(
    (r) =>
      r.type === "Despesa" && r.nws !== "Ignore"
  );

  const breakdown: Record<string, number> = {
    Needs: 0,
    Wants: 0,
    Saves: 0,
  };

  for (const r of expenses) {
    if (r.nws in breakdown) {
      breakdown[r.nws] += r.amount;
    }
  }

  for (const key of Object.keys(breakdown)) {
    breakdown[key] = Math.round(breakdown[key] * 100) / 100;
  }

  return breakdown;
}

// ── Unique extra info categories by NWS type (for budget planning) ──
export function getExtraInfoCategoriesByNWS(
  records: WalletRecord[]
): Record<string, string[]> {
  const projectExtraInfos = [
    "LabStories - Pagamentos Freelancers",
    "LabStories - Compras material",
    "Despesas Dwellin'",
    "Pending transfer",
  ];
  const expenses = getPeriodRecords(records).filter(
    (r) =>
      r.type === "Despesa" &&
      r.nws !== "Ignore" &&
      r.extraInfo !== "" &&
      !projectExtraInfos.includes(r.extraInfo)
  );

  const map: Record<string, Set<string>> = {
    Needs: new Set(),
    Wants: new Set(),
  };

  for (const r of expenses) {
    if (r.nws === "Needs" || r.nws === "Wants") {
      map[r.nws].add(r.extraInfo);
    }
  }

  return {
    Needs: Array.from(map.Needs).sort(),
    Wants: Array.from(map.Wants).sort(),
  };
}

// ── Compute debt payments from CSV ──
export function computeDebtPayments(
  records: WalletRecord[],
  debts: DebtEntry[]
): DebtWithPayments[] {
  const periodRecs = getPeriodRecords(records);

  return debts.map((debt) => {
    let paymentsThisMonth = 0;

    if (debt.fixedPortionOf) {
      // Debt is a portion of a larger payment matched by label
      const matchingRecords = periodRecs.filter(
        (r) =>
          r.type === "Despesa" &&
          r.labels.includes(debt.fixedPortionOf!.label)
      );
      paymentsThisMonth = matchingRecords.length * debt.fixedPortionOf.amount;
    } else {
      // Match by label directly
      const matchingRecords = periodRecs.filter(
        (r) =>
          r.type === "Despesa" &&
          r.labels.includes(debt.csvLabel)
      );
      paymentsThisMonth = matchingRecords.reduce((s, r) => s + r.amount, 0);
    }

    const remaining = Math.max(0, debt.totalOwed - paymentsThisMonth);

    return {
      ...debt,
      paymentsThisMonth: Math.round(paymentsThisMonth * 100) / 100,
      remaining: Math.round(remaining * 100) / 100,
    };
  });
}
