"use client";

import { motion } from "framer-motion";
import { ArrowLeft, PiggyBank, ShieldCheck, Sparkles, Target } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import type { BudgetPlan } from "@/types/budget";

interface BudgetPlanViewerProps {
  plan: BudgetPlan;
  name: string;
  onBack: () => void;
}

export default function BudgetPlanViewer({
  plan,
  name,
  onBack,
}: BudgetPlanViewerProps) {
  const { t, dateLocale } = useLanguage();

  const formatMonth = (month: string) => {
    const match = month.match(/(\d{4})-(\d{2})/);
    if (match) {
      const date = new Date(parseInt(match[1]), parseInt(match[2]) - 1);
      return date.toLocaleDateString(dateLocale, {
        month: "long",
        year: "numeric",
      });
    }
    return month;
  };

  return (
    <div className="min-h-screen flex items-start justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-3xl space-y-6"
      >
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)]
                       text-[var(--text-muted)] hover:text-[var(--text-primary)]
                       transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">
              {t("budgetViewer.title", { month: formatMonth(plan.month || name) })}
            </h1>
            {plan.createdAt && (
              <p className="text-sm text-[var(--text-muted)]">
                {t("budgetViewer.created", {
                  date: new Date(plan.createdAt).toLocaleDateString(dateLocale, {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  }),
                })}
              </p>
            )}
          </div>
        </div>

        {/* Overview */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
            {t("budgetViewer.overview")}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider">
                {t("budgetViewer.totalIncome")}
              </p>
              <p className="text-xl font-bold text-[var(--income)]">
                €{plan.totalIncome?.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider">
                {t("budgetViewer.scheduled")}
              </p>
              <p className="text-xl font-bold text-[var(--expense)]">
                €{plan.scheduledTotal?.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider">
                {t("budgetViewer.disposable")}
              </p>
              <p className="text-xl font-bold text-[var(--text-primary)]">
                €{plan.disposableIncome?.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider">
                {t("common.savings")}
              </p>
              <p className="text-xl font-bold text-[var(--savings)]">
                €{plan.allocations?.saves?.amount?.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Allocations */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-[var(--needs)]/30 bg-[var(--bg-secondary)] p-5">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck size={18} className="text-[var(--needs)]" />
              <h3 className="font-medium text-[var(--needs)]">{t("common.needs")}</h3>
              <span className="ml-auto text-sm font-bold text-[var(--text-primary)]">
                {plan.allocations?.needs?.percentage}%
              </span>
            </div>
            <p className="text-2xl font-bold text-[var(--text-primary)]">
              €{plan.allocations?.needs?.amount?.toFixed(2)}
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--wants)]/30 bg-[var(--bg-secondary)] p-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={18} className="text-[var(--wants)]" />
              <h3 className="font-medium text-[var(--wants)]">{t("common.wants")}</h3>
              <span className="ml-auto text-sm font-bold text-[var(--text-primary)]">
                {plan.allocations?.wants?.percentage}%
              </span>
            </div>
            <p className="text-2xl font-bold text-[var(--text-primary)]">
              €{plan.allocations?.wants?.amount?.toFixed(2)}
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--saves-color)]/30 bg-[var(--bg-secondary)] p-5">
            <div className="flex items-center gap-2 mb-3">
              <PiggyBank size={18} className="text-[var(--saves-color)]" />
              <h3 className="font-medium text-[var(--saves-color)]">{t("common.saves")}</h3>
              <span className="ml-auto text-sm font-bold text-[var(--text-primary)]">
                {plan.allocations?.saves?.percentage}%
              </span>
            </div>
            <p className="text-2xl font-bold text-[var(--text-primary)]">
              €{plan.allocations?.saves?.amount?.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Scheduled Transfers breakdown */}
        {plan.categoryBreakdown && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Needs breakdown */}
            {plan.categoryBreakdown.needs?.length > 0 && (
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5">
                <h3 className="font-medium text-[var(--needs)] mb-3">
                  {t("budgetViewer.scheduledNeeds")}
                </h3>
                <div className="space-y-2">
                  {plan.categoryBreakdown.needs.map((item) => (
                    <div
                      key={item.category}
                      className="flex items-center justify-between py-1 border-b border-[var(--border)]/50 last:border-0"
                    >
                      <span className="text-sm text-[var(--text-secondary)]">
                        {item.category}
                      </span>
                      <span className="text-sm font-medium text-[var(--text-primary)]">
                        €{item.amount.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Wants breakdown */}
            {plan.categoryBreakdown.wants?.length > 0 && (
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5">
                <h3 className="font-medium text-[var(--wants)] mb-3">
                  {t("budgetViewer.scheduledWants")}
                </h3>
                <div className="space-y-2">
                  {plan.categoryBreakdown.wants.map((item) => (
                    <div
                      key={item.category}
                      className="flex items-center justify-between py-1 border-b border-[var(--border)]/50 last:border-0"
                    >
                      <span className="text-sm text-[var(--text-secondary)]">
                        {item.category}
                      </span>
                      <span className="text-sm font-medium text-[var(--text-primary)]">
                        €{item.amount.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Account Leftovers */}
        {plan.accountLeftovers && (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5">
            <h3 className="font-medium text-[var(--text-primary)] mb-3">
              {t("budgetViewer.accountCarryover")}
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-[var(--text-muted)]">{t("budgetViewer.main")}</p>
                <p className="text-lg font-semibold text-[var(--text-primary)]">
                  €{plan.accountLeftovers.Main?.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-xs text-[var(--text-muted)]">{t("budgetViewer.coverflex")}</p>
                <p className="text-lg font-semibold text-[var(--text-primary)]">
                  €{plan.accountLeftovers.Coverflex?.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-xs text-[var(--text-muted)]">{t("budgetViewer.savingsLabel")}</p>
                <p className="text-lg font-semibold text-[var(--text-primary)]">
                  €{plan.accountLeftovers.Savings?.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* V2: Savings Goal Allocations */}
        {plan.savings && plan.savings.allocations.length > 0 && (
          <div className="rounded-2xl border border-[var(--saves-color)]/30 bg-[var(--bg-secondary)] p-5">
            <div className="flex items-center gap-2 mb-3">
              <Target size={18} className="text-[var(--saves-color)]" />
              <h3 className="font-medium text-[var(--saves-color)]">{t("budgetViewer.savingsGoalAllocations")}</h3>
            </div>
            <div className="space-y-2">
              {plan.savings.allocations.map((alloc) => (
                <div
                  key={alloc.goalId}
                  className="flex items-center justify-between py-1 border-b border-[var(--border)]/50 last:border-0"
                >
                  <span className="text-sm text-[var(--text-secondary)]">{alloc.goalName}</span>
                  <span className="text-sm font-medium text-[var(--text-primary)]">
                    €{alloc.amount.toFixed(2)}
                  </span>
                </div>
              ))}
              {plan.savings.unallocated > 0 && (
                <div className="flex items-center justify-between py-1 text-[var(--text-muted)]">
                  <span className="text-sm italic">{t("budgetViewer.unallocated")}</span>
                  <span className="text-sm">€{plan.savings.unallocated.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* V2: Flexible Budget Categories */}
        {plan.flexibleBudget && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plan.flexibleBudget.needs.categories.length > 0 && (
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5">
                <h3 className="font-medium text-[var(--needs)] mb-3">
                  {t("budgetViewer.flexibleNeeds", { total: plan.flexibleBudget.needs.total.toFixed(2) })}
                </h3>
                <div className="space-y-2">
                  {plan.flexibleBudget.needs.categories.map((cat) => (
                    <div key={cat.id}>
                      <div className="flex items-center justify-between py-1 border-b border-[var(--border)]/50">
                        <span className="text-sm font-medium text-[var(--text-secondary)]">{cat.name}</span>
                        <span className="text-sm font-medium text-[var(--text-primary)]">
                          €{cat.budgeted.toFixed(2)}
                        </span>
                      </div>
                      {cat.subcategories && cat.subcategories.length > 0 && (
                        <div className="ml-4 space-y-0.5">
                          {cat.subcategories.map((sub) => (
                            <div
                              key={sub.id}
                              className="flex items-center justify-between py-0.5"
                            >
                              <span className="text-xs text-[var(--text-muted)]">↳ {sub.name}</span>
                              <span className="text-xs text-[var(--text-secondary)]">
                                €{sub.budgeted.toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {plan.flexibleBudget.wants.categories.length > 0 && (
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5">
                <h3 className="font-medium text-[var(--wants)] mb-3">
                  {t("budgetViewer.flexibleWants", { total: plan.flexibleBudget.wants.total.toFixed(2) })}
                </h3>
                <div className="space-y-2">
                  {plan.flexibleBudget.wants.categories.map((cat) => (
                    <div key={cat.id}>
                      <div className="flex items-center justify-between py-1 border-b border-[var(--border)]/50">
                        <span className="text-sm font-medium text-[var(--text-secondary)]">{cat.name}</span>
                        <span className="text-sm font-medium text-[var(--text-primary)]">
                          €{cat.budgeted.toFixed(2)}
                        </span>
                      </div>
                      {cat.subcategories && cat.subcategories.length > 0 && (
                        <div className="ml-4 space-y-0.5">
                          {cat.subcategories.map((sub) => (
                            <div
                              key={sub.id}
                              className="flex items-center justify-between py-0.5"
                            >
                              <span className="text-xs text-[var(--text-muted)]">↳ {sub.name}</span>
                              <span className="text-xs text-[var(--text-secondary)]">
                                €{sub.budgeted.toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
