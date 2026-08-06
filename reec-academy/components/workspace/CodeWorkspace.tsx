"use client";

/**
 * components/workspace/CodeWorkspace.tsx
 *
 * The lesson-triggered "compiler on the right side" panel. Fixed-
 * position, full height, independent of page layout — opened from a
 * Worked Example's Run button, a plain SmartCode block, or a Mini
 * Challenge. The actual editor/run/output UI lives in
 * CodeEditorPanel.tsx (shared with the standalone /workspace page);
 * this component owns only the chrome specific to being a lesson-aware
 * overlay: the focus-mode hamburger and the close button.
 */

import * as React from "react";
import { X, Menu, Terminal } from "lucide-react";
import { useWorkspaceStore } from "@/lib/workspace/store";
import { Button } from "@/components/ui/button";
import { CodeEditorPanel } from "./CodeEditorPanel";

export function CodeWorkspace() {
  const isOpen = useWorkspaceStore((s) => s.isOpen);
  const title = useWorkspaceStore((s) => s.title);
  const code = useWorkspaceStore((s) => s.code);
  const language = useWorkspaceStore((s) => s.language);
  const result = useWorkspaceStore((s) => s.result);
  const lessonVisible = useWorkspaceStore((s) => s.lessonVisible);
  const setCode = useWorkspaceStore((s) => s.setCode);
  const setLanguage = useWorkspaceStore((s) => s.setLanguage);
  const run = useWorkspaceStore((s) => s.run);
  const close = useWorkspaceStore((s) => s.closeWorkspace);
  const reset = useWorkspaceStore((s) => s.reset);
  const toggleLessonVisible = useWorkspaceStore((s) => s.toggleLessonVisible);

  React.useEffect(() => {
    if (!isOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  if (!isOpen) return null;

  return (
    <aside className="fixed bottom-0 right-0 top-14 z-40 flex w-full flex-col border-l border-border bg-background shadow-2xl sm:w-[46%] sm:min-w-[420px]">
      <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            title={lessonVisible ? "Hide lesson" : "Show lesson"}
            onClick={toggleLessonVisible}
          >
            <Menu size={15} />
          </Button>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <Terminal size={12} /> Code Workspace
            </div>
            {title && <div className="truncate text-xs text-muted-foreground/80">{title}</div>}
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={close} aria-label="Close workspace">
          <X size={16} />
        </Button>
      </div>

      <CodeEditorPanel
        code={code}
        setCode={setCode}
        language={language}
        setLanguage={(lang) => setLanguage(lang, { resetToStarter: code.trim() === "" })}
        result={result}
        run={run}
        reset={reset}
      />
    </aside>
  );
}
