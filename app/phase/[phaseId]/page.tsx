import { getAllLessons } from "@/lib/content/discover";
import { CURRICULUM_ROADMAP, roadmapTitleForPhase } from "@/lib/content/roadmap";
import { CurriculumShell } from "@/components/CurriculumShell";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Clock, ChevronRight, Clock3, UploadCloud } from "lucide-react";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  return CURRICULUM_ROADMAP.map((p) => ({ phaseId: String(p.phase) }));
}

export default async function PhasePage({ params }: { params: { phaseId: string } }) {
  const phaseNum = Number(params.phaseId);
  const roadmapEntry = CURRICULUM_ROADMAP.find((p) => p.phase === phaseNum);
  if (!roadmapEntry) notFound();

  const lessons = await getAllLessons();
  const phaseLessons = lessons.filter((l) => l.frontmatter.phase === phaseNum);

  return (
    <CurriculumShell>
      <div className="mx-auto max-w-3xl px-6 py-10 lg:px-10">
        <Badge variant="outline" className="mb-3">
          Phase {phaseNum}
        </Badge>
        <h1 className="mb-2 text-2xl font-bold tracking-tight">{roadmapTitleForPhase(phaseNum)}</h1>
        <p className="mb-8 text-sm text-muted-foreground">{roadmapEntry.description}</p>

        {phaseLessons.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border py-16 text-center">
            <Clock3 size={28} className="text-muted-foreground" />
            <div className="text-sm font-medium">Coming soon</div>
            <p className="max-w-sm text-xs text-muted-foreground">
              No lessons have been uploaded for this phase yet. Once one lands
              under <code className="rounded bg-muted px-1 py-0.5">content/Phase-{String(phaseNum).padStart(2, "0")}</code>,
              it shows up here automatically.
            </p>
            <Link
              href={`/upload?phase=${phaseNum}`}
              className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:border-primary/50 hover:text-primary"
            >
              <UploadCloud size={13} /> Upload the first lesson
            </Link>
          </div>
        ) : (
          <ol className="space-y-2">
            {phaseLessons.map((lesson, i) => (
              <li key={lesson.path}>
                <Link
                  href={lesson.path}
                  className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card px-4 py-3.5 transition-colors hover:border-primary/50"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="truncate font-medium">{lesson.frontmatter.title}</div>
                      {lesson.frontmatter.subtitle && (
                        <div className="truncate text-xs text-muted-foreground">
                          {lesson.frontmatter.subtitle}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3 text-xs text-muted-foreground">
                    <span className="hidden items-center gap-1 sm:flex">
                      <Clock size={12} /> {lesson.readingTimeMinutes}m
                    </span>
                    <ChevronRight size={14} />
                  </div>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </div>
    </CurriculumShell>
  );
}
