"use client";

import * as React from "react";
import Link from "next/link";
import { BookOpen, Box, Terminal, ChevronRight, Sparkles } from "lucide-react";
import type { DashboardLesson } from "./types";
import { useProgressStore } from "@/lib/progress/store";
import { useIsMounted } from "@/lib/hooks/useIsMounted";

interface ContinueLearningCardProps {
  allLessons: DashboardLesson[];
}

export function ContinueLearningCard({ allLessons }: ContinueLearningCardProps) {
  const isMounted = useIsMounted();
  const completedLessons = useProgressStore((s) => s.completedLessons);

  // Derive real lessons: prioritize uncompleted, then available
  const uncompleted = isMounted
    ? allLessons.filter((l) => !completedLessons?.has(l.path))
    : allLessons;
  const candidateLessons = uncompleted.length > 0 ? uncompleted : allLessons;
  const displayLessons = candidateLessons.slice(0, 3);

  // If fewer than 3 lessons in repository, supplement with upcoming phase preview
  const cards: Array<{
    id: string;
    href: string;
    icon: typeof BookOpen;
    tag: string;
    title: string;
    description: string;
    progress: number;
    chips: string[];
    hasArrow?: boolean;
    isUpcoming?: boolean;
  }> = displayLessons.map((l, idx) => {
    const isDone = isMounted && completedLessons?.has(l.path);
    const Icon = idx === 0 ? BookOpen : idx === 1 ? Box : Terminal;
    return {
      id: l.slug,
      href: `/lesson/${l.slug}`,
      icon: Icon,
      tag: `PHASE ${String(l.phase).padStart(2, "0")}`,
      title: l.title,
      description: l.subtitle || l.description || "Foundational systems engineering module.",
      progress: isDone ? 100 : 0,
      chips: l.tags?.slice(0, 3) || [],
      hasArrow: true,
    };
  });

  if (cards.length < 3) {
    cards.push({
      id: "upcoming-phase-01",
      href: "/phase/1",
      icon: Sparkles,
      tag: "UPCOMING",
      title: "Phase 01: Rust Foundations",
      description: "Ownership, borrowing, lifetimes & patterns.",
      progress: 0,
      chips: ["Ownership", "Lifetimes"],
      hasArrow: true,
      isUpcoming: true,
    });
  }

  return (
    <div
      className="rounded-[22px] border border-slate-900/[0.06] dark:border-white/[0.07] bg-white/68 dark:bg-[#0b1220]/75 p-3 sm:p-3.5 xl:p-4 backdrop-blur-xl backdrop-saturate-160 transition-all duration-200"
      style={{
        boxShadow: "var(--glass-specular), var(--glass-shadow)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-2">
        <h3 className="text-xs sm:text-[13px] font-bold text-slate-900 dark:text-slate-100">
          Continue Learning
        </h3>
        <Link
          href="/phase/0"
          className="group flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <span>View All</span>
          <ChevronRight
            size={13}
            className="transition-transform group-hover:translate-x-0.5"
          />
        </Link>
      </div>

      {/* 3 Module Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-2.5">
        {cards.map((m) => {
          const Icon = m.icon;

          return (
            <Link
              key={m.id}
              href={m.href}
              className="group relative flex flex-col justify-between rounded-xl border border-slate-900/[0.06] dark:border-white/[0.06] bg-white/55 dark:bg-white/[0.03] p-2.5 sm:p-3 transition-all duration-150 hover:border-blue-500/40 dark:hover:border-blue-400/30 hover:bg-white/85 dark:hover:bg-white/[0.065] hover:shadow-xs backdrop-blur-md"
              style={{
                boxShadow: "var(--glass-inner-highlight)",
              }}
            >
              <div className="space-y-1">
                <div className="flex items-start gap-2">
                  {/* Blue Icon */}
                  <div className="flex h-6.5 w-6.5 shrink-0 items-center justify-center text-blue-600 dark:text-blue-400">
                    <Icon size={17} className="stroke-[1.75]" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="text-[8.5px] font-mono font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      {m.tag}
                    </div>
                    <h4 className="text-[10.5px] sm:text-[11px] font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                      {m.title}
                    </h4>
                  </div>

                  {m.hasArrow && (
                    <ChevronRight
                      size={13}
                      className="text-slate-400 dark:text-slate-500 shrink-0 transition-transform group-hover:translate-x-0.5"
                    />
                  )}
                </div>

                <p className="text-[9.5px] text-slate-500 dark:text-slate-400 line-clamp-1 leading-snug">
                  {m.description}
                </p>

                {/* Chips if present (Glass Chips) */}
                {m.chips.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {m.chips.map((chip) => (
                      <span
                        key={chip}
                        className="rounded border border-slate-900/[0.05] dark:border-white/[0.06] bg-slate-200/40 dark:bg-white/[0.05] px-1.5 py-0.5 text-[8.5px] font-mono text-slate-600 dark:text-slate-300 truncate max-w-[90px] backdrop-blur-xs"
                      >
                        {chip}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Progress Bar & Percentage */}
              <div className="mt-2 pt-1 flex items-center gap-2">
                <div className="h-1 flex-1 rounded-full bg-slate-200/50 dark:bg-white/[0.08] overflow-hidden border border-slate-900/[0.04] dark:border-white/[0.03]">
                  <div
                    className="h-full rounded-full bg-blue-600 dark:bg-blue-500 transition-all duration-300"
                    style={{ width: `${m.progress}%` }}
                  />
                </div>
                <span className="text-[9.5px] font-mono font-semibold text-slate-400 dark:text-slate-500">
                  {m.progress}%
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
