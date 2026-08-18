"use client";

import * as React from "react";
import Link from "next/link";
import { Check, Terminal, Code2, Bookmark, Clock, ChevronRight } from "lucide-react";
import { useProgressStore, type ActivityItem } from "@/lib/progress/store";
import { useIsMounted } from "@/lib/hooks/useIsMounted";
import { cn } from "@/lib/utils";

function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diffMs = now - timestamp;
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

export function RecentActivityCard() {
  const isMounted = useIsMounted();
  const activityLog = useProgressStore((s) => s.activityLog);
  const safeActivities = isMounted && Array.isArray(activityLog) ? activityLog : [];
  const displayActivities = safeActivities.slice(0, 3);

  const getActivityIcon = (act: ActivityItem) => {
    if (act.iconType === "check" || act.type === "lesson_completed") {
      return { icon: Check, isCheck: true };
    }
    if (act.type === "workspace_practice") {
      return { icon: Terminal, isCheck: false };
    }
    if (act.iconType === "bookmark" || act.type.startsWith("bookmark")) {
      return { icon: Bookmark, isCheck: false };
    }
    if (act.iconType === "time" || act.type === "study_session") {
      return { icon: Clock, isCheck: false };
    }
    return { icon: Code2, isCheck: false };
  };

  return (
    <div
      className="rounded-[22px] border border-slate-900/[0.06] dark:border-white/[0.07] bg-white/68 dark:bg-[#0b1220]/75 p-2.5 sm:p-3 xl:p-3.5 backdrop-blur-xl backdrop-saturate-160 transition-all duration-200"
      style={{
        boxShadow: "var(--glass-specular), var(--glass-shadow)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-1.5">
        <h3 className="text-xs sm:text-[13px] font-bold text-slate-900 dark:text-slate-100">
          Recent Activity
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

      {/* Real Activity List or Clean Empty State */}
      {displayActivities.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-900/[0.05] dark:divide-white/[0.06] pt-0.5">
          {displayActivities.map((act, idx) => {
            const { icon: Icon, isCheck } = getActivityIcon(act);
            const relativeTime = formatRelativeTime(act.timestamp);
            const targetHref = act.path
              ? act.path.startsWith("/")
                ? act.path
                : `/lesson/${act.path.replace(/\.md$/, "")}`
              : "/phase/0";

            return (
              <Link
                key={act.id}
                href={targetHref}
                className={cn(
                  "group flex items-center gap-2 py-1 transition-colors hover:text-blue-600 dark:hover:text-blue-400",
                  idx === 0 ? "sm:pr-2.5" : idx === 1 ? "sm:px-2.5" : "sm:pl-2.5"
                )}
              >
                {isCheck ? (
                  <div
                    className="flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-full border border-blue-500/35 bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 shadow-xs"
                    style={{
                      boxShadow: "var(--glass-inner-highlight)",
                    }}
                  >
                    <Check size={11} strokeWidth={2.5} />
                  </div>
                ) : (
                  <div className="flex h-5.5 w-5.5 shrink-0 items-center justify-center text-blue-600 dark:text-blue-400">
                    <Icon size={15} strokeWidth={1.8} />
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <div className="text-[10.5px] font-medium text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate transition-colors">
                    {act.title}
                  </div>
                  <div className="text-[9.5px] text-slate-400 dark:text-slate-500">
                    {relativeTime}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="py-2 text-center text-[10.5px] text-slate-400 dark:text-slate-500">
          Your learning activity will appear here as you study.
        </div>
      )}
    </div>
  );
}
