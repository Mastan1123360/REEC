import { getAllLessons } from "@/lib/content/discover";
import { CURRICULUM_ROADMAP, roadmapTitleForPhase } from "@/lib/content/roadmap";
import { CurriculumShell } from "@/components/CurriculumShell";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Clock, ChevronRight, Clock3, UploadCloud, Layers } from "lucide-react";
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
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 lg:px-8">
        {/* Phase Header Card */}
        <div
          className="mb-8 rounded-[24px] border border-slate-200/60 dark:border-white/[0.08] bg-white/75 dark:bg-[#0c1322]/80 p-6 sm:p-8 backdrop-blur-2xl backdrop-saturate-150 shadow-xs"
          style={{
            boxShadow:
              "inset 0 1px 0 rgba(255, 255, 255, 0.45), 0 4px 20px -2px rgba(0, 0, 0, 0.03)",
          }}
        >
          <div className="mb-3 flex items-center gap-2">
            <Badge variant="default" className="text-xs px-2.5 py-0.5">
              Phase {String(phaseNum).padStart(2, "0")}
            </Badge>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              {phaseLessons.length} Modules
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            {roadmapTitleForPhase(phaseNum)}
          </h1>
          <p className="mt-2.5 text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
            {roadmapEntry.description}
          </p>
        </div>

        {/* Phase Lessons or Empty State */}
        {phaseLessons.length === 0 ? (
          <div
            className="flex flex-col items-center gap-3 rounded-[22px] border border-dashed border-slate-300/80 dark:border-white/[0.1] bg-white/50 dark:bg-[#0c1322]/50 p-12 text-center backdrop-blur-xl"
            style={{
              boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.4)",
            }}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Clock3 size={24} />
            </div>
            <div className="text-sm font-bold text-slate-900 dark:text-slate-100">Coming Soon</div>
            <p className="max-w-sm text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              No lessons have been uploaded for this phase yet. Once one lands
              under <code className="rounded bg-slate-100 dark:bg-white/[0.08] px-1.5 py-0.5 font-mono text-slate-800 dark:text-slate-200">content/Phase-{String(phaseNum).padStart(2, "0")}</code>,
              it shows up here automatically.
            </p>
            <Link
              href={`/upload?phase=${phaseNum}`}
              className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-slate-200/70 dark:border-white/[0.1] bg-white/80 dark:bg-white/[0.06] px-3.5 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:border-blue-500/50 hover:text-blue-600 dark:hover:text-blue-400 transition-all shadow-xs backdrop-blur-md"
            >
              <UploadCloud size={14} /> Upload the first lesson
            </Link>
          </div>
        ) : (
          <ol className="space-y-3">
            {phaseLessons.map((lesson, i) => (
              <li key={lesson.path}>
                <Link
                  href={lesson.path}
                  className="group flex items-center justify-between gap-4 rounded-[20px] border border-slate-200/60 dark:border-white/[0.08] bg-white/70 dark:bg-[#0c1322]/75 p-4 sm:p-5 backdrop-blur-xl backdrop-saturate-150 shadow-xs hover:border-blue-500/40 hover:bg-white/90 dark:hover:bg-[#111a2e]/90 hover:shadow-md transition-all duration-200"
                  style={{
                    boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.45)",
                  }}
                >
                  <div className="flex min-w-0 items-center gap-3.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-blue-500/30 bg-blue-500/10 text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                        {lesson.frontmatter.title}
                      </div>
                      {lesson.frontmatter.subtitle && (
                        <div className="truncate text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {lesson.frontmatter.subtitle}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span className="hidden items-center gap-1 sm:flex font-mono text-[11px]">
                      <Clock size={12} className="text-slate-400" /> {lesson.readingTimeMinutes}m
                    </span>
                    <ChevronRight size={15} className="transition-transform group-hover:translate-x-0.5 text-slate-400 group-hover:text-blue-500" />
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
