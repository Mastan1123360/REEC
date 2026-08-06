import { CONCEPT_CHAIN } from "@/lib/semantic/ontology";
import type { ConceptNode } from "@/lib/semantic/ontology";
import { GitBranch, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Renders the master concept chain (lib/semantic/ontology.ts) with this
 * lesson's matched concepts highlighted, so a learner can see at a glance
 * where today's material sits relative to everything else in the
 * curriculum — the "Compilation → Machine Code → CPU → Memory →
 * Ownership → Borrowing" picture from the brief, generated per lesson
 * rather than hand-drawn once.
 */
export function ConceptMap({ concepts }: { concepts: ConceptNode[] }) {
  const activeIds = new Set(concepts.map((c) => c.id));
  if (activeIds.size === 0) return null;

  return (
    <section className="mb-10 rounded-lg border border-border bg-card p-5">
      <div className="mb-4 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <GitBranch size={13} /> Concept Map
      </div>
      <div className="flex flex-wrap items-center gap-x-1 gap-y-3">
        {CONCEPT_CHAIN.map((node, i) => {
          const isActive = activeIds.has(node.id);
          return (
            <div key={node.id} className="flex items-center">
              <span
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  isActive
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground/60"
                )}
              >
                {node.label}
              </span>
              {i < CONCEPT_CHAIN.length - 1 && (
                <ArrowRight
                  size={13}
                  className={cn("mx-1 shrink-0", isActive ? "text-primary/60" : "text-border")}
                />
              )}
            </div>
          );
        })}
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        Highlighted nodes are what this lesson covers — the rest of the
        chain is where it came from and where it&rsquo;s heading.
      </p>
    </section>
  );
}
