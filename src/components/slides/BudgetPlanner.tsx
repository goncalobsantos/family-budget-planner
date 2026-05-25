"use client";

import { useState } from "react";
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
  TrendingUp,
  Wallet,
  X,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useBudget } from "@/context/BudgetContext";
import type { BudgetPlan, BudgetPlanCategory, BudgetPlanSubcategory, SavingsAllocation } from "@/types/budget";

export default function BudgetPlanner() {
  const { data } = useBudget();

  // Savings percentage
  const [savesPct, setSavesPct] = useState(20);

  // Which scheduled Wants items have been moved to Needs
  const [movedToNeeds, setMovedToNeeds] = useState<Set<string>>(new Set());

  // Custom flexible spending categories
  const [flexibleNeeds, setFlexibleNeeds] = useState<BudgetPlanCategory[]>([]);
  const [flexibleWants, setFlexibleWants] = useState<BudgetPlanCategory[]>([]);

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

  // ── Income calculations ──
  const incomeFromSources = nextMonthIncome.sources.reduce((s, src) => s + src.amount, 0);
  const totalLeftovers =
    nextMonthIncome.accountLeftovers.Main +
    nextMonthIncome.accountLeftovers.Coverflex;
  const totalIncome = incomeFromSources + totalLeftovers;
  const savingsBase = nextMonthIncome.sources
    .filter((src) => src.countsForSavings)
    .reduce((s, src) => s + src.amount, 0) + totalLeftovers;

  // ── Scheduled transfers split ──
  const scheduledNeeds = scheduledTransfers.filter(
    (t) => t.nws === "Needs" || movedToNeeds.has(t.id)
  );
  const scheduledWants = scheduledTransfers.filter(
    (t) => t.nws === "Wants" && !movedToNeeds.has(t.id)
  );
  const scheduledNeedsTotal = scheduledNeeds.reduce((s, t) => s + t.amount, 0);
  const scheduledWantsTotal = scheduledWants.reduce((s, t) => s + t.amount, 0);
  const scheduledTotal = scheduledNeedsTotal + scheduledWantsTotal;

  // ── Savings ──
  const savingsAmount = (savingsBase * savesPct) / 100;
  const allocatedToGoals = savingsAllocations.reduce((s, a) => s + a.amount, 0);
  const unallocatedSavings = Math.max(0, savingsAmount - allocatedToGoals);

  // ── Flexible budget ──
  const flexibleTotal = Math.max(0, totalIncome - scheduledTotal - savingsAmount);
  // Category total = its own budgeted + sum of subcategories
  const getCategoryTotal = (cat: BudgetPlanCategory): number => {
    const subTotal = (cat.subcategories || []).reduce((s, sc) => s + sc.budgeted, 0);
    return cat.budgeted + subTotal;
  };
  const flexibleNeedsTotal = flexibleNeeds.reduce((s, c) => s + getCategoryTotal(c), 0);
  const flexibleWantsTotal = flexibleWants.reduce((s, c) => s + getCategoryTotal(c), 0);
  const flexibleAllocated = flexibleNeedsTotal + flexibleWantsTotal;
  const flexibleUnallocated = Math.max(0, flexibleTotal - flexibleAllocated);

  // ── Grand totals ──
  const totalNeeds = scheduledNeedsTotal + flexibleNeedsTotal;
  const totalWants = scheduledWantsTotal + flexibleWantsTotal;
  const needsPctOfIncome = totalIncome > 0 ? Math.round((totalNeeds / totalIncome) * 10000) / 100 : 0;
  const wantsPctOfIncome = totalIncome > 0 ? Math.round((totalWants / totalIncome) * 10000) / 100 : 0;

  // ── Budget health indicator ──
  const totalAllocated = totalNeeds + totalWants + savingsAmount;
  const overBudget = totalAllocated > totalIncome + 0.01;
  const allMoneyAssigned = Math.abs(totalIncome - totalAllocated) < 0.01;

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
      const maxSaves = totalIncome - scheduledTotal;
      const clamped = Math.min(val, maxSaves);
      const newPct = totalIncome > 0 ? (clamped / totalIncome) * 100 : 0;
      setSavesPct(Math.round(newPct * 100) / 100);
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
        prev.map((c) => (c.id === id ? { ...c, budgeted: val } : c))
      );
    } else if (editingField.startsWith("flex-wants-")) {
      const id = editingField.replace("flex-wants-", "");
      setFlexibleWants((prev) =>
        prev.map((c) => (c.id === id ? { ...c, budgeted: val } : c))
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

  const toggleMoveToNeeds = (id: string) => {
    setMovedToNeeds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
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
      scheduledTotal,
      savings: {
        totalAmount: savingsAmount,
        percentage: Math.round(savesPct * 100) / 100,
        allocations: savingsAllocations,
        unallocated: unallocatedSavings,
      },
      flexibleBudget: {
        total: flexibleTotal,
        needs: {
          total: flexibleNeedsTotal,
          categories: flexibleNeeds.filter((c) => getCategoryTotal(c) > 0),
        },
        wants: {
          total: flexibleWantsTotal,
          categories: flexibleWants.filter((c) => getCategoryTotal(c) > 0),
        },
      },
      allocations: {
        needs: { percentage: needsPctOfIncome, amount: totalNeeds },
        wants: { percentage: wantsPctOfIncome, amount: totalWants },
        saves: { percentage: Math.round(savesPct * 100) / 100, amount: savingsAmount },
      },
      disposableIncome: flexibleTotal,
      categoryBreakdown: {
        needs: [
          ...scheduledNeeds.map((t) => ({
            category: t.name,
            percentage: Math.round((t.amount / (totalNeeds || 1)) * 100),
            amount: t.amount,
          })),
          ...flexibleNeeds
            .filter((c) => getCategoryTotal(c) > 0)
            .map((c) => ({
              category: c.name,
              percentage: Math.round((getCategoryTotal(c) / (totalNeeds || 1)) * 100),
              amount: getCategoryTotal(c),
            })),
        ],
        wants: [
          ...scheduledWants.map((t) => ({
            category: t.name,
            percentage: Math.round((t.amount / (totalWants || 1)) * 100),
            amount: t.amount,
          })),
          ...flexibleWants
            .filter((c) => getCategoryTotal(c) > 0)
            .map((c) => ({
              category: c.name,
              percentage: Math.round((getCategoryTotal(c) / (totalWants || 1)) * 100),
              amount: getCategoryTotal(c),
            })),
        ],
      },
    };

    setSaving(true);
    try {
      await fetch("/api/archives/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: JSON.stringify(plan, null, 2),
          filename: `budget-plan-${nextMonth}.json`,
          type: "budget",
        }),
      });

      const blob = new Blob([JSON.stringify(plan, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `budget-plan-${nextMonth}.json`;
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
  }: {
    field: string;
    amount: number;
    color: string;
    small?: boolean;
  }) => {
    if (editingField === field) {
      return (
        <input
          type="number"
          step="0.01"
          min="0"
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
    <div className="w-full space-y-5 overflow-y-auto max-h-[calc(100vh-120px)] pr-2">
      {/* Header */}
      <div className="text-center space-y-1">
        <h2 className="text-3xl font-bold text-[var(--text-primary)]">
          Budget Planning
        </h2>
        <p className="text-[var(--text-muted)] text-sm">
          Plan every euro — Income: €{totalIncome.toFixed(2)}
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
                ? `Over budget by €${(totalAllocated - totalIncome).toFixed(2)}`
                : allMoneyAssigned
                  ? "Every euro has a job!"
                  : `€${(totalIncome - totalAllocated).toFixed(2)} unassigned`}
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
              width: `${Math.min(100, (totalNeeds / totalIncome) * 100)}%`,
              backgroundColor: "var(--needs)",
            }}
          />
          <div
            className="h-full transition-all duration-300"
            style={{
              width: `${Math.min(100, (totalWants / totalIncome) * 100)}%`,
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
      <div className="grid grid-cols-4 gap-3">
        <div className="rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] p-3 text-center">
          <p className="text-xs text-[var(--text-muted)]">Income</p>
          <p className="text-lg font-bold text-[var(--income)]">€{totalIncome.toFixed(0)}</p>
        </div>
        <div className="rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] p-3 text-center">
          <p className="text-xs text-[var(--text-muted)]">Committed</p>
          <p className="text-lg font-bold text-[var(--expense)]">€{scheduledTotal.toFixed(0)}</p>
        </div>
        <div className="rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] p-3 text-center">
          <p className="text-xs text-[var(--text-muted)]">Savings</p>
          <p className="text-lg font-bold text-[var(--saves-color)]">€{savingsAmount.toFixed(0)}</p>
        </div>
        <div className="rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] p-3 text-center">
          <p className="text-xs text-[var(--text-muted)]">Flexible</p>
          <p className="text-lg font-bold text-[var(--accent-primary)]">€{flexibleTotal.toFixed(0)}</p>
        </div>
      </div>

      {/* Savings Section with Goals */}
      <div className="rounded-2xl border border-[var(--saves-color)] bg-[var(--bg-secondary)] p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <PiggyBank size={18} className="text-[var(--saves-color)]" />
            <h3 className="font-medium text-[var(--saves-color)]">Savings — {Math.round(savesPct)}%</h3>
          </div>
          <EditableAmount field="saves" amount={savingsAmount} color="var(--saves-color)" />
        </div>
        <input
          type="range"
          min={0}
          max={50}
          step={1}
          value={savesPct}
          onChange={(e) => setSavesPct(parseInt(e.target.value))}
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
              <span className="text-xs font-medium text-[var(--text-muted)]">Allocate to goals</span>
              {unallocatedSavings > 0 && (
                <span className="ml-auto text-xs text-[var(--text-muted)]">
                  €{unallocatedSavings.toFixed(2)} unallocated
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

      {/* Flexible Budget: Needs & Wants with custom categories + subcategories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Flexible Needs */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Lock size={16} className="text-[var(--needs)]" />
              <h3 className="font-medium text-[var(--needs)]">Flexible Needs</h3>
            </div>
            <span className="text-sm font-bold text-[var(--text-primary)]">
              €{flexibleNeedsTotal.toFixed(2)}
            </span>
          </div>
          <div className="space-y-1">
            {flexibleNeeds.map((cat) => {
              const isExpanded = expandedCategories.has(cat.id);
              const hasSubs = (cat.subcategories || []).length > 0;
              const catTotal = getCategoryTotal(cat);
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
                      {hasSubs && catTotal > cat.budgeted && (
                        <span className="text-[10px] text-[var(--text-muted)]">
                          Σ€{catTotal.toFixed(0)}
                        </span>
                      )}
                      <EditableAmount
                        field={`flex-needs-${cat.id}`}
                        amount={cat.budgeted}
                        color="var(--needs)"
                        small
                      />
                    </div>
                  </div>
                  {/* Subcategories */}
                  {isExpanded && (
                    <div className="ml-5 space-y-0.5 mb-1">
                      {(cat.subcategories || []).map((sub) => (
                        <div key={sub.id} className="flex items-center justify-between py-0.5">
                          <div className="flex items-center gap-1.5 group">
                            <span className="text-xs text-[var(--text-secondary)]">↳ {sub.name}</span>
                            <button
                              onClick={() => removeSubcategory("needs", cat.id, sub.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 size={10} className="text-[var(--text-muted)]" />
                            </button>
                          </div>
                          <EditableAmount
                            field={`sub-needs-${sub.id}`}
                            amount={sub.budgeted}
                            color="var(--needs)"
                            small
                          />
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
                            placeholder="Subcategory..."
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
                          <Plus size={10} /> subcategory
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
                <option value="">Select a category...</option>
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
              <Plus size={12} /> Add category
            </button>
          )}
        </div>

        {/* Flexible Wants */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Unlock size={16} className="text-[var(--wants)]" />
              <h3 className="font-medium text-[var(--wants)]">Flexible Wants</h3>
            </div>
            <span className="text-sm font-bold text-[var(--text-primary)]">
              €{flexibleWantsTotal.toFixed(2)}
            </span>
          </div>
          <div className="space-y-1">
            {flexibleWants.map((cat) => {
              const isExpanded = expandedCategories.has(cat.id);
              const hasSubs = (cat.subcategories || []).length > 0;
              const catTotal = getCategoryTotal(cat);
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
                      {hasSubs && catTotal > cat.budgeted && (
                        <span className="text-[10px] text-[var(--text-muted)]">
                          Σ€{catTotal.toFixed(0)}
                        </span>
                      )}
                      <EditableAmount
                        field={`flex-wants-${cat.id}`}
                        amount={cat.budgeted}
                        color="var(--wants)"
                        small
                      />
                    </div>
                  </div>
                  {/* Subcategories */}
                  {isExpanded && (
                    <div className="ml-5 space-y-0.5 mb-1">
                      {(cat.subcategories || []).map((sub) => (
                        <div key={sub.id} className="flex items-center justify-between py-0.5">
                          <div className="flex items-center gap-1.5 group">
                            <span className="text-xs text-[var(--text-secondary)]">↳ {sub.name}</span>
                            <button
                              onClick={() => removeSubcategory("wants", cat.id, sub.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 size={10} className="text-[var(--text-muted)]" />
                            </button>
                          </div>
                          <EditableAmount
                            field={`sub-wants-${sub.id}`}
                            amount={sub.budgeted}
                            color="var(--wants)"
                            small
                          />
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
                            placeholder="Subcategory..."
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
                          <Plus size={10} /> subcategory
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
                <option value="">Select a category...</option>
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
              <Plus size={12} /> Add category
            </button>
          )}
        </div>
      </div>

      {/* Unallocated flexible money info */}
      {flexibleUnallocated > 0.01 && (
        <div className="rounded-xl p-3 border border-[var(--accent-primary)]/50 bg-[var(--accent-primary)]/10 flex items-center gap-3">
          <TrendingUp size={16} className="text-[var(--accent-primary)]" />
          <span className="text-sm text-[var(--text-secondary)]">
            €{flexibleUnallocated.toFixed(2)} of flexible budget not yet assigned to categories.
            Assign it or it stays as a buffer.
          </span>
        </div>
      )}

      {/* Scheduled Payments Breakdown (collapsible) */}
      <details className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] overflow-hidden">
        <summary className="p-4 cursor-pointer flex items-center justify-between hover:bg-[var(--bg-tertiary)] transition-colors">
          <div className="flex items-center gap-2">
            <Lock size={16} className="text-[var(--text-muted)]" />
            <span className="font-medium text-[var(--text-primary)]">Committed Payments</span>
          </div>
          <span className="text-sm font-bold text-[var(--expense)]">
            €{scheduledTotal.toFixed(2)}
          </span>
        </summary>
        <div className="px-4 pb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Scheduled Needs */}
          <div>
            <h4 className="text-xs font-medium text-[var(--needs)] mb-2 uppercase tracking-wide">
              Needs — €{scheduledNeedsTotal.toFixed(2)}
            </h4>
            <div className="space-y-1.5 max-h-[200px] overflow-y-auto pr-1">
              {scheduledNeeds.map((t) => {
                const isMovedFromWants = t.nws === "Wants" && movedToNeeds.has(t.id);
                return (
                  <div key={t.id} className="flex items-center justify-between py-1 text-sm">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[var(--text-primary)]">{t.name}</span>
                      {isMovedFromWants && (
                        <button
                          onClick={() => toggleMoveToNeeds(t.id)}
                          className="text-[9px] px-1 py-0.5 rounded bg-[var(--wants)]/20 text-[var(--wants)]"
                        >
                          undo
                        </button>
                      )}
                    </div>
                    <span className="font-medium text-[var(--text-primary)]">€{t.amount.toFixed(2)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Scheduled Wants */}
          <div>
            <h4 className="text-xs font-medium text-[var(--wants)] mb-2 uppercase tracking-wide">
              Wants — €{scheduledWantsTotal.toFixed(2)}
            </h4>
            <div className="space-y-1.5 max-h-[200px] overflow-y-auto pr-1">
              {scheduledWants.map((t) => (
                <div key={t.id} className="flex items-center justify-between py-1 text-sm">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[var(--text-primary)]">{t.name}</span>
                    <button
                      onClick={() => toggleMoveToNeeds(t.id)}
                      className="text-[9px] px-1 py-0.5 rounded bg-[var(--needs)]/20 text-[var(--needs)] hover:bg-[var(--needs)]/30"
                    >
                      → Needs
                    </button>
                  </div>
                  <span className="font-medium text-[var(--text-primary)]">€{t.amount.toFixed(2)}</span>
                </div>
              ))}
              {scheduledWants.length === 0 && (
                <p className="text-xs text-[var(--text-muted)] italic">All moved to Needs</p>
              )}
            </div>
          </div>
        </div>
      </details>

      {/* Export button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
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
            Plan Saved & Exported!
          </>
        ) : saving ? (
          <>
            <Download size={20} />
            Saving…
          </>
        ) : overBudget ? (
          <>
            <AlertTriangle size={20} />
            Fix over-budget before saving
          </>
        ) : (
          <>
            <Download size={20} />
            Save Budget Plan
          </>
        )}
      </motion.button>
    </div>
  );
}
