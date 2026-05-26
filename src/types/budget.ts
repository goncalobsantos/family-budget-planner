// ── Raw CSV Record ──
export interface WalletRecord {
  category: string;
  amount: number;
  type: "Receita" | "Despesa"; // Income | Expense
  note: string;
  date: string; // ISO date string
  labels: string[];
  nws: NWSType;
  account: AccountType;
  extraInfo: string;
}

export type NWSType =
  | "Needs"
  | "Wants"
  | "Saves"
  | "Income"
  | "Ignore"
  | "Start";

export type AccountType = "Main" | "Meal" | "TradeRepublic";

// ── Display name mapping ──
export const ACCOUNT_DISPLAY_NAMES: Record<AccountType, string> = {
  Main: "Main Account",
  Meal: "Coverflex",
  TradeRepublic: "Savings",
};

// ── Processed Data ──
export interface OpeningBalance {
  account: AccountType;
  displayName: string;
  amount: number;
}

export interface DailyBalance {
  date: string;
  Main: number;
  Coverflex: number;
  Savings: number;
}

export interface CategoryTotal {
  category: string;
  total: number;
  records: WalletRecord[];
}

export interface ProjectData {
  label: string;
  displayName: string;
  income: number;
  expenses: number;
  net: number;
  incomeRecords: WalletRecord[];
  expenseRecords: WalletRecord[];
}

export interface ProjectMonthSummary {
  month: string; // YYYY-MM
  income: number;
  expenses: number;
  net: number;
}

export interface ProjectYearData {
  label: string;
  displayName: string;
  months: ProjectMonthSummary[];
  totalIncome: number;
  totalExpenses: number;
  totalNet: number;
}

// ── Config Types ──
export interface DebtEntry {
  id: string;
  name: string;
  description: string;
  totalOwed: number;
  csvLabel: string; // label in CSV to match payments
  fixedPortionOf?: { // if only a portion of a payment is debt
    label: string;
    amount: number; // the debt portion from the total payment
  };
}

export interface DebtWithPayments extends DebtEntry {
  paymentsThisMonth: number;
  remaining: number;
}

export interface GoalEntry {
  id: string;
  name: string;
  description: string;
  targetAmount: number;
  currentSaved: number;
  deadline: string; // ISO date
  icon: string; // lucide icon name
}

export interface ScheduledTransfer {
  id: string;
  name: string;
  amount: number;
  category: string;
  nws: "Needs" | "Wants" | "Saves";
  isFixed: boolean; // true = exact amount, false = estimate
  day: number; // day of the month the payment goes out (0 = no fixed date)
  type: "bill" | "subscription" | "variable" | "mantimentos";
}

export interface IncomeSource {
  id: string;
  name: string;
  amount: number;
  account: AccountType;
  isFixed: boolean;
  day: number; // day of the month income is received
  countsForSavings: boolean; // whether this income counts towards the 20% savings target
}

export interface NextMonthIncome {
  sources: IncomeSource[];
  accountLeftovers: {
    Main: number;
    Coverflex: number;
    Savings: number;
  };
}

// ── Budget Plan (exported JSON) ──
export interface BudgetPlanSubcategory {
  id: string;
  name: string;
  budgeted: number;
  isCommitted?: boolean; // true if from scheduled transfers
}

export interface BudgetPlanCategory {
  id: string;
  name: string;
  budgeted: number;
  isFixed: boolean; // locked amount vs flexible
  notes?: string;
  subcategories?: BudgetPlanSubcategory[];
}

export interface SavingsAllocation {
  goalId: string;
  goalName: string;
  amount: number;
}

export interface BudgetPlan {
  version: 2; // schema version for backwards compat
  month: string; // YYYY-MM
  createdAt: string;
  totalIncome: number;
  incomeSources: { name: string; amount: number; isFixed: boolean }[];
  accountLeftovers: {
    Main: number;
    Coverflex: number;
    Savings: number;
  };
  // Scheduled (committed) transfers
  scheduledTransfers: ScheduledTransfer[];
  scheduledTotal: number;
  // Savings breakdown
  savings: {
    totalAmount: number;
    percentage: number;
    allocations: SavingsAllocation[]; // how savings is distributed to goals
    unallocated: number; // savings not assigned to a goal
  };
  // Flexible spending (after scheduled + savings)
  flexibleBudget: {
    total: number;
    needs: {
      total: number;
      categories: BudgetPlanCategory[];
    };
    wants: {
      total: number;
      categories: BudgetPlanCategory[];
    };
  };
  // Summary allocations (total percentages of income)
  allocations: {
    needs: { percentage: number; amount: number };
    wants: { percentage: number; amount: number };
    saves: { percentage: number; amount: number };
  };
  // Legacy fields for backward compat
  disposableIncome: number;
  categoryBreakdown: {
    needs: { category: string; amount: number; percentage: number }[];
    wants: { category: string; amount: number; percentage: number }[];
  };
}

// ── Budget vs Actual Analysis ──
export interface BudgetVsActualLine {
  category: string;
  budgeted: number;
  actual: number;
  difference: number; // positive = under budget, negative = over
  percentUsed: number;
}

export interface BudgetAnalysis {
  planMonth: string; // the month the budget was for
  periodStart: string;
  periodEnd: string;
  daysInPeriod: number;
  daysInMonth: number;
  isPartialPeriod: boolean; // true if CSV doesn't cover full month
  coveragePercentage: number; // % of month covered

  // High-level
  totalBudgetedIncome: number;
  actualIncome: number;
  totalBudgetedExpenses: number;
  actualExpenses: number;

  // NWS-level comparison
  needsBudgeted: number;
  needsActual: number;
  wantsBudgeted: number;
  wantsActual: number;
  savesBudgeted: number;
  savesActual: number;

  // Category detail
  needsBreakdown: BudgetVsActualLine[];
  wantsBreakdown: BudgetVsActualLine[];

  // Savings goals progress
  savingsGoalProgress: {
    goalName: string;
    planned: number;
    achieved: number;
  }[];

  // Insights
  wins: string[]; // categories where we stayed under budget
  overages: string[]; // categories where we went over
  warnings: string[]; // e.g. partial period, missing data
}

// ── Full App State ──
export interface BudgetData {
  records: WalletRecord[]; // all records from CSV
  periodRecords: WalletRecord[]; // only records within the period (after Start)
  dateRange: { start: string; end: string };
  openingBalances: OpeningBalance[];
  dailyBalances: DailyBalance[];
  categoryBreakdown: CategoryTotal[];
  extraInfoBreakdown: CategoryTotal[];
  projects: {
    labstories: ProjectData;
    dwellin: ProjectData;
  };
  projectsYear: {
    labstories: ProjectYearData;
    dwellin: ProjectYearData;
  };
  incomeTotal: number;
  expenseTotal: number;
  // Config data
  debts: DebtWithPayments[];
  goals: GoalEntry[];
  scheduledTransfers: ScheduledTransfer[];
  nextMonthIncome: NextMonthIncome;
}
