"use client";

import { motion } from "framer-motion";
import { Wallet, CreditCard, PiggyBank } from "lucide-react";
import { useBudget } from "@/context/BudgetContext";
import { useLanguage } from "@/i18n/LanguageContext";

const icons = {
  Main: Wallet,
  Meal: CreditCard,
  TradeRepublic: PiggyBank,
};

const colors = {
  Main: "var(--accent-primary)",
  Meal: "var(--needs)",
  TradeRepublic: "var(--savings)",
};

export default function OpeningBalances() {
  const { data } = useBudget();
  const { t, dateLocale } = useLanguage();
  if (!data) return null;

  const total = data.openingBalances.reduce((s, b) => s + b.amount, 0);

  return (
    <div className="w-full space-y-6 sm:space-y-10 overflow-y-auto max-h-[calc(100vh-100px)] sm:max-h-[calc(100vh-120px)]">
      <div className="text-center space-y-2">
        <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
          {t("openingBalances.title")}
        </h2>
        <p className="text-[var(--text-muted)]">
          {t("openingBalances.subtitle", {
            date: new Date(data.dateRange.start).toLocaleDateString(dateLocale, {
              day: "numeric",
              month: "long",
              year: "numeric",
            }),
          })}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        {data.openingBalances.map((balance, i) => {
          const Icon = icons[balance.account];
          const color = colors[balance.account];
          return (
            <motion.div
              key={balance.account}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5 sm:p-8
                         hover:border-[var(--text-muted)] transition-colors duration-300"
            >
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${color}20` }}
                >
                  <Icon size={24} style={{ color }} />
                </div>
                <h3 className="text-lg font-medium text-[var(--text-secondary)]">
                  {balance.displayName}
                </h3>
              </div>
              <p className="text-4xl font-bold text-[var(--text-primary)]">
                €{balance.amount.toFixed(2)}
              </p>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-center"
      >
        <p className="text-[var(--text-muted)] text-sm mb-1">{t("openingBalances.totalAcrossAccounts")}</p>
        <p className="text-2xl font-semibold text-[var(--text-primary)]">
          €{total.toFixed(2)}
        </p>
      </motion.div>
    </div>
  );
}
