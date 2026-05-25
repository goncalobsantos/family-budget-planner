"use client";

import { motion } from "framer-motion";
import { useBudget } from "@/context/BudgetContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function ProjectsYearOverview() {
  const { data } = useBudget();
  if (!data) return null;

  const { projectsYear } = data;
  const currentYear = new Date(data.dateRange.start).getFullYear();

  // Build chart data: merged months
  const allMonths = new Set([
    ...projectsYear.labstories.months.map((m) => m.month),
    ...projectsYear.dwellin.months.map((m) => m.month),
  ]);
  const chartData = Array.from(allMonths)
    .sort()
    .map((month) => {
      const ls = projectsYear.labstories.months.find((m) => m.month === month);
      const dw = projectsYear.dwellin.months.find((m) => m.month === month);
      const label = new Date(month + "-01").toLocaleDateString("pt-PT", {
        month: "short",
      });
      return {
        month: label,
        "LabStories Income": ls?.income || 0,
        "LabStories Expenses": ls?.expenses || 0,
        "Dwellin' Income": dw?.income || 0,
        "Dwellin' Expenses": dw?.expenses || 0,
      };
    });

  const lsTotalIncome = projectsYear.labstories.totalIncome;
  const lsTotalExpenses = projectsYear.labstories.totalExpenses;
  const dwTotalIncome = projectsYear.dwellin.totalIncome;
  const dwTotalExpenses = projectsYear.dwellin.totalExpenses;

  return (
    <div className="w-full space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-[var(--text-primary)]">
          Projects — Year Overview {currentYear}
        </h2>
        <p className="text-[var(--text-muted)]">
          Full year data from CSV history
        </p>
      </div>

      {/* Chart */}
      <div className="w-full h-[350px] bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border)] p-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="month"
              stroke="var(--text-muted)"
              tick={{ fontSize: 12 }}
            />
            <YAxis
              stroke="var(--text-muted)"
              tick={{ fontSize: 12 }}
              tickFormatter={(v) => `€${v}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--bg-secondary)",
                border: "1px solid var(--border)",
                borderRadius: "12px",
              }}
              formatter={(value) => `€${Number(value).toFixed(2)}`}
            />
            <Legend />
            <Bar dataKey="LabStories Income" fill="var(--chart-10)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="LabStories Expenses" fill="var(--chart-7)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Dwellin' Income" fill="var(--chart-11)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Dwellin' Expenses" fill="var(--chart-6)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* YTD Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          {
            name: "LabStories",
            income: lsTotalIncome,
            expenses: lsTotalExpenses,
            color: "var(--accent-primary)",
          },
          {
            name: "Dwellin'",
            income: dwTotalIncome,
            expenses: dwTotalExpenses,
            color: "var(--accent-secondary)",
          },
        ].map((p, i) => (
          <motion.div
            key={p.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15 }}
            className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6"
          >
            <h3
              className="text-lg font-semibold mb-4"
              style={{ color: p.color }}
            >
              {p.name} — YTD
            </h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-[var(--text-muted)] mb-1">Income</p>
                <p className="text-lg font-semibold text-[var(--income)]">
                  €{p.income.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-xs text-[var(--text-muted)] mb-1">Expenses</p>
                <p className="text-lg font-semibold text-[var(--expense)]">
                  €{p.expenses.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-xs text-[var(--text-muted)] mb-1">Net</p>
                <p
                  className={`text-lg font-semibold ${
                    p.income - p.expenses >= 0
                      ? "text-[var(--income)]"
                      : "text-[var(--expense)]"
                  }`}
                >
                  €{(p.income - p.expenses).toFixed(2)}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
