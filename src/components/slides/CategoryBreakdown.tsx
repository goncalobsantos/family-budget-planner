"use client";

import { useState } from "react";
import { useBudget } from "@/context/BudgetContext";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import CategoryDetailModal from "@/components/CategoryDetailModal";
import type { CategoryTotal } from "@/types/budget";

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
  "var(--chart-7)",
  "var(--chart-8)",
  "var(--chart-9)",
  "var(--chart-10)",
  "var(--chart-11)",
  "var(--chart-12)",
];

export default function CategoryBreakdown() {
  const { data } = useBudget();
  const [selected, setSelected] = useState<CategoryTotal | null>(null);

  if (!data) return null;

  const chartData = data.categoryBreakdown.map((c) => ({
    name: c.category,
    value: c.total,
  }));

  const total = data.categoryBreakdown.reduce((s, c) => s + c.total, 0);

  return (
    <div className="w-full space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-[var(--text-primary)]">
          Spending by Category
        </h2>
        <p className="text-[var(--text-muted)]">
          Where our money went · Total: €{total.toFixed(2)}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-center">
        {/* Pie chart */}
        <div className="w-full lg:w-1/2 h-[380px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={150}
                paddingAngle={2}
                dataKey="value"
                cursor="pointer"
                onClick={(_, index) =>
                  setSelected(data.categoryBreakdown[index])
                }
              >
                {chartData.map((_, index) => (
                  <Cell
                    key={index}
                    fill={COLORS[index % COLORS.length]}
                    stroke="var(--bg-primary)"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [`€${Number(value).toFixed(2)}`, "Amount"]}
                contentStyle={{
                  backgroundColor: "var(--bg-secondary)",
                  border: "1px solid var(--border)",
                  borderRadius: "12px",
                  padding: "8px 14px",
                }}
                itemStyle={{ color: "var(--text-secondary)" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend list */}
        <div className="w-full lg:w-1/2 space-y-2 max-h-[380px] overflow-y-auto pr-2">
          {data.categoryBreakdown.map((cat, i) => (
            <button
              key={cat.category}
              onClick={() => setSelected(cat)}
              className="w-full flex items-center gap-3 p-3 rounded-xl
                         hover:bg-[var(--bg-tertiary)] transition-colors text-left group"
            >
              <div
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: COLORS[i % COLORS.length] }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[var(--text-primary)] truncate group-hover:text-[var(--accent-primary)]">
                  {cat.category}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  €{cat.total.toFixed(2)}
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  {((cat.total / total) * 100).toFixed(1)}%
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <CategoryDetailModal
        isOpen={selected !== null}
        onClose={() => setSelected(null)}
        title={selected?.category || ""}
        records={selected?.records || []}
        total={selected?.total || 0}
      />
    </div>
  );
}
