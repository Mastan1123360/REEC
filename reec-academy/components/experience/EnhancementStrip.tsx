"use client";

/**
 * components/experience/EnhancementStrip.tsx
 *
 * Renders the AI Lesson Interpreter's per-block enhancement decisions
 * (e.g. "this block introduces ownership → attach Memory Viewer +
 * Ownership Timeline + Move/Drop Animation") as a row of togglable chips
 * directly beneath the block they annotate. Each chip expands the
 * corresponding widget from the registry in place. This is the concrete
 * mechanism behind "if the lesson teaches ownership, automatically
 * enable..." — the interpreter decided WHICH widgets apply, this
 * component is responsible only for laying them out and toggling them.
 */

import * as React from "react";
import { widgetRegistry } from "@/lib/widgets/registry";

export function EnhancementStrip({ keys }: { keys: string[] }) {
  const [active, setActive] = React.useState<string | null>(null);

  return (
    <div className="mb-6 -mt-3">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Suggested for this concept:
        </span>
        {keys.map((key) => {
          const def = widgetRegistry.get(key);
          if (!def) return null;
          const isActive = active === key;
          return (
            <button
              key={key}
              onClick={() => setActive(isActive ? null : key)}
              className={
                "rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors " +
                (isActive
                  ? "border-fuchsia-500/50 bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400"
                  : "border-border text-muted-foreground hover:text-foreground")
              }
            >
              {def.label}
            </button>
          );
        })}
      </div>
      {active && (() => {
        const def = widgetRegistry.get(active);
        if (!def) return null;
        const Component = def.component;
        return <Component />;
      })()}
    </div>
  );
}
