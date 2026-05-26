"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Archive, X, FileText, Calendar, Info } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

interface SaveArchiveModalProps {
  dateRange: { start: string; end: string };
  recordCount: number;
  incomeTotal: number;
  expenseTotal: number;
  onSave: (filename: string) => void;
  onClose: () => void;
  saving: boolean;
}

/**
 * Generate the default filename from date range:
 * records_[day][monthName]-[day][monthName].csv
 * e.g. records_24april-24may.csv
 */
function generateDefaultFilename(start: string, end: string): string {
  const months = [
    "january", "february", "march", "april", "may", "june",
    "july", "august", "september", "october", "november", "december",
  ];
  const startDate = new Date(start);
  const endDate = new Date(end);
  const startDay = startDate.getDate();
  const endDay = endDate.getDate();
  const startMonth = months[startDate.getMonth()];
  const endMonth = months[endDate.getMonth()];
  return `records_${startDay}${startMonth}-${endDay}${endMonth}.csv`;
}

/**
 * Beautify a records filename for display.
 * "records_24april-24may.csv" → localized "Análise financeira de 24 de abril a 24 de maio"
 */
export function beautifyArchiveName(
  filename: string,
  language: string
): string {
  // Try to parse records_DDmonth-DDmonth.csv
  const match = filename.match(
    /^records_(\d{1,2})([a-z]+)-(\d{1,2})([a-z]+)\.csv$/i
  );
  if (!match) return filename.replace(/\.csv$/, "");

  const [, startDay, startMonthEn, endDay, endMonthEn] = match;

  const monthsMap: Record<string, Record<string, string>> = {
    pt: { january: "janeiro", february: "fevereiro", march: "março", april: "abril", may: "maio", june: "junho", july: "julho", august: "agosto", september: "setembro", october: "outubro", november: "novembro", december: "dezembro" },
    "pt-BR": { january: "janeiro", february: "fevereiro", march: "março", april: "abril", may: "maio", june: "junho", july: "julho", august: "agosto", september: "setembro", october: "outubro", november: "novembro", december: "dezembro" },
    es: { january: "enero", february: "febrero", march: "marzo", april: "abril", may: "mayo", june: "junio", july: "julio", august: "agosto", september: "septiembre", october: "octubre", november: "noviembre", december: "diciembre" },
    fr: { january: "janvier", february: "février", march: "mars", april: "avril", may: "mai", june: "juin", july: "juillet", august: "août", september: "septembre", october: "octobre", november: "novembre", december: "décembre" },
    ja: { january: "1月", february: "2月", march: "3月", april: "4月", may: "5月", june: "6月", july: "7月", august: "8月", september: "9月", october: "10月", november: "11月", december: "12月" },
  };

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  const months = monthsMap[language];

  if (language === "ja" && months) {
    const sm = months[startMonthEn.toLowerCase()] ?? startMonthEn;
    const em = months[endMonthEn.toLowerCase()] ?? endMonthEn;
    return `${sm}${startDay}日〜${em}${endDay}日の財務分析`;
  }

  if ((language === "pt" || language === "pt-BR") && months) {
    const sm = months[startMonthEn.toLowerCase()] ?? startMonthEn;
    const em = months[endMonthEn.toLowerCase()] ?? endMonthEn;
    return `Análise financeira de ${startDay} de ${sm} a ${endDay} de ${em}`;
  }

  if (language === "es" && months) {
    const sm = months[startMonthEn.toLowerCase()] ?? startMonthEn;
    const em = months[endMonthEn.toLowerCase()] ?? endMonthEn;
    return `Análisis financiero del ${startDay} de ${sm} al ${endDay} de ${em}`;
  }

  if (language === "fr" && months) {
    const sm = months[startMonthEn.toLowerCase()] ?? startMonthEn;
    const em = months[endMonthEn.toLowerCase()] ?? endMonthEn;
    return `Analyse financière du ${startDay} ${sm} au ${endDay} ${em}`;
  }

  // English fallback
  const sm = capitalize(startMonthEn.toLowerCase());
  const em = capitalize(endMonthEn.toLowerCase());
  const ordinal = (n: number) => {
    if (n % 10 === 1 && n !== 11) return `${n}st`;
    if (n % 10 === 2 && n !== 12) return `${n}nd`;
    if (n % 10 === 3 && n !== 13) return `${n}rd`;
    return `${n}th`;
  };
  return `Financial analysis from ${ordinal(+startDay)} of ${sm} to ${ordinal(+endDay)} of ${em}`;
}

export default function SaveArchiveModal({
  dateRange,
  recordCount,
  incomeTotal,
  expenseTotal,
  onSave,
  onClose,
  saving,
}: SaveArchiveModalProps) {
  const { t, language } = useLanguage();
  const defaultFilename = generateDefaultFilename(dateRange.start, dateRange.end);
  const [customName, setCustomName] = useState("");

  const finalFilename = customName.trim()
    ? customName.trim().replace(/\.csv$/, "") + ".csv"
    : defaultFilename;

  const beautifiedName = beautifyArchiveName(finalFilename, language);

  const handleSave = () => {
    // Sanitize: only allow safe chars for filesystem
    const sanitized = finalFilename.replace(/[^a-zA-Z0-9._-]/g, "");
    onSave(sanitized);
  };

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-md bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border)] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]/50">
          <div className="flex items-center gap-2">
            <Archive size={18} className="text-[var(--accent-primary)]" />
            <h3 className="text-base font-semibold text-[var(--text-primary)]">
              {t("saveModal.title")}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors"
          >
            <X size={16} className="text-[var(--text-muted)]" />
          </button>
        </div>

        {/* Content */}
        <div className="px-5 py-4 space-y-4">
          {/* Explanation */}
          <div className="flex gap-2.5 p-3 rounded-xl bg-[var(--accent-primary)]/5 border border-[var(--accent-primary)]/20">
            <Info size={16} className="text-[var(--accent-primary)] flex-shrink-0 mt-0.5" />
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              {t("saveModal.explanation")}
            </p>
          </div>

          {/* Summary */}
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
              {t("saveModal.summary")}
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[var(--bg-tertiary)]">
                <Calendar size={14} className="text-[var(--text-muted)]" />
                <div>
                  <p className="text-[10px] text-[var(--text-muted)]">{t("saveModal.period")}</p>
                  <p className="text-xs font-medium text-[var(--text-primary)]">
                    {new Date(dateRange.start).toLocaleDateString(language === "pt" ? "pt-PT" : "en-GB", { day: "2-digit", month: "short" })}
                    {" — "}
                    {new Date(dateRange.end).toLocaleDateString(language === "pt" ? "pt-PT" : "en-GB", { day: "2-digit", month: "short" })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[var(--bg-tertiary)]">
                <FileText size={14} className="text-[var(--text-muted)]" />
                <div>
                  <p className="text-[10px] text-[var(--text-muted)]">{t("saveModal.records")}</p>
                  <p className="text-xs font-medium text-[var(--text-primary)]">{recordCount}</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-lg bg-[var(--bg-tertiary)]">
                <p className="text-[10px] text-[var(--text-muted)]">{t("common.income")}</p>
                <p className="text-xs font-medium text-[var(--income)]">€{incomeTotal.toFixed(2)}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-[var(--bg-tertiary)]">
                <p className="text-[10px] text-[var(--text-muted)]">{t("common.expenses")}</p>
                <p className="text-xs font-medium text-[var(--expense)]">€{expenseTotal.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Filename */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
              {t("saveModal.filename")}
            </label>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder={defaultFilename.replace(/\.csv$/, "")}
              className="w-full px-3 py-2 rounded-lg text-sm
                         bg-[var(--bg-tertiary)] border border-[var(--border)]
                         text-[var(--text-primary)] placeholder:text-[var(--text-muted)]/50
                         focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
            />
            <p className="text-[10px] text-[var(--text-muted)] italic">
              {beautifiedName}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-[var(--border)]/50">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm text-[var(--text-secondary)]
                       hover:bg-[var(--bg-tertiary)] transition-colors"
          >
            {t("saveModal.cancel")}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                       bg-[var(--accent-primary)] text-white
                       hover:bg-[var(--accent-primary)]/90 transition-colors
                       disabled:opacity-50"
          >
            <Archive size={14} />
            <span>{saving ? t("presentation.saving") : t("saveModal.saveButton")}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
