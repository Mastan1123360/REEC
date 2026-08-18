"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, FileText, X, Loader2, ArrowRight, CornerDownLeft } from "lucide-react";
import { dialogBackdropVariants, dialogContentVariants } from "@/lib/motion";

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

  const navigate = React.useCallback(
    (path: string) => {
      onOpenChange(false);
      setQuery("");
      router.push(path);
    },
    [onOpenChange, router]
  );

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
  }, [open, results, activeIndex, onOpenChange, navigate]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          variants={dialogBackdropVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="fixed inset-0 z-[70] flex items-start justify-center bg-black/30 dark:bg-black/50 pt-[12vh] backdrop-blur-md"
          onClick={() => onOpenChange(false)}
        >
          <motion.div
            variants={dialogContentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full max-w-xl mx-4 overflow-hidden rounded-2xl border border-slate-900/[0.08] dark:border-white/[0.09] bg-white/80 dark:bg-[#0c1424]/92 shadow-2xl backdrop-blur-3xl backdrop-saturate-180"
            style={{
              boxShadow: "var(--glass-specular), var(--glass-shadow-heavy)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-slate-900/[0.06] dark:border-white/[0.06] px-4 py-3.5 bg-slate-50/40 dark:bg-white/[0.02]">
              {loading ? (
                <Loader2 size={18} className="shrink-0 animate-spin text-blue-600 dark:text-blue-400" />
              ) : (
                <Search size={18} className="shrink-0 text-slate-400 dark:text-slate-500" />
              )}
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search lessons, topics, phases, keywords..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-900 dark:text-slate-100"
              />
              <button
                onClick={() => onOpenChange(false)}
                className="shrink-0 rounded-full p-1 text-slate-400 hover:bg-slate-200/60 dark:hover:bg-white/[0.1] hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="max-h-[55vh] overflow-y-auto p-2">
              {!query.trim() && (
                <div className="flex flex-col items-center gap-2.5 px-4 py-10 text-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <Search size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Quick Lesson Search</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Type to search across ownership, concurrency, memory, traits, and more.
                    </p>
                  </div>
                </div>
              )}

              {query.trim() && !loading && results.length === 0 && (
                <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
                  <FileText size={24} className="text-slate-400/40" />
                  <p className="text-sm text-slate-500 dark:text-slate-400">
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
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all " +
                    (i === activeIndex
                      ? "bg-blue-500/12 border border-blue-500/30 text-slate-900 dark:text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]"
                      : "hover:bg-white/60 dark:hover:bg-white/[0.05] border border-transparent text-slate-600 dark:text-slate-400")
                  }
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-mono font-bold">
                    P{r.phase}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {r.title}
                    </div>
                    {r.subtitle && (
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {r.subtitle}
                      </div>
                    )}
                    {r.excerpt && (
                      <div className="text-[10.5px] text-slate-400 dark:text-slate-500 line-clamp-1 mt-0.5">
                        {r.excerpt}
                      </div>
                    )}
                  </div>
                  <ArrowRight
                    size={14}
                    className={
                      "shrink-0 transition-opacity " +
                      (i === activeIndex ? "opacity-100 text-blue-600 dark:text-blue-400" : "opacity-0")
                    }
                  />
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-slate-900/[0.06] dark:border-white/[0.06] px-4 py-2 text-[10px] text-slate-400 dark:text-slate-500 bg-slate-50/40 dark:bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <span>↑↓ Navigate</span>
                <span>↵ Select</span>
                <span>Esc Close</span>
              </div>
              <div className="flex items-center gap-1 font-mono">
                <CornerDownLeft size={10} />
                <span>Enter to jump</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

