"use client";

/**
 * components/experience/InteractiveChecklist.tsx
 *
 * remark-gfm renders markdown task lists (`- [ ] step one`) as
 * `<input type="checkbox" disabled>` — correct for a static document,
 * wrong for an interactive lesson. This component takes a block's
 * rendered HTML, strips `disabled` from every checkbox and tags each one
 * with a stable index, then syncs their checked state imperatively
 * against the progress store (persisted, so a Project's or Mini
 * Challenge's checklist survives navigation) via a single delegated
 * change listener — no per-checkbox React components needed, and the
 * server-rendered HTML (with Shiki-highlighted code, etc.) stays exactly
 * as the parser produced it.
 */

import * as React from "react";
import { useProgressStore } from "@/lib/progress/store";

const CHECKBOX_RE = /<input\s+type="checkbox"([^>]*?)\/?>/g;

function makeInteractive(html: string): { html: string; count: number } {
  let count = 0;
  const out = html.replace(CHECKBOX_RE, (match, attrs: string) => {
    const idx = count++;
    const cleanedAttrs = attrs.replace(/\s*disabled(=""|="disabled")?/g, "");
    return `<input type="checkbox" data-checklist-idx="${idx}"${cleanedAttrs}/>`;
  });
  return { html: out, count };
}

export function InteractiveChecklist({ html, blockId }: { html: string; blockId: string }) {
  const checklist = useProgressStore((s) => s.checklist);
  const toggleChecklistItem = useProgressStore((s) => s.toggleChecklistItem);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const { html: interactiveHtml, count } = React.useMemo(() => makeInteractive(html), [html]);

  // Sync checked state imperatively after every render — dangerouslySetInnerHTML
  // is static, so this is the reliable way to reflect store state onto the
  // actual DOM checkboxes without re-parsing HTML into React elements.
  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const boxes = container.querySelectorAll<HTMLInputElement>("input[data-checklist-idx]");
    boxes.forEach((box) => {
      const idx = box.getAttribute("data-checklist-idx");
      box.checked = !!checklist[`${blockId}-${idx}`];
    });
  });

  function handleChange(e: React.ChangeEvent<HTMLDivElement>) {
    const target = e.target as HTMLElement;
    if (target.tagName === "INPUT" && (target as HTMLInputElement).type === "checkbox") {
      const idx = target.getAttribute("data-checklist-idx");
      if (idx !== null) toggleChecklistItem(`${blockId}-${idx}`);
    }
  }

  const doneCount = Array.from({ length: count }).filter((_, i) => checklist[`${blockId}-${i}`]).length;

  return (
    <div>
      {count > 0 && (
        <div className="mb-2 text-xs text-muted-foreground">
          {doneCount}/{count} complete
        </div>
      )}
      <div
        ref={containerRef}
        onChange={handleChange}
        className="[&_input[type=checkbox]]:mr-2 [&_input[type=checkbox]]:cursor-pointer [&_li:has(input[type=checkbox])]:list-none [&_ul:has(li>input[type=checkbox])]:pl-0 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0"
        dangerouslySetInnerHTML={{ __html: interactiveHtml }}
      />
    </div>
  );
}
