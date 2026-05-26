"use client";

import { useBudget } from "@/context/BudgetContext";
import { useLanguage } from "@/i18n/LanguageContext";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const formatDate = (val: string) => {
  const d = new Date(val);
  return `${d.getDate()}/${d.getMonth() + 1}`;
};

interface AccountChartProps {
  data: { date: string; value: number }[];
  label: string;
  color: string;
  startValue: number;
  endValue: number;
  dateLocale: string;
}

function AccountChart({ data, label, color, startValue, endValue, dateLocale }: AccountChartProps) {
  const diff = endValue - startValue;
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-[var(--text-secondary)]">{label}</h3>
        <div className="text-right">
          <span className="text-lg font-semibold text-[var(--text-primary)]">
            €{endValue.toFixed(2)}
          </span>
          <span className={`ml-2 text-xs font-medium ${diff >= 0 ? "text-[var(--income)]" : "text-[var(--expense)]"}`}>
            {diff >= 0 ? "+" : ""}€{diff.toFixed(2)}
          </span>
        </div>
      </div>
      <div className="h-[100px] sm:h-[140px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id={`gradient-${label}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              stroke="var(--text-muted)"
              tick={{ fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              stroke="var(--text-muted)"
              tick={{ fontSize: 10 }}
              tickFormatter={(v) => `€${v}`}
              width={55}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              formatter={(value) => [`€${Number(value).toFixed(2)}`, label]}
              labelFormatter={(l) =>
                new Date(l).toLocaleDateString(dateLocale, { day: "numeric", month: "short" })
              }
              contentStyle={{
                backgroundColor: "var(--bg-secondary)",
                border: "1px solid var(--border)",
                borderRadius: "12px",
                padding: "8px 12px",
                fontSize: "12px",
              }}
              itemStyle={{ color: "var(--text-secondary)" }}
              labelStyle={{ color: "var(--text-primary)", fontWeight: 600 }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              fill={`url(#gradient-${label})`}
              dot={false}
              activeDot={{ r: 4, fill: color }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default function MoneyFlow() {
  const { data } = useBudget();
  const { t, dateLocale } = useLanguage();
  if (!data || data.dailyBalances.length === 0) return null;

  const first = data.dailyBalances[0];
  const last = data.dailyBalances[data.dailyBalances.length - 1];

  const accounts = [
    {
      label: t("moneyFlow.mainAccount"),
      key: "Main" as const,
      color: "var(--accent-primary)",
    },
    {
      label: t("moneyFlow.coverflex"),
      key: "Coverflex" as const,
      color: "var(--needs)",
    },
    {
      label: t("moneyFlow.savings"),
      key: "Savings" as const,
      color: "var(--savings)",
    },
  ];

  return (
    <div className="w-full space-y-4 sm:space-y-6 overflow-y-auto max-h-[calc(100vh-100px)] sm:max-h-[calc(100vh-120px)]">
      <div className="text-center space-y-2">
        <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
          {t("moneyFlow.title")}
        </h2>
        <p className="text-[var(--text-muted)]">
          {t("moneyFlow.subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {accounts.map((account) => (
          <AccountChart
            key={account.key}
            label={account.label}
            color={account.color}
            data={data.dailyBalances.map((d) => ({
              date: d.date,
              value: d[account.key],
            }))}
            startValue={first[account.key]}
            endValue={last[account.key]}
            dateLocale={dateLocale}
          />
        ))}
      </div>
    </div>
  );
}
