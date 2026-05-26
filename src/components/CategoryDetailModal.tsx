"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import type { WalletRecord } from "@/types/budget";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  records: WalletRecord[];
  total: number;
}

export default function CategoryDetailModal({
  isOpen,
  onClose,
  title,
  records,
  total,
}: Props) {
  const { t, dateLocale } = useLanguage();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border)]
                       max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-[var(--border)]">
              <div className="min-w-0 flex-1">
                <h3 className="text-base sm:text-lg font-semibold text-[var(--text-primary)] truncate">
                  {title}
                </h3>
                <p className="text-xs sm:text-sm text-[var(--text-muted)]">
                  {t("categoryModal.transactionsTotal", {
                    count: records.length,
                    transactionWord: records.length !== 1 ? t("common.transactions") : t("common.transaction"),
                  })}
                  <span className="text-[var(--expense)]">
                    €{total.toFixed(2)}
                  </span>
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors flex-shrink-0 ml-2"
              >
                <X size={20} className="text-[var(--text-muted)]" />
              </button>
            </div>

            {/* Records - card layout on mobile, table on desktop */}
            <div className="overflow-y-auto max-h-[60vh] p-3 sm:p-4">
              {/* Mobile: card layout */}
              <div className="sm:hidden space-y-2">
                {records
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .map((r, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-[var(--bg-tertiary)]/50"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-[var(--text-primary)] truncate">
                          {r.note || "—"}
                        </p>
                        <p className="text-xs text-[var(--text-muted)]">
                          {new Date(r.date).toLocaleDateString(dateLocale, { day: "2-digit", month: "short" })}
                          {r.category && ` · ${r.category}`}
                        </p>
                      </div>
                      <span className="text-sm font-medium text-[var(--expense)] whitespace-nowrap flex-shrink-0">
                        €{r.amount.toFixed(2)}
                      </span>
                    </div>
                  ))}
              </div>

              {/* Desktop: table layout */}
              <table className="hidden sm:table w-full">
                <thead>
                  <tr className="text-left text-xs text-[var(--text-muted)] uppercase tracking-wider">
                    <th className="pb-3 pr-4">{t("common.date")}</th>
                    <th className="pb-3 pr-4">{t("common.note")}</th>
                    <th className="pb-3 pr-4">{t("common.category")}</th>
                    <th className="pb-3 text-right whitespace-nowrap">{t("common.amount")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {records
                    .sort(
                      (a, b) =>
                        new Date(a.date).getTime() -
                        new Date(b.date).getTime()
                    )
                    .map((r, i) => (
                      <tr
                        key={i}
                        className="text-sm hover:bg-[var(--bg-tertiary)] transition-colors"
                      >
                        <td className="py-3 pr-4 text-[var(--text-secondary)] whitespace-nowrap">
                          {new Date(r.date).toLocaleDateString(dateLocale, {
                            day: "2-digit",
                            month: "short",
                          })}
                        </td>
                        <td className="py-3 pr-4 text-[var(--text-primary)]">
                          {r.note || "—"}
                        </td>
                        <td className="py-3 pr-4 text-[var(--text-muted)]">
                          {r.category}
                        </td>
                        <td className="py-3 text-right font-medium text-[var(--expense)] whitespace-nowrap">
                          €{r.amount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
