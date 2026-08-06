/**
 * lib/widgets/future-plugins.tsx
 *
 * Registers stub entries for the visualizer plugins named in the platform
 * roadmap (Ownership Visualizer, Borrow Timeline, Lifetime Visualizer,
 * Trait Visualizer, Memory Viewer, Assembly Viewer, Tokio Runtime Viewer,
 * Wayland Protocol Viewer). Each renders a "coming soon" placeholder that
 * still respects the widget contract (id, title, props) so lesson authors
 * can start referencing `widgets: [{ type: "ownership-visualizer" }]` in
 * front matter today. Replacing a stub with a real implementation is a
 * single import swap in `index.ts` — the registry key stays stable, so no
 * lesson file ever needs to change.
 */
"use client";
import * as React from "react";
import { Sparkles } from "lucide-react";
import { registerWidget } from "./registry";
import { BlockShell } from "./components/BlockShell";
import type { WidgetProps } from "./registry";

const PLANNED = [
  { key: "ownership-visualizer", label: "Ownership Visualizer" },
  { key: "borrow-timeline", label: "Borrow Timeline" },
  { key: "lifetime-visualizer", label: "Lifetime Visualizer" },
  { key: "trait-visualizer", label: "Trait Visualizer" },
  { key: "memory-viewer", label: "Memory Viewer" },
  { key: "assembly-viewer", label: "Assembly Viewer" },
  { key: "tokio-runtime-viewer", label: "Tokio Runtime Viewer" },
  { key: "wayland-protocol-viewer", label: "Wayland Protocol Viewer" },
  { key: "ownership-timeline", label: "Ownership Timeline" },
  { key: "move-drop-animation", label: "Move / Drop Animation" },
  { key: "borrow-checker-simulation", label: "Borrow Checker Simulation" },
  { key: "reference-graph", label: "Reference Graph" },
  { key: "nll-timeline", label: "NLL Timeline" },
] as const;

function makeStub(label: string) {
  function Stub({ block, title }: WidgetProps) {
    return (
      <BlockShell
        id={block?.id}
        icon={<Sparkles size={14} />}
        label={label}
        title={title ?? block?.title}
        accent="fuchsia"
      >
        <p className="mt-0 text-sm text-muted-foreground">
          This interactive visualizer is on the platform roadmap. It will
          render here without any change to this lesson&rsquo;s markdown —
          the widget registry key (<code>{label}</code>) is already stable.
        </p>
      </BlockShell>
    );
  }
  Stub.displayName = `${label.replace(/\s+/g, "")}Stub`;
  return Stub;
}

export function registerFuturePlugins() {
  for (const plugin of PLANNED) {
    registerWidget({
      key: plugin.key,
      label: plugin.label,
      component: makeStub(plugin.label),
      icon: "Sparkles",
    });
  }
}
