import { getAllLessons, getRoadmapStatus } from "@/lib/content/discover";
import { RoadmapNavigator } from "@/components/roadmap/RoadmapNavigator";

export const metadata = {
  title: "Curriculum Roadmap — REEC Academy",
  description: "Explore the nine-phase engineering curriculum roadmap in Rust with hierarchical phase, week, and lesson navigation.",
};

export default async function RoadmapPage({
  searchParams,
}: {
  searchParams?: { phase?: string };
}) {
  const [roadmap, lessons] = await Promise.all([
    getRoadmapStatus(),
    getAllLessons(),
  ]);

  const initialPhase = searchParams?.phase !== undefined ? Number(searchParams.phase) : 0;

  return (
    <RoadmapNavigator
      roadmap={roadmap}
      lessons={lessons}
      initialPhase={isNaN(initialPhase) ? 0 : initialPhase}
    />
  );
}
