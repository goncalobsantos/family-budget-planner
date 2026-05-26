"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import {
  translations,
  type Language,
  type TranslationKey,
} from "@/i18n/translations";

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  dateLocale: string;
}

const LanguageContext = createContext<LanguageContextValue>({
  language: "pt",
  setLanguage: () => {},
  t: (key) => key,
  dateLocale: "pt-PT",
});

const DATE_LOCALES: Record<Language, string> = {
  pt: "pt-PT",
  en: "en-GB",
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("budget-lang") as Language | null;
      if (stored && stored in translations) return stored;
    }
    return "pt";
  });

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem("budget-lang", lang);
    }
  }, []);

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>): string => {
      let text: string = translations[language][key] ?? key;
      if (params) {
        for (const [k, v] of Object.entries(params)) {
          text = text.replaceAll(`{${k}}`, String(v));
        }
      }
      return text;
    },
    [language]
  );

  const dateLocale = DATE_LOCALES[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dateLocale }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
