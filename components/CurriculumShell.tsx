import { getAllLessons, getRoadmapStatus } from "@/lib/content/discover";
import { Sidebar } from "./Sidebar";

/** Server component: fetches the full lesson index + the fixed 9-phase
 * roadmap once and renders the secondary curriculum outline navigation
 * beside page content inside the dynamic content area of the persistent REEC shell. */
export async function CurriculumShell({ children }: { children: React.ReactNode }) {
  const [lessons, roadmap] = await Promise.all([getAllLessons(), getRoadmapStatus()]);
  return (
    <div className="flex h-full min-h-0 w-full overflow-hidden">
      <Sidebar lessons={lessons} roadmap={roadmap} />
      <div className="min-w-0 flex-1 overflow-y-auto h-full scroll-smooth">
        {children}
      </div>
    </div>
  );
}
