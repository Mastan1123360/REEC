"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import { ChevronRight, CheckCircle2, Circle, Clock3 } from "lucide-react";
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
    <nav className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-72 shrink-0 overflow-y-auto border-r border-border/60 px-3 py-6 text-sm lg:block">
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
  const activeInPhase = lessons.some((l) => l.path === pathname);
  const [open, setOpen] = React.useState(activeInPhase || (phase === 0 && hasContent));
  const doneCount = lessons.filter((l) => completed.has(l.path)).length;

  if (!hasContent) {
    return (
      <Link
        href={`/phase/${phase}`}
        className="mb-1 flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-muted-foreground/60 hover:bg-accent hover:text-muted-foreground"
      >
        <span className="truncate">Phase {phase} — {title}</span>
        <Clock3 size={12} className="shrink-0" />
      </Link>
    );
  }

  return (
    <div className="mb-1">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left font-medium text-foreground/90 hover:bg-accent"
      >
        <span className="truncate">Phase {phase}</span>
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {doneCount}/{lessons.length}
          <ChevronRight size={13} className={cn("transition-transform", open && "rotate-90")} />
        </span>
      </button>
      {open && (
        <ul className="ml-2 mt-0.5 space-y-0.5 border-l border-border/60 pl-3">
          {lessons.map((l) => {
            const isDone = completed.has(l.path);
            const isActive = pathname === l.path;
            return (
              <li key={l.path}>
                <Link
                  href={l.path}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-2 py-1.5 text-[0.8125rem] text-muted-foreground hover:bg-accent hover:text-foreground",
                    isActive && "bg-accent font-medium text-foreground"
                  )}
                >
                  {isDone ? (
                    <CheckCircle2 size={13} className="shrink-0 text-emerald-500" />
                  ) : (
                    <Circle size={13} className="shrink-0 opacity-40" />
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
