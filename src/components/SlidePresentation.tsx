"use client";

import { useState, useCallback, useEffect, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SlideLabel {
  short: string;
  icon?: string;
}

interface SlideProps {
  children: ReactNode[];
  labels?: SlideLabel[];
  onSlideChange?: (index: number) => void;
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
}: SlideProps) {
  const slides = children.filter(Boolean) as ReactNode[];
  const [[page, direction], setPage] = useState([0, 0]);
  const total = slides.length;

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

  return (
    <div className="fixed inset-0 bg-[var(--bg-primary)] overflow-hidden flex flex-col">
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
            className="absolute inset-0 flex items-center justify-center p-8"
          >
            <div className="w-full max-w-6xl mx-auto h-full flex items-center">
              {slides[page]}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation arrows */}
      {page > 0 && (
        <button
          onClick={() => paginate(-1)}
          className="fixed left-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full
                     bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)]
                     text-[var(--text-secondary)] hover:text-[var(--text-primary)]
                     transition-colors duration-200 backdrop-blur-sm"
          aria-label="Previous slide"
        >
          <ChevronLeft size={24} />
        </button>
      )}
      {page < total - 1 && (
        <button
          onClick={() => paginate(1)}
          className="fixed right-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full
                     bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)]
                     text-[var(--text-secondary)] hover:text-[var(--text-primary)]
                     transition-colors duration-200 backdrop-blur-sm"
          aria-label="Next slide"
        >
          <ChevronRight size={24} />
        </button>
      )}

      {/* Slide navigation */}
      <nav className="flex-shrink-0 flex items-center justify-center gap-1.5 py-3 px-4 z-20">
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
              aria-label={label ? label.short : `Slide ${i + 1}`}
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
      </nav>
    </div>
  );
}
