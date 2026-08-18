"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import { ChevronRight, CheckCircle2, Circle, Clock3, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProgressStore } from "@/lib/progress/store";
import type { Lesson } from "@/lib/content/types";
import type { RoadmapStatus } from "@/lib/content/discover";

export function Sidebar({ lessons, roadmap }: { lessons: Lesson[]; roadmap: RoadmapStatus[] }) {
  const pathname = usePathname();
  const completed = useProgressStore((s) => s.completedLessons);

  const lessonsByPhase = React.useMemo(() => {
    const map = new Map<number, Lesson[]>();
    for (const l of lessons) {
      const arr = map.get(l.frontmatter.phase) ?? [];
      arr.push(l);
      map.set(l.frontmatter.phase, arr);
    }
    return map;
  }, [lessons]);

  return (
    <nav
      className="hidden xl:block h-full w-72 shrink-0 overflow-y-auto border-r border-slate-200/60 dark:border-white/[0.08] bg-white/45 dark:bg-[#090f1d]/50 backdrop-blur-xl px-3.5 py-5 text-sm z-10 select-none"
      style={{
        boxShadow: "inset -1px 0 0 rgba(255, 255, 255, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
      }}
    >
      <div className="mb-3 px-2 flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <BookOpen size={12} className="text-blue-500" />
          <span>Curriculum Outline</span>
        </span>
      </div>
      <div className="space-y-1">
        {roadmap.map((entry) => (
          <PhaseGroup
            key={entry.phase}
            phase={entry.phase}
            title={entry.title}
            hasContent={entry.hasContent}
            lessons={lessonsByPhase.get(entry.phase) ?? []}
            pathname={pathname}
            completed={completed}
          />
        ))}
      </div>
    </nav>
  );
}

function PhaseGroup({
  phase,
  title,
  hasContent,
  lessons,
  pathname,
  completed,
}: {
  phase: number;
  title: string;
  hasContent: boolean;
  lessons: Lesson[];
  pathname: string | null;
  completed: Set<string>;
}) {
  const activeInPhase = lessons.some((l) => l.path === pathname) || pathname === `/phase/${phase}`;
  const [open, setOpen] = React.useState(activeInPhase || (phase === 0 && hasContent));
  const doneCount = lessons.filter((l) => completed.has(l.path)).length;

  if (!hasContent) {
    return (
      <Link
        href={`/phase/${phase}`}
        className="flex items-center justify-between gap-2 rounded-xl px-2.5 py-1.5 text-left text-slate-400 dark:text-slate-500 hover:bg-slate-100/60 dark:hover:bg-white/[0.04] hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
      >
        <span className="truncate text-xs font-medium">Phase {phase} — {title}</span>
        <Clock3 size={12} className="shrink-0" />
      </Link>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden transition-colors">
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-left font-medium transition-all text-xs",
          activeInPhase
            ? "bg-blue-500/12 text-blue-600 dark:text-blue-400 font-semibold border border-blue-500/30"
            : "text-slate-700 dark:text-slate-300 hover:bg-slate-100/60 dark:hover:bg-white/[0.05]"
        )}
        style={
          activeInPhase
            ? {
                boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.4)",
              }
            : undefined
        }
      >
        <span className="truncate tracking-tight font-semibold">
          Phase {String(phase).padStart(2, "0")} · {title}
        </span>
        <span className="flex items-center gap-1 text-[10.5px] font-mono text-slate-400 dark:text-slate-500">
          {doneCount}/{lessons.length}
          <ChevronRight size={12} className={cn("transition-transform duration-200", open && "rotate-90")} />
        </span>
      </button>
      {open && (
        <ul className="ml-3 my-1 space-y-0.5 border-l border-slate-200/60 dark:border-white/[0.08] pl-2">
          {lessons.map((l) => {
            const isDone = completed.has(l.path);
            const isActive = pathname === l.path;
            return (
              <li key={l.path}>
                <Link
                  href={l.path}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-2 py-1 text-[11.5px] transition-all",
                    isActive
                      ? "bg-blue-600 text-white font-medium shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/60 dark:hover:bg-white/[0.05] hover:text-slate-900 dark:hover:text-slate-100"
                  )}
                >
                  {isDone ? (
                    <CheckCircle2 size={12} className={cn("shrink-0", isActive ? "text-white" : "text-blue-500")} />
                  ) : (
                    <Circle size={12} className="shrink-0 opacity-30" />
                  )}
                  <span className="truncate">{l.frontmatter.title}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
