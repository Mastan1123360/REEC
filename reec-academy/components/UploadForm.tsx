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

    const uploadingToast = { kind: "idle" as const };
    setStatus(uploadingToast);

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

  const [submitting, setSubmitting] = React.useState(false);

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
            className="w-full rounded-md border border-border bg-background px-2 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
          >
            {roadmap.map((r) => (
              <option key={r.phase} value={r.phase}>
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
            className="w-full rounded-md border border-border bg-background px-2 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
          />
        </Field>
        <Field label="Day">
          <input
            type="number"
            min={1}
            value={day}
            onChange={(e) => setDay(Number(e.target.value))}
            className="w-full rounded-md border border-border bg-background px-2 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
          />
        </Field>
      </div>

      <p className="text-xs text-muted-foreground">
        This lesson will be saved as{" "}
        <code className="rounded bg-muted px-1.5 py-0.5">
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
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 text-center transition-colors " +
          (dragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/40")
        }
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
            <FileText size={28} className="text-primary" />
            <div className="text-sm font-medium">{file.name}</div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setFile(null);
              }}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <X size={12} /> remove
            </button>
          </>
        ) : (
          <>
            <UploadCloud size={28} className="text-muted-foreground" />
            <div className="text-sm">
              <span className="font-medium text-primary">Click to choose</span> or drag a{" "}
              <code className="rounded bg-muted px-1 py-0.5">.md</code> file here
            </div>
          </>
        )}
      </div>

      {status.kind === "error" && (
        <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          <AlertCircle size={15} className="mt-0.5 shrink-0" />
          {status.message}
        </div>
      )}
      {status.kind === "success" && (
        <div className="flex items-start gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/5 px-3 py-2 text-sm text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 size={15} className="mt-0.5 shrink-0" />
          <div>
            <div className="font-medium">&ldquo;{status.title}&rdquo; is live.</div>
            <button
              type="button"
              onClick={() => router.push(status.path)}
              className="underline underline-offset-2"
            >
              Open the lesson →
            </button>
          </div>
        </div>
      )}

      <Button type="submit" disabled={submitting || !file} className="w-full">
        {submitting ? <Loader2 size={15} className="animate-spin" /> : <UploadCloud size={15} />}
        {submitting ? "Compiling lesson…" : "Upload & compile lesson"}
      </Button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
