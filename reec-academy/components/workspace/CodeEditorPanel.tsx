"use client";

/**
 * components/workspace/CodeEditorPanel.tsx
 *
 * The actual editor + Run + output UI, factored out so it can be reused
 * by two genuinely different surfaces without sharing state between
 * them:
 *
 *   1. CodeWorkspace.tsx — the lesson-triggered slide-in panel, wired to
 *      the global zustand store (lib/workspace/store.ts), because it
 *      needs to be opened FROM a lesson widget with pre-filled code.
 *   2. app/workspace/page.tsx — a standalone, general-purpose sandbox
 *      page, wired to its own local component state, because it isn't
 *      tied to any lesson and shouldn't be affected by (or affect) a
 *      workspace a lesson happens to have open elsewhere.
 *
 * This component itself is fully controlled — it owns no state of its
 * own beyond the copy-button flash — so both callers stay in charge of
 * what "run" and "change language" actually do.
 */

import * as React from "react";
import {
  Play, Copy, Check, RotateCcw, Loader2,
  CheckCircle2, XCircle, ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LANGUAGES, type LanguageId } from "@/lib/workspace/languages";
import type { CompileResult } from "@/lib/workspace/store";
import { cn } from "@/lib/utils";

export function CodeEditorPanel({
  code,
  setCode,
  language,
  setLanguage,
  result,
  run,
  reset,
  dark = true,
  className,
}: {
  code: string;
  setCode: (code: string) => void;
  language: LanguageId;
  setLanguage: (language: LanguageId) => void;
  result: CompileResult;
  run: () => void;
  reset: () => void;
  dark?: boolean;
  className?: string;
}) {
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        run();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [run]);

  return (
    <div className={cn("flex flex-1 flex-col overflow-hidden", className)}>
      <div className="flex items-center gap-2 border-b border-border px-3 py-2">
        <LanguagePicker value={language} onChange={setLanguage} />
        <span className="text-[11px] text-muted-foreground">
          {LANGUAGES.find((l) => l.id === language)?.backend === "playground"
            ? "Rust Playground (stable)"
            : "Piston execution API"}
        </span>
      </div>

      <div className="relative flex-1 overflow-hidden">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Tab") {
              e.preventDefault();
              const el = e.currentTarget;
              const start = el.selectionStart;
              const end = el.selectionEnd;
              const next = code.slice(0, start) + "    " + code.slice(end);
              setCode(next);
              requestAnimationFrame(() => {
                el.selectionStart = el.selectionEnd = start + 4;
              });
            }
          }}
          spellCheck={false}
          className={cn(
            "h-full w-full resize-none border-0 p-4 font-mono text-[13px] leading-relaxed outline-none",
            dark ? "bg-[#0d1117] text-[#e6edf3]" : "bg-background text-foreground"
          )}
          placeholder={`// Write ${LANGUAGES.find((l) => l.id === language)?.label ?? "code"} here...`}
        />
      </div>

      <div className="flex items-center gap-2 border-t border-border px-3 py-2">
        <Button size="sm" onClick={run} disabled={result.status === "running"}>
          {result.status === "running" ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
          Run
          <kbd className="ml-1 hidden rounded border border-primary-foreground/30 px-1 text-[10px] opacity-70 sm:inline">
            ⌘⏎
          </kbd>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={async () => {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 1200);
          }}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          Copy
        </Button>
        <Button variant="outline" size="sm" onClick={reset} title="Reset to starter code">
          <RotateCcw size={14} />
        </Button>
      </div>

      <OutputPanel result={result} />
    </div>
  );
}

function LanguagePicker({
  value,
  onChange,
}: {
  value: LanguageId;
  onChange: (id: LanguageId) => void;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as LanguageId)}
        className="appearance-none rounded-md border border-border bg-background py-1 pl-2.5 pr-7 text-xs font-medium outline-none focus:ring-1 focus:ring-ring"
      >
        {LANGUAGES.map((l) => (
          <option key={l.id} value={l.id}>
            {l.label}
          </option>
        ))}
      </select>
      <ChevronDown size={12} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}

function OutputPanel({ result }: { result: CompileResult }) {
  if (result.status === "idle") {
    return (
      <div className="max-h-40 overflow-y-auto border-t border-border px-4 py-3 text-xs text-muted-foreground">
        Output will appear here after you Run.
      </div>
    );
  }

  return (
    <div className="max-h-56 overflow-y-auto border-t border-border">
      <div className="sticky top-0 flex items-center gap-1.5 border-b border-border/60 bg-background px-4 py-1.5 text-xs font-medium">
        {result.status === "running" && (
          <>
            <Loader2 size={12} className="animate-spin text-muted-foreground" />
            <span className="text-muted-foreground">Compiling & running…</span>
          </>
        )}
        {result.status === "success" && (
          <>
            <CheckCircle2 size={12} className="text-emerald-500" />
            <span className="text-emerald-600 dark:text-emerald-400">Success</span>
          </>
        )}
        {result.status === "error" && (
          <>
            <XCircle size={12} className="text-destructive" />
            <span className="text-destructive">Compile / runtime error</span>
          </>
        )}
        {result.durationMs != null && (
          <span className="ml-auto text-[10px] text-muted-foreground">{result.durationMs}ms</span>
        )}
      </div>
      <pre className="whitespace-pre-wrap break-words px-4 py-3 font-mono text-[12px] leading-relaxed">
        {result.stdout && <span className="text-foreground/90">{result.stdout}</span>}
        {result.stdout && result.stderr && "\n"}
        {result.stderr && <span className="text-destructive/90">{result.stderr}</span>}
        {!result.stdout && !result.stderr && result.status !== "running" && (
          <span className="text-muted-foreground">(no output)</span>
        )}
      </pre>
    </div>
  );
}
