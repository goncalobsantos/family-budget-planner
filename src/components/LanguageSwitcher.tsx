"use client";

import { useLanguage } from "@/i18n/LanguageContext";
import type { Language } from "@/i18n/translations";

const LABELS: Record<Language, string> = {
  pt: "PT",
  en: "EN",
};

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const next: Language = language === "pt" ? "en" : "pt";

  return (
    <button
      onClick={() => setLanguage(next)}
      className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 rounded-xl
                 text-sm font-medium transition-all duration-200
                 bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border)]
                 hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]"
      aria-label={`Switch to ${next === "pt" ? "Português" : "English"}`}
    >
      <span className="uppercase text-xs font-bold">{LABELS[language]}</span>
      <span className="uppercase text-xs text-[var(--text-muted)]">{LABELS[next]}</span>
    </button>
  );
}
