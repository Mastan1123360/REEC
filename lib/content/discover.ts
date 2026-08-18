/**
 * lib/content/discover.ts
 *
 * Automatic content discovery. Authors drop markdown files under /content
 * in a `Phase-XX/Week-YY/Day-ZZ.md` (or any nested) structure; nothing here
 * is hardcoded to a specific phase/week/day — the filesystem *is* the
 * routing table. This module walks the tree, parses every lesson, and
 * builds the indexes the rest of the app reads from (with an in-memory
 * cache since content is static at build/runtime for a given deploy).
 */

import fs from "node:fs";
import path from "node:path";
import { parseLesson } from "./parser";
import { CURRICULUM_ROADMAP, roadmapTitleForPhase, type RoadmapPhase } from "./roadmap";
import type { Lesson, PhaseSummary } from "./types";

const CONTENT_ROOT = path.join(process.cwd(), "content");

let cache: { lessons: Lesson[]; bySlug: Map<string, Lesson> } | null = null;

/** Called after an upload writes a new file to /content — forces the next
 * read to re-walk the filesystem instead of serving the stale in-memory
 * index. Cheap: the whole curriculum is small enough to re-parse on
 * every cache miss without noticeable latency. */
export function invalidateLessonCache() {
  cache = null;
}

function walk(dir: string, base: string[] = []): string[][] {
  const entries = fs.existsSync(dir) ? fs.readdirSync(dir, { withFileTypes: true }) : [];
  let out: string[][] = [];
  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out = out.concat(walk(full, [...base, entry.name]));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      const name = entry.name.replace(/\.md$/, "");
      out.push([...base, name]);
    }
  }
  return out;
}

async function loadAll(): Promise<Lesson[]> {
  const slugs = walk(CONTENT_ROOT);
  const lessons: Lesson[] = [];
  for (const slugParts of slugs) {
    const filePath = path.join(CONTENT_ROOT, ...slugParts) + ".md";
    const raw = fs.readFileSync(filePath, "utf-8");
    const lesson = await parseLesson(raw, slugParts);
    if (lesson.frontmatter.published) lessons.push(lesson);
  }
  lessons.sort((a, b) => {
    if (a.frontmatter.phase !== b.frontmatter.phase) return a.frontmatter.phase - b.frontmatter.phase;
    if ((a.frontmatter.week ?? 0) !== (b.frontmatter.week ?? 0))
      return (a.frontmatter.week ?? 0) - (b.frontmatter.week ?? 0);
    return (a.frontmatter.day ?? 0) - (b.frontmatter.day ?? 0);
  });
  return lessons;
}

async function getCache() {
  if (cache) return cache;
  const lessons = await loadAll();
  const bySlug = new Map<string, Lesson>();
  for (const lesson of lessons) {
    bySlug.set(lesson.slug.map((s) => s.toLowerCase()).join("/"), lesson);
  }
  cache = { lessons, bySlug };
  return cache;
}

export async function getAllLessons(): Promise<Lesson[]> {
  const { lessons } = await getCache();
  return lessons;
}

export async function getLessonBySlug(slugParts?: string[]): Promise<Lesson | null> {
  if (!slugParts || !Array.isArray(slugParts) || slugParts.length === 0) return null;
  const { bySlug } = await getCache();
  return bySlug.get(slugParts.map((s) => s.toLowerCase()).join("/")) ?? null;
}

export async function getAllLessonSlugs(): Promise<string[][]> {
  const { lessons } = await getCache();
  return lessons.map((l) => l.slug);
}

export async function getPhaseSummaries(): Promise<PhaseSummary[]> {
  const { lessons } = await getCache();
  const map = new Map<number, PhaseSummary>();
  for (const lesson of lessons) {
    const p = lesson.frontmatter.phase;
    if (!map.has(p)) {
      map.set(p, { phase: p, title: roadmapTitleForPhase(p), lessonCount: 0, weeks: [] });
    }
    const summary = map.get(p)!;
    summary.lessonCount += 1;
    if (lesson.frontmatter.week && !summary.weeks.includes(lesson.frontmatter.week)) {
      summary.weeks.push(lesson.frontmatter.week);
    }
  }
  return [...map.values()].sort((a, b) => a.phase - b.phase);
}

export interface RoadmapStatus extends RoadmapPhase {
  lessonCount: number;
  weeks: number[];
  hasContent: boolean;
}

/** The dashboard's real data source: the fixed 9-phase roadmap, each
 * entry annotated with whatever content actually exists for it right
 * now. A phase with zero lessons is still returned — it just carries
 * `hasContent: false` so the UI can render it as "Coming Soon" instead
 * of omitting it entirely. */
export async function getRoadmapStatus(): Promise<RoadmapStatus[]> {
  const { lessons } = await getCache();
  return CURRICULUM_ROADMAP.map((entry) => {
    const phaseLessons = lessons.filter((l) => l.frontmatter.phase === entry.phase);
    const weeks = [...new Set(phaseLessons.map((l) => l.frontmatter.week).filter((w): w is number => !!w))];
    return { ...entry, lessonCount: phaseLessons.length, weeks, hasContent: phaseLessons.length > 0 };
  });
}

/** True once every one of the 9 roadmap phases has at least one lesson.
 * The upload feature (header button, /upload page, and the upload API
 * route itself) all gate on this — once the curriculum is fully
 * populated, uploading is disabled everywhere rather than left available
 * with nothing meaningful left to add. */
export async function isCurriculumComplete(): Promise<boolean> {
  const status = await getRoadmapStatus();
  return status.every((p) => p.hasContent);
}

export async function searchLessons(query: string): Promise<Lesson[]> {
  const { lessons } = await getCache();
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return lessons.filter((l) => {
    const haystack = [
      l.frontmatter.title,
      l.frontmatter.subtitle ?? "",
      l.excerpt,
      ...l.frontmatter.tags,
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}
