/**
 * lib/widgets/index.ts
 *
 * Single import point that registers every built-in widget. The app root
 * layout imports this module once (for its side effects) before any
 * lesson renders. Future plugins — Ownership Visualizer, Borrow Timeline,
 * Lifetime Visualizer, Trait Visualizer, Memory Viewer, Assembly Viewer,
 * Tokio Runtime Viewer, Wayland Protocol Viewer — are added by:
 *
 *   1. Implementing a component in lib/widgets/components/YourWidget.tsx
 *      that accepts `WidgetProps`.
 *   2. Adding one `registerWidget({...})` call below (or in its own
 *      plugin file imported here).
 *
 * No changes to the parser, the remark plugin, the Lesson Renderer, or any
 * existing lesson markdown file are ever required — this is the whole
 * point of the plugin boundary.
 */

import { registerWidget } from "./registry";
import { StoryCard } from "./components/StoryCard";
import { MentalModelCard } from "./components/MentalModelCard";
import { EngineeringNote } from "./components/EngineeringNote";
import { ProductionNote } from "./components/ProductionNote";
import { HistoricalContext } from "./components/HistoricalContext";
import { WorkedExample } from "./components/WorkedExample";
import { CompilerThinking } from "./components/CompilerThinking";
import { MiniChallenge } from "./components/MiniChallenge";
import { Reflection } from "./components/Reflection";
import { ProjectBlock } from "./components/ProjectBlock";
import { ReadingBlock } from "./components/ReadingBlock";

registerWidget({ key: "story", label: "Story", component: StoryCard, icon: "BookOpen" });
registerWidget({ key: "mental-model", label: "Mental Model", component: MentalModelCard, icon: "Brain" });
registerWidget({ key: "engineering-note", label: "Engineering Note", component: EngineeringNote, icon: "NotebookPen" });
registerWidget({ key: "production-note", label: "Production Note", component: ProductionNote, icon: "PackageSearch" });
registerWidget({ key: "historical-context", label: "Historical Context", component: HistoricalContext, icon: "Landmark" });
registerWidget({ key: "worked-example", label: "Worked Example", component: WorkedExample, icon: "Code2" });
registerWidget({ key: "compiler-thinking", label: "Compiler Thinking", component: CompilerThinking, icon: "Cpu" });
registerWidget({ key: "mini-challenge", label: "Mini Challenge", component: MiniChallenge, icon: "Swords" });
registerWidget({ key: "reflection", label: "Reflection", component: Reflection, icon: "PenSquare" });
registerWidget({ key: "project", label: "Project", component: ProjectBlock, icon: "Hammer" });
registerWidget({ key: "reading", label: "Reading", component: ReadingBlock, icon: "Library" });

/**
 * Placeholder registrations for the announced future plugin surface.
 * These map to a friendly "coming soon" component today so lesson authors
 * can reference them in front matter `widgets:` immediately, and swapping
 * in the real interactive visualizer later is a one-line change here.
 */
import { registerFuturePlugins } from "./future-plugins";
registerFuturePlugins();

export { widgetRegistry } from "./registry";
