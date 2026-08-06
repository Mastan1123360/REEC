/**
 * lib/progress/store.ts
 *
 * Client-side progress tracking. Everything here is intentionally
 * localStorage-backed (no backend in this scaffold) but isolated behind a
 * single Zustand store, so swapping in a real API-backed persistence layer
 * later only touches this file.
 */
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ProgressState {
  completedLessons: Set<string>;
  completedBlocks: Set<string>;
  bookmarks: Set<string>;
  notes: Record<string, string>;
  /** Individual checklist-item state (e.g. project deliverables, mini
   * challenge steps), keyed "<blockId>-<itemIndex>" — see
   * components/experience/InteractiveChecklist.tsx. */
  checklist: Record<string, boolean>;
  lastVisited: string | null;

  toggleLesson: (lessonPath: string) => void;
  toggleBlock: (blockId: string) => void;
  toggleBookmark: (lessonPath: string) => void;
  setNote: (blockId: string, value: string) => void;
  toggleChecklistItem: (key: string) => void;
  setLastVisited: (path: string) => void;
  progressForPhase: (lessonPaths: string[]) => number;
}

// Zustand + Set doesn't serialize by default; we store arrays and convert.
type PersistedShape = {
  completedLessons: string[];
  completedBlocks: string[];
  bookmarks: string[];
  notes: Record<string, string>;
  checklist: Record<string, boolean>;
  lastVisited: string | null;
};

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      completedLessons: new Set(),
      completedBlocks: new Set(),
      bookmarks: new Set(),
      notes: {},
      checklist: {},
      lastVisited: null,

      toggleLesson: (lessonPath) =>
        set((state) => {
          const next = new Set(state.completedLessons);
          next.has(lessonPath) ? next.delete(lessonPath) : next.add(lessonPath);
          return { completedLessons: next };
        }),

      toggleBlock: (blockId) =>
        set((state) => {
          const next = new Set(state.completedBlocks);
          next.has(blockId) ? next.delete(blockId) : next.add(blockId);
          return { completedBlocks: next };
        }),

      toggleBookmark: (lessonPath) =>
        set((state) => {
          const next = new Set(state.bookmarks);
          next.has(lessonPath) ? next.delete(lessonPath) : next.add(lessonPath);
          return { bookmarks: next };
        }),

      setNote: (blockId, value) =>
        set((state) => ({ notes: { ...state.notes, [blockId]: value } })),

      toggleChecklistItem: (key) =>
        set((state) => ({ checklist: { ...state.checklist, [key]: !state.checklist[key] } })),

      setLastVisited: (path) => set({ lastVisited: path }),

      progressForPhase: (lessonPaths) => {
        const { completedLessons } = get();
        if (lessonPaths.length === 0) return 0;
        const done = lessonPaths.filter((p) => completedLessons.has(p)).length;
        return Math.round((done / lessonPaths.length) * 100);
      },
    }),
    {
      name: "reec-academy-progress",
      partialize: (state): PersistedShape => ({
        completedLessons: [...state.completedLessons],
        completedBlocks: [...state.completedBlocks],
        bookmarks: [...state.bookmarks],
        notes: state.notes,
        checklist: state.checklist,
        lastVisited: state.lastVisited,
      }),
      merge: (persisted, current) => {
        const p = persisted as PersistedShape | undefined;
        if (!p) return current;
        return {
          ...current,
          completedLessons: new Set(p.completedLessons ?? []),
          completedBlocks: new Set(p.completedBlocks ?? []),
          bookmarks: new Set(p.bookmarks ?? []),
          notes: p.notes ?? {},
          checklist: p.checklist ?? {},
          lastVisited: p.lastVisited ?? null,
        };
      },
    }
  )
);
