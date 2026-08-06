"use client";

/**
 * components/experience/SmartCode.tsx
 *
 * Every standalone fenced code block in a lesson (promoted to its own
 * CodeNode by the parser — see lib/content/parser.ts) is dispatched here
 * automatically. The author never opts in; the engine "compiles" any
 * ```rust ... ``` block into this: Copy, Run (opens the real Code
 * Workspace, pre-filled), and Expand/Collapse for long snippets.
 */

import * as React from "react";
import { Copy, Check, ChevronDown, ChevronUp, Play } from "lucide-react";
import type { CodeNode } from "@/lib/content/types";
import { Button } from "@/components/ui/button";
import { useWorkspaceStore } from "@/lib/workspace/store";
import type { LanguageId } from "@/lib/workspace/languages";

const COLLAPSE_THRESHOLD_LINES = 18;

const LANG_ALIASES: Record<string, LanguageId> = {
  rs: "rust",
  rust: "rust",
  py: "python",
  python: "python",
  java: "java",
  c: "c",
  cpp: "cpp",
  "c++": "cpp",
};

export function SmartCode({ code }: { code: CodeNode }) {
  const openWorkspace = useWorkspaceStore((s) => s.openWorkspace);
  const setLanguage = useWorkspaceStore((s) => s.setLanguage);
  const [copied, setCopied] = React.useState(false);
  const lineCount = code.source.split("\n").length;
  const [collapsed, setCollapsed] = React.useState(lineCount > COLLAPSE_THRESHOLD_LINES);

  async function handleCopy() {
    await navigator.clipboard.writeText(code.source);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function handleRun() {
    const lang = LANG_ALIASES[code.lang.toLowerCase()] ?? "rust";
    openWorkspace(code.source, `${code.lang} snippet`);
    setLanguage(lang);
  }

  return (
    <div className="reec-code-surface group relative my-6 overflow-hidden rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border/60 px-3 py-1.5">
        <span className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
          {code.lang}
        </span>
        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
          <IconButton label="Copy" onClick={handleCopy}>
            {copied ? <Check size={13} /> : <Copy size={13} />}
          </IconButton>
          <IconButton label="Run in Code Workspace" onClick={handleRun}>
            <Play size={13} />
          </IconButton>
          {lineCount > COLLAPSE_THRESHOLD_LINES && (
            <IconButton label={collapsed ? "Expand" : "Collapse"} onClick={() => setCollapsed((c) => !c)}>
              {collapsed ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
            </IconButton>
          )}
        </div>
      </div>

      <div
        className={collapsed ? "relative max-h-64 overflow-hidden" : ""}
        dangerouslySetInnerHTML={{ __html: code.html }}
      />
      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className="flex w-full items-center justify-center gap-1 border-t border-border/60 bg-gradient-to-t from-card to-card/70 py-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <ChevronDown size={12} /> Show {lineCount - COLLAPSE_THRESHOLD_LINES} more lines
        </button>
      )}
    </div>
  );
}

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-6 w-6 text-muted-foreground hover:text-foreground"
      title={label}
      aria-label={label}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}
