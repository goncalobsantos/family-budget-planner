"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Download,
  Check,
  Lock,
  Unlock,
  PiggyBank,
  Target,
  Plus,
  Trash2,
  AlertTriangle,
  Wallet,
  X,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useBudget } from "@/context/BudgetContext";
import { useLanguage } from "@/i18n/LanguageContext";
import type { BudgetPlan, BudgetPlanCategory, BudgetPlanSubcategory, SavingsAllocation } from "@/types/budget";

export default function BudgetPlanner() {
  const { data } = useBudget();

  // Savings percentage
  const [savesPct, setSavesPct] = useState(20);

  // Build initial categories from scheduled transfers
  const initialCategories = useMemo(() => {
    if (!data) return { needs: [], wants: [] };
    const needsMap = new Map<string, BudgetPlanCategory>();
    const wantsMap = new Map<string, BudgetPlanCategory>();

    for (const t of data.scheduledTransfers) {
      const isNeeds = t.nws === "Needs";
      const map = isNeeds ? needsMap : wantsMap;
      const catName = t.category || "Outros";

      if (!map.has(catName)) {
        map.set(catName, {
          id: `committed-${catName.toLowerCase().replace(/\s+/g, "-")}`,
          name: catName,
          budgeted: 0,
          isFixed: false,
          subcategories: [],
        });
      }

      const cat = map.get(catName)!;
      cat.subcategories = cat.subcategories || [];
      cat.subcategories.push({
        id: `committed-${t.id}`,
        name: t.name,
        budgeted: t.amount,
        isCommitted: true,
      });
      // Pre-fill the category budget with the committed total
      cat.budgeted += t.amount;
    }

    return {
      needs: Array.from(needsMap.values()),
      wants: Array.from(wantsMap.values()),
    };
  }, [data]);

  // Custom flexible spending categories (initialized from committed)
  const [flexibleNeeds, setFlexibleNeeds] = useState<BudgetPlanCategory[]>(initialCategories.needs);
  const [flexibleWants, setFlexibleWants] = useState<BudgetPlanCategory[]>(initialCategories.wants);

  // Savings allocations to goals
  const [savingsAllocations, setSavingsAllocations] = useState<SavingsAllocation[]>([]);

  // Editing state
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [addingTo, setAddingTo] = useState<"needs" | "wants" | null>(null);
  // Subcategory adding state: tracks which parent category we're adding a subcategory to
  const [addingSubTo, setAddingSubTo] = useState<string | null>(null);
  const [newSubcategoryName, setNewSubcategoryName] = useState("");
  // Expanded categories (to show/hide subcategories)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const [exported, setExported] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!data) return null;

  const { nextMonthIncome, scheduledTransfers, goals } = data;
  const { t } = useLanguage();

  // ── Income calculations ──
  const incomeFromSources = nextMonthIncome.sources.reduce((s, src) => s + src.amount, 0);
  const totalLeftovers =
    nextMonthIncome.accountLeftovers.Main +
    nextMonthIncome.accountLeftovers.Coverflex;
  const totalIncome = incomeFromSources + totalLeftovers;
  const savingsBase = nextMonthIncome.sources
    .filter((src) => src.countsForSavings)
    .reduce((s, src) => s + src.amount, 0);

  // ── Savings ──
  const savingsAmount = (savingsBase * savesPct) / 100;
  const allocatedToGoals = savingsAllocations.reduce((s, a) => s + a.amount, 0);
  const unallocatedSavings = Math.max(0, savingsAmount - allocatedToGoals);

  // ── Category totals ──
  // cat.budgeted already includes committed amounts as the floor
  const getCategoryTotal = (cat: BudgetPlanCategory): number => cat.budgeted;

  // Get the committed minimum for a category (sum of committed subcategories)
  const getCommittedMin = (cat: BudgetPlanCategory): number =>
    (cat.subcategories || []).filter((sc) => sc.isCommitted).reduce((s, sc) => s + sc.budgeted, 0);
  const needsTotal = flexibleNeeds.reduce((s, c) => s + getCategoryTotal(c), 0);
  const wantsTotal = flexibleWants.reduce((s, c) => s + getCategoryTotal(c), 0);

  // ── Budget health ──
  const totalAllocated = needsTotal + wantsTotal + savingsAmount;
  const unassigned = Math.max(0, totalIncome - totalAllocated);
  const overBudget = totalAllocated > totalIncome + 0.01;
  const allMoneyAssigned = Math.abs(totalIncome - totalAllocated) < 0.01;
  const needsPctOfIncome = totalIncome > 0 ? Math.round((needsTotal / totalIncome) * 10000) / 100 : 0;
  const wantsPctOfIncome = totalIncome > 0 ? Math.round((wantsTotal / totalIncome) * 10000) / 100 : 0;

  // ── Available personal categories (from CSV extraInfoBreakdown) ──
  const allPersonalCategories = data.extraInfoBreakdown.map((c) => c.category);
  const usedCategoryNames = new Set([
    ...flexibleNeeds.map((c) => c.name),
    ...flexibleWants.map((c) => c.name),
  ]);
  const availableCategories = allPersonalCategories.filter(
    (name) => !usedCategoryNames.has(name)
  );

  // ── Handlers ──
  const startEditing = (field: string, currentAmount: number) => {
    setEditingField(field);
    setEditValue(currentAmount.toFixed(2));
  };

  const commitEdit = () => {
    if (!editingField) return;
    const val = parseFloat(editValue);
    if (isNaN(val) || val < 0) {
      setEditingField(null);
      return;
    }

    if (editingField === "saves") {
      const maxSaves = totalIncome - needsTotal - wantsTotal;
      const clamped = Math.min(val, maxSaves);
      const newPct = savingsBase > 0 ? (clamped / savingsBase) * 100 : 0;
      setSavesPct(newPct);
    } else if (editingField.startsWith("sub-needs-")) {
      const subId = editingField.replace("sub-needs-", "");
      setFlexibleNeeds((prev) =>
        prev.map((c) => ({
          ...c,
          subcategories: (c.subcategories || []).map((sc) =>
            sc.id === subId ? { ...sc, budgeted: val } : sc
          ),
        }))
      );
    } else if (editingField.startsWith("sub-wants-")) {
      const subId = editingField.replace("sub-wants-", "");
      setFlexibleWants((prev) =>
        prev.map((c) => ({
          ...c,
          subcategories: (c.subcategories || []).map((sc) =>
            sc.id === subId ? { ...sc, budgeted: val } : sc
          ),
        }))
      );
    } else if (editingField.startsWith("flex-needs-")) {
      const id = editingField.replace("flex-needs-", "");
      setFlexibleNeeds((prev) =>
        prev.map((c) => {
          if (c.id !== id) return c;
          const floor = getCommittedMin(c);
          return { ...c, budgeted: Math.max(val, floor) };
        })
      );
    } else if (editingField.startsWith("flex-wants-")) {
      const id = editingField.replace("flex-wants-", "");
      setFlexibleWants((prev) =>
        prev.map((c) => {
          if (c.id !== id) return c;
          const floor = getCommittedMin(c);
          return { ...c, budgeted: Math.max(val, floor) };
        })
      );
    } else if (editingField.startsWith("goal-")) {
      const goalId = editingField.replace("goal-", "");
      setSavingsAllocations((prev) => {
        const existing = prev.find((a) => a.goalId === goalId);
        if (existing) {
          return prev.map((a) => (a.goalId === goalId ? { ...a, amount: val } : a));
        }
        const goal = goals.find((g) => g.id === goalId);
        return [...prev, { goalId, goalName: goal?.name || goalId, amount: val }];
      });
    }
    setEditingField(null);
  };

  const addCategory = (type: "needs" | "wants") => {
    if (!newCategoryName.trim()) return;
    const id = `custom-${Date.now()}`;
    const cat: BudgetPlanCategory = {
      id,
      name: newCategoryName.trim(),
      budgeted: 0,
      isFixed: false,
      subcategories: [],
    };
    if (type === "needs") {
      setFlexibleNeeds((prev) => [...prev, cat]);
    } else {
      setFlexibleWants((prev) => [...prev, cat]);
    }
    setNewCategoryName("");
    setAddingTo(null);
  };

  const removeCategory = (type: "needs" | "wants", id: string) => {
    if (type === "needs") {
      setFlexibleNeeds((prev) => prev.filter((c) => c.id !== id));
    } else {
      setFlexibleWants((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const addSubcategory = (type: "needs" | "wants", parentId: string) => {
    if (!newSubcategoryName.trim()) return;
    const sub: BudgetPlanSubcategory = {
      id: `sub-${Date.now()}`,
      name: newSubcategoryName.trim(),
      budgeted: 0,
    };
    const updater = (prev: BudgetPlanCategory[]) =>
      prev.map((c) =>
        c.id === parentId
          ? { ...c, subcategories: [...(c.subcategories || []), sub] }
          : c
      );
    if (type === "needs") {
      setFlexibleNeeds(updater);
    } else {
      setFlexibleWants(updater);
    }
    setNewSubcategoryName("");
    setAddingSubTo(null);
  };

  const removeSubcategory = (type: "needs" | "wants", parentId: string, subId: string) => {
    const updater = (prev: BudgetPlanCategory[]) =>
      prev.map((c) =>
        c.id === parentId
          ? { ...c, subcategories: (c.subcategories || []).filter((sc) => sc.id !== subId) }
          : c
      );
    if (type === "needs") {
      setFlexibleNeeds(updater);
    } else {
      setFlexibleWants(updater);
    }
  };

  const toggleExpanded = (id: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const cancelAddSubcategory = () => {
    setAddingSubTo(null);
    setNewSubcategoryName("");
  };

  const generatePlan = async () => {
    const month = data.dateRange.end.slice(0, 7);
    const parts = month.split("-");
    const nextMonth = `${parseInt(parts[1]) === 12 ? parseInt(parts[0]) + 1 : parts[0]}-${String(parseInt(parts[1]) === 12 ? 1 : parseInt(parts[1]) + 1).padStart(2, "0")}`;

    const monthNames = [
      "january", "february", "march", "april", "may", "june",
      "july", "august", "september", "october", "november", "december",
    ];
    const endMonthIdx = parseInt(parts[1]) - 1;
    const nextMonthIdx = endMonthIdx === 11 ? 0 : endMonthIdx + 1;
    const year = endMonthIdx === 11 ? parseInt(parts[0]) + 1 : parseInt(parts[0]);
    const planFilename = `budget-plan-${year}-${monthNames[endMonthIdx]}-${monthNames[nextMonthIdx]}.json`;

    const plan: BudgetPlan = {
      version: 2,
      month: nextMonth,
      createdAt: new Date().toISOString(),
      totalIncome,
      incomeSources: nextMonthIncome.sources.map((s) => ({
        name: s.name,
        amount: s.amount,
        isFixed: s.isFixed,
      })),
      accountLeftovers: nextMonthIncome.accountLeftovers,
      scheduledTransfers,
      scheduledTotal: scheduledTransfers.reduce((s, t) => s + t.amount, 0),
      savings: {
        totalAmount: savingsAmount,
        percentage: Math.round(savesPct * 100) / 100,
        allocations: savingsAllocations,
        unallocated: unallocatedSavings,
      },
      flexibleBudget: {
        total: totalIncome - savingsAmount,
        needs: {
          total: needsTotal,
          categories: flexibleNeeds.filter((c) => getCategoryTotal(c) > 0),
        },
        wants: {
          total: wantsTotal,
          categories: flexibleWants.filter((c) => getCategoryTotal(c) > 0),
        },
      },
      allocations: {
        needs: { percentage: needsPctOfIncome, amount: needsTotal },
        wants: { percentage: wantsPctOfIncome, amount: wantsTotal },
        saves: { percentage: Math.round(savesPct * 100) / 100, amount: savingsAmount },
      },
      disposableIncome: totalIncome - savingsAmount,
      categoryBreakdown: {
        needs: flexibleNeeds
          .filter((c) => getCategoryTotal(c) > 0)
          .map((c) => ({
            category: c.name,
            percentage: Math.round((getCategoryTotal(c) / (needsTotal || 1)) * 100),
            amount: getCategoryTotal(c),
          })),
        wants: flexibleWants
          .filter((c) => getCategoryTotal(c) > 0)
          .map((c) => ({
            category: c.name,
            percentage: Math.round((getCategoryTotal(c) / (wantsTotal || 1)) * 100),
            amount: getCategoryTotal(c),
          })),
      },
    };

    setSaving(true);
    try {
      await fetch("/api/archives/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: JSON.stringify(plan, null, 2),
          filename: planFilename,
          type: "budget",
        }),
      });

      const blob = new Blob([JSON.stringify(plan, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = planFilename;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setSaving(false);
    }

    setExported(true);
  };

  // ── Editable Amount ──
  const EditableAmount = ({
    field,
    amount,
    color,
    small,
    min: minVal = 0,
  }: {
    field: string;
    amount: number;
    color: string;
    small?: boolean;
    min?: number;
  }) => {
    if (editingField === field) {
      return (
        <input
          type="number"
          step="0.01"
          min={minVal}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitEdit();
            if (e.key === "Escape") setEditingField(null);
          }}
          autoFocus
          className={`font-bold bg-transparent border-b-2 outline-none ${small ? "text-sm w-20" : "text-2xl w-32"}`}
          style={{ borderColor: color, color: "var(--text-primary)" }}
        />
      );
    }
    return (
      <p
        className={`font-bold cursor-pointer hover:opacity-70 transition-opacity ${small ? "text-sm" : "text-2xl"}`}
        style={{ color: "var(--text-primary)" }}
        onClick={() => startEditing(field, amount)}
        title="Click to edit"
      >
        €{amount.toFixed(2)}
      </p>
    );
  };

  return (
    <div className="w-full space-y-4 sm:space-y-5 overflow-y-auto max-h-[calc(100vh-100px)] sm:max-h-[calc(100vh-120px)] pr-1 sm:pr-2">
      {/* Header */}
      <div className="text-center space-y-1">
        <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
          {t("planner.title")}
        </h2>
        <p className="text-[var(--text-muted)] text-sm">
          {t("planner.subtitle", { income: totalIncome.toFixed(2) })}
        </p>
      </div>

      {/* Budget Health Bar */}
      <div className={`rounded-xl p-3 border ${overBudget ? "border-[var(--expense)] bg-[var(--expense)]/10" : allMoneyAssigned ? "border-[var(--income)] bg-[var(--income)]/10" : "border-[var(--border)] bg-[var(--bg-secondary)]"}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {overBudget ? (
              <AlertTriangle size={16} className="text-[var(--expense)]" />
            ) : allMoneyAssigned ? (
              <Check size={16} className="text-[var(--income)]" />
            ) : (
              <Wallet size={16} className="text-[var(--text-muted)]" />
            )}
            <span className={`text-sm font-medium ${overBudget ? "text-[var(--expense)]" : allMoneyAssigned ? "text-[var(--income)]" : "text-[var(--text-secondary)]"}`}>
              {overBudget
                ? t("planner.overBudget", { amount: (totalAllocated - totalIncome).toFixed(2) })
                : allMoneyAssigned
                  ? t("planner.allAssigned")
                  : t("planner.unassigned", { amount: (totalIncome - totalAllocated).toFixed(2) })}
            </span>
          </div>
          <span className="text-xs text-[var(--text-muted)]">
            {savesPct.toFixed(2)}% saves · {needsPctOfIncome.toFixed(2)}% needs · {wantsPctOfIncome.toFixed(2)}% wants
          </span>
        </div>
        <div className="h-3 rounded-full bg-[var(--bg-tertiary)] overflow-hidden flex">
          <div
            className="h-full transition-all duration-300"
            style={{
              width: `${Math.min(100, (needsTotal / totalIncome) * 100)}%`,
              backgroundColor: "var(--needs)",
            }}
          />
          <div
            className="h-full transition-all duration-300"
            style={{
              width: `${Math.min(100, (wantsTotal / totalIncome) * 100)}%`,
              backgroundColor: "var(--wants)",
            }}
          />
          <div
            className="h-full transition-all duration-300"
            style={{
              width: `${Math.min(100, (savingsAmount / totalIncome) * 100)}%`,
              backgroundColor: "var(--saves-color)",
            }}
          />
        </div>
      </div>

      {/* Money Flow Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        <div className="rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] p-3 text-center">
          <p className="text-xs text-[var(--text-muted)]">{t("common.income")}</p>
          <p className="text-lg font-bold text-[var(--income)]">€{totalIncome.toFixed(2)}</p>
        </div>
        <div className="rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] p-3 text-center">
          <p className="text-xs text-[var(--text-muted)]">{t("common.needs")}</p>
          <p className="text-lg font-bold text-[var(--needs)]">€{needsTotal.toFixed(2)}</p>
        </div>
        <div className="rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] p-3 text-center">
          <p className="text-xs text-[var(--text-muted)]">{t("common.savings")}</p>
          <p className="text-lg font-bold text-[var(--saves-color)]">€{savingsAmount.toFixed(2)}</p>
        </div>
        <div className="rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] p-3 text-center">
          <p className="text-xs text-[var(--text-muted)]">{t("common.wants")}</p>
          <p className="text-lg font-bold text-[var(--wants)]">€{wantsTotal.toFixed(2)}</p>
        </div>
      </div>

      {/* Savings Section with Goals */}
      <div className="rounded-2xl border border-[var(--saves-color)] bg-[var(--bg-secondary)] p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <PiggyBank size={18} className="text-[var(--saves-color)]" />
            <h3 className="font-medium text-[var(--saves-color)]">{t("common.savings")} — {savesPct.toFixed(2)}%</h3>
          </div>
          <EditableAmount field="saves" amount={savingsAmount} color="var(--saves-color)" />
        </div>
        <input
          type="range"
          min={0}
          max={50}
          step={0.01}
          value={savesPct}
          onChange={(e) => setSavesPct(parseFloat(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, var(--saves-color) 0%, var(--saves-color) ${(savesPct / 50) * 100}%, var(--bg-tertiary) ${(savesPct / 50) * 100}%, var(--bg-tertiary) 100%)`,
          }}
        />

        {/* Goals allocation */}
        {goals.length > 0 && (
          <div className="mt-3 pt-3 border-t border-[var(--border)]">
            <div className="flex items-center gap-2 mb-2">
              <Target size={14} className="text-[var(--saves-color)]" />
              <span className="text-xs font-medium text-[var(--text-muted)]">{t("planner.allocateToGoals")}</span>
              {unallocatedSavings > 0 && (
                <span className="ml-auto text-xs text-[var(--text-muted)]">
                  {t("planner.unallocated", { amount: unallocatedSavings.toFixed(2) })}
                </span>
              )}
            </div>
            <div className="space-y-1.5">
              {goals.map((goal) => {
                const allocation = savingsAllocations.find((a) => a.goalId === goal.id);
                return (
                  <div key={goal.id} className="flex items-center justify-between py-1">
                    <span className="text-sm text-[var(--text-primary)]">{goal.name}</span>
                    <EditableAmount
                      field={`goal-${goal.id}`}
                      amount={allocation?.amount ?? 0}
                      color="var(--saves-color)"
                      small
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Budget: Needs & Wants with categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Needs */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Lock size={16} className="text-[var(--needs)]" />
              <h3 className="font-medium text-[var(--needs)]">{t("common.needs")}</h3>
            </div>
            <span className="text-sm font-bold text-[var(--text-primary)]">
              €{needsTotal.toFixed(2)}
            </span>
          </div>
          <div className="space-y-1">
            {flexibleNeeds.map((cat) => {
              const isExpanded = expandedCategories.has(cat.id);
              const hasSubs = (cat.subcategories || []).length > 0;
              return (
                <div key={cat.id} className="border-b border-[var(--border)]/50 last:border-0 pb-1">
                  <div className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-1.5 group">
                      <button
                        onClick={() => toggleExpanded(cat.id)}
                        className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                      >
                        {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                      </button>
                      <span className="text-sm font-medium text-[var(--text-primary)]">{cat.name}</span>
                      {hasSubs && (
                        <span className="text-[10px] text-[var(--text-muted)]">
                          ({(cat.subcategories || []).length})
                        </span>
                      )}
                      <button
                        onClick={() => removeCategory("needs", cat.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={11} className="text-[var(--text-muted)]" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <EditableAmount
                        field={`flex-needs-${cat.id}`}
                        amount={cat.budgeted}
                        color="var(--needs)"
                        small
                        min={getCommittedMin(cat)}
                      />
                    </div>
                  </div>
                  {/* Category detail items */}
                  {isExpanded && (
                    <div className="ml-5 space-y-0.5 mb-1">
                      {(cat.subcategories || []).map((sub) => (
                        <div key={sub.id} className="flex items-center justify-between py-0.5">
                          <div className="flex items-center gap-1.5 group">
                            <span className={`text-xs ${sub.isCommitted ? "text-[var(--text-muted)]" : "text-[var(--text-secondary)]"}`}>
                              {sub.isCommitted ? "⚡" : "↳"} {sub.name}
                            </span>
                            {!sub.isCommitted && (
                              <button
                                onClick={() => removeSubcategory("needs", cat.id, sub.id)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Trash2 size={10} className="text-[var(--text-muted)]" />
                              </button>
                            )}
                          </div>
                          {sub.isCommitted ? (
                            <span className="text-xs font-medium text-[var(--text-muted)]">€{sub.budgeted.toFixed(2)}</span>
                          ) : (
                            <EditableAmount
                              field={`sub-needs-${sub.id}`}
                              amount={sub.budgeted}
                              color="var(--needs)"
                              small
                            />
                          )}
                        </div>
                      ))}
                      {/* Add subcategory */}
                      {addingSubTo === cat.id ? (
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-xs text-[var(--text-muted)]">↳</span>
                          <input
                            type="text"
                            value={newSubcategoryName}
                            onChange={(e) => setNewSubcategoryName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") addSubcategory("needs", cat.id);
                              if (e.key === "Escape") cancelAddSubcategory();
                            }}
                            placeholder={t("planner.subcategoryPlaceholder")}
                            autoFocus
                            className="text-xs bg-transparent border-b border-[var(--needs)]/50 outline-none flex-1 text-[var(--text-primary)]"
                          />
                          <button onClick={() => addSubcategory("needs", cat.id)} className="text-[var(--needs)]">
                            <Check size={12} />
                          </button>
                          <button onClick={cancelAddSubcategory} className="text-[var(--text-muted)] hover:text-[var(--expense)]">
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setAddingSubTo(cat.id); setNewSubcategoryName(""); }}
                          className="flex items-center gap-1 text-[10px] text-[var(--text-muted)] hover:text-[var(--needs)] transition-colors mt-0.5"
                        >
                          <Plus size={10} /> {t("planner.subcategory")}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {addingTo === "needs" ? (
            <div className="mt-2 flex items-center gap-2">
              <select
                value={newCategoryName}
                onChange={(e) => {
                  setNewCategoryName(e.target.value);
                  if (e.target.value) {
                    // Auto-commit on selection
                    const id = `custom-${Date.now()}`;
                    const cat: BudgetPlanCategory = {
                      id,
                      name: e.target.value,
                      budgeted: 0,
                      isFixed: false,
                      subcategories: [],
                    };
                    setFlexibleNeeds((prev) => [...prev, cat]);
                    setNewCategoryName("");
                    setAddingTo(null);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Escape") { setAddingTo(null); setNewCategoryName(""); }
                }}
                autoFocus
                className="text-sm bg-[var(--bg-primary)] border border-[var(--needs)]/50 rounded-lg px-2 py-1 outline-none flex-1 text-[var(--text-primary)]"
              >
                <option value="">{t("planner.selectCategory")}</option>
                {availableCategories.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
              <button onClick={() => { setAddingTo(null); setNewCategoryName(""); }} className="text-[var(--text-muted)] hover:text-[var(--expense)]">
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setAddingTo("needs")}
              className="mt-2 flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--needs)] transition-colors"
            >
              <Plus size={12} /> {t("planner.addCategory")}
            </button>
          )}
        </div>

        {/* Wants */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Unlock size={16} className="text-[var(--wants)]" />
              <h3 className="font-medium text-[var(--wants)]">{t("common.wants")}</h3>
            </div>
            <span className="text-sm font-bold text-[var(--text-primary)]">
              €{wantsTotal.toFixed(2)}
            </span>
          </div>
          <div className="space-y-1">
            {flexibleWants.map((cat) => {
              const isExpanded = expandedCategories.has(cat.id);
              const hasSubs = (cat.subcategories || []).length > 0;
              return (
                <div key={cat.id} className="border-b border-[var(--border)]/50 last:border-0 pb-1">
                  <div className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-1.5 group">
                      <button
                        onClick={() => toggleExpanded(cat.id)}
                        className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                      >
                        {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                      </button>
                      <span className="text-sm font-medium text-[var(--text-primary)]">{cat.name}</span>
                      {hasSubs && (
                        <span className="text-[10px] text-[var(--text-muted)]">
                          ({(cat.subcategories || []).length})
                        </span>
                      )}
                      <button
                        onClick={() => removeCategory("wants", cat.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={11} className="text-[var(--text-muted)]" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <EditableAmount
                        field={`flex-wants-${cat.id}`}
                        amount={cat.budgeted}
                        color="var(--wants)"
                        small
                        min={getCommittedMin(cat)}
                      />
                    </div>
                  </div>
                  {/* Category detail items */}
                  {isExpanded && (
                    <div className="ml-5 space-y-0.5 mb-1">
                      {(cat.subcategories || []).map((sub) => (
                        <div key={sub.id} className="flex items-center justify-between py-0.5">
                          <div className="flex items-center gap-1.5 group">
                            <span className={`text-xs ${sub.isCommitted ? "text-[var(--text-muted)]" : "text-[var(--text-secondary)]"}`}>
                              {sub.isCommitted ? "⚡" : "↳"} {sub.name}
                            </span>
                            {!sub.isCommitted && (
                              <button
                                onClick={() => removeSubcategory("wants", cat.id, sub.id)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Trash2 size={10} className="text-[var(--text-muted)]" />
                              </button>
                            )}
                          </div>
                          {sub.isCommitted ? (
                            <span className="text-xs font-medium text-[var(--text-muted)]">€{sub.budgeted.toFixed(2)}</span>
                          ) : (
                            <EditableAmount
                              field={`sub-wants-${sub.id}`}
                              amount={sub.budgeted}
                              color="var(--wants)"
                              small
                            />
                          )}
                        </div>
                      ))}
                      {/* Add subcategory */}
                      {addingSubTo === cat.id ? (
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-xs text-[var(--text-muted)]">↳</span>
                          <input
                            type="text"
                            value={newSubcategoryName}
                            onChange={(e) => setNewSubcategoryName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") addSubcategory("wants", cat.id);
                              if (e.key === "Escape") cancelAddSubcategory();
                            }}
                            placeholder={t("planner.subcategoryPlaceholder")}
                            autoFocus
                            className="text-xs bg-transparent border-b border-[var(--wants)]/50 outline-none flex-1 text-[var(--text-primary)]"
                          />
                          <button onClick={() => addSubcategory("wants", cat.id)} className="text-[var(--wants)]">
                            <Check size={12} />
                          </button>
                          <button onClick={cancelAddSubcategory} className="text-[var(--text-muted)] hover:text-[var(--expense)]">
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setAddingSubTo(cat.id); setNewSubcategoryName(""); }}
                          className="flex items-center gap-1 text-[10px] text-[var(--text-muted)] hover:text-[var(--wants)] transition-colors mt-0.5"
                        >
                          <Plus size={10} /> {t("planner.subcategory")}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {addingTo === "wants" ? (
            <div className="mt-2 flex items-center gap-2">
              <select
                value={newCategoryName}
                onChange={(e) => {
                  setNewCategoryName(e.target.value);
                  if (e.target.value) {
                    const id = `custom-${Date.now()}`;
                    const cat: BudgetPlanCategory = {
                      id,
                      name: e.target.value,
                      budgeted: 0,
                      isFixed: false,
                      subcategories: [],
                    };
                    setFlexibleWants((prev) => [...prev, cat]);
                    setNewCategoryName("");
                    setAddingTo(null);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Escape") { setAddingTo(null); setNewCategoryName(""); }
                }}
                autoFocus
                className="text-sm bg-[var(--bg-primary)] border border-[var(--wants)]/50 rounded-lg px-2 py-1 outline-none flex-1 text-[var(--text-primary)]"
              >
                <option value="">{t("planner.selectCategory")}</option>
                {availableCategories.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
              <button onClick={() => { setAddingTo(null); setNewCategoryName(""); }} className="text-[var(--text-muted)] hover:text-[var(--expense)]">
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setAddingTo("wants")}
              className="mt-2 flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--wants)] transition-colors"
            >
              <Plus size={12} /> {t("planner.addCategory")}
            </button>
          )}
        </div>
      </div>

      {/* Export button */}
      <motion.button
        whileHover={{ scale: 1 }}
        whileTap={{ scale: 0.98 }}
        onClick={generatePlan}
        disabled={overBudget}
        className={`w-full py-4 px-6 rounded-xl font-medium text-lg
                   flex items-center justify-center gap-3 transition-colors duration-200
                   ${
                     exported
                       ? "bg-[var(--income)] text-white"
                       : overBudget
                         ? "bg-[var(--bg-tertiary)] text-[var(--text-muted)] cursor-not-allowed"
                         : "bg-[var(--accent-primary)] hover:bg-[var(--accent-secondary)] text-white"
                   }`}
      >
        {exported ? (
          <>
            <Check size={20} />
            {t("planner.planSaved")}
          </>
        ) : saving ? (
          <>
            <Download size={20} />
            {t("planner.savingPlan")}
          </>
        ) : overBudget ? (
          <>
            <AlertTriangle size={20} />
            {t("planner.fixOverBudget")}
          </>
        ) : (
          <>
            <Download size={20} />
            {t("planner.saveBudgetPlan")}
          </>
        )}
      </motion.button>
    </div>
  );
}
