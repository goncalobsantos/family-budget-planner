"use client";

import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Target,
  PiggyBank,
} from "lucide-react";
import type { BudgetAnalysis, BudgetVsActualLine } from "@/types/budget";

interface Props {
  analysis: BudgetAnalysis;
}

function ProgressBar({
  percent,
  color,
  bgColor,
}: {
  percent: number;
  color: string;
  bgColor: string;
}) {
  const clamped = Math.min(percent, 150);
  return (
    <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: bgColor }}>
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{
          width: `${Math.min(100, (clamped / 150) * 100)}%`,
          backgroundColor: color,
        }}
      />
    </div>
  );
}

function CategoryLine({ line }: { line: BudgetVsActualLine }) {
  const isOver = line.actual > line.budgeted && line.budgeted > 0;
  const isUnplanned = line.budgeted === 0 && line.actual > 0;
  const isUnder = line.actual <= line.budgeted && line.actual > 0 && line.budgeted > 0;

  return (
    <div className="py-1.5 border-b border-[var(--border)]/50 last:border-0">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          {isOver || isUnplanned ? (
            <XCircle size={12} className="text-[var(--expense)]" />
          ) : isUnder ? (
            <CheckCircle size={12} className="text-[var(--income)]" />
          ) : (
            <div className="w-3" />
          )}
          <span className="text-sm text-[var(--text-primary)]">{line.category}</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-[var(--text-muted)]">
            €{line.budgeted.toFixed(0)}
          </span>
          <span className="text-[var(--text-muted)]">→</span>
          <span
            className={`font-medium ${isOver || isUnplanned ? "text-[var(--expense)]" : "text-[var(--text-primary)]"}`}
          >
            €{line.actual.toFixed(2)}
          </span>
          <span
            className={`text-xs font-mono w-16 text-right ${line.difference >= 0 ? "text-[var(--income)]" : "text-[var(--expense)]"}`}
          >
            {line.difference >= 0 ? "+" : ""}€{line.difference.toFixed(0)}
          </span>
        </div>
      </div>
      {line.budgeted > 0 && (
        <ProgressBar
          percent={line.percentUsed}
          color={
            line.percentUsed > 100
              ? "var(--expense)"
              : line.percentUsed > 80
                ? "var(--wants)"
                : "var(--income)"
          }
          bgColor="var(--bg-tertiary)"
        />
      )}
    </div>
  );
}

export default function BudgetAnalysisSlide({ analysis }: Props) {
  const {
    planMonth,
    isPartialPeriod,
    coveragePercentage,
    daysInPeriod,
    daysInMonth,
    totalBudgetedIncome,
    actualIncome,
    totalBudgetedExpenses,
    actualExpenses,
    needsBudgeted,
    needsActual,
    wantsBudgeted,
    wantsActual,
    savesBudgeted,
    savesActual,
    needsBreakdown,
    wantsBreakdown,
    wins,
    overages,
    warnings,
  } = analysis;

  const totalDifference = totalBudgetedExpenses - actualExpenses;
  const overallOnTrack = totalDifference >= 0;

  // Format month for display
  const monthDate = new Date(`${planMonth}-01`);
  const monthName = monthDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="w-full space-y-5 overflow-y-auto max-h-[calc(100vh-120px)] pr-2">
      {/* Header */}
      <div className="text-center space-y-1">
        <h2 className="text-3xl font-bold text-[var(--text-primary)]">
          Budget Review — {monthName}
        </h2>
        <p className="text-[var(--text-muted)] text-sm">
          How did we do vs. the plan?
        </p>
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="space-y-2">
          {warnings.map((w, i) => (
            <div
              key={i}
              className="rounded-xl p-3 border border-[var(--wants)]/50 bg-[var(--wants)]/10 flex items-start gap-2"
            >
              <AlertTriangle size={14} className="text-[var(--wants)] mt-0.5 flex-shrink-0" />
              <span className="text-sm text-[var(--text-secondary)]">{w}</span>
            </div>
          ))}
        </div>
      )}

      {/* Partial period indicator */}
      {isPartialPeriod && (
        <div className="rounded-xl p-3 border border-[var(--accent-primary)]/50 bg-[var(--accent-primary)]/10 flex items-center gap-2">
          <Clock size={14} className="text-[var(--accent-primary)]" />
          <span className="text-sm text-[var(--text-secondary)]">
            Partial month: {daysInPeriod} of {daysInMonth} days ({coveragePercentage}% coverage)
          </span>
        </div>
      )}

      {/* High-level Budget vs Actual */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] p-3 text-center">
          <p className="text-xs text-[var(--text-muted)]">Income</p>
          <p className="text-sm text-[var(--text-muted)]">€{totalBudgetedIncome.toFixed(0)} planned</p>
          <p className="text-lg font-bold text-[var(--income)]">€{actualIncome.toFixed(0)}</p>
        </div>
        <div className="rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] p-3 text-center">
          <p className="text-xs text-[var(--text-muted)]">Expenses</p>
          <p className="text-sm text-[var(--text-muted)]">€{totalBudgetedExpenses.toFixed(0)} planned</p>
          <p className={`text-lg font-bold ${overallOnTrack ? "text-[var(--income)]" : "text-[var(--expense)]"}`}>
            €{actualExpenses.toFixed(0)}
          </p>
        </div>
        <div className="rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] p-3 text-center">
          <p className="text-xs text-[var(--text-muted)]">Savings</p>
          <p className="text-sm text-[var(--text-muted)]">€{savesBudgeted.toFixed(0)} target</p>
          <p className={`text-lg font-bold ${savesActual >= savesBudgeted * 0.8 ? "text-[var(--saves-color)]" : "text-[var(--expense)]"}`}>
            €{savesActual.toFixed(0)}
          </p>
        </div>
        <div className="rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] p-3 text-center">
          <p className="text-xs text-[var(--text-muted)]">Net Result</p>
          <p className={`text-lg font-bold ${totalDifference >= 0 ? "text-[var(--income)]" : "text-[var(--expense)]"}`}>
            {totalDifference >= 0 ? "+" : ""}€{totalDifference.toFixed(0)}
          </p>
          <p className="text-xs text-[var(--text-muted)]">
            {totalDifference >= 0 ? "under budget" : "over budget"}
          </p>
        </div>
      </div>

      {/* NWS Comparison Bars */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
        <h3 className="font-medium text-[var(--text-primary)] mb-3">
          Budget vs Actual by Category
        </h3>
        <div className="space-y-3">
          {/* Needs */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-[var(--needs)]">Needs</span>
              <span className="text-sm text-[var(--text-muted)]">
                €{needsActual.toFixed(0)} / €{needsBudgeted.toFixed(0)}
                <span className={`ml-2 font-medium ${needsActual <= needsBudgeted ? "text-[var(--income)]" : "text-[var(--expense)]"}`}>
                  ({needsBudgeted > 0 ? Math.round((needsActual / needsBudgeted) * 100) : 0}%)
                </span>
              </span>
            </div>
            <div className="h-4 rounded-full bg-[var(--bg-tertiary)] overflow-hidden relative">
              <div
                className="h-full rounded-full absolute top-0 left-0 opacity-30"
                style={{
                  width: "100%",
                  backgroundColor: "var(--needs)",
                }}
              />
              <div
                className="h-full rounded-full absolute top-0 left-0 transition-all duration-500"
                style={{
                  width: `${Math.min(100, needsBudgeted > 0 ? (needsActual / needsBudgeted) * 100 : 0)}%`,
                  backgroundColor: needsActual <= needsBudgeted ? "var(--needs)" : "var(--expense)",
                }}
              />
            </div>
          </div>

          {/* Wants */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-[var(--wants)]">Wants</span>
              <span className="text-sm text-[var(--text-muted)]">
                €{wantsActual.toFixed(0)} / €{wantsBudgeted.toFixed(0)}
                <span className={`ml-2 font-medium ${wantsActual <= wantsBudgeted ? "text-[var(--income)]" : "text-[var(--expense)]"}`}>
                  ({wantsBudgeted > 0 ? Math.round((wantsActual / wantsBudgeted) * 100) : 0}%)
                </span>
              </span>
            </div>
            <div className="h-4 rounded-full bg-[var(--bg-tertiary)] overflow-hidden relative">
              <div
                className="h-full rounded-full absolute top-0 left-0 opacity-30"
                style={{
                  width: "100%",
                  backgroundColor: "var(--wants)",
                }}
              />
              <div
                className="h-full rounded-full absolute top-0 left-0 transition-all duration-500"
                style={{
                  width: `${Math.min(100, wantsBudgeted > 0 ? (wantsActual / wantsBudgeted) * 100 : 0)}%`,
                  backgroundColor: wantsActual <= wantsBudgeted ? "var(--wants)" : "var(--expense)",
                }}
              />
            </div>
          </div>

          {/* Saves */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-[var(--saves-color)]">Saves</span>
              <span className="text-sm text-[var(--text-muted)]">
                €{savesActual.toFixed(0)} / €{savesBudgeted.toFixed(0)}
                <span className={`ml-2 font-medium ${savesActual >= savesBudgeted * 0.8 ? "text-[var(--income)]" : "text-[var(--expense)]"}`}>
                  ({savesBudgeted > 0 ? Math.round((savesActual / savesBudgeted) * 100) : 0}%)
                </span>
              </span>
            </div>
            <div className="h-4 rounded-full bg-[var(--bg-tertiary)] overflow-hidden relative">
              <div
                className="h-full rounded-full absolute top-0 left-0 opacity-30"
                style={{
                  width: "100%",
                  backgroundColor: "var(--saves-color)",
                }}
              />
              <div
                className="h-full rounded-full absolute top-0 left-0 transition-all duration-500"
                style={{
                  width: `${Math.min(100, savesBudgeted > 0 ? (savesActual / savesBudgeted) * 100 : 0)}%`,
                  backgroundColor: savesActual >= savesBudgeted * 0.8 ? "var(--saves-color)" : "var(--expense)",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Category Detail Breakdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Needs detail */}
        {needsBreakdown.length > 0 && (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
            <h4 className="text-xs font-medium text-[var(--needs)] mb-2 uppercase tracking-wide">
              Needs Breakdown
            </h4>
            <div className="space-y-0.5 max-h-[250px] overflow-y-auto pr-1">
              {needsBreakdown
                .sort((a, b) => Math.abs(b.difference) - Math.abs(a.difference))
                .map((line) => (
                  <CategoryLine key={line.category} line={line} />
                ))}
            </div>
          </div>
        )}

        {/* Wants detail */}
        {wantsBreakdown.length > 0 && (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
            <h4 className="text-xs font-medium text-[var(--wants)] mb-2 uppercase tracking-wide">
              Wants Breakdown
            </h4>
            <div className="space-y-0.5 max-h-[250px] overflow-y-auto pr-1">
              {wantsBreakdown
                .sort((a, b) => Math.abs(b.difference) - Math.abs(a.difference))
                .map((line) => (
                  <CategoryLine key={line.category} line={line} />
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Wins & Overages */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {wins.length > 0 && (
          <div className="rounded-2xl border border-[var(--income)]/30 bg-[var(--income)]/5 p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={16} className="text-[var(--income)]" />
              <h4 className="font-medium text-[var(--income)]">Wins</h4>
            </div>
            <div className="space-y-1.5">
              {wins.slice(0, 6).map((w, i) => (
                <p key={i} className="text-sm text-[var(--text-secondary)]">
                  <CheckCircle size={12} className="inline mr-1.5 text-[var(--income)]" />
                  {w}
                </p>
              ))}
            </div>
          </div>
        )}

        {overages.length > 0 && (
          <div className="rounded-2xl border border-[var(--expense)]/30 bg-[var(--expense)]/5 p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingDown size={16} className="text-[var(--expense)]" />
              <h4 className="font-medium text-[var(--expense)]">Overages</h4>
            </div>
            <div className="space-y-1.5">
              {overages.slice(0, 6).map((o, i) => (
                <p key={i} className="text-sm text-[var(--text-secondary)]">
                  <XCircle size={12} className="inline mr-1.5 text-[var(--expense)]" />
                  {o}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* No wins/overages fallback */}
      {wins.length === 0 && overages.length === 0 && (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6 text-center">
          <Target size={24} className="mx-auto mb-2 text-[var(--text-muted)]" />
          <p className="text-sm text-[var(--text-muted)]">
            No specific category comparisons available. The budget plan may not have detailed categories.
          </p>
        </div>
      )}
    </div>
  );
}
