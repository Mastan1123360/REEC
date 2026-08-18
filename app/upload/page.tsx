import { CURRICULUM_ROADMAP } from "@/lib/content/roadmap";
import { isCurriculumComplete } from "@/lib/content/discover";
import { UploadForm } from "@/components/UploadForm";
import { UploadCloud, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default async function UploadPage({
  searchParams,
}: {
  searchParams: { phase?: string };
}) {
  const initialPhase = searchParams.phase ? Number(searchParams.phase) : 0;
  const complete = await isCurriculumComplete();

  if (complete) {
    return (
      <div className="h-full overflow-y-auto flex flex-col items-center justify-center px-4 py-16 text-center lg:px-8 w-full">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 mb-4">
          <CheckCircle2 size={32} />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">Curriculum complete</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400 max-w-md">
          All 9 phases have content. Uploading is disabled — there&rsquo;s
          nothing left on the roadmap to add.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-1.5 rounded-xl border border-slate-200/70 dark:border-white/[0.1] bg-white/80 dark:bg-white/[0.06] px-4 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:border-blue-500/50 hover:text-blue-600 dark:hover:text-blue-400 transition-all shadow-xs backdrop-blur-md"
        >
          Back to the dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto px-4 py-8 lg:px-8 max-w-xl mx-auto scroll-smooth w-full">
      {/* Glass Header Card */}
      <div
        className="mb-8 rounded-[24px] border border-slate-200/60 dark:border-white/[0.08] bg-white/75 dark:bg-[#0c1322]/80 p-6 sm:p-8 backdrop-blur-2xl backdrop-saturate-150 shadow-xs"
        style={{
          boxShadow:
            "inset 0 1px 0 rgba(255, 255, 255, 0.45), 0 4px 20px -2px rgba(0, 0, 0, 0.03)",
        }}
      >
        <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
          <UploadCloud size={13} /> Author a module
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
          Upload a Module
        </h1>
        <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          Pick where this lesson belongs — Phase, Week, Day — and drop in
          your <code className="rounded bg-slate-100 dark:bg-white/[0.08] px-1.5 py-0.5 font-mono text-slate-800 dark:text-slate-200">.md</code>{" "}
          file. The engine compiles it into an interactive study
          session immediately with zero build step.
        </p>
      </div>

      {/* Glass Form Panel */}
      <div
        className="rounded-[24px] border border-slate-200/60 dark:border-white/[0.08] bg-white/75 dark:bg-[#0c1322]/80 p-6 sm:p-8 backdrop-blur-2xl backdrop-saturate-150 shadow-xs"
        style={{
          boxShadow:
            "inset 0 1px 0 rgba(255, 255, 255, 0.45), 0 4px 20px -2px rgba(0, 0, 0, 0.03)",
        }}
      >
        <UploadForm roadmap={CURRICULUM_ROADMAP} initialPhase={initialPhase} />
      </div>
    </div>
  );
}
