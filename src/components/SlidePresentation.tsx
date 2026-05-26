"use client";

import { useState, useCallback, useEffect, useRef, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, LayoutGrid, X } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";

interface SlideLabel {
  short: string;
  icon?: string;
}

interface SlideProps {
  children: ReactNode[];
  labels?: SlideLabel[];
  onSlideChange?: (index: number) => void;
  /** Slot rendered on the left side of the mobile bottom nav bar */
  mobileAction?: ReactNode;
}

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction < 0 ? "100%" : "-100%",
    opacity: 0,
  }),
};

export default function SlidePresentation({
  children,
  labels,
  onSlideChange,
  mobileAction,
}: SlideProps) {
  const slides = children.filter(Boolean) as ReactNode[];
  const [[page, direction], setPage] = useState([0, 0]);
  const total = slides.length;
  const { t } = useLanguage();

  const paginate = useCallback(
    (newDirection: number) => {
      setPage(([prev]) => {
        const next = prev + newDirection;
        if (next < 0 || next >= total) return [prev, 0];
        return [next, newDirection];
      });
    },
    [total]
  );

  const goToSlide = useCallback(
    (index: number) => {
      setPage(([prev]) => [index, index > prev ? 1 : -1]);
    },
    []
  );

  useEffect(() => {
    onSlideChange?.(page);
  }, [page, onSlideChange]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        paginate(1);
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        paginate(-1);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [paginate]);

  // Touch swipe support
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, []);
  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStart.current) return;
      const dx = e.changedTouches[0].clientX - touchStart.current.x;
      const dy = e.changedTouches[0].clientY - touchStart.current.y;
      // Only swipe if horizontal distance > 50px and more horizontal than vertical
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        if (dx < 0) paginate(1);
        else paginate(-1);
      }
      touchStart.current = null;
    },
    [paginate]
  );

  const [navOpen, setNavOpen] = useState(false);
  const [showSwipeHint, setShowSwipeHint] = useState(true);

  // Dismiss swipe hint after first navigation or after 5 seconds
  useEffect(() => {
    if (page > 0) setShowSwipeHint(false);
  }, [page]);

  useEffect(() => {
    const timer = setTimeout(() => setShowSwipeHint(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className="fixed inset-0 bg-[var(--bg-primary)] overflow-hidden flex flex-col"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Progress bar */}
      <div className="h-1 bg-[var(--bg-tertiary)] w-full flex-shrink-0 z-20">
        <motion.div
          className="h-full bg-[var(--accent-primary)]"
          animate={{ width: `${((page + 1) / total) * 100}%` }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      </div>

      {/* Slide content */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={page}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            className="absolute inset-0 flex items-center justify-center p-3 sm:p-6 md:p-8"
          >
            <div className="w-full max-w-6xl mx-auto h-full flex items-center overflow-hidden">
              {slides[page]}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Swipe hint - shown on first slide, fades out */}
        <AnimatePresence>
          {showSwipeHint && page === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 1, duration: 0.4 }}
              className="sm:hidden absolute bottom-4 left-0 right-0 flex justify-center pointer-events-none"
            >
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--bg-secondary)]/90 border border-[var(--border)]/50 backdrop-blur-sm">
                <motion.div
                  animate={{ x: [0, 8, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                >
                  <ChevronRight size={14} className="text-[var(--accent-primary)]" />
                </motion.div>
                <span className="text-[11px] text-[var(--text-muted)]">{t("slide.swipeHint")}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation arrows - hidden on small touch devices, swipe handles it */}
      {page > 0 && (
        <button
          onClick={() => paginate(-1)}
          className="hidden sm:block fixed left-2 md:left-4 top-1/2 -translate-y-1/2 z-30 p-2 md:p-3 rounded-full
                     bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)]
                     text-[var(--text-secondary)] hover:text-[var(--text-primary)]
                     transition-colors duration-200 backdrop-blur-sm"
          aria-label={t("slide.previousSlide")}
        >
          <ChevronLeft size={24} />
        </button>
      )}
      {page < total - 1 && (
        <button
          onClick={() => paginate(1)}
          className="hidden sm:block fixed right-2 md:right-4 top-1/2 -translate-y-1/2 z-30 p-2 md:p-3 rounded-full
                     bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)]
                     text-[var(--text-secondary)] hover:text-[var(--text-primary)]
                     transition-colors duration-200 backdrop-blur-sm"
          aria-label={t("slide.nextSlide")}
        >
          <ChevronRight size={24} />
        </button>
      )}

      {/* Bottom navigation bar */}
      <nav className="flex-shrink-0 z-20 bg-[var(--bg-primary)]/90 backdrop-blur-sm border-t border-[var(--border)]/30">
        {/* Mobile: action / slide menu / next hint */}
        <div className="flex sm:hidden items-center justify-between py-2.5 px-3 safe-area-pb">
          {/* Left: action slot (e.g. save button) */}
          <div className="flex-shrink-0 min-w-[60px]">
            {mobileAction}
          </div>

          {/* Center: slide menu indicator */}
          <button
            onClick={() => setNavOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                       text-xs text-[var(--text-secondary)]
                       hover:bg-[var(--bg-tertiary)] transition-colors"
            aria-label={t("slide.slideMenu")}
          >
            <LayoutGrid size={12} />
            <span className="font-medium">{page + 1} / {total}</span>
          </button>

          {/* Right: prev/next navigation */}
          <div className="flex-shrink-0 min-w-[60px] flex justify-end items-center gap-1">
            {page > 0 && (
              <button
                onClick={() => paginate(-1)}
                className="p-1.5 text-[var(--text-muted)]"
                aria-label={t("slide.previousSlide")}
              >
                <ChevronLeft size={16} />
              </button>
            )}
            {page < total - 1 && (
              <button
                onClick={() => paginate(1)}
                className="flex items-center gap-0.5 text-[11px] font-medium text-[var(--accent-primary)]"
                aria-label={t("slide.nextSlide")}
              >
                <span>{t("slide.next")}</span>
                <ChevronRight size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Desktop: full label navigation */}
        <div className="hidden sm:flex items-center justify-center gap-1.5 py-3 px-4">
          {Array.from({ length: total }).map((_, i) => {
            const label = labels?.[i];
            const isActive = i === page;

            return (
              <button
                key={i}
                onClick={() => goToSlide(i)}
                className={`relative group transition-all duration-300 ${
                  isActive
                    ? "bg-[var(--accent-primary)] text-white rounded-full px-3 py-1.5"
                    : "w-2.5 h-2.5 rounded-full bg-[var(--bg-tertiary)] hover:bg-[var(--accent-primary)]/50 hover:scale-150"
                }`}
                aria-label={label ? label.short : t("slide.slideN", { n: i + 1 })}
                aria-current={isActive ? "step" : undefined}
              >
                {isActive && (
                  <span className="text-xs font-medium whitespace-nowrap flex items-center gap-1">
                    {label?.icon && <span>{label.icon}</span>}
                    {label?.short ?? `${i + 1}`}
                  </span>
                )}
                {!isActive && label && (
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2
                                    px-2 py-1 rounded-md text-[11px] font-medium whitespace-nowrap
                                    bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border)]
                                    shadow-lg opacity-0 scale-90 pointer-events-none
                                    group-hover:opacity-100 group-hover:scale-100 transition-all duration-200">
                    {label.icon && <span className="mr-1">{label.icon}</span>}
                    {label.short}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Slide menu overlay (mobile) */}
      <AnimatePresence>
        {navOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center sm:justify-center"
            onClick={() => setNavOpen(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              className="w-full sm:w-auto sm:max-w-sm sm:rounded-2xl rounded-t-2xl bg-[var(--bg-secondary)] border-t border-[var(--border)] max-h-[70vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]/50">
                <span className="text-sm font-semibold text-[var(--text-primary)]">{t("slide.goToSlide")}</span>
                <button
                  onClick={() => setNavOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors"
                >
                  <X size={16} className="text-[var(--text-muted)]" />
                </button>
              </div>
              <div className="overflow-y-auto max-h-[calc(70vh-48px)] py-2">
                {Array.from({ length: total }).map((_, i) => {
                  const label = labels?.[i];
                  const isActive = i === page;
                  return (
                    <button
                      key={i}
                      onClick={() => { goToSlide(i); setNavOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors
                        ${isActive ? "bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]" : "text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]"}`}
                    >
                      <span className="text-base">{label?.icon ?? "•"}</span>
                      <span className={`text-sm ${isActive ? "font-semibold" : ""}`}>
                        {label?.short ?? t("slide.slideN", { n: i + 1 })}
                      </span>
                      {isActive && (
                        <span className="ml-auto text-[10px] uppercase tracking-wider font-bold text-[var(--accent-primary)]">
                          {t("slide.current")}
                        </span>
                      )}
                    </button>
                  );
                })}
                {/* Language switcher in menu */}
                <div className="mt-2 pt-2 border-t border-[var(--border)]/50 px-4 flex items-center justify-between">
                  <span className="text-xs text-[var(--text-muted)]">{t("presentation.language")}</span>
                  <LanguageSwitcher />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
