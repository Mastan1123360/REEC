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
      <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center lg:px-8">
        <CheckCircle2 size={32} className="mb-3 text-emerald-500" />
        <h1 className="text-2xl font-bold tracking-tight">Curriculum complete</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          All 9 phases have content. Uploading is disabled — there&rsquo;s
          nothing left on the roadmap to add.
        </p>
        <Link href="/" className="mt-6 text-sm font-medium text-primary underline underline-offset-4">
          Back to the dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-14 lg:px-8">
      <div className="mb-8">
        <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
          <UploadCloud size={12} /> Author a lesson
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Upload a lesson</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Pick where this lesson belongs — Phase, Week, Day — and drop in
          your <code className="rounded bg-muted px-1.5 py-0.5">.md</code>{" "}
          file. The engine parses it, compiles it into an interactive study
          session, and it&rsquo;s live immediately — no rebuild, no restart.
        </p>
      </div>

      <UploadForm roadmap={CURRICULUM_ROADMAP} initialPhase={initialPhase} />
    </div>
  );
}
