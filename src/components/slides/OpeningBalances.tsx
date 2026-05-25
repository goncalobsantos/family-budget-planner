"use client";

import { motion } from "framer-motion";
import { Wallet, CreditCard, PiggyBank } from "lucide-react";
import { useBudget } from "@/context/BudgetContext";

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
  if (!data) return null;

  const total = data.openingBalances.reduce((s, b) => s + b.amount, 0);

  return (
    <div className="w-full space-y-10">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-[var(--text-primary)]">
          Opening Balances
        </h2>
        <p className="text-[var(--text-muted)]">
          Where we started on{" "}
          {new Date(data.dateRange.start).toLocaleDateString("pt-PT", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {data.openingBalances.map((balance, i) => {
          const Icon = icons[balance.account];
          const color = colors[balance.account];
          return (
            <motion.div
              key={balance.account}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-8
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
        <p className="text-[var(--text-muted)] text-sm mb-1">Total across all accounts</p>
        <p className="text-2xl font-semibold text-[var(--text-primary)]">
          €{total.toFixed(2)}
        </p>
      </motion.div>
    </div>
  );
}
