"use client";

/**
 * lib/workspace/store.ts
 *
 * The Code Workspace's global state — deliberately NOT persisted to
 * localStorage (unlike the progress store): a code workspace is a
 * scratchpad for the current task, not something you'd expect to reopen
 * days later with stale code in it.
 *
 * `lessonVisible` is the "focus mode" switch: when a Mini Challenge /
 * Failure Lab / Worked Example opens the workspace, the lesson content
 * is hidden by default (`lessonVisible: false`) so you're not just
 * copying the answer that's still on screen — the hamburger control in
 * the workspace panel (components/workspace/CodeWorkspace.tsx) toggles
 * it back into a split view on demand.
 *
 * `language` drives which backend app/api/compile/route.ts uses (see
 * lib/workspace/languages.ts) — this same store backs both the
 * lesson-triggered slide-in panel and the standalone /workspace page,
 * so switching languages behaves identically in both places.
 */

import { create } from "zustand";
import { LANGUAGES, getLanguage, type LanguageId } from "./languages";

export type CompileStatus = "idle" | "running" | "success" | "error";

export interface CompileResult {
  status: CompileStatus;
  stdout: string;
  stderr: string;
  durationMs?: number;
}

interface WorkspaceState {
  isOpen: boolean;
  lessonVisible: boolean;
  title: string;
  code: string;
  language: LanguageId;
  result: CompileResult;

  openWorkspace: (code: string, title: string, language?: LanguageId) => void;
  closeWorkspace: () => void;
  setCode: (code: string) => void;
  setLanguage: (language: LanguageId, opts?: { resetToStarter?: boolean }) => void;
  toggleLessonVisible: () => void;
  run: () => Promise<void>;
  reset: () => void;
}

const IDLE_RESULT: CompileResult = { status: "idle", stdout: "", stderr: "" };

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  isOpen: false,
  lessonVisible: false,
  title: "",
  code: "",
  language: "rust",
  result: IDLE_RESULT,

  openWorkspace: (code, title, language = "rust") =>
    set({ isOpen: true, lessonVisible: false, code, title, language, result: IDLE_RESULT }),

  closeWorkspace: () => set({ isOpen: false, lessonVisible: false, result: IDLE_RESULT }),

  setCode: (code) => set({ code }),

  setLanguage: (language, opts) =>
    set((s) => ({
      language,
      code: opts?.resetToStarter ? getLanguage(language).starter : s.code,
      result: IDLE_RESULT,
    })),

  toggleLessonVisible: () => set((s) => ({ lessonVisible: !s.lessonVisible })),

  reset: () => set((s) => ({ code: getLanguage(s.language).starter, result: IDLE_RESULT })),

  run: async () => {
    const { code, language } = get();
    if (!code.trim()) return;
    set({ result: { status: "running", stdout: "", stderr: "" } });
    const start = Date.now();
    try {
      const res = await fetch("/api/compile", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ code, language }),
      });
      const data = await res.json();
      set({
        result: {
          status: data.success ? "success" : "error",
          stdout: data.stdout ?? "",
          stderr: data.stderr ?? "",
          durationMs: Date.now() - start,
        },
      });
    } catch {
      set({
        result: {
          status: "error",
          stdout: "",
          stderr: "Couldn't reach the compile service. Check your internet connection and try again.",
          durationMs: Date.now() - start,
        },
      });
    }
  },
}));

export { LANGUAGES };
