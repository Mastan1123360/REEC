"use client";

/**
 * app/hello-reec/page.tsx
 *
 * "the hello_reec directory (where users directly store their code as
 * lessons want students to create them)" — the original curriculum's
 * Lab 0.1 asks students to create a committed `hello_reec` repository as
 * their working environment. This page is that directory, lived inside
 * the app: files persist (lib/files/store.ts, localStorage-backed)
 * across sessions, unlike the ephemeral Code Workspace scratchpad.
 */

import * as React from "react";
import {
  FolderGit2, Plus, Trash2, Pencil, Check, X, FileCode, Play,
} from "lucide-react";
import { useFilesStore, type SavedFile } from "@/lib/files/store";
import { getLanguage, type LanguageId } from "@/lib/workspace/languages";
import { CodeEditorPanel } from "@/components/workspace/CodeEditorPanel";
import { useWorkspaceStore } from "@/lib/workspace/store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CompileResult } from "@/lib/workspace/store";

const IDLE_RESULT: CompileResult = { status: "idle", stdout: "", stderr: "" };

export default function HelloReecPage() {
  const files = useFilesStore((s) => s.files);
  const createFile = useFilesStore((s) => s.createFile);
  const updateContent = useFilesStore((s) => s.updateContent);
  const renameFile = useFilesStore((s) => s.renameFile);
  const deleteFile = useFilesStore((s) => s.deleteFile);
  const openInWorkspace = useWorkspaceStore((s) => s.openWorkspace);
  const setWorkspaceLanguage = useWorkspaceStore((s) => s.setLanguage);

  const fileList = React.useMemo(
    () => Object.values(files).sort((a, b) => b.updatedAt - a.updatedAt),
    [files]
  );
  const [selectedId, setSelectedId] = React.useState<string | null>(fileList[0]?.id ?? null);
  const [renamingId, setRenamingId] = React.useState<string | null>(null);
  const [renameDraft, setRenameDraft] = React.useState("");
  const [result, setResult] = React.useState<CompileResult>(IDLE_RESULT);

  const selected = fileList.find((f) => f.id === selectedId) ?? null;

  React.useEffect(() => {
    if (!selected && fileList.length > 0) setSelectedId(fileList[0].id);
  }, [fileList, selected]);

  function handleCreate() {
    const language: LanguageId = "rust";
    const name = `untitled-${fileList.length + 1}.rs`;
    const id = createFile(name, language, getLanguage(language).starter);
    setSelectedId(id);
  }

  async function run() {
    if (!selected || !selected.content.trim()) return;
    setResult({ status: "running", stdout: "", stderr: "" });
    const start = Date.now();
    try {
      const res = await fetch("/api/compile", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ code: selected.content, language: selected.language }),
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

  return (
    <div className="mx-auto flex h-[calc(100vh-3.5rem)] max-w-[1400px]">
      <aside className="flex w-64 shrink-0 flex-col border-r border-border/60">
        <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
          <div className="flex items-center gap-1.5 text-sm font-semibold">
            <FolderGit2 size={15} className="text-primary" /> hello_reec
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCreate} title="New file">
            <Plus size={15} />
          </Button>
        </div>
        <p className="border-b border-border/60 px-4 py-2 text-[11px] leading-relaxed text-muted-foreground">
          Your personal directory. Files here persist in your browser —
          this is where lesson deliverables actually live.
        </p>
        <div className="flex-1 overflow-y-auto">
          {fileList.length === 0 && (
            <div className="px-4 py-8 text-center text-xs text-muted-foreground">
              No files yet. Click <Plus size={11} className="inline" /> to create one.
            </div>
          )}
          <ul>
            {fileList.map((f) => (
              <FileRow
                key={f.id}
                file={f}
                active={f.id === selectedId}
                renaming={renamingId === f.id}
                renameDraft={renameDraft}
                onSelect={() => setSelectedId(f.id)}
                onStartRename={() => {
                  setRenamingId(f.id);
                  setRenameDraft(f.name);
                }}
                onRenameChange={setRenameDraft}
                onRenameCommit={() => {
                  if (renameDraft.trim()) renameFile(f.id, renameDraft.trim());
                  setRenamingId(null);
                }}
                onRenameCancel={() => setRenamingId(null)}
                onDelete={() => {
                  deleteFile(f.id);
                  if (selectedId === f.id) setSelectedId(null);
                }}
              />
            ))}
          </ul>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        {selected ? (
          <>
            <div className="flex items-center justify-between border-b border-border/60 px-4 py-2.5">
              <div className="flex items-center gap-1.5 text-sm font-medium">
                <FileCode size={14} className="text-muted-foreground" />
                {selected.name}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  openInWorkspace(selected.content, selected.name);
                  setWorkspaceLanguage(selected.language);
                }}
              >
                <Play size={13} /> Open in Code Workspace
              </Button>
            </div>
            <CodeEditorPanel
              code={selected.content}
              setCode={(content) => updateContent(selected.id, content)}
              language={selected.language}
              setLanguage={() => {
                /* language is fixed per-file here — create a new file to change language */
              }}
              result={result}
              run={run}
              reset={() => updateContent(selected.id, getLanguage(selected.language).starter)}
              className="flex-1"
            />
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
            <FolderGit2 size={32} className="text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              Select a file, or create a new one to get started.
            </p>
            <Button size="sm" onClick={handleCreate}>
              <Plus size={14} /> New file
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}

function FileRow({
  file,
  active,
  renaming,
  renameDraft,
  onSelect,
  onStartRename,
  onRenameChange,
  onRenameCommit,
  onRenameCancel,
  onDelete,
}: {
  file: SavedFile;
  active: boolean;
  renaming: boolean;
  renameDraft: string;
  onSelect: () => void;
  onStartRename: () => void;
  onRenameChange: (v: string) => void;
  onRenameCommit: () => void;
  onRenameCancel: () => void;
  onDelete: () => void;
}) {
  if (renaming) {
    return (
      <li className="flex items-center gap-1 px-3 py-1.5">
        <input
          autoFocus
          value={renameDraft}
          onChange={(e) => onRenameChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onRenameCommit();
            if (e.key === "Escape") onRenameCancel();
          }}
          className="w-full rounded border border-border bg-background px-1.5 py-0.5 text-xs outline-none focus:ring-1 focus:ring-ring"
        />
        <button onClick={onRenameCommit} className="text-emerald-500">
          <Check size={13} />
        </button>
        <button onClick={onRenameCancel} className="text-muted-foreground">
          <X size={13} />
        </button>
      </li>
    );
  }

  return (
    <li>
      <button
        onClick={onSelect}
        className={cn(
          "group flex w-full items-center justify-between gap-2 px-4 py-2 text-left text-sm hover:bg-accent",
          active && "bg-accent font-medium"
        )}
      >
        <span className="flex min-w-0 items-center gap-2">
          <FileCode size={13} className="shrink-0 text-muted-foreground" />
          <span className="truncate">{file.name}</span>
        </span>
        <span className="flex shrink-0 items-center gap-0.5 opacity-0 group-hover:opacity-100">
          <span
            role="button"
            onClick={(e) => {
              e.stopPropagation();
              onStartRename();
            }}
            className="rounded p-1 text-muted-foreground hover:text-foreground"
          >
            <Pencil size={12} />
          </span>
          <span
            role="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="rounded p-1 text-muted-foreground hover:text-destructive"
          >
            <Trash2 size={12} />
          </span>
        </span>
      </button>
    </li>
  );
}
