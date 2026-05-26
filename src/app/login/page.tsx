"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/i18n/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { t } = useLanguage();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push("/");
        router.refresh();
      } else {
        try {
          const data = await res.json();
          setError(data.error || t("login.loginFailed"));
        } catch {
          setError(t("login.serverError", { status: res.status }));
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : t("login.networkError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] p-4">
      <div className="fixed top-3 left-3 sm:top-4 sm:left-4 z-40">
        <LanguageSwitcher />
      </div>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-6 rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6 sm:p-8"
      >
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            {t("common.familyBudget")}
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            {t("login.enterPassword")}
          </p>
        </div>

        <div className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t("login.password")}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-3 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            autoFocus
            disabled={loading}
          />

          {error && (
            <p className="text-sm text-[var(--expense)] text-center">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full rounded-xl bg-[var(--accent)] px-4 py-3 font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "..." : t("login.enter")}
          </button>
        </div>
      </form>
    </div>
  );
}
