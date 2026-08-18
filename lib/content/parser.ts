/**
 * lib/content/parser.ts
 *
 * The Lesson Parser.
 *
 *   raw markdown file  --->  Lesson object
 *
 * Pipeline:
 *   1. gray-matter splits front matter from body, we validate/normalize it.
 *   2. remark-parse builds an mdast tree from the body.
 *   3. remarkReecBlocks walks the tree and re-parents ":::kind[...] ... :::"
 *      spans into `reecBlock` nodes.
 *   4. remark-rehype + rehype-raw + rehype-slug + rehype-stringify render
 *      the tree to HTML per top-level heading section, so the Lesson
 *      Viewer can interleave prose and widgets in document order without
 *      re-parsing markdown on the client.
 *
 * This module is server-only (uses gray-matter + node fs indirectly via
 * discover.ts) and is deliberately synchronous-friendly: `unified` runs
 * are async, so `parseLesson` is async and is always called from server
 * components / route handlers, never client components.
 */

import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import { rehypeShiki } from "./rehype-shiki";
import { toString as mdastToString } from "mdast-util-to-string";
import type { Root, Content, Heading } from "mdast";

import { remarkReecBlocks, REEC_BLOCK_KINDS } from "./remark-reec-blocks";
import { isolateReecFences } from "./isolate-fences";
import type {
  Lesson,
  LessonFrontmatter,
  LessonFrontmatterInput,
  LessonSection,
  ReecBlock,
  CodeNode,
  WidgetRef,
} from "./types";

const WORDS_PER_MINUTE = 220;

/** Normalizes raw YAML front matter into the fully-defaulted contract. */
/** YAML has a well-known gotcha: a list item containing an unquoted
 * colon — e.g. `- Explain: why this matters` — parses as a one-key
 * object (`{ Explain: "why this matters" }`), not a plain string. If
 * that object is later handed straight to React as a child, React
 * throws "Objects are not valid as a React child." Rather than crash
 * the whole lesson page over an authoring mistake in one list item, we
 * coerce every entry defensively: strings pass through unchanged;
 * single-key objects get flattened back into readable "Key: value"
 * text (recovering the author's actual intent); anything else falls
 * back to String(item) rather than ever reaching a renderer as a raw
 * object. */
function toStringArray(value: unknown): string[] {
  if (value == null) return [];
  const arr = Array.isArray(value) ? value : [value];
  return arr
    .map((item): string => {
      if (typeof item === "string") return item;
      if (typeof item === "number" || typeof item === "boolean") return String(item);
      if (item && typeof item === "object") {
        const entries = Object.entries(item as Record<string, unknown>);
        if (entries.length === 0) return "";
        const [key, val] = entries[0];
        return val !== undefined && val !== null && val !== ""
          ? `${key}: ${val}`
          : String(key);
      }
      return "";
    })
    .map((s) => s.trim())
    .filter(Boolean);
}

const DIFFICULTY_WORD_MAP: Record<string, 1 | 2 | 3 | 4 | 5> = {
  beginner: 1,
  easy: 1,
  novice: 1,
  intermediate: 3,
  medium: 3,
  moderate: 3,
  advanced: 4,
  hard: 4,
  expert: 5,
  master: 5,
};

/** Accepts 1–5, a numeric string, or common difficulty words
 * ("Beginner", "Advanced", ...) — real-world lesson front matter mixes
 * all three, and a mismatch here shouldn't be a hard failure. */
function toDifficulty(value: unknown): 1 | 2 | 3 | 4 | 5 {
  if (typeof value === "number" && value >= 1 && value <= 5) {
    return Math.round(value) as 1 | 2 | 3 | 4 | 5;
  }
  if (typeof value === "string") {
    const asNumber = Number(value);
    if (Number.isFinite(asNumber) && asNumber >= 1 && asNumber <= 5) {
      return Math.round(asNumber) as 1 | 2 | 3 | 4 | 5;
    }
    const mapped = DIFFICULTY_WORD_MAP[value.trim().toLowerCase()];
    if (mapped) return mapped;
  }
  return 1;
}

/** estimated_time is documented as a string ("90 min") but authors
 * routinely write a bare number in YAML (`estimated_time: 75`), which
 * parses as a JS number, not a string — normalize both into the string
 * shape the rest of the app expects. */
function toEstimatedTimeString(value: unknown): string | null {
  if (value == null || value === "") return null;
  if (typeof value === "number") return `${value} min`;
  return String(value);
}

export function normalizeFrontmatter(
  raw: Partial<LessonFrontmatterInput>
): LessonFrontmatter {
  if (!raw.id) throw new Error("Lesson front matter is missing required field: id");
  if (raw.phase === undefined) throw new Error(`Lesson "${raw.id}" is missing required field: phase`);
  if (!raw.title) throw new Error(`Lesson "${raw.id}" is missing required field: title`);

  return {
    id: raw.id,
    phase: raw.phase,
    week: raw.week ?? null,
    day: raw.day ?? null,
    title: raw.title,
    subtitle: raw.subtitle ?? null,
    difficulty: toDifficulty(raw.difficulty),
    estimated_time: toEstimatedTimeString(raw.estimated_time),
    learning_objectives: toStringArray(raw.learning_objectives),
    prerequisites: toStringArray(raw.prerequisites),
    widgets: raw.widgets ?? [],
    project: raw.project ?? null,
    failure_lab: raw.failure_lab ?? null,
    tags: toStringArray(raw.tags),
    key_terms: toStringArray(raw.key_terms),
    reading: raw.reading ?? [],
    next: raw.next ?? null,
    previous: raw.previous ?? null,
    published: raw.published ?? true,
  };
}

async function renderNodesToHtml(nodes: Content[]): Promise<string> {
  if (nodes.length === 0) return "";
  const root: Root = { type: "root", children: nodes };
  const processor = unified()
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeShiki)
    .use(rehypeRaw)
    .use(rehypeSlug)
    .use(rehypeStringify, { allowDangerousHtml: true });
  const hast = await processor.run(root);
  return String(processor.stringify(hast as any));
}

let blockCounter = 0;
function nextBlockId(kind: string) {
  blockCounter += 1;
  return `${kind}-${blockCounter}`;
}

/**
 * Parses a lesson's raw markdown (including front matter) into a fully
 * structured Lesson object: normalized metadata, section tree with
 * interleaved prose/widget nodes, a flat block list, and derived stats.
 */
export async function parseLesson(
  rawFile: string,
  slug: string[]
): Promise<Lesson> {
  const { data, content } = matter(rawFile);
  const frontmatter = normalizeFrontmatter(data as LessonFrontmatterInput);
  const normalizedContent = isolateReecFences(content);

  const bodyProcessor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkReecBlocks);
  const parsedTree = bodyProcessor.parse(normalizedContent);
  const tree = (await bodyProcessor.run(parsedTree)) as Root;

  // Split the (post-block-transform) top-level nodes into sections keyed by
  // heading. A "section" starts at each heading node; content before the
  // first heading becomes an implicit "Overview" section.
  const sections: LessonSection[] = [];
  const blocks: ReecBlock[] = [];

  let current: LessonSection = {
    id: "overview",
    heading: frontmatter.title,
    depth: 1,
    nodes: [],
  };
  let currentProse: Content[] = [];

  const flushProse = async () => {
    if (currentProse.length === 0) return;
    const html = await renderNodesToHtml(currentProse);
    if (html.trim().length > 0) {
      current.nodes.push({ type: "prose", html });
    }
    currentProse = [];
  };

  for (const node of tree.children as Content[]) {
    if (node.type === "heading") {
      await flushProse();
      if (current.nodes.length > 0 || sections.length === 0) {
        sections.push(current);
      }
      const heading = node as Heading;
      const text = mdastToString(heading);
      current = {
        id: slugify(text),
        heading: text,
        depth: heading.depth,
        nodes: [],
      };
      continue;
    }

    // @ts-expect-error reecBlock is our custom node type
    if (node.type === "reecBlock") {
      await flushProse();
      const anyNode = node as unknown as {
        kind: string;
        title?: string;
        children: Content[];
      };
      const html = await renderNodesToHtml(anyNode.children);
      const markdown = anyNode.children.map((c) => mdastToString(c)).join("\n\n");
      const firstCode = anyNode.children.find(
        (c): c is Content & { lang?: string | null; value: string } => c.type === "code"
      );
      const block: ReecBlock = {
        kind: anyNode.kind,
        title: anyNode.title,
        markdown,
        html,
        id: nextBlockId(anyNode.kind),
        codeSource: firstCode?.value,
        codeLang: firstCode?.lang ?? undefined,
      };
      blocks.push(block);
      current.nodes.push({ type: "block", block });
      continue;
    }

    if (node.type === "code") {
      await flushProse();
      const html = await renderNodesToHtml([node]);
      const codeNode: CodeNode = {
        id: nextBlockId("code"),
        lang: (node as { lang?: string | null }).lang ?? "text",
        source: (node as { value: string }).value,
        html,
      };
      current.nodes.push({ type: "code", code: codeNode });
      continue;
    }

    currentProse.push(node);
  }

  await flushProse();
  if (current.nodes.length > 0) sections.push(current);

  const plainText = mdastToString(tree);
  const rawWordCount = plainText.split(/\s+/).filter(Boolean).length;
  const readingTimeMinutes = Math.max(1, Math.round(rawWordCount / WORDS_PER_MINUTE));
  const excerpt = plainText.slice(0, 220).trim();

  const path = "/lesson/" + slug.map((s) => s.toLowerCase()).join("/");

  return {
    frontmatter,
    slug,
    path,
    sections,
    blocks,
    readingTimeMinutes,
    excerpt,
    rawWordCount,
  };
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function isKnownBlockKind(kind: string): boolean {
  return (REEC_BLOCK_KINDS as readonly string[]).includes(kind);
}

export function collectWidgetRefs(lesson: Lesson): WidgetRef[] {
  // Explicit widget refs from front matter (for standalone / plugin
  // widgets not tied to a REEC block, e.g. an Ownership Visualizer
  // embedded ad hoc) plus one implicit ref per REEC block found in body.
  const implicit: WidgetRef[] = lesson.blocks.map((b) => ({
    type: b.kind,
    props: { blockId: b.id },
  }));
  return [...lesson.frontmatter.widgets, ...implicit];
}
