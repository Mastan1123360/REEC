/**
 * BlockShell — shared chrome every REEC block widget renders inside.
 * Keeps individual widgets focused on their semantic differences (icon,
 * accent color, layout) while sharing spacing/typography/anchor behavior.
 */
import * as React from "react";
import { cn } from "@/lib/utils";

export function BlockShell({
  id,
  icon,
  label,
  title,
  accent,
  children,
  className,
}: {
  id?: string;
  icon: React.ReactNode;
  label: string;
  title?: string;
  accent: string; // tailwind color token, e.g. "sky"
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={cn(
        "group my-6 scroll-mt-24 overflow-hidden rounded-lg border border-border bg-card",
        className
      )}
    >
      <div
        className={cn(
          "flex items-center gap-2 border-b border-border/60 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide",
          `text-${accent}-600 dark:text-${accent}-400 bg-${accent}-500/[0.06]`
        )}
      >
        <span className="shrink-0">{icon}</span>
        <span>{label}</span>
        {title && (
          <>
            <span className="opacity-40">·</span>
            <span className="truncate normal-case tracking-normal text-foreground/80">
              {title}
            </span>
          </>
        )}
      </div>
      <div className="reec-prose px-5 py-4 text-[0.925rem] leading-relaxed">{children}</div>
    </section>
  );
}
