"use client";

/**
 * app/workspace/page.tsx
 *
 * A standalone "write code, run it, learn" sandbox — not tied to any
 * lesson, not affected by (or affecting) a lesson-triggered workspace
 * elsewhere. Deliberately uses its own local state rather than the
 * global zustand workspace store (lib/workspace/store.ts is for the
 * lesson-triggered focus-mode panel specifically); the two are
 * independent by design so opening one never surprises the other.
 */

import * as React from "react";
import { Terminal, Sparkles } from "lucide-react";
import { CodeEditorPanel } from "@/components/workspace/CodeEditorPanel";
import { getLanguage, type LanguageId } from "@/lib/workspace/languages";
import type { CompileResult } from "@/lib/workspace/store";

const IDLE_RESULT: CompileResult = { status: "idle", stdout: "", stderr: "" };

export default function WorkspacePage() {
  const [language, setLanguageState] = React.useState<LanguageId>("rust");
  const [code, setCode] = React.useState(getLanguage("rust").starter);
  const [result, setResult] = React.useState<CompileResult>(IDLE_RESULT);

  function setLanguage(next: LanguageId) {
    setLanguageState(next);
    setCode(getLanguage(next).starter);
    setResult(IDLE_RESULT);
  }

  async function run() {
    if (!code.trim()) return;
    setResult({ status: "running", stdout: "", stderr: "" });
    const start = Date.now();
    try {
      const res = await fetch("/api/compile", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ code, language }),
      });
      const data = await res.json();
      setResult({
        status: data.success ? "success" : "error",
        stdout: data.stdout ?? "",
        stderr: data.stderr ?? "",
        durationMs: Date.now() - start,
      });
    } catch {
      setResult({
        status: "error",
        stdout: "",
        stderr: "Couldn't reach the compile service. Check your internet connection and try again.",
        durationMs: Date.now() - start,
      });
    }
  }

  function reset() {
    setCode(getLanguage(language).starter);
    setResult(IDLE_RESULT);
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-3.5rem)] max-w-[1400px] flex-col px-4 py-6 lg:px-8">
      <div className="mb-4">
        <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
          <Sparkles size={12} /> Practice anytime, no lesson required
        </div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <Terminal size={22} className="text-primary" /> Code Workspace
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Write, run, and learn — Rust, Python, Java, C, and C++. Switch
          languages any time; each one starts you off with a runnable
          template.
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden rounded-lg border border-border">
        <CodeEditorPanel
          code={code}
          setCode={setCode}
          language={language}
          setLanguage={setLanguage}
          result={result}
          run={run}
          reset={reset}
        />
      </div>
    </div>
  );
}
