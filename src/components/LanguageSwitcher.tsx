"use client";

import { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import type { Language } from "@/i18n/translations";

const LANGUAGE_ORDER: Language[] = ["pt", "en", "es", "fr", "pt-BR", "ja"];

const FLAGS: Record<Language, string> = {
  pt: "🇵🇹",
  en: "🇬🇧",
  es: "🇪🇸",
  fr: "🇫🇷",
  "pt-BR": "🇧🇷",
  ja: "🇯🇵",
};

const LABELS: Record<Language, string> = {
  pt: "Português",
  en: "English",
  es: "Español",
  fr: "Français",
  "pt-BR": "Português (BR)",
  ja: "日本語",
};

const SHORT_LABELS: Record<Language, string> = {
  pt: "PT",
  en: "EN",
  es: "ES",
  fr: "FR",
  "pt-BR": "BR",
  ja: "JA",
};

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const [openUp, setOpenUp] = useState(false);
  const [openLeft, setOpenLeft] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  function handleToggle() {
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceRight = window.innerWidth - rect.left;
      setOpenUp(spaceBelow < 280);
      setOpenLeft(spaceRight < 200);
    }
    setOpen(!open);
  }

  return (
    <div ref={ref} className="relative">
      <button
        ref={btnRef}
        onClick={handleToggle}
        className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 rounded-xl
                   text-sm font-medium transition-all duration-200
                   bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border)]
                   hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]"
        aria-label="Select language"
        aria-expanded={open}
      >
        <span className="text-sm leading-none">{FLAGS[language]}</span>
        <span className="uppercase text-xs font-bold">{SHORT_LABELS[language]}</span>
      </button>

      {open && (
        <div
          className={`absolute min-w-[170px] rounded-xl overflow-hidden py-1
                     bg-[var(--bg-secondary)] border border-[var(--border)] shadow-xl z-[9999]
                     ${openUp ? "bottom-full mb-2" : "top-full mt-2"}
                     ${openLeft ? "right-0" : "left-0"}`}
        >
          {LANGUAGE_ORDER.map((lang) => (
            <button
              key={lang}
              onClick={() => {
                setLanguage(lang);
                setOpen(false);
              }}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left text-sm
                         transition-colors duration-150
                         ${lang === language
                           ? "bg-[var(--bg-tertiary)] text-[var(--text-primary)] font-medium"
                           : "text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]"
                         }`}
            >
              <span className="text-base leading-none">{FLAGS[lang]}</span>
              <span>{LABELS[lang]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
