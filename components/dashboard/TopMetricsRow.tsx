"use client";

import * as React from "react";
import { TrendingUp, Flame, Clock, BookOpen } from "lucide-react";
import type { DashboardPhase, DashboardLesson } from "./types";
import { useProgressStore } from "@/lib/progress/store";
import { useIsMounted } from "@/lib/hooks/useIsMounted";
import { cn } from "@/lib/utils";

export function OverallProgressCard({
  allLessons,
}: {
  allLessons: DashboardLesson[];
}) {
  const isMounted = useIsMounted();
  const completedLessons = useProgressStore((s) => s.completedLessons);
  const totalLessons = allLessons?.length || 0;
  const completedCount = isMounted && completedLessons ? completedLessons.size : 0;
  const progressPct =
    totalLessons > 0
      ? Math.min(100, Math.round((completedCount / totalLessons) * 100))
      : 0;

  return (
    <div
      className="rounded-[22px] border border-slate-900/[0.06] dark:border-white/[0.07] bg-white/68 dark:bg-[#0b1220]/75 p-3 sm:p-3.5 xl:p-4 backdrop-blur-xl backdrop-saturate-160 flex flex-col justify-between transition-all duration-200 hover:border-blue-500/30 dark:hover:border-blue-400/25 hover:bg-white/82 dark:hover:bg-[#0e1628]/85"
      style={{
        boxShadow: "var(--glass-specular), var(--glass-shadow)",
      }}
    >
      <div>
        <div className="flex items-center justify-between">
          <span className="text-[11px] sm:text-xs font-semibold text-slate-600 dark:text-slate-400">
            Overall Progress
          </span>
          <TrendingUp size={14} className="text-slate-400 dark:text-slate-500" />
        </div>

        <div className="mt-1 flex items-baseline gap-1">
          <span className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            {progressPct}%
          </span>
        </div>

        {/* Progress Bar with Apple Glass track */}
        <div className="mt-2 h-1.5 w-full rounded-full bg-slate-200/50 dark:bg-white/[0.08] overflow-hidden border border-slate-900/[0.04] dark:border-white/[0.04]">
          <div
            className="h-full rounded-full bg-blue-600 dark:bg-blue-500 transition-all duration-500 shadow-xs"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <div className="mt-2 text-[10.5px] text-slate-500 dark:text-slate-400 font-medium truncate">
        {totalLessons > 0 ? (
          `${completedCount} / ${totalLessons} modules completed`
        ) : (
          "Curriculum initializing"
        )}
      </div>
    </div>
  );
}

export function CurrentStreakCard() {
  const isMounted = useIsMounted();
  const getStreak = useProgressStore((s) => s.getStreak);
  const streakInfo =
    isMounted && getStreak
      ? getStreak()
      : {
          current: 0,
          best: 0,
          daysStatus: [false, false, false, false, false, false, false],
          todayActive: false,
        };

  const streakDays = streakInfo.current || 0;
  const bestStreak = streakInfo.best || streakDays;

  return (
    <div
      className="rounded-[22px] border border-slate-900/[0.06] dark:border-white/[0.07] bg-white/68 dark:bg-[#0b1220]/75 p-3 sm:p-3.5 xl:p-4 backdrop-blur-xl backdrop-saturate-160 flex flex-col justify-between transition-all duration-200 hover:border-blue-500/30 dark:hover:border-blue-400/25 hover:bg-white/82 dark:hover:bg-[#0e1628]/85"
      style={{
        boxShadow: "var(--glass-specular), var(--glass-shadow)",
      }}
    >
      <div>
        <div className="flex items-center justify-between">
          <span className="text-[11px] sm:text-xs font-semibold text-slate-600 dark:text-slate-400">
            Current Streak
          </span>
          <Flame
            size={15}
            className="text-slate-400 dark:text-slate-500 fill-slate-400/20"
          />
        </div>

        <div className="mt-1 flex items-baseline gap-1">
          <span className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            {streakDays}
          </span>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            days
          </span>
        </div>

        {/* Real 7-day Dot Trail Indicator */}
        <div className="mt-2 flex items-center gap-1.5">
          {streakInfo.daysStatus.map((isActiveDay, i) => (
            <div
              key={i}
              title={isActiveDay ? "Study session recorded" : "No session"}
              className={cn(
                "h-1.5 w-1.5 rounded-full transition-all",
                isActiveDay
                  ? "bg-blue-600 dark:bg-blue-500 shadow-xs"
                  : "bg-slate-300/60 dark:bg-white/[0.15]"
              )}
            />
          ))}
        </div>
      </div>

      <div className="mt-2 text-[10.5px] text-slate-500 dark:text-slate-400 font-medium truncate">
        {streakDays > 0 ? `Best: ${bestStreak} days` : "Start a session to build streak"}
      </div>
    </div>
  );
}

export function TimeInvestedCard() {
  const isMounted = useIsMounted();
  const studyTimeMinutes = useProgressStore((s) => s.studyTimeMinutes);
  const getWeekDailyMinutes = useProgressStore((s) => s.getWeekDailyMinutes);

  const weekDays = isMounted && getWeekDailyMinutes ? getWeekDailyMinutes() : [];
  const totalMinutes = isMounted ? studyTimeMinutes || 0 : 0;
  const hoursDisplay =
    totalMinutes >= 60
      ? (totalMinutes / 60).toFixed(1).replace(".0", "")
      : totalMinutes > 0
      ? "<1"
      : "0";

  const thisWeekMinutes = weekDays.reduce((acc, d) => acc + (d.minutes || 0), 0);
  const thisWeekHoursDisplay = (thisWeekMinutes / 60).toFixed(1).replace(".0", "");

  return (
    <div
      className="rounded-[22px] border border-slate-900/[0.06] dark:border-white/[0.07] bg-white/68 dark:bg-[#0b1220]/75 p-3 sm:p-3.5 xl:p-4 backdrop-blur-xl backdrop-saturate-160 flex flex-col justify-between transition-all duration-200 hover:border-blue-500/30 dark:hover:border-blue-400/25 hover:bg-white/82 dark:hover:bg-[#0e1628]/85"
      style={{
        boxShadow: "var(--glass-specular), var(--glass-shadow)",
      }}
    >
      <div>
        <div className="flex items-center justify-between">
          <span className="text-[11px] sm:text-xs font-semibold text-slate-600 dark:text-slate-400">
            Time Invested
          </span>
          <Clock size={14} className="text-slate-400 dark:text-slate-500" />
        </div>

        <div className="mt-1 flex items-baseline gap-1">
          <span className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            {hoursDisplay}
          </span>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            hrs
          </span>
        </div>
      </div>

      <div className="mt-2 text-[10.5px] text-slate-500 dark:text-slate-400 font-medium truncate">
        {thisWeekMinutes > 0 ? `+${thisWeekHoursDisplay}h this week` : "0h this week"}
      </div>
    </div>
  );
}

export function TotalLessonsCard({
  allLessons,
  phasesCount = 9,
}: {
  allLessons: DashboardLesson[];
  phasesCount?: number;
}) {
  const totalLessons = allLessons?.length || 0;

  return (
    <div
      className="rounded-[22px] border border-slate-900/[0.06] dark:border-white/[0.07] bg-white/68 dark:bg-[#0b1220]/75 p-3 sm:p-3.5 xl:p-4 backdrop-blur-xl backdrop-saturate-160 flex flex-col justify-between transition-all duration-200 hover:border-blue-500/30 dark:hover:border-blue-400/25 hover:bg-white/82 dark:hover:bg-[#0e1628]/85"
      style={{
        boxShadow: "var(--glass-specular), var(--glass-shadow)",
      }}
    >
      <div>
        <div className="flex items-center justify-between">
          <span className="text-[11px] sm:text-xs font-semibold text-slate-600 dark:text-slate-400">
            Total Lessons
          </span>
          <BookOpen size={14} className="text-slate-400 dark:text-slate-500" />
        </div>

        <div className="mt-1 flex items-baseline gap-1">
          <span className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            {totalLessons}
          </span>
        </div>
      </div>

      <div className="mt-2 text-[10.5px] text-slate-500 dark:text-slate-400 font-medium truncate">
        Across {phasesCount} phases
      </div>
    </div>
  );
}
