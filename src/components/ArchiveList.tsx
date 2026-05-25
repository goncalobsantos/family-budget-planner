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
      if (!res.ok) throw new Error("Failed to load CSV");
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
      if (!res.ok) throw new Error("Failed to load budget");
      const plan = await res.json();
      onLoadBudget(plan, file.name);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to load file");
    } finally {
      setLoadingFile(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-8 text-[var(--text-muted)]">
        <Loader2 size={18} className="animate-spin" />
        <span className="text-sm">Loading archives…</span>
      </div>
    );
  }

  if (
    !archives ||
    (archives.csvFiles.length === 0 && archives.budgetFiles.length === 0)
  ) {
    return null;
  }

  const formatMonth = (name: string) => {
    // Try to parse YYYY-MM format
    const match = name.match(/(\d{4})-(\d{2})/);
    if (match) {
      const date = new Date(parseInt(match[1]), parseInt(match[2]) - 1);
      return date.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
    }
    return name;
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
          Archives
        </h2>
      </div>

      {/* Monthly Analyses */}
      {archives.csvFiles.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
            Monthly Analyses
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
                    {formatMonth(file.name)}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {file.filename}
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
            Budget Plans
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
                    {formatMonth(file.name)}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    Budget Plan
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
