"use client";

/**
 * components/workspace/FocusBackdrop.tsx
 *
 * "the lessons should move so they cannot be seen... then we can open
 * it from hamburger" — this is that behavior. While the Code Workspace
 * is open and `lessonVisible` is false (the default the moment it
 * opens), this renders an opaque cover over everything except the
 * workspace panel itself, so the lesson text — and any worked example
 * you might otherwise just copy from — is genuinely not visible. The
 * hamburger icon inside the workspace panel's header (not duplicated
 * here) toggles it back to a split view.
 */

import { useWorkspaceStore } from "@/lib/workspace/store";
import { Menu, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FocusBackdrop() {
  const isOpen = useWorkspaceStore((s) => s.isOpen);
  const lessonVisible = useWorkspaceStore((s) => s.lessonVisible);
  const toggleLessonVisible = useWorkspaceStore((s) => s.toggleLessonVisible);

  if (!isOpen || lessonVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 top-14 z-30 flex flex-col items-center justify-center gap-3 bg-background/98 backdrop-blur-sm sm:right-[46%] sm:min-w-0">
      <PenLine size={26} className="text-muted-foreground/50" />
      <p className="max-w-xs text-center text-sm text-muted-foreground">
        Lesson hidden — focus mode. Write your solution in the workspace
        on the right before peeking back.
      </p>
      <Button variant="outline" size="sm" onClick={toggleLessonVisible}>
        <Menu size={14} /> Show lesson
      </Button>
    </div>
  );
}
