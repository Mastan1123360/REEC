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
    <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
      {prev ? (
        <Link
          href={prev.path}
          className="group rounded-lg border border-border p-4 transition-colors hover:border-primary/50"
        >
          <div className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
            <ArrowLeft size={12} className="transition-transform group-hover:-translate-x-0.5" />
            Previous
          </div>
          <div className="truncate text-sm font-medium">{prev.frontmatter.title}</div>
        </Link>
      ) : (
        <div />
      )}
      {next ? (
        <Link
          href={next.path}
          className="group rounded-lg border border-primary/30 bg-primary/5 p-4 text-right transition-colors hover:border-primary/60"
        >
          <div className="mb-1 flex items-center justify-end gap-1 text-xs text-primary">
            Next lesson
            <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
          </div>
          <div className="truncate text-sm font-medium">{next.frontmatter.title}</div>
          {next.frontmatter.subtitle && (
            <div className="mt-1 truncate text-xs text-muted-foreground">{next.frontmatter.subtitle}</div>
          )}
          <div className="mt-2 flex items-center justify-end gap-1 text-[11px] text-muted-foreground">
            <Clock size={11} /> {next.readingTimeMinutes} min
          </div>
        </Link>
      ) : (
        <div />
      )}
    </div>
  );
}
