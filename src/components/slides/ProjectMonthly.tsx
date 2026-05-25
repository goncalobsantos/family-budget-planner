"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from "lucide-react";
import type { ProjectData } from "@/types/budget";

interface Props {
  project: ProjectData;
  accentColor: string;
}

export default function ProjectMonthly({ project, accentColor }: Props) {
  const isPositive = project.net >= 0;

  return (
    <div className="w-full space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-[var(--text-primary)]">
          {project.displayName}
        </h2>
        <p className="text-[var(--text-muted)]">Monthly overview</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <ArrowUpRight size={20} className="text-[var(--income)]" />
            <p className="text-sm text-[var(--text-muted)]">Income</p>
          </div>
          <p className="text-3xl font-bold text-[var(--income)]">
            €{project.income.toFixed(2)}
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            {project.incomeRecords.length} transaction{project.incomeRecords.length !== 1 ? "s" : ""}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <ArrowDownRight size={20} className="text-[var(--expense)]" />
            <p className="text-sm text-[var(--text-muted)]">Expenses</p>
          </div>
          <p className="text-3xl font-bold text-[var(--expense)]">
            €{project.expenses.toFixed(2)}
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            {project.expenseRecords.length} transaction{project.expenseRecords.length !== 1 ? "s" : ""}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border-2 bg-[var(--bg-secondary)] p-6"
          style={{ borderColor: accentColor }}
        >
          <div className="flex items-center gap-2 mb-4">
            {isPositive ? (
              <TrendingUp size={20} className="text-[var(--income)]" />
            ) : (
              <TrendingDown size={20} className="text-[var(--expense)]" />
            )}
            <p className="text-sm text-[var(--text-muted)]">Net Result</p>
          </div>
          <p
            className={`text-3xl font-bold ${isPositive ? "text-[var(--income)]" : "text-[var(--expense)]"}`}
          >
            {isPositive ? "+" : ""}€{project.net.toFixed(2)}
          </p>
        </motion.div>
      </div>

      {/* Transaction list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Income */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5">
          <h3 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-4">
            Income Details
          </h3>
          {project.incomeRecords.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)] italic">No income this month</p>
          ) : (
            <div className="space-y-3">
              {project.incomeRecords.map((r, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0"
                >
                  <div>
                    <p className="text-sm text-[var(--text-primary)]">
                      {r.note || r.category}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {new Date(r.date).toLocaleDateString("pt-PT", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-[var(--income)]">
                    +€{r.amount.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Expenses */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5">
          <h3 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-4">
            Expense Details
          </h3>
          {project.expenseRecords.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)] italic">No expenses this month</p>
          ) : (
            <div className="space-y-3">
              {project.expenseRecords.map((r, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0"
                >
                  <div>
                    <p className="text-sm text-[var(--text-primary)]">
                      {r.note || r.category}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {new Date(r.date).toLocaleDateString("pt-PT", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-[var(--expense)]">
                    -€{r.amount.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
