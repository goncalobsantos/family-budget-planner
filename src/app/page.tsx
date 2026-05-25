"use client";

import { useCallback, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Upload, FileSpreadsheet, ArrowRight, AlertCircle } from "lucide-react";
import { useBudget } from "@/context/BudgetContext";
import ArchiveList from "@/components/ArchiveList";
import BudgetPlanViewer from "@/components/BudgetPlanViewer";
import type { BudgetPlan } from "@/types/budget";

export default function UploadPage() {
  const router = useRouter();
  const { loadCsv, data, error } = useBudget();
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
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
      loadCsv(csvText);
      setFileName("Archive");
      router.push("/presentation");
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
    <div className="min-h-screen flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-xl"
      >
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-3">
            Family Budget
          </h1>
          <p className="text-[var(--text-muted)] text-lg">
            Upload your monthly Wallet CSV or browse past analyses
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
            relative cursor-pointer rounded-2xl border-2 border-dashed p-12
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
                {data.records.length} records loaded ·{" "}
                {new Date(data.dateRange.start).toLocaleDateString("pt-PT")} —{" "}
                {new Date(data.dateRange.end).toLocaleDateString("pt-PT")}
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                Click to upload a different file
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <Upload
                size={48}
                className={`mx-auto ${isDragging ? "text-[var(--accent-primary)]" : "text-[var(--text-muted)]"}`}
              />
              <p className="text-[var(--text-primary)] font-medium">
                Drop your CSV file here
              </p>
              <p className="text-[var(--text-muted)] text-sm">
                or click to browse
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
            Start Presentation
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
    </div>
  );
}
