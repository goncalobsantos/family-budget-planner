"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useBudget } from "@/context/BudgetContext";
import SlidePresentation from "@/components/SlidePresentation";
import OpeningBalances from "@/components/slides/OpeningBalances";
import MoneyFlow from "@/components/slides/MoneyFlow";
import CategoryBreakdown from "@/components/slides/CategoryBreakdown";
import ExtraInfoBreakdown from "@/components/slides/ExtraInfoBreakdown";
import ProjectMonthly from "@/components/slides/ProjectMonthly";
import ProjectsYearOverview from "@/components/slides/ProjectsYearOverview";
import NextMonthPreview from "@/components/slides/NextMonthPreview";
import BudgetPlanner from "@/components/slides/BudgetPlanner";
import DebtsAndGoals from "@/components/slides/DebtsAndGoals";
import BudgetAnalysisSlide from "@/components/slides/BudgetAnalysisSlide";
import { buildBudgetAnalysis } from "@/lib/budget-analysis";
import { useLanguage } from "@/i18n/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Archive, Check } from "lucide-react";
import type { BudgetPlan, BudgetAnalysis } from "@/types/budget";

export default function PresentationPage() {
  const { data, csvText } = useBudget();
  const router = useRouter();
  const { t } = useLanguage();
  const [archiveSaved, setArchiveSaved] = useState(false);
  const [archiveSaving, setArchiveSaving] = useState(false);
  const [budgetAnalysis, setBudgetAnalysis] = useState<BudgetAnalysis | null>(null);

  useEffect(() => {
    if (!data) {
      router.replace("/");
    }
  }, [data, router]);

  // Try to load a budget plan for the current CSV period (prior month plan)
  useEffect(() => {
    if (!data) return;

    async function loadPriorBudgetPlan() {
      try {
        // The CSV's date range tells us which month we're analyzing
        const csvMonth = data!.dateRange.start.slice(0, 7); // YYYY-MM

        // Fetch list of available budget plans
        const res = await fetch("/api/archives");
        if (!res.ok) return;
        const { budgetFiles } = await res.json();

        // Look for a budget plan that matches this CSV's month
        const matchingPlan = budgetFiles.find(
          (f: { name: string }) => f.name === csvMonth
        );

        if (!matchingPlan) return;

        // Fetch the actual plan file
        const planRes = await fetch(matchingPlan.path);
        if (!planRes.ok) return;
        const plan: BudgetPlan = await planRes.json();

        // Build the analysis
        const analysis = buildBudgetAnalysis(plan, data!.records, data!.dateRange, t);
        setBudgetAnalysis(analysis);
      } catch {
        // Silently fail — no prior budget plan is fine
      }
    }

    loadPriorBudgetPlan();
  }, [data]);

  const saveToArchive = useCallback(async () => {
    if (!csvText || !data) return;
    setArchiveSaving(true);
    try {
      // Derive filename from date range
      const month = data.dateRange.start.slice(0, 7);
      const filename = `${month}.csv`;
      await fetch("/api/archives/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: csvText, filename, type: "csv" }),
      });
      setArchiveSaved(true);
    } finally {
      setArchiveSaving(false);
    }
  }, [csvText, data]);

  if (!data) return null;

  const slideLabels = [
    { short: t("slideLabel.balances"), icon: "🏦" },
    { short: t("slideLabel.moneyFlow"), icon: "💸" },
    { short: t("slideLabel.categories"), icon: "📊" },
    { short: t("slideLabel.extraInfo"), icon: "📋" },
    { short: "LabStories", icon: "🧪" },
    { short: "Dwellin'", icon: "🏠" },
    { short: t("slideLabel.yearOverview"), icon: "📅" },
    ...(budgetAnalysis ? [{ short: t("slideLabel.budgetVsActual"), icon: "🎯" }] : []),
    { short: t("slideLabel.nextMonth"), icon: "⏭️" },
    { short: t("slideLabel.planner"), icon: "✏️" },
    { short: t("slideLabel.debtsAndGoals"), icon: "🎯" },
  ];

  const mobileArchiveBtn = csvText ? (
    <button
      onClick={saveToArchive}
      disabled={archiveSaved || archiveSaving}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all
        ${archiveSaved
          ? "text-[var(--income)]"
          : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        }`}
      aria-label={archiveSaved ? t("presentation.archived") : t("presentation.saveToArchive")}
    >
      {archiveSaved ? <Check size={14} /> : <Archive size={14} />}
      <span>{archiveSaved ? "✓" : archiveSaving ? "…" : t("presentation.save")}</span>
    </button>
  ) : undefined;

  return (
    <>
      {/* Desktop: visible top toolbar */}
      <div className="hidden sm:flex fixed top-0 left-0 right-0 z-40 items-center justify-between px-4 py-2 pointer-events-none">
        <div className="pointer-events-auto">
          <LanguageSwitcher />
        </div>
        {csvText && (
          <button
            onClick={saveToArchive}
            disabled={archiveSaved || archiveSaving}
            className={`pointer-events-auto flex items-center gap-2 px-4 py-2 rounded-xl
                       text-sm font-medium transition-all duration-200
                       ${
                         archiveSaved
                           ? "bg-[var(--income)]/20 text-[var(--income)] border border-[var(--income)]/30"
                           : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]"
                       }`}
          >
            {archiveSaved ? (
              <>
                <Check size={14} />
                <span>{t("presentation.archived")}</span>
              </>
            ) : (
              <>
                <Archive size={14} />
                <span>{archiveSaving ? t("presentation.saving") : t("presentation.saveToArchive")}</span>
              </>
            )}
          </button>
        )}
      </div>

      <SlidePresentation labels={slideLabels} mobileAction={mobileArchiveBtn}>
      {/* Slide 1: Opening Balances */}
      <OpeningBalances />

      {/* Slide 2: Money Flow */}
      <MoneyFlow />

      {/* Slide 3: Category Breakdown */}
      <CategoryBreakdown />

      {/* Slide 4: Extra Info Breakdown */}
      <ExtraInfoBreakdown />

      {/* Slide 5: LabStories Monthly */}
      <ProjectMonthly
        project={data.projects.labstories}
        accentColor="var(--accent-primary)"
      />

      {/* Slide 6: Dwellin' Monthly */}
      <ProjectMonthly
        project={data.projects.dwellin}
        accentColor="var(--accent-secondary)"
      />

      {/* Slide 7: Projects Year Overview */}
      <ProjectsYearOverview />

      {/* Slide 8: Budget Analysis (if prior budget plan exists) */}
      {budgetAnalysis && <BudgetAnalysisSlide analysis={budgetAnalysis} />}

      {/* Slide 9: Next Month Preview */}
      <NextMonthPreview />

      {/* Slide 9: Budget Planner */}
      <BudgetPlanner />

      {/* Slide 10: Debts & Goals */}
      <DebtsAndGoals />
    </SlidePresentation>
    </>
  );
}
