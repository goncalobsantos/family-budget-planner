"use client";

import { motion } from "framer-motion";
import { Shield, Plane, Car, Target, TrendingDown } from "lucide-react";
import { useBudget } from "@/context/BudgetContext";
import { useLanguage } from "@/i18n/LanguageContext";

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Shield,
  Plane,
  Car,
  Target,
};

export default function DebtsAndGoals() {
  const { data } = useBudget();
  const { t, dateLocale } = useLanguage();
  if (!data) return null;

  const { debts, goals } = data;

  return (
    <div className="w-full space-y-5 sm:space-y-8 overflow-y-auto max-h-[calc(100vh-100px)] sm:max-h-[calc(100vh-120px)] pr-1 sm:pr-2">
      <div className="text-center space-y-2">
        <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
          {t("debtsGoals.title")}
        </h2>
        <p className="text-[var(--text-muted)]">
          {t("debtsGoals.subtitle")}
        </p>
      </div>

      {/* Debts */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <TrendingDown size={20} className="text-[var(--expense)]" />
          <h3 className="text-xl font-semibold text-[var(--text-primary)]">
            {t("debtsGoals.debts")}
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {debts.map((debt, i) => {
            const paid = debt.totalOwed - debt.remaining;
            const progress = debt.totalOwed > 0 ? (paid / debt.totalOwed) * 100 : 0;

            return (
              <motion.div
                key={debt.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-[var(--text-primary)]">
                      {debt.name}
                    </h4>
                    <p className="text-xs text-[var(--text-muted)]">
                      {debt.description}
                    </p>
                  </div>
                  {debt.paymentsThisMonth > 0 && (
                    <span className="text-xs px-2 py-1 rounded-full bg-[var(--income)]/15 text-[var(--income)]">
                      {t("debtsGoals.thisMonth", { amount: debt.paymentsThisMonth.toFixed(2) })}
                    </span>
                  )}
                </div>

                {/* Progress bar */}
                <div className="w-full h-3 rounded-full bg-[var(--bg-tertiary)] mb-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                    className="h-full rounded-full bg-gradient-to-r from-[var(--expense)] to-[var(--needs)]"
                  />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--text-muted)]">
                    {t("debtsGoals.paidTotal", { paid: paid.toFixed(2), total: debt.totalOwed.toLocaleString() })}
                  </span>
                  <span className="text-[var(--text-secondary)]">
                    {progress.toFixed(1)}%
                  </span>
                </div>

                <div className="mt-3 pt-3 border-t border-[var(--border)] text-xs text-[var(--text-muted)]">
                  <span>{t("debtsGoals.remaining", { amount: debt.remaining.toFixed(2) })}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Goals */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Target size={20} className="text-[var(--income)]" />
          <h3 className="text-xl font-semibold text-[var(--text-primary)]">
            {t("debtsGoals.financialGoals")}
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {goals.map((goal, i) => {
            const Icon = iconMap[goal.icon] || Target;
            const progress = (goal.currentSaved / goal.targetAmount) * 100;
            const remaining = goal.targetAmount - goal.currentSaved;
            const deadline = new Date(goal.deadline);
            const now = new Date();
            const monthsLeft = Math.max(
              0,
              (deadline.getFullYear() - now.getFullYear()) * 12 +
                (deadline.getMonth() - now.getMonth())
            );
            const monthlySavingsNeeded =
              monthsLeft > 0 ? remaining / monthsLeft : remaining;

            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 + 0.2 }}
                className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[var(--accent-primary)]/15 flex items-center justify-center">
                    <Icon size={20} className="text-[var(--accent-primary)]" />
                  </div>
                  <div>
                    <h4 className="font-medium text-[var(--text-primary)] text-sm">
                      {goal.name}
                    </h4>
                    <p className="text-xs text-[var(--text-muted)]">
                      {goal.description}
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-3 rounded-full bg-[var(--bg-tertiary)] mb-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(progress, 100)}%` }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
                    className="h-full rounded-full bg-gradient-to-r from-[var(--accent-primary)] to-[var(--income)]"
                  />
                </div>

                <div className="flex items-center justify-between text-sm mb-3">
                  <span className="text-[var(--text-muted)]">
                    €{goal.currentSaved.toLocaleString()} / €{goal.targetAmount.toLocaleString()}
                  </span>
                  <span className="text-[var(--accent-primary)] font-medium">
                    {progress.toFixed(1)}%
                  </span>
                </div>

                <div className="pt-3 border-t border-[var(--border)] space-y-1 text-xs text-[var(--text-muted)]">
                  <div className="flex justify-between">
                    <span>{t("debtsGoals.deadline")}</span>
                    <span>
                      {deadline.toLocaleDateString(dateLocale, {
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t("debtsGoals.monthlyNeeded")}</span>
                    <span className="text-[var(--text-secondary)]">
                      €{monthlySavingsNeeded.toFixed(2)}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
