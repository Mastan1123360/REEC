"use client";

/**
 * components/experience/ExpandableCard.tsx
 *
 * Renders a block's HTML collapsed to a short preview (roughly one
 * paragraph, measured by height rather than a fragile character count so
 * code blocks/lists collapse sensibly too) with a "Show more" toggle —
 * the "beautiful expandable insight cards" the platform brief originally
 * asked for Engineering Notes to be. Used by EngineeringNote,
 * ProductionNote, and HistoricalContext so all three "insight" block
 * types behave consistently.
 */

import * as React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const COLLAPSED_HEIGHT = 92; // px — enough for ~2-3 lines of prose

export function ExpandableCard({ html, timeline = false }: { html: string; timeline?: boolean }) {
  const [expanded, setExpanded] = React.useState(false);
  const [overflows, setOverflows] = React.useState(false);
  const contentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = contentRef.current;
    if (el) setOverflows(el.scrollHeight > COLLAPSED_HEIGHT + 8);
  }, [html]);

  return (
    <div>
      <div
        ref={contentRef}
        style={!expanded && overflows ? { maxHeight: COLLAPSED_HEIGHT, overflow: "hidden" } : undefined}
        className={
          (timeline ? "reec-timeline " : "") +
          "relative [&_p:first-child]:mt-0 [&_p:last-child]:mb-0"
        }
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {!expanded && overflows && (
        <div className="pointer-events-none -mt-10 h-10 bg-gradient-to-t from-card to-transparent" />
      )}
      {overflows && (
        <button
          onClick={() => setExpanded((e) => !e)}
          className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  );
}
