"use client";

import { useCallback, useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileSpreadsheet, ArrowRight, AlertCircle, Loader2 } from "lucide-react";
import { useBudget } from "@/context/BudgetContext";
import { useLanguage } from "@/i18n/LanguageContext";
import ArchiveList from "@/components/ArchiveList";
import BudgetPlanViewer from "@/components/BudgetPlanViewer";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import type { BudgetPlan } from "@/types/budget";

export default function UploadPage() {
  const router = useRouter();
  const { loadCsv, clearData, data, error } = useBudget();
  const { t, dateLocale } = useLanguage();
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [loadingArchive, setLoadingArchive] = useState(false);

  // Clear stale data when returning to home page (e.g. browser back from archive)
  useEffect(() => {
    clearData();
    setFileName(null);
  }, [clearData]);
  const [budgetPlan, setBudgetPlan] = useState<{
    plan: BudgetPlan;
    name: string;
  } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.name.endsWith(".csv")) {
        return;
      }
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        loadCsv(text);
      };
      reader.readAsText(file);
    },
    [loadCsv]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const onFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleArchiveCsvLoad = useCallback(
    (csvText: string) => {
      setLoadingArchive(true);
      // Small delay for the exit animation to play, then load and navigate
      setTimeout(() => {
        loadCsv(csvText);
        setTimeout(() => {
          router.push("/presentation?source=archive");
        }, 600);
      }, 100);
    },
    [loadCsv, router]
  );

  const handleBudgetLoad = useCallback(
    (plan: object, name: string) => {
      setBudgetPlan({ plan: plan as BudgetPlan, name });
    },
    []
  );

  // If viewing a budget plan, show the viewer
  if (budgetPlan) {
    return (
      <BudgetPlanViewer
        plan={budgetPlan.plan}
        name={budgetPlan.name}
        onBack={() => setBudgetPlan(null)}
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8">
      <div className="fixed top-3 left-3 sm:top-4 sm:left-4 z-40">
        <LanguageSwitcher />
      </div>
      <AnimatePresence mode="wait">
        {loadingArchive ? (
          <motion.div
            key="archive-loading"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex flex-col items-center gap-4"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
            >
              <Loader2 size={32} className="text-[var(--accent-primary)]" />
            </motion.div>
            <p className="text-sm text-[var(--text-muted)]">
              {t("archives.loadingAnalysis")}
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="main-content"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20, scale: 0.97 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full max-w-xl"
          >
        <div className="text-center mb-6 sm:mb-10">
          <h1 className="text-2xl sm:text-4xl font-bold text-[var(--text-primary)] mb-2 sm:mb-3">
            {t("common.familyBudget")}
          </h1>
          <p className="text-[var(--text-muted)] text-base sm:text-lg">
            {t("upload.subtitle")}
          </p>
        </div>

        {/* Drop zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          onClick={() => fileRef.current?.click()}
          className={`
            relative cursor-pointer rounded-2xl border-2 border-dashed p-6 sm:p-12
            transition-all duration-300 text-center
            ${
              isDragging
                ? "border-[var(--accent-primary)] bg-[var(--accent-primary)]/10"
                : data
                  ? "border-[var(--income)] bg-[var(--income)]/5"
                  : "border-[var(--border)] bg-[var(--bg-secondary)] hover:border-[var(--text-muted)] hover:bg-[var(--bg-tertiary)]"
            }
          `}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            onChange={onFileChange}
            className="hidden"
          />

          {data ? (
            <div className="space-y-3">
              <FileSpreadsheet
                size={48}
                className="mx-auto text-[var(--income)]"
              />
              <p className="text-[var(--text-primary)] font-medium text-lg">
                {fileName}
              </p>
              <p className="text-[var(--text-muted)] text-sm">
                {t("upload.recordsLoaded", {
                  count: data.records.length,
                  start: new Date(data.dateRange.start).toLocaleDateString(dateLocale),
                  end: new Date(data.dateRange.end).toLocaleDateString(dateLocale),
                })}
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                {t("upload.clickDifferentFile")}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <Upload
                size={48}
                className={`mx-auto ${isDragging ? "text-[var(--accent-primary)]" : "text-[var(--text-muted)]"}`}
              />
              <p className="text-[var(--text-primary)] font-medium">
                {t("upload.dropHere")}
              </p>
              <p className="text-[var(--text-muted)] text-sm">
                {t("upload.orClickBrowse")}
              </p>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 rounded-xl bg-[var(--expense)]/10 border border-[var(--expense)]/30
                       flex items-start gap-3"
          >
            <AlertCircle size={20} className="text-[var(--expense)] flex-shrink-0 mt-0.5" />
            <p className="text-sm text-[var(--expense)]">{error}</p>
          </motion.div>
        )}

        {/* Continue button */}
        {data && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onClick={() => router.push("/presentation")}
            className="mt-6 w-full py-4 px-6 rounded-xl font-medium text-lg
                       bg-[var(--accent-primary)] hover:bg-[var(--accent-secondary)]
                       text-white transition-colors duration-200
                       flex items-center justify-center gap-3"
          >
            {t("upload.startPresentation")}
            <ArrowRight size={20} />
          </motion.button>
        )}

        {/* Archive section */}
        <div className="mt-10">
          <ArchiveList
            onLoadCsv={handleArchiveCsvLoad}
            onLoadBudget={handleBudgetLoad}
          />
        </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
