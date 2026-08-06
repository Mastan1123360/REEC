/**
 * app/api/lessons/upload/route.ts
 *
 * Accepts an uploaded .md file plus a Phase/Week/Day placement, writes it
 * into /content in the exact structure lib/content/discover.ts already
 * walks (Phase-XX/Week-YY/Day-ZZ.md), and busts the in-memory lesson
 * cache so the very next page load sees it — no restart, no rebuild.
 *
 * Placement rule: the folder the file is saved under is determined by
 * the Phase/Week/Day the user picked in the upload form, NOT by whatever
 * `phase:`/`week:`/`day:` the file's own front matter might say — this
 * keeps "I uploaded this into Phase 0 / Week 1 / Day 1" unambiguous even
 * if the author's front matter is wrong or missing. We overwrite the
 * front matter's phase/week/day to match the chosen placement so the
 * dashboard's phase grouping (which reads front matter, not folder path)
 * never disagrees with where the file visibly lives.
 *
 * NOTE on hosting: this writes to the server's local filesystem, which
 * works for local dev and any always-on Node server. On a strictly
 * read-only/serverless deploy (e.g. Vercel's default filesystem is
 * ephemeral per-invocation) an uploaded file will NOT persist across
 * deployments — it works for the session/instance it was written to.
 * For persistent production uploads, swap this route's write step for a
 * real datastore/object storage call; nothing else in the app needs to
 * change, since discovery always goes through lib/content/discover.ts.
 */

import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { revalidatePath } from "next/cache";
import { invalidateLessonCache, isCurriculumComplete } from "@/lib/content/discover";
import { roadmapTitleForPhase } from "@/lib/content/roadmap";

export const runtime = "nodejs";

const CONTENT_ROOT = path.join(process.cwd(), "content");
const pad2 = (n: number) => String(n).padStart(2, "0");

function deriveTitleFromMarkdown(body: string, fallback: string): string {
  const headingMatch = body.match(/^#\s+(.+)$/m);
  return headingMatch ? headingMatch[1].trim() : fallback;
}

/** Node 18 doesn't expose `File` as a global (it's only reachable via
 * `node:buffer`'s named export, and even that varies by minor version) —
 * referencing the bare `File` identifier for an `instanceof` check throws
 * `ReferenceError: File is not defined` before any of our own validation
 * even runs. `formData()` entries that aren't a plain string are always
 * Blob-like (File extends Blob), so duck-typing on the Blob/File surface
 * (`arrayBuffer`/`text`/`name`) is the actual portable check across Node
 * 18, Node 20+, and edge runtimes alike. */
function isUploadedFile(
  value: FormDataEntryValue | null
): value is FormDataEntryValue & { name: string; text: () => Promise<string> } {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as { text?: unknown }).text === "function" &&
    typeof (value as { name?: unknown }).name === "string"
  );
}

export async function POST(req: NextRequest) {
  if (await isCurriculumComplete()) {
    return NextResponse.json(
      { error: "The curriculum is complete — all 9 phases have content, so uploads are disabled." },
      { status: 403 }
    );
  }

  const form = await req.formData();
  const file = form.get("file");
  const phaseRaw = form.get("phase");
  const weekRaw = form.get("week");
  const dayRaw = form.get("day");

  if (!isUploadedFile(file)) {
    return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
  }
  if (!file.name.toLowerCase().endsWith(".md")) {
    return NextResponse.json({ error: "Only .md files are accepted." }, { status: 400 });
  }

  const phase = Number(phaseRaw);
  const week = Number(weekRaw);
  const day = Number(dayRaw);
  if (!Number.isInteger(phase) || phase < 0) {
    return NextResponse.json({ error: "Invalid phase." }, { status: 400 });
  }
  if (!Number.isInteger(week) || week < 1) {
    return NextResponse.json({ error: "Invalid week." }, { status: 400 });
  }
  if (!Number.isInteger(day) || day < 1) {
    return NextResponse.json({ error: "Invalid day." }, { status: 400 });
  }

  const raw = await file.text();
  if (raw.length > 500_000) {
    return NextResponse.json({ error: "File too large (max 500KB)." }, { status: 400 });
  }

  let parsed: matter.GrayMatterFile<string>;
  try {
    parsed = matter(raw);
  } catch {
    return NextResponse.json({ error: "Could not parse the file as markdown/front matter." }, { status: 400 });
  }

  const slugParts = [`Phase-${pad2(phase)}`, `Week-${pad2(week)}`, `Day-${pad2(day)}`];
  const derivedId = `phase${phase}-week${week}-day${day}`;
  const fallbackTitle = deriveTitleFromMarkdown(
    parsed.content,
    `Phase ${phase}, Week ${week}, Day ${day}`
  );

  // Overwrite placement-relevant fields; preserve everything else the
  // author already wrote (learning_objectives, tags, widgets, etc.).
  const data = {
    ...parsed.data,
    id: parsed.data.id || derivedId,
    phase,
    week,
    day,
    title: parsed.data.title || fallbackTitle,
    published: parsed.data.published ?? true,
  };

  const normalized = matter.stringify(parsed.content, data);

  const dir = path.join(CONTENT_ROOT, ...slugParts.slice(0, 2));
  const filePath = path.join(CONTENT_ROOT, ...slugParts) + ".md";

  try {
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, normalized, "utf-8");
  } catch (err) {
    return NextResponse.json(
      { error: `Failed to write file on the server: ${(err as Error).message}` },
      { status: 500 }
    );
  }

  invalidateLessonCache();
  revalidatePath("/", "layout");

  const lessonPath = "/lesson/" + slugParts.map((s) => s.toLowerCase()).join("/");

  return NextResponse.json({
    success: true,
    path: lessonPath,
    phaseTitle: roadmapTitleForPhase(phase),
    title: data.title,
  });
}
