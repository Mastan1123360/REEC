export interface DashboardLesson {
  slug: string;
  path: string;
  title: string;
  subtitle?: string;
  phase: number;
  week?: number;
  day?: number;
  tags?: string[];
  description?: string;
}

export interface DashboardPhase {
  phaseNumber: number;
  title: string;
  tagline: string;
  hasContent: boolean;
  lessons: DashboardLesson[];
}
