"use client";

import * as React from "react";
import {
  Clock,
  Plus,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  X,
  Play,
  Pause,
  Flame,
} from "lucide-react";
import { useProgressStore } from "@/lib/progress/store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface StudySessionModalProps {
  open: boolean;
  onClose: () => void;
}

export function StudySessionModal({ open, onClose }: StudySessionModalProps) {
  const [customMinutes, setCustomMinutes] = React.useState("30");
  const [sessionNote, setSessionNote] = React.useState("");
  const [showResetConfirm, setShowResetConfirm] = React.useState(false);

  const addStudyMinutes = useProgressStore((s) => s.addStudyMinutes);
  const resetAllProgress = useProgressStore((s) => s.resetAllProgress);
  const isSessionActive = useProgressStore((s) => s.isSessionActive);
  const setSessionActive = useProgressStore((s) => s.setSessionActive);
  const currentSessionSeconds = useProgressStore((s) => s.currentSessionSeconds);
  const getTodayMinutes = useProgressStore((s) => s.getTodayMinutes);
  const studyTimeMinutes = useProgressStore((s) => s.studyTimeMinutes);

  if (!open) return null;

  const handleQuickAdd = (mins: number) => {
    addStudyMinutes(mins, sessionNote || `Quick practice session (+${mins}m)`);
    setSessionNote("");
    onClose();
  };

  const handleCustomAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const mins = parseInt(customMinutes, 10);
    if (!isNaN(mins) && mins > 0) {
      addStudyMinutes(mins, sessionNote || `Manual study session (+${mins}m)`);
      setSessionNote("");
      onClose();
    }
  };

  const handleReset = () => {
    resetAllProgress();
    setShowResetConfirm(false);
    onClose();
  };

  const formatSessionTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4 backdrop-blur-md animate-in fade-in-0 duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-3xl border border-border/80 bg-card/95 shadow-2xl backdrop-blur-2xl p-6 animate-in zoom-in-95 duration-150 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Clock size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight text-foreground">
                Study & Progress Controls
              </h3>
              <p className="text-xs text-muted-foreground">
                Live time tracking, practice logs & resets
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Live Active Session Card */}
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
              <span className="h-2 w-2 rounded-full bg-primary animate-ping" />
              <span>Current Live Session</span>
            </div>
            <button
              onClick={() => setSessionActive(!isSessionActive)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors border",
                isSessionActive
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted text-muted-foreground border-border"
              )}
            >
              {isSessionActive ? (
                <>
                  <Pause size={11} /> Auto-Tracking Active
                </>
              ) : (
                <>
                  <Play size={11} /> Tracking Paused
                </>
              )}
            </button>
          </div>

          <div className="flex items-baseline justify-between">
            <div>
              <div className="text-2xl font-bold font-mono text-foreground">
                {formatSessionTime(currentSessionSeconds)}
              </div>
              <span className="text-xs text-muted-foreground">This tab session</span>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold font-mono text-foreground">
                {getTodayMinutes()}m
              </div>
              <span className="text-xs text-muted-foreground">Total today</span>
            </div>
          </div>
        </div>

        {/* Quick Log Options */}
        <div className="space-y-3">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
            Quick Log Practice Time
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[15, 30, 60].map((mins) => (
              <button
                key={mins}
                onClick={() => handleQuickAdd(mins)}
                className="flex items-center justify-center gap-1.5 rounded-2xl border border-border/80 bg-muted/40 py-2.5 text-xs font-semibold text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all shadow-sm active:scale-95"
              >
                <Plus size={13} />
                <span>+{mins} mins</span>
              </button>
            ))}
          </div>

          {/* Custom Input */}
          <form onSubmit={handleCustomAdd} className="flex gap-2 pt-1">
            <input
              type="number"
              min="1"
              max="600"
              value={customMinutes}
              onChange={(e) => setCustomMinutes(e.target.value)}
              placeholder="Minutes"
              className="w-28 rounded-xl border border-border/80 bg-background/80 px-3 py-2 text-xs font-mono text-foreground outline-none focus:border-primary"
            />
            <input
              type="text"
              value={sessionNote}
              onChange={(e) => setSessionNote(e.target.value)}
              placeholder="Note (e.g. read chapter 2)"
              className="flex-1 rounded-xl border border-border/80 bg-background/80 px-3 py-2 text-xs text-foreground outline-none focus:border-primary placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              className="rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shrink-0"
            >
              Add
            </button>
          </form>
        </div>

        {/* Reset Progress Section */}
        <div className="border-t border-border/60 pt-4">
          {showResetConfirm ? (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3.5 space-y-2">
              <p className="text-xs font-medium text-rose-500">
                Are you sure you want to reset all curriculum progress, study minutes, and streaks?
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="rounded-xl border border-border/80 bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReset}
                  className="rounded-xl bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700"
                >
                  Yes, Reset Everything
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-rose-500 transition-colors"
            >
              <RotateCcw size={13} />
              <span>Reset all progress & start fresh</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
