"use client";

import * as React from "react";
import Link from "next/link";
import {
  BookOpen,
  Clock,
  Terminal,
  Cpu,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useProgressStore } from "@/lib/progress/store";
import { useIsMounted } from "@/lib/hooks/useIsMounted";
import { cn } from "@/lib/utils";

// Mini SVG Sparkline generator
function MiniSparkline({
  data,
  color = "#3b82f6",
}: {
  data: number[];
  color?: string;
}) {
  const points = data && data.length > 0 ? data : [0, 0, 0, 0, 0, 0, 0];
  const max = Math.max(...points, 1);
  const min = Math.min(...points, 0);
  const range = max - min || 1;
  const width = 64;
  const height = 18;

  const pathCoords = points.map((val, idx) => {
    const x = (idx / (points.length - 1)) * (width - 6) + 3;
    const y = height - 4 - ((val - min) / range) * (height - 8);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const pathData = `M ${pathCoords.join(" L ")}`;

  return (
    <svg width={width} height={height} className="overflow-visible shrink-0">
      <path
        d={pathData}
        fill="none"
        stroke={color}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {points.map((val, idx) => {
        const x = (idx / (points.length - 1)) * (width - 6) + 3;
        const y = height - 4 - ((val - min) / range) * (height - 8);
        return (
          <circle
            key={idx}
            cx={x}
            cy={y}
            r={idx === points.length - 1 || val > 0 ? 2 : 1.25}
            fill={val > 0 ? color : "currentColor"}
            className={val > 0 ? "text-blue-500" : "text-slate-400 dark:text-slate-600"}
          />
        );
      })}
    </svg>
  );
}

export function LearningAnalyticsCard() {
  const isMounted = useIsMounted();
  const completedLessons = useProgressStore((s) => s.completedLessons);
  const completedBlocks = useProgressStore((s) => s.completedBlocks);
  const studyTimeMinutes = useProgressStore((s) => s.studyTimeMinutes);
  const activityLog = useProgressStore((s) => s.activityLog);
  const getWeekDailyMinutes = useProgressStore((s) => s.getWeekDailyMinutes);

  const weekDays = isMounted && getWeekDailyMinutes ? getWeekDailyMinutes() : [];
  const weekMinsData = weekDays.map((d) => d.minutes);

  const completedLessonsCount = isMounted && completedLessons ? completedLessons.size : 0;
  const completedBlocksCount = isMounted && completedBlocks ? completedBlocks.size : 0;
  
  // Real code executions count from activity log or progress
  const codeExecutionsCount = isMounted && Array.isArray(activityLog)
    ? activityLog.filter((a) => a.type === "workspace_practice" || a.iconType === "code").length
    : 0;

  const totalMinutes = isMounted ? studyTimeMinutes || 0 : 0;
  const hoursDisplay =
    totalMinutes >= 60
      ? `${(totalMinutes / 60).toFixed(1).replace(".0", "")} hrs`
      : totalMinutes > 0
      ? "<1 hr"
      : "0 hrs";

  const rows = [
    {
      id: "lessons",
      label: "Lessons Completed",
      icon: BookOpen,
      iconColor: "text-blue-500 bg-blue-500/10 dark:bg-blue-500/20 border-blue-500/30",
      value: String(completedLessonsCount),
      sparkline: [0, 0, 0, completedLessonsCount > 0 ? 1 : 0, 0, completedLessonsCount, completedLessonsCount],
    },
    {
      id: "study_time",
      label: "Study Time",
      icon: Clock,
      iconColor: "text-amber-500 bg-amber-500/10 dark:bg-amber-500/20 border-amber-500/30",
      value: hoursDisplay,
      sparkline: weekMinsData.length > 0 ? weekMinsData : [0, 0, 0, 0, 0, 0, 0],
    },
    {
      id: "code_executions",
      label: "Code Executions",
      icon: Terminal,
      iconColor: "text-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/20 border-emerald-500/30",
      value: String(codeExecutionsCount),
      sparkline: [0, 0, 0, codeExecutionsCount > 0 ? 1 : 0, 0, codeExecutionsCount, codeExecutionsCount],
    },
    {
      id: "problems_solved",
      label: "Problems Solved",
      icon: Cpu,
      iconColor: "text-rose-500 bg-rose-500/10 dark:bg-rose-500/20 border-rose-500/30",
      value: String(completedBlocksCount),
      sparkline: [0, 0, 0, 0, completedBlocksCount > 0 ? 1 : 0, completedBlocksCount, completedBlocksCount],
    },
  ];

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
          <h3 className="text-xs sm:text-[13px] font-bold text-slate-900 dark:text-slate-100">
            Learning Analytics
          </h3>
          <div className="flex items-center gap-1 text-[10.5px] font-medium text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-white/[0.04] border border-slate-900/[0.04] dark:border-white/[0.06]">
            <span>This Week</span>
            <ChevronDown size={11} className="text-slate-400 dark:text-slate-500" />
          </div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-slate-900/[0.04] dark:divide-white/[0.04] py-0.5">
          {rows.map((row) => {
            const Icon = row.icon;
            return (
              <div
                key={row.id}
                className="flex items-center justify-between py-2 sm:py-2.5 gap-2"
              >
                {/* Left: Icon & Label */}
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border",
                      row.iconColor
                    )}
                  >
                    <Icon size={12} />
                  </div>
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">
                    {row.label}
                  </span>
                </div>

                {/* Right: Value & Sparkline */}
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 min-w-[28px] text-right font-mono">
                    {row.value}
                  </span>
                  <MiniSparkline data={row.sparkline} color="#3b82f6" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Link */}
      <div className="pt-2 border-t border-slate-900/[0.04] dark:border-white/[0.04] mt-1 flex justify-center">
        <Link
          href="/roadmap"
          className="group inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <span>View Detailed Analytics</span>
          <ChevronRight
            size={12}
            className="transition-transform group-hover:translate-x-0.5"
          />
        </Link>
      </div>
    </div>
  );
}
