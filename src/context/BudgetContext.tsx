"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type {
  WalletRecord,
  BudgetData,
  DebtEntry,
  GoalEntry,
  ScheduledTransfer,
  NextMonthIncome,
} from "@/types/budget";
import { parseCsv } from "@/lib/csv-parser";
import {
  getOpeningBalances,
  getDailyBalances,
  getCategoryBreakdown,
  getExtraInfoBreakdown,
  getProjectData,
  getProjectYearData,
  getIncomeTotal,
  getExpenseTotal,
  getDateRange,
  getPeriodRecords,
  computeDebtPayments,
} from "@/lib/data-processor";

import debtsData from "@/data/debts.json";
import goalsData from "@/data/goals.json";
import scheduledData from "@/data/scheduled-transfers.json";
import nextMonthData from "@/data/next-month-income.json";

interface BudgetContextValue {
  data: BudgetData | null;
  csvText: string | null;
  loadCsv: (csvText: string) => void;
  clearData: () => void;
  error: string | null;
}

const BudgetContext = createContext<BudgetContextValue>({
  data: null,
  csvText: null,
  loadCsv: () => {},
  clearData: () => {},
  error: null,
});

export function BudgetProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<BudgetData | null>(null);
  const [csvText, setCsvText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const clearData = useCallback(() => {
    setData(null);
    setCsvText(null);
    setError(null);
  }, []);

  const loadCsv = useCallback((text: string) => {
    try {
      setError(null);
      const records: WalletRecord[] = parseCsv(text);

      if (records.length === 0) {
        throw new Error("No records found in CSV");
      }

      setCsvText(text);

      const dateRange = getDateRange(records);
      const periodRecords = getPeriodRecords(records);
      const openingBalances = getOpeningBalances(records);
      const dailyBalances = getDailyBalances(records);
      const categoryBreakdown = getCategoryBreakdown(records);
      const extraInfoBreakdown = getExtraInfoBreakdown(records);
      const labstories = getProjectData(records, "LabStories", "LabStories");
      const dwellin = getProjectData(records, "Dwell", "Dwellin'");
      const labstoriesYear = getProjectYearData(records, "LabStories", "LabStories");
      const dwellinYear = getProjectYearData(records, "Dwell", "Dwellin'");
      const incomeTotal = getIncomeTotal(records);
      const expenseTotal = getExpenseTotal(records);
      const debts = computeDebtPayments(records, debtsData as DebtEntry[]);

      setData({
        records,
        periodRecords,
        dateRange,
        openingBalances,
        dailyBalances,
        categoryBreakdown,
        extraInfoBreakdown,
        projects: { labstories, dwellin },
        projectsYear: { labstories: labstoriesYear, dwellin: dwellinYear },
        incomeTotal,
        expenseTotal,
        debts,
        goals: goalsData as GoalEntry[],
        scheduledTransfers: scheduledData as ScheduledTransfer[],
        nextMonthIncome: nextMonthData as NextMonthIncome,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to parse CSV");
      setData(null);
      setCsvText(null);
    }
  }, []);

  return (
    <BudgetContext.Provider value={{ data, csvText, loadCsv, clearData, error }}>
      {children}
    </BudgetContext.Provider>
  );
}

export function useBudget() {
  const ctx = useContext(BudgetContext);
  if (!ctx) {
    throw new Error("useBudget must be used within BudgetProvider");
  }
  return ctx;
}
