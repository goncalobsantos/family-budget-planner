"use client";

import { motion } from "framer-motion";
import {
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Lock,
  HelpCircle,
  PiggyBank,
} from "lucide-react";
import { useBudget } from "@/context/BudgetContext";

export default function NextMonthPreview() {
  const { data } = useBudget();
  if (!data) return null;

  const { nextMonthIncome, scheduledTransfers } = data;
  const totalIncome = nextMonthIncome.sources.reduce(
    (s, src) => s + src.amount,
    0
  );
  const totalLeftovers =
    nextMonthIncome.accountLeftovers.Main +
    nextMonthIncome.accountLeftovers.Coverflex;
  const totalScheduled = scheduledTransfers.reduce(
    (s, t) => s + t.amount,
    0
  );
  const savingsBase = nextMonthIncome.sources
    .filter((src) => src.countsForSavings)
    .reduce((s, src) => s + src.amount, 0);
  const savingsAmount = savingsBase * 0.2;
  const disposable = totalIncome + totalLeftovers - totalScheduled - savingsAmount;

  // Sort transfers: dated ones by period order (day>=24 first), undated at end
  const sortedTransfers = [...scheduledTransfers].sort((a, b) => {
    if (a.day === 0 && b.day === 0) return 0;
    if (a.day === 0) return 1;
    if (b.day === 0) return -1;
    const aKey = a.day >= 24 ? a.day : a.day + 31;
    const bKey = b.day >= 24 ? b.day : b.day + 31;
    return aKey - bKey;
  });

  return (
    <div className="w-full space-y-8 overflow-y-auto max-h-[calc(100vh-120px)] pr-2">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-[var(--text-primary)]">
          Next Month Preview
        </h2>
        <p className="text-[var(--text-muted)]">
          <Calendar size={14} className="inline mr-1" />
          Expected income &amp; scheduled payments
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Income sources */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6"
        >
          <div className="flex items-center gap-2 mb-5">
            <ArrowUpRight size={20} className="text-[var(--income)]" />
            <h3 className="font-medium text-[var(--text-primary)]">
              Expected Income
            </h3>
          </div>
          <div className="space-y-3">
            {nextMonthIncome.sources.map((src) => (
              <div
                key={src.id}
                className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-[var(--text-muted)] w-5">
                    {src.day}
                  </span>
                  <p className="text-sm text-[var(--text-primary)]">
                    {src.name}
                  </p>
                  {src.isFixed ? (
                    <Lock size={12} className="text-[var(--text-muted)]" />
                  ) : (
                    <HelpCircle
                      size={12}
                      className="text-[var(--text-muted)]"
                    />
                  )}
                </div>
                <p className="text-sm font-medium text-[var(--income)]">
                  €{src.amount.toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          {totalLeftovers > 0 && (
            <div className="mt-4 pt-3 border-t border-[var(--border)]">
              <p className="text-xs text-[var(--text-muted)] mb-2">
                Account Leftovers
              </p>
              {Object.entries(nextMonthIncome.accountLeftovers)
                .filter(([key, v]) => v > 0 && key !== "Savings")
                .map(([account, amount]) => (
                  <div
                    key={account}
                    className="flex items-center justify-between py-1"
                  >
                    <p className="text-sm text-[var(--text-secondary)]">
                      {account}
                    </p>
                    <p className="text-sm text-[var(--text-primary)]">
                      €{amount.toFixed(2)}
                    </p>
                  </div>
                ))}
            </div>
          )}

          <div className="mt-4 pt-3 border-t border-[var(--border)] flex justify-between">
            <p className="font-medium text-[var(--text-primary)]">
              Total Income
            </p>
            <p className="font-bold text-lg text-[var(--income)]">
              €{(totalIncome + totalLeftovers).toFixed(2)}
            </p>
          </div>

          {/* Savings 20% */}
          <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PiggyBank size={16} className="text-[var(--saves-color)]" />
              <p className="text-sm font-medium text-[var(--saves-color)]">
                Savings (20%)
              </p>
            </div>
            <p className="font-bold text-[var(--saves-color)]">
              €{savingsAmount.toFixed(2)}
            </p>
          </div>
        </motion.div>

        {/* Scheduled transfers */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6"
        >
          <div className="flex items-center gap-2 mb-5">
            <ArrowDownRight size={20} className="text-[var(--expense)]" />
            <h3 className="font-medium text-[var(--text-primary)]">
              Scheduled Payments
            </h3>
          </div>
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            {sortedTransfers.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0"
              >
                <div className="flex items-center gap-2">
                  {t.day > 0 ? (
                    <span className="text-xs font-mono text-[var(--text-muted)] w-5 text-right">
                      {t.day}
                    </span>
                  ) : (
                    <span className="text-xs font-mono text-[var(--text-muted)] w-5 text-right">
                      —
                    </span>
                  )}
                  <p className="text-sm text-[var(--text-primary)]">
                    {t.name}
                  </p>
                  {t.isFixed ? (
                    <Lock size={12} className="text-[var(--text-muted)]" />
                  ) : (
                    <HelpCircle
                      size={12}
                      className="text-[var(--text-muted)]"
                    />
                  )}
                </div>
                <p className="text-sm font-medium text-[var(--expense)]">
                  €{t.amount.toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-[var(--border)] flex justify-between">
            <p className="font-medium text-[var(--text-primary)]">
              Total Scheduled
            </p>
            <p className="font-bold text-lg text-[var(--expense)]">
              €{totalScheduled.toFixed(2)}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Disposable income highlight */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl border-2 border-[var(--accent-primary)] bg-[var(--bg-secondary)] p-6 text-center"
      >
        <p className="text-sm text-[var(--text-muted)] mb-1">
          Disposable Income (after scheduled + 20% savings)
        </p>
        <p className="text-4xl font-bold text-[var(--accent-primary)]">
          €{disposable.toFixed(2)}
        </p>
      </motion.div>
    </div>
  );
}
