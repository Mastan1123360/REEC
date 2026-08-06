"use client";
import { Clock, Target, ListChecks, Bookmark, CheckCircle2, Compass } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useProgressStore } from "@/lib/progress/store";
import type { Lesson } from "@/lib/content/types";
import type { LessonSemanticModel } from "@/lib/semantic/model";
import type { ExperiencePlan } from "@/lib/semantic/interpreter";

const DIFFICULTY_LABEL: Record<number, string> = {
  1: "★☆☆☆☆",
  2: "★★☆☆☆",
  3: "★★★☆☆",
  4: "★★★★☆",
  5: "★★★★★",
};

/**
 * The "Today's Mission" module — the study session's entry point. Its
 * copy is generated, not authored: the synopsis comes from the lesson's
 * own first Story/Mental Model block (lib/semantic/model.ts), the key
 * concept chips come from the ontology match, and everything else comes
 * straight from front matter the author already had to write anyway.
 */
export function MissionHeader({
  lesson,
  model,
  plan,
}: {
  lesson: Lesson;
  model: LessonSemanticModel;
  plan: ExperiencePlan;
}) {
  const { frontmatter } = lesson;
  const isDone = useProgressStore((s) => s.completedLessons.has(lesson.path));
  const isBookmarked = useProgressStore((s) => s.bookmarks.has(lesson.path));
  const toggleLesson = useProgressStore((s) => s.toggleLesson);
  const toggleBookmark = useProgressStore((s) => s.toggleBookmark);

  return (
    <header className="mb-10 border-b border-border/60 pb-8">
      <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <Badge variant="outline">Phase {frontmatter.phase}</Badge>
        {frontmatter.week && <Badge variant="outline">Week {frontmatter.week}</Badge>}
        {frontmatter.day && <Badge variant="outline">Day {frontmatter.day}</Badge>}
        <span className="flex items-center gap-1">
          <Clock size={12} /> {model.estimatedMinutes} min
        </span>
        <span>{DIFFICULTY_LABEL[model.difficulty]}</span>
      </div>

      <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
        <Compass size={12} /> Today&rsquo;s Mission
      </div>

      <h1 className="text-3xl font-bold tracking-tight">{plan.missionTitle}</h1>
      {frontmatter.subtitle && (
        <p className="mt-2 text-lg text-muted-foreground">{frontmatter.subtitle}</p>
      )}
      {plan.missionSynopsis && (
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-foreground/80">
          {plan.missionSynopsis}
        </p>
      )}

      {model.learningObjectives.length > 0 && (
        <div className="mt-6 rounded-lg border border-border bg-muted/30 p-4">
          <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <Target size={13} /> Learning Objectives
          </div>
          <ul className="space-y-1 text-sm">
            {model.learningObjectives.map((obj, i) => (
              <li key={i} className="flex gap-2">
                <ListChecks size={14} className="mt-0.5 shrink-0 text-primary" />
                <span>{obj}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {model.keyTerms.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-muted-foreground">Key concepts:</span>
          {model.keyTerms.map((t) => (
            <Badge key={t} variant="secondary" className="font-mono text-[11px]">
              {t}
            </Badge>
          ))}
        </div>
      )}

      <div className="mt-6 flex gap-2">
        <Button variant={isDone ? "default" : "outline"} size="sm" onClick={() => toggleLesson(lesson.path)}>
          <CheckCircle2 size={14} />
          {isDone ? "Completed" : "Mark lesson complete"}
        </Button>
        <Button variant="outline" size="sm" onClick={() => toggleBookmark(lesson.path)}>
          <Bookmark size={14} fill={isBookmarked ? "currentColor" : "none"} />
          {isBookmarked ? "Bookmarked" : "Bookmark"}
        </Button>
      </div>
    </header>
  );
}
