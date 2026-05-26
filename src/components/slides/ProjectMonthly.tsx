"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import type { ProjectData } from "@/types/budget";

interface Props {
  project: ProjectData;
  accentColor: string;
}

export default function ProjectMonthly({ project, accentColor }: Props) {
  const isPositive = project.net >= 0;
  const { t, dateLocale } = useLanguage();

  return (
    <div className="w-full space-y-5 sm:space-y-8 overflow-y-auto max-h-[calc(100vh-100px)] sm:max-h-[calc(100vh-120px)]">
      <div className="text-center space-y-2">
        <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
          {project.displayName}
        </h2>
        <p className="text-[var(--text-muted)]">{t("projectMonthly.monthlyOverview")}</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <ArrowUpRight size={20} className="text-[var(--income)]" />
            <p className="text-sm text-[var(--text-muted)]">{t("common.income")}</p>
          </div>
          <p className="text-3xl font-bold text-[var(--income)]">
            €{project.income.toFixed(2)}
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            {project.incomeRecords.length} {project.incomeRecords.length !== 1 ? t("common.transactions") : t("common.transaction")}
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
            <p className="text-sm text-[var(--text-muted)]">{t("common.expenses")}</p>
          </div>
          <p className="text-3xl font-bold text-[var(--expense)]">
            €{project.expenses.toFixed(2)}
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            {project.expenseRecords.length} {project.expenseRecords.length !== 1 ? t("common.transactions") : t("common.transaction")}
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
            <p className="text-sm text-[var(--text-muted)]">{t("projectMonthly.netResult")}</p>
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
            {t("projectMonthly.incomeDetails")}
          </h3>
          {project.incomeRecords.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)] italic">{t("projectMonthly.noIncome")}</p>
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
                      {new Date(r.date).toLocaleDateString(dateLocale, {
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
            {t("projectMonthly.expenseDetails")}
          </h3>
          {project.expenseRecords.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)] italic">{t("projectMonthly.noExpenses")}</p>
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
                      {new Date(r.date).toLocaleDateString(dateLocale, {
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
