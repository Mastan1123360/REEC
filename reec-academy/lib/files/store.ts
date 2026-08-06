"use client";

/**
 * lib/files/store.ts
 *
 * The "hello_reec" directory — a persisted (localStorage-backed) personal
 * file store where a student saves the actual deliverables lessons ask
 * for (per the original curriculum's Lab 0.1: "a committed hello_reec
 * Git repository..."). This is deliberately separate from
 * lib/workspace/store.ts, which is an ephemeral scratchpad that resets
 * whenever the Code Workspace panel closes — files saved here persist
 * across sessions, exactly like a real personal project directory would.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { LanguageId } from "@/lib/workspace/languages";

export interface SavedFile {
  id: string;
  name: string;
  language: LanguageId;
  content: string;
  createdAt: number;
  updatedAt: number;
}

interface FilesState {
  files: Record<string, SavedFile>;
  createFile: (name: string, language: LanguageId, content?: string) => string;
  updateContent: (id: string, content: string) => void;
  renameFile: (id: string, name: string) => void;
  deleteFile: (id: string) => void;
}

function makeId() {
  return `f_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export const useFilesStore = create<FilesState>()(
  persist(
    (set) => ({
      files: {},

      createFile: (name, language, content = "") => {
        const id = makeId();
        const now = Date.now();
        set((s) => ({
          files: {
            ...s.files,
            [id]: { id, name, language, content, createdAt: now, updatedAt: now },
          },
        }));
        return id;
      },

      updateContent: (id, content) =>
        set((s) => {
          const file = s.files[id];
          if (!file) return s;
          return { files: { ...s.files, [id]: { ...file, content, updatedAt: Date.now() } } };
        }),

      renameFile: (id, name) =>
        set((s) => {
          const file = s.files[id];
          if (!file) return s;
          return { files: { ...s.files, [id]: { ...file, name, updatedAt: Date.now() } } };
        }),

      deleteFile: (id) =>
        set((s) => {
          const next = { ...s.files };
          delete next[id];
          return { files: next };
        }),
    }),
    { name: "reec-academy-hello-reec" }
  )
);
