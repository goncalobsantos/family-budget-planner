"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  FileSpreadsheet,
  Calculator,
  Loader2,
  Archive,
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

interface ArchiveFile {
  name: string;
  filename: string;
  path: string;
  modified: string;
}

interface ArchiveData {
  csvFiles: ArchiveFile[];
  budgetFiles: ArchiveFile[];
}

interface ArchiveListProps {
  onLoadCsv: (csvText: string) => void;
  onLoadBudget: (plan: object, name: string) => void;
}

export default function ArchiveList({
  onLoadCsv,
  onLoadBudget,
}: ArchiveListProps) {
  const [archives, setArchives] = useState<ArchiveData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingFile, setLoadingFile] = useState<string | null>(null);
  const { t, dateLocale, language } = useLanguage();

  useEffect(() => {
    fetch("/api/archives")
      .then((r) => r.json())
      .then((data) => setArchives(data))
      .catch(() => setArchives({ csvFiles: [], budgetFiles: [] }))
      .finally(() => setLoading(false));
  }, []);

  const handleCsvClick = async (file: ArchiveFile) => {
    setLoadingFile(file.filename);
    try {
      const res = await fetch(`/api/archives/read?dir=csv&filename=${encodeURIComponent(file.filename)}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        throw new Error(err.error || `Failed (${res.status})`);
      }
      const text = await res.text();
      onLoadCsv(text);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to load file");
    } finally {
      setLoadingFile(null);
    }
  };

  const handleBudgetClick = async (file: ArchiveFile) => {
    setLoadingFile(file.filename);
    try {
      const res = await fetch(`/api/archives/read?dir=budgets&filename=${encodeURIComponent(file.filename)}`);
      if (!res.ok) throw new Error(t("archives.failedToLoad"));
      const plan = await res.json();
      onLoadBudget(plan, file.name);
    } catch (e) {
      alert(e instanceof Error ? e.message : t("archives.failedToLoad"));
    } finally {
      setLoadingFile(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-8 text-[var(--text-muted)]">
        <Loader2 size={18} className="animate-spin" />
        <span className="text-sm">{t("archives.loadingArchives")}</span>
      </div>
    );
  }

  if (
    !archives ||
    (archives.csvFiles.length === 0 && archives.budgetFiles.length === 0)
  ) {
    return null;
  }

  const getDisplayName = (name: string, filename: string) => {
    // If it's a records_DDmonth-DDmonth filename, show simple title
    const recordsMatch = filename.match(/^records_(\d{1,2})([a-z]+)-(\d{1,2})([a-z]+)\.csv$/i);
    if (recordsMatch) {
      return t("archives.financialAnalysis");
    }
    // Fallback: Try to parse YYYY-MM format
    const match = name.match(/(\d{4})-(\d{2})/);
    if (match) {
      const date = new Date(parseInt(match[1]), parseInt(match[2]) - 1);
      return date.toLocaleDateString(dateLocale, {
        month: "long",
        year: "numeric",
      });
    }
    return name;
  };

  const getPeriodSubtitle = (filename: string) => {
    const match = filename.match(/^records_(\d{1,2})([a-z]+)-(\d{1,2})([a-z]+)\.csv$/i);
    if (!match) return null;
    const [, startDay, startMonth, endDay, endMonth] = match;
    const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

    const monthsMap: Record<string, Record<string, string>> = {
      pt: { january: "janeiro", february: "fevereiro", march: "março", april: "abril", may: "maio", june: "junho", july: "julho", august: "agosto", september: "setembro", october: "outubro", november: "novembro", december: "dezembro" },
      "pt-BR": { january: "janeiro", february: "fevereiro", march: "março", april: "abril", may: "maio", june: "junho", july: "julho", august: "agosto", september: "setembro", october: "outubro", november: "novembro", december: "dezembro" },
      es: { january: "enero", february: "febrero", march: "marzo", april: "abril", may: "mayo", june: "junio", july: "julio", august: "agosto", september: "septiembre", october: "octubre", november: "noviembre", december: "diciembre" },
      fr: { january: "janvier", february: "février", march: "mars", april: "avril", may: "mai", june: "juin", july: "juillet", august: "août", september: "septembre", october: "octobre", november: "novembre", december: "décembre" },
      ja: { january: "1月", february: "2月", march: "3月", april: "4月", may: "5月", june: "6月", july: "7月", august: "8月", september: "9月", october: "10月", november: "11月", december: "12月" },
    };

    const months = monthsMap[language];
    if (months) {
      const sm = months[startMonth.toLowerCase()] ?? startMonth;
      const em = months[endMonth.toLowerCase()] ?? endMonth;
      if (language === "ja") {
        return `${sm}${startDay}日 — ${em}${endDay}日`;
      }
      if (language === "pt" || language === "pt-BR") {
        return `${startDay} de ${sm} — ${endDay} de ${em}`;
      }
      if (language === "es") {
        return `${startDay} de ${sm} — ${endDay} de ${em}`;
      }
      if (language === "fr") {
        return `${startDay} ${sm} — ${endDay} ${em}`;
      }
    }
    return `${startDay} ${capitalize(startMonth)} — ${endDay} ${capitalize(endMonth)}`;
  };

  const getBudgetPlanSubtitle = (filename: string) => {
    // New format: budget-plan-YYYY-month-month.json
    const match = filename.match(/^budget-plan-\d{4}-([a-z]+)-([a-z]+)\.json$/i);
    if (!match) {
      // Legacy format: budget-plan-YYYY-MM.json
      const legacyMatch = filename.match(/^budget-plan-(\d{4})-(\d{2})\.json$/);
      if (legacyMatch) {
        const date = new Date(parseInt(legacyMatch[1]), parseInt(legacyMatch[2]) - 1);
        return date.toLocaleDateString(dateLocale, { month: "long", year: "numeric" });
      }
      return null;
    }

    const [, startMonthEn, endMonthEn] = match;
    const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

    const monthsMap: Record<string, Record<string, string>> = {
      pt: { january: "janeiro", february: "fevereiro", march: "março", april: "abril", may: "maio", june: "junho", july: "julho", august: "agosto", september: "setembro", october: "outubro", november: "novembro", december: "dezembro" },
      "pt-BR": { january: "janeiro", february: "fevereiro", march: "março", april: "abril", may: "maio", june: "junho", july: "julho", august: "agosto", september: "setembro", october: "outubro", november: "novembro", december: "dezembro" },
      es: { january: "enero", february: "febrero", march: "marzo", april: "abril", may: "mayo", june: "junio", july: "julio", august: "agosto", september: "septiembre", october: "octubre", november: "noviembre", december: "diciembre" },
      fr: { january: "janvier", february: "février", march: "mars", april: "avril", may: "mai", june: "juin", july: "juillet", august: "août", september: "septembre", october: "octobre", november: "novembre", december: "décembre" },
      ja: { january: "1月", february: "2月", march: "3月", april: "4月", may: "5月", june: "6月", july: "7月", august: "8月", september: "9月", october: "10月", november: "11月", december: "12月" },
    };

    const months = monthsMap[language];
    const sm = months?.[startMonthEn.toLowerCase()] ?? capitalize(startMonthEn);
    const em = months?.[endMonthEn.toLowerCase()] ?? capitalize(endMonthEn);

    return t("archives.budgetPlanPeriod", {
      startMonth: language === "ja" ? sm : capitalize(sm),
      endMonth: language === "ja" ? em : capitalize(em),
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-2 text-[var(--text-muted)]">
        <Archive size={18} />
        <h2 className="text-sm font-medium uppercase tracking-wider">
          {t("archives.title")}
        </h2>
      </div>

      {/* Monthly Analyses */}
      {archives.csvFiles.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
            {t("archives.monthlyAnalyses")}
          </h3>
          <div className="grid gap-2">
            {archives.csvFiles.map((file) => (
              <button
                key={file.filename}
                onClick={() => handleCsvClick(file)}
                disabled={loadingFile === file.filename}
                className="flex items-center gap-3 w-full p-3 rounded-xl
                           bg-[var(--bg-secondary)] border border-[var(--border)]
                           hover:border-[var(--accent-primary)] hover:bg-[var(--bg-tertiary)]
                           transition-all duration-200 text-left group"
              >
                {loadingFile === file.filename ? (
                  <Loader2
                    size={18}
                    className="text-[var(--accent-primary)] animate-spin flex-shrink-0"
                  />
                ) : (
                  <FileSpreadsheet
                    size={18}
                    className="text-[var(--income)] flex-shrink-0 group-hover:text-[var(--accent-primary)]
                               transition-colors"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                    {getDisplayName(file.name, file.filename)}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {getPeriodSubtitle(file.filename) ?? file.filename}
                  </p>
                </div>
                <Calendar size={14} className="text-[var(--text-muted)]" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Budget Plans */}
      {archives.budgetFiles.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
            {t("archives.budgetPlans")}
          </h3>
          <div className="grid gap-2">
            {archives.budgetFiles.map((file) => (
              <button
                key={file.filename}
                onClick={() => handleBudgetClick(file)}
                disabled={loadingFile === file.filename}
                className="flex items-center gap-3 w-full p-3 rounded-xl
                           bg-[var(--bg-secondary)] border border-[var(--border)]
                           hover:border-[var(--accent-secondary)] hover:bg-[var(--bg-tertiary)]
                           transition-all duration-200 text-left group"
              >
                {loadingFile === file.filename ? (
                  <Loader2
                    size={18}
                    className="text-[var(--accent-secondary)] animate-spin flex-shrink-0"
                  />
                ) : (
                  <Calculator
                    size={18}
                    className="text-[var(--accent-secondary)] flex-shrink-0
                               group-hover:text-[var(--accent-primary)] transition-colors"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                    {t("archives.budgetPlan")}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {getBudgetPlanSubtitle(file.filename) ?? file.filename}
                  </p>
                </div>
                <Calendar size={14} className="text-[var(--text-muted)]" />
              </button>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
