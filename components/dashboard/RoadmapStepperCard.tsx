"use client";

import * as React from "react";
import Link from "next/link";
import {
  ChevronRight,
  ChevronLeft,
  Box,
  Layers,
  Settings,
  Code2,
  Terminal,
  Shield,
  Coins,
  Cloud,
  Cpu,
  Clock3,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import type { DashboardPhase } from "./types";
import { useProgressStore } from "@/lib/progress/store";
import { useIsMounted } from "@/lib/hooks/useIsMounted";
import { cn } from "@/lib/utils";

interface RoadmapStepperCardProps {
  phases: DashboardPhase[];
}

const PHASE_ICONS = [
  Box, // Phase 0
  Layers, // Phase 1
  Settings, // Phase 2
  Terminal, // Phase 3
  Cpu, // Phase 4
  Shield, // Phase 5
  Coins, // Phase 6
  Cloud, // Phase 7
  Code2, // Phase 8
];

export function RoadmapStepperCard({ phases }: RoadmapStepperCardProps) {
  const isMounted = useIsMounted();
  const completedLessons = useProgressStore((s) => s.completedLessons);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(true);
  const [activePageIndex, setActivePageIndex] = React.useState(0);

  // Check scroll position to update buttons and indicators
  const updateScrollState = React.useCallback(() => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);

    const cardWidth = 260; // approximate card width + gap
    const index = Math.min(
      phases.length - 1,
      Math.max(0, Math.round(scrollLeft / cardWidth))
    );
    setActivePageIndex(index);
  }, [phases.length]);

  React.useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [updateScrollState]);

  const handleScroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    const { clientWidth } = scrollContainerRef.current;
    const scrollAmount = clientWidth * 0.75;
    scrollContainerRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const scrollToIndex = (index: number) => {
    if (!scrollContainerRef.current) return;
    const cards = scrollContainerRef.current.children;
    if (cards[index]) {
      (cards[index] as HTMLElement).scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "start",
      });
    }
  };

  return (
    <div
      className="rounded-[22px] border border-slate-900/[0.06] dark:border-white/[0.07] bg-white/68 dark:bg-[#0b1220]/75 p-3 sm:p-3.5 xl:p-4 backdrop-blur-xl backdrop-saturate-160 transition-all duration-200"
      style={{
        boxShadow: "var(--glass-specular), var(--glass-shadow)",
      }}
    >
      {/* Header with Clean Title & Full Roadmap Link */}
      <div className="flex items-center justify-between pb-2.5">
        <div className="flex items-center gap-2">
          <h3 className="text-xs sm:text-[13px] font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
            <span>Your Curriculum</span>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              {phases.length} Phases
            </span>
          </h3>
        </div>

        {/* Full Roadmap Link */}
        <Link
          href="/roadmap"
          className="group flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <span>View Full Roadmap</span>
          <ChevronRight
            size={12}
            className="transition-transform group-hover:translate-x-0.5"
          />
        </Link>
      </div>

      {/* Carousel Track with Floating Glass Navigation Controls */}
      <div className="relative group/carousel">
        {/* Floating Glass Left Control */}
        <button
          onClick={() => handleScroll("left")}
          disabled={!canScrollLeft}
          aria-label="Previous phases"
          className={cn(
            "group/btn absolute left-0 sm:left-0.5 top-1/2 -translate-y-1/2 z-20 flex h-8 w-8 sm:h-8.5 sm:w-8.5 items-center justify-center rounded-full border border-slate-900/[0.08] dark:border-white/[0.1] bg-white/75 dark:bg-[#0e1628]/90 text-slate-700 dark:text-slate-300 shadow-md backdrop-blur-2xl backdrop-saturate-180 transition-all duration-150 active:scale-[0.97]",
            !canScrollLeft
              ? "opacity-0 pointer-events-none md:opacity-20 md:pointer-events-none"
              : "hover:border-blue-500/40 dark:hover:border-blue-400/35 hover:bg-white/95 dark:hover:bg-[#142038] hover:text-blue-600 dark:hover:text-blue-400 hover:shadow-lg hover:-translate-y-1/2 cursor-pointer"
          )}
          style={{
            boxShadow: "var(--glass-specular), var(--glass-shadow)",
          }}
        >
          <ChevronLeft
            size={15}
            className="transition-transform duration-150 group-hover/btn:-translate-x-0.5"
          />
        </button>

        {/* Floating Glass Right Control */}
        <button
          onClick={() => handleScroll("right")}
          disabled={!canScrollRight}
          aria-label="Next phases"
          className={cn(
            "group/btn absolute right-0 sm:right-0.5 top-1/2 -translate-y-1/2 z-20 flex h-8 w-8 sm:h-8.5 sm:w-8.5 items-center justify-center rounded-full border border-slate-900/[0.08] dark:border-white/[0.1] bg-white/75 dark:bg-[#0e1628]/90 text-slate-700 dark:text-slate-300 shadow-md backdrop-blur-2xl backdrop-saturate-180 transition-all duration-150 active:scale-[0.97]",
            !canScrollRight
              ? "opacity-0 pointer-events-none md:opacity-20 md:pointer-events-none"
              : "hover:border-blue-500/40 dark:hover:border-blue-400/35 hover:bg-white/95 dark:hover:bg-[#142038] hover:text-blue-600 dark:hover:text-blue-400 hover:shadow-lg hover:-translate-y-1/2 cursor-pointer"
          )}
          style={{
            boxShadow: "var(--glass-specular), var(--glass-shadow)",
          }}
        >
          <ChevronRight
            size={15}
            className="transition-transform duration-150 group-hover/btn:translate-x-0.5"
          />
        </button>

        {/* Horizontal Carousel (Every single phase in the curriculum) */}
        <div
          ref={scrollContainerRef}
          className="flex gap-2.5 overflow-x-auto pb-1.5 scrollbar-none snap-x snap-mandatory scroll-smooth -mx-1 px-1 sm:px-2"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
        {phases.map((phase) => {
          const Icon = PHASE_ICONS[phase.phaseNumber] || Box;
          const phaseLessons = phase.lessons;
          const completedCount = isMounted
            ? phaseLessons.filter((l) => completedLessons?.has(l.path)).length
            : 0;
          const isCompleted =
            phaseLessons.length > 0 && completedCount === phaseLessons.length;
          const isInProgress = completedCount > 0 && !isCompleted;
          const progressPct =
            phaseLessons.length > 0
              ? Math.round((completedCount / phaseLessons.length) * 100)
              : 0;

          return (
            <Link
              key={phase.phaseNumber}
              href={`/phase/${phase.phaseNumber}`}
              className={cn(
                "group relative shrink-0 w-[220px] sm:w-[240px] xl:w-[245px] snap-start rounded-2xl border p-3 flex flex-col justify-between transition-all duration-200 text-left backdrop-blur-md hover:-translate-y-0.5",
                isInProgress
                  ? "bg-blue-500/[0.09] dark:bg-blue-500/[0.14] border-blue-500/35 dark:border-blue-400/30 shadow-xs ring-1 ring-blue-500/20"
                  : isCompleted
                  ? "bg-emerald-500/[0.06] dark:bg-emerald-500/[0.08] border-emerald-500/30 dark:border-emerald-500/25"
                  : "bg-white/50 dark:bg-white/[0.03] border-slate-900/[0.06] dark:border-white/[0.06] hover:border-blue-500/40 dark:hover:border-blue-400/30 hover:bg-white/80 dark:hover:bg-white/[0.065]"
              )}
              style={{
                boxShadow:
                  "var(--glass-inner-highlight), 0 2px 10px -2px rgba(15, 23, 42, 0.02)",
              }}
            >
              {/* Top Row: Phase Tag & Icon */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Phase {String(phase.phaseNumber).padStart(2, "0")}
                  </span>
                  <div
                    className={cn(
                      "flex h-6 w-6 items-center justify-center rounded-lg border transition-colors",
                      isCompleted
                        ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                        : isInProgress
                        ? "border-blue-500/40 bg-blue-500/15 text-blue-600 dark:text-blue-400"
                        : "border-slate-900/[0.06] dark:border-white/[0.08] bg-white/60 dark:bg-white/[0.04] text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400"
                    )}
                    style={{
                      boxShadow: "var(--glass-inner-highlight)",
                    }}
                  >
                    {isCompleted ? (
                      <CheckCircle2 size={13} />
                    ) : (
                      <Icon size={13} />
                    )}
                  </div>
                </div>

                {/* Phase Title */}
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {phase.title}
                </h4>

                {/* Description */}
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed h-8">
                  {phase.tagline || "Comprehensive systems engineering module."}
                </p>
              </div>

              {/* Bottom Progress Row */}
              <div className="mt-3 pt-2 border-t border-slate-900/[0.05] dark:border-white/[0.06]">
                <div className="flex items-center justify-between text-[10.5px] font-mono text-slate-500 dark:text-slate-400 mb-1.5">
                  <span>
                    {phaseLessons.length > 0
                      ? `${completedCount}/${phaseLessons.length} lessons`
                      : "Coming soon"}
                  </span>
                  <span
                    className={cn(
                      "font-semibold",
                      isCompleted
                        ? "text-emerald-600 dark:text-emerald-400"
                        : isInProgress
                        ? "text-blue-600 dark:text-blue-400"
                        : ""
                    )}
                  >
                    {phaseLessons.length > 0
                      ? isCompleted
                      ? "100%"
                      : `${progressPct}%`
                      : "0%"}
                  </span>
                </div>

                {/* Progress bar line */}
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200/60 dark:bg-white/[0.08]">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-300",
                      isCompleted
                        ? "bg-emerald-500"
                        : "bg-blue-600 dark:bg-blue-500"
                    )}
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>
            </Link>
          );
        })}
        </div>
      </div>

      {/* Position Indicators (Dots) */}
      <div className="flex items-center justify-center gap-1.5 pt-2">
        {phases.map((_, i) => (
          <button
            key={i}
            onClick={() => scrollToIndex(i)}
            aria-label={`Scroll to phase ${i}`}
            className={cn(
              "h-1.5 rounded-full transition-all duration-200",
              i === activePageIndex
                ? "w-4 bg-blue-600 dark:bg-blue-400"
                : "w-1.5 bg-slate-300/80 dark:bg-white/[0.15] hover:bg-slate-400"
            )}
          />
        ))}
      </div>
    </div>
  );
}
