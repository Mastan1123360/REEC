import { getAllLessons, getRoadmapStatus } from "@/lib/content/discover";
import { Sidebar } from "./Sidebar";

/** Server component: fetches the full lesson index + the fixed 9-phase
 * roadmap once and renders the persistent left-hand curriculum
 * navigation beside page content. Used by every route that needs "the
 * curriculum is always one click away" — phase index pages and lesson
 * pages both wrap their content in this. */
export async function CurriculumShell({ children }: { children: React.ReactNode }) {
  const [lessons, roadmap] = await Promise.all([getAllLessons(), getRoadmapStatus()]);
  return (
    <div className="mx-auto flex max-w-[1400px]">
      <Sidebar lessons={lessons} roadmap={roadmap} />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
