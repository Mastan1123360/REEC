import Link from "next/link";
import { ArrowLeft, ArrowRight, Clock } from "lucide-react";
import { getAllLessons } from "@/lib/content/discover";
import type { Lesson } from "@/lib/content/types";

export async function NextLessonPreview({ lesson }: { lesson: Lesson }) {
  const lessons = await getAllLessons();
  const idx = lessons.findIndex((l) => l.path === lesson.path);
  const prev = idx > 0 ? lessons[idx - 1] : null;
  const next = idx >= 0 && idx < lessons.length - 1 ? lessons[idx + 1] : null;

  return (
    <div className="mt-8 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
      {prev ? (
        <Link
          href={prev.path}
          className="group rounded-[20px] border border-slate-200/60 dark:border-white/[0.08] bg-white/70 dark:bg-[#0c1322]/75 p-4 sm:p-5 backdrop-blur-xl backdrop-saturate-150 shadow-xs hover:border-blue-500/40 hover:bg-white/90 dark:hover:bg-[#111a2e]/90 hover:shadow-md transition-all duration-200"
          style={{
            boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.45)",
          }}
        >
          <div className="mb-1 flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            <ArrowLeft size={12} className="transition-transform group-hover:-translate-x-0.5" />
            Previous Module
          </div>
          <div className="truncate text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {prev.frontmatter.title}
          </div>
        </Link>
      ) : (
        <div />
      )}
      {next ? (
        <Link
          href={next.path}
          className="group rounded-[20px] border border-blue-500/30 bg-blue-500/5 dark:bg-blue-500/10 p-4 sm:p-5 backdrop-blur-xl backdrop-saturate-150 shadow-xs hover:border-blue-500/50 hover:bg-blue-500/10 dark:hover:bg-blue-500/15 text-right hover:shadow-md transition-all duration-200"
          style={{
            boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.4)",
          }}
        >
          <div className="mb-1 flex items-center justify-end gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400">
            Next Module
            <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
          </div>
          <div className="truncate text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {next.frontmatter.title}
          </div>
          {next.frontmatter.subtitle && (
            <div className="mt-0.5 truncate text-[11px] text-slate-500 dark:text-slate-400">
              {next.frontmatter.subtitle}
            </div>
          )}
          <div className="mt-2 flex items-center justify-end gap-1 font-mono text-[10.5px] text-slate-500 dark:text-slate-400">
            <Clock size={11} /> {next.readingTimeMinutes} min
          </div>
        </Link>
      ) : (
        <div />
      )}
    </div>
  );
}
