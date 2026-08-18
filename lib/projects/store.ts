import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { EngineeringProject } from "@/lib/content/projects-data";

interface ProjectStore {
  projects: EngineeringProject[];
  addProject: (project: Omit<EngineeringProject, "id">) => string;
  updateProject: (id: string, updates: Partial<EngineeringProject>) => void;
  deleteProject: (id: string) => void;
  toggleMilestone: (projectId: string, milestoneIndex: number) => void;
}

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      projects: [],
      addProject: (data) => {
        const id = `proj-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        const newProject: EngineeringProject = {
          ...data,
          id,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          projects: [newProject, ...state.projects],
        }));
        return id;
      },
      updateProject: (id, updates) => {
        set((state) => ({
          projects: state.projects.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        }));
      },
      deleteProject: (id) => {
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
        }));
      },
      toggleMilestone: (projectId, milestoneIndex) => {
        set((state) => ({
          projects: state.projects.map((p) => {
            if (p.id !== projectId) return p;
            const milestones = [...p.milestones];
            if (milestones[milestoneIndex]) {
              milestones[milestoneIndex] = {
                ...milestones[milestoneIndex],
                completed: !milestones[milestoneIndex].completed,
              };
            }
            return { ...p, milestones };
          }),
        }));
      },
    }),
    {
      name: "reec_user_projects",
    }
  )
);
