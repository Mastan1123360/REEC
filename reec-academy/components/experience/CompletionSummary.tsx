"use client";
import { CheckCircle2, Circle, PartyPopper, Github, ListTodo } from "lucide-react";
import { useProgressStore } from "@/lib/progress/store";
import type { Lesson } from "@/lib/content/types";
import type { LessonSemanticModel } from "@/lib/semantic/model";
import { Button } from "@/components/ui/button";

/**
 * Auto-generated end-of-session summary: every Mini Challenge in the
 * lesson becomes a checklist item (backed by the same progress store the
 * MiniChallenge widget itself writes to, so they always agree), plus a
 * Project deliverables/tracker block if the lesson declares a `project`
 * in front matter — matching "project checklist, deliverables,
 * completion tracker, GitHub repository link" from the brief.
 */
export function CompletionSummary({ lesson, model }: { lesson: Lesson; model: LessonSemanticModel }) {
  const completedBlocks = useProgressStore((s) => s.completedBlocks);
  const isLessonDone = useProgressStore((s) => s.completedLessons.has(lesson.path));
  const toggleLesson = useProgressStore((s) => s.toggleLesson);

  const challenges = model.inventory["mini-challenge"]?.blocks ?? [];
  const doneChallenges = challenges.filter((c) => completedBlocks.has(c.id)).length;
  const project = lesson.frontmatter.project;

  return (
    <section className="mt-14 rounded-lg border border-border bg-card p-6">
      <div className="mb-4 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <PartyPopper size={13} /> Completion Summary
      </div>

      {challenges.length > 0 && (
        <div className="mb-5">
          <div className="mb-2 flex items-center gap-1.5 text-sm font-medium">
            <ListTodo size={14} /> Practice checklist ({doneChallenges}/{challenges.length})
          </div>
          <ul className="space-y-1.5">
            {challenges.map((c) => {
              const done = completedBlocks.has(c.id);
              return (
                <li key={c.id} className="flex items-center gap-2 text-sm text-foreground/80">
                  {done ? (
                    <CheckCircle2 size={14} className="shrink-0 text-emerald-500" />
                  ) : (
                    <Circle size={14} className="shrink-0 opacity-40" />
                  )}
                  <span>{c.title ?? "Mini challenge"}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {project && (
        <div className="mb-5 rounded-md border border-border bg-muted/30 p-4">
          <div className="mb-1 text-sm font-medium">
            Project deliverable: {project.name}
            {project.major && <span className="ml-2 text-xs text-primary">[Major]</span>}
          </div>
          <a
            href={`https://github.com/search?q=${encodeURIComponent(project.name)}`}
            target="_blank"
            rel="noreferrer"
            className="mt-1 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <Github size={13} /> Reference implementations on GitHub
          </a>
        </div>
      )}

      <Button variant={isLessonDone ? "default" : "outline"} size="sm" onClick={() => toggleLesson(lesson.path)}>
        <CheckCircle2 size={14} />
        {isLessonDone ? "Lesson marked complete" : "Mark this lesson complete"}
      </Button>
    </section>
  );
}
