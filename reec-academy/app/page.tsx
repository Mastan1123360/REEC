import { getAllLessons, getRoadmapStatus } from "@/lib/content/discover";
import { DashboardPhaseGrid } from "@/components/DashboardPhaseGrid";
import { GraduationCap, Layers, Clock, Sparkles } from "lucide-react";

export default async function DashboardPage() {
  const [roadmap, lessons] = await Promise.all([getRoadmapStatus(), getAllLessons()]);
  const totalMinutes = lessons.reduce((sum, l) => sum + l.readingTimeMinutes, 0);
  const liveCount = roadmap.filter((p) => p.hasContent).length;

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-10 lg:px-8">
      <div className="mb-10 max-w-2xl">
        <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
          <Sparkles size={12} /> Interactive Learning Engine
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Rust Elite Engineering Curriculum
        </h1>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">
          Zero to professional systems engineer. Every lesson below is authored
          as plain markdown and rendered by REEC Academy&rsquo;s widget engine —
          the curriculum is data, the platform is the engine.
        </p>
      </div>

      <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat icon={<Layers size={16} />} label="Phases live" value={`${liveCount}/${roadmap.length}`} />
        <Stat icon={<GraduationCap size={16} />} label="Lessons" value={String(lessons.length)} />
        <Stat icon={<Clock size={16} />} label="Est. reading" value={`${Math.round(totalMinutes / 60)}h`} />
        <Stat
          icon={<Sparkles size={16} />}
          label="Widgets registered"
          value="11+"
        />
      </div>

      <DashboardPhaseGrid roadmap={roadmap} lessons={lessons} />
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-2 flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <div className="text-2xl font-bold tracking-tight">{value}</div>
    </div>
  );
}
