"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, FileText, X, Loader2, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Result {
  title: string;
  subtitle: string | null;
  path: string;
  phase: number;
  excerpt: string;
}

export function SearchDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<Result[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const router = useRouter();

  React.useEffect(() => {
    if (!open) return;
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const handle = setTimeout(async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (res.ok) setResults(await res.json());
      setLoading(false);
    }, 150);
    return () => clearTimeout(handle);
  }, [query, open]);

  React.useEffect(() => setActiveIndex(0), [results]);

  React.useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onOpenChange(false);
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, results.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      }
      if (e.key === "Enter" && results[activeIndex]) {
        navigate(results[activeIndex].path);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, results, activeIndex]);

  function navigate(path: string) {
    onOpenChange(false);
    setQuery("");
    router.push(path);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 pt-[12vh] backdrop-blur-sm"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="w-full max-w-xl animate-in overflow-hidden rounded-xl border border-border bg-popover shadow-2xl fade-in-0 zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2.5 border-b border-border px-4 py-3.5">
          {loading ? (
            <Loader2 size={16} className="shrink-0 animate-spin text-muted-foreground" />
          ) : (
            <Search size={16} className="shrink-0 text-muted-foreground" />
          )}
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search lessons, tags, phases..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <button onClick={() => onOpenChange(false)} className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground">
            <X size={16} />
          </button>
        </div>

        <div className="max-h-[55vh] overflow-y-auto p-1.5">
          {!query.trim() && (
            <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
              <Search size={22} className="text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                Search across every lesson, tag, and phase.
              </p>
            </div>
          )}

          {query.trim() && !loading && results.length === 0 && (
            <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
              <FileText size={22} className="text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                No lessons match &ldquo;{query}&rdquo;.
              </p>
            </div>
          )}

          {results.map((r, i) => (
            <button
              key={r.path}
              onClick={() => navigate(r.path)}
              onMouseEnter={() => setActiveIndex(i)}
              className={
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors " +
                (i === activeIndex ? "bg-accent" : "hover:bg-accent/60")
              }
            >
              <FileText size={15} className="mt-0.5 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <div className="mb-0.5 flex items-center gap-2">
                  <span className="truncate text-sm font-medium">{r.title}</span>
                  <Badge variant="outline" className="shrink-0 py-0 text-[10px]">
                    Phase {r.phase}
                  </Badge>
                </div>
                <div className="truncate text-xs text-muted-foreground">{r.excerpt}</div>
              </div>
              {i === activeIndex && <ArrowRight size={14} className="shrink-0 text-muted-foreground" />}
            </button>
          ))}
        </div>

        {results.length > 0 && (
          <div className="flex items-center gap-3 border-t border-border/60 px-4 py-2 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-border px-1">↑↓</kbd> navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-border px-1">↵</kbd> open
            </span>
            <span className="ml-auto">{results.length} result{results.length === 1 ? "" : "s"}</span>
          </div>
        )}
      </div>
    </div>
  );
}
