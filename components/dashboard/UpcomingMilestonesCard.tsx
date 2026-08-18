"use client";

import * as React from "react";
import Link from "next/link";
import { Calendar, ChevronRight } from "lucide-react";
import type { DashboardPhase, DashboardLesson } from "./types";
import { useProgressStore } from "@/lib/progress/store";
import { useIsMounted } from "@/lib/hooks/useIsMounted";
import { cn } from "@/lib/utils";

interface UpcomingMilestonesCardProps {
  phases: DashboardPhase[];
  allLessons?: DashboardLesson[];
}

export function UpcomingMilestonesCard({ phases }: UpcomingMilestonesCardProps) {
  const isMounted = useIsMounted();
  const completedLessons = useProgressStore((s) => s.completedLessons);
  const getStreak = useProgressStore((s) => s.getStreak);

  // Calculate real phase progress for active and upcoming milestones
  const milestones = React.useMemo(() => {
    const streakInfo = isMounted && getStreak ? getStreak() : { current: 0, best: 0 };
    const list: Array<{
      id: string;
      pill: string;
      pillColor: string;
      title: string;
      progressText: string;
      href: string;
    }> = [];

    // Phase 00 milestone
    const p0 = phases.find((p) => p.phaseNumber === 0);
    const p0Total = p0 ? p0.lessons.length : 3;
    const p0Done = isMounted && p0 ? p0.lessons.filter((l) => completedLessons?.has(l.path)).length : 0;
    list.push({
      id: "phase-00",
      pill: "Phase 00",
      pillColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
      title: `Complete ${p0Total} lesson${p0Total === 1 ? "" : "s"}`,
      progressText: `${p0Done} / ${p0Total}`,
      href: "/phase/0",
    });

    // Phase 01 milestone
    const p1 = phases.find((p) => p.phaseNumber === 1);
    const p1Total = p1 ? p1.lessons.length : 1;
    const p1Done = isMounted && p1 ? p1.lessons.filter((l) => completedLessons?.has(l.path)).length : 0;
    list.push({
      id: "phase-01",
      pill: "Phase 01",
      pillColor: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
      title: `Complete ${p1Total} lesson${p1Total === 1 ? "" : "s"}`,
      progressText: `${p1Done} / ${p1Total}`,
      href: "/phase/1",
    });

    // 7-day streak milestone
    const currentStreak = streakInfo.current || 0;
    list.push({
      id: "streak-milestone",
      pill: "Build Streak",
      pillColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
      title: "Maintain 7-day streak",
      progressText: `${Math.min(7, currentStreak)} / 7`,
      href: "/roadmap",
    });

    return list;
  }, [phases, completedLessons, getStreak, isMounted]);

  return (
    <div
      className="rounded-[22px] border border-slate-900/[0.06] dark:border-white/[0.07] bg-white/68 dark:bg-[#0b1220]/75 p-3 sm:p-3.5 xl:p-4 backdrop-blur-xl backdrop-saturate-160 flex flex-col justify-between transition-all duration-200"
      style={{
        boxShadow: "var(--glass-specular), var(--glass-shadow)",
      }}
    >
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-2">
          <div className="flex items-center gap-1.5">
            <Calendar size={14} className="text-slate-400 dark:text-slate-500" />
            <h3 className="text-xs sm:text-[13px] font-bold text-slate-900 dark:text-slate-100">
              Upcoming Milestones
            </h3>
          </div>

          <Link
            href="/roadmap"
            className="group flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <span>View Roadmap</span>
            <ChevronRight
              size={12}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        </div>

        {/* Milestone Rows */}
        <div className="space-y-2 pt-1">
          {milestones.map((m) => (
            <Link
              key={m.id}
              href={m.href}
              className="flex items-center justify-between py-1.5 px-2 rounded-xl bg-slate-50/70 dark:bg-white/[0.025] border border-slate-900/[0.04] dark:border-white/[0.05] hover:border-blue-500/30 dark:hover:border-white/[0.08] hover:bg-slate-100/80 dark:hover:bg-white/[0.05] transition-all group"
            >
              {/* Left Pill & Title */}
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className={cn(
                    "text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border shrink-0",
                    m.pillColor
                  )}
                >
                  {m.pill}
                </span>
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors truncate">
                  {m.title}
                </span>
              </div>

              {/* Progress Count */}
              <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 shrink-0 ml-2">
                {m.progressText}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
