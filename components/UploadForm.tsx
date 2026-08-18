"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, FileText, X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { RoadmapPhase } from "@/lib/content/roadmap";

type Status = { kind: "idle" } | { kind: "error"; message: string } | { kind: "success"; path: string; title: string };

export function UploadForm({
  roadmap,
  initialPhase,
}: {
  roadmap: RoadmapPhase[];
  initialPhase: number;
}) {
  const router = useRouter();
  const [phase, setPhase] = React.useState(initialPhase);
  const [week, setWeek] = React.useState(1);
  const [day, setDay] = React.useState(1);
  const [file, setFile] = React.useState<File | null>(null);
  const [dragActive, setDragActive] = React.useState(false);
  const [status, setStatus] = React.useState<Status>({ kind: "idle" });
  const [submitting, setSubmitting] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  function pickFile(f: File | null | undefined) {
    if (!f) return;
    if (!f.name.toLowerCase().endsWith(".md")) {
      setStatus({ kind: "error", message: "Only .md files are accepted." });
      return;
    }
    setFile(f);
    setStatus({ kind: "idle" });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setStatus({ kind: "error", message: "Choose a .md file first." });
      return;
    }
    setStatus({ kind: "idle" });

    const form = new FormData();
    form.set("file", file);
    form.set("phase", String(phase));
    form.set("week", String(week));
    form.set("day", String(day));

    try {
      const res = await fetch("/api/lessons/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) {
        setStatus({ kind: "error", message: data.error ?? "Upload failed." });
        return;
      }
      setStatus({ kind: "success", path: data.path, title: data.title });
    } catch {
      setStatus({ kind: "error", message: "Network error — is the server running?" });
    }
  }

  return (
    <form
      onSubmit={async (e) => {
        setSubmitting(true);
        await handleSubmit(e);
        setSubmitting(false);
      }}
      className="space-y-6"
    >
      <div className="grid grid-cols-3 gap-3">
        <Field label="Phase">
          <select
            value={phase}
            onChange={(e) => setPhase(Number(e.target.value))}
            className="w-full rounded-xl border border-slate-200/70 dark:border-white/[0.1] bg-white/70 dark:bg-white/[0.05] px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none backdrop-blur-md focus:border-blue-500 transition-all"
            style={{ boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.4)" }}
          >
            {roadmap.map((r) => (
              <option key={r.phase} value={r.phase} className="dark:bg-[#0c1322]">
                Phase {r.phase}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Week">
          <input
            type="number"
            min={1}
            value={week}
            onChange={(e) => setWeek(Number(e.target.value))}
            className="w-full rounded-xl border border-slate-200/70 dark:border-white/[0.1] bg-white/70 dark:bg-white/[0.05] px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none backdrop-blur-md focus:border-blue-500 transition-all"
            style={{ boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.4)" }}
          />
        </Field>
        <Field label="Day">
          <input
            type="number"
            min={1}
            value={day}
            onChange={(e) => setDay(Number(e.target.value))}
            className="w-full rounded-xl border border-slate-200/70 dark:border-white/[0.1] bg-white/70 dark:bg-white/[0.05] px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none backdrop-blur-md focus:border-blue-500 transition-all"
            style={{ boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.4)" }}
          />
        </Field>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400">
        This module will be compiled and saved to:{" "}
        <code className="rounded-md border border-slate-200/60 dark:border-white/[0.08] bg-slate-100/70 dark:bg-white/[0.05] px-1.5 py-0.5 font-mono text-[11px] text-slate-800 dark:text-slate-200">
          content/Phase-{String(phase).padStart(2, "0")}/Week-{String(week).padStart(2, "0")}/Day-
          {String(day).padStart(2, "0")}.md
        </code>
      </p>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          pickFile(e.dataTransfer.files?.[0]);
        }}
        onClick={() => inputRef.current?.click()}
        className={
          "flex cursor-pointer flex-col items-center justify-center gap-2.5 rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-200 " +
          (dragActive
            ? "border-blue-500 bg-blue-500/10 backdrop-blur-xl"
            : "border-slate-300/80 dark:border-white/[0.1] bg-white/50 dark:bg-white/[0.02] hover:border-blue-500/50 hover:bg-white/80 dark:hover:bg-white/[0.04] backdrop-blur-md")
        }
        style={{
          boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.4)",
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".md"
          className="hidden"
          onChange={(e) => pickFile(e.target.files?.[0])}
        />
        {file ? (
          <>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <FileText size={24} />
            </div>
            <div className="text-sm font-bold text-slate-900 dark:text-slate-100">{file.name}</div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setFile(null);
              }}
              className="flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-red-500 transition-colors"
            >
              <X size={12} /> Remove file
            </button>
          </>
        ) : (
          <>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <UploadCloud size={24} />
            </div>
            <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              <span className="font-bold text-blue-600 dark:text-blue-400">Click to choose</span> or drag a{" "}
              <code className="rounded bg-slate-100 dark:bg-white/[0.08] px-1 py-0.5 font-mono text-slate-800 dark:text-slate-200">.md</code> file here
            </div>
          </>
        )}
      </div>

      {status.kind === "error" && (
        <div className="flex items-start gap-2.5 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-xs font-medium text-red-600 dark:text-red-400 backdrop-blur-md">
          <AlertCircle size={15} className="mt-0.5 shrink-0" />
          <span>{status.message}</span>
        </div>
      )}

      {status.kind === "success" && (
        <div className="flex items-start gap-2.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs font-medium text-emerald-700 dark:text-emerald-300 backdrop-blur-md">
          <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-500" />
          <div>
            <div className="font-bold">&ldquo;{status.title}&rdquo; compiled & live.</div>
            <button
              type="button"
              onClick={() => router.push(status.path)}
              className="mt-1 font-semibold text-blue-600 dark:text-blue-400 underline underline-offset-2"
            >
              Open the lesson →
            </button>
          </div>
        </div>
      )}

      <Button type="submit" disabled={submitting || !file} className="w-full h-11 rounded-2xl text-sm">
        {submitting ? <Loader2 size={15} className="animate-spin" /> : <UploadCloud size={15} />}
        {submitting ? "Compiling lesson…" : "Upload & Compile Lesson"}
      </Button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold text-slate-600 dark:text-slate-400">{label}</span>
      {children}
    </label>
  );
}
