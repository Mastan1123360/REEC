import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { revalidatePath } from "next/cache";
import { invalidateLessonCache, isCurriculumComplete } from "@/lib/content/discover";
import { roadmapTitleForPhase } from "@/lib/content/roadmap";
import { isFailureLabFilename, parseFailureLabFile } from "@/lib/content/labs-discovery";

export const runtime = "nodejs";

const CONTENT_ROOT = path.join(process.cwd(), "content");
const pad2 = (n: number) => String(n).padStart(2, "0");

function deriveTitleFromMarkdown(body: string, fallback: string): string {
  const headingMatch = body.match(/^#\s+(.+)$/m);
  return headingMatch ? headingMatch[1].trim() : fallback;
}

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

  const raw = await file.text();
  if (raw.length > 500_000) {
    return NextResponse.json({ error: "File too large (max 500KB)." }, { status: 400 });
  }

  // 1. Check if the uploaded file is identified as a Failure Lab
  if (isFailureLabFilename(file.name)) {
    const labsDir = path.join(CONTENT_ROOT, "Failure-Labs");
    try {
      fs.mkdirSync(labsDir, { recursive: true });
      const safeName = file.name.replace(/[^a-zA-Z0-9_\-. —]/g, "_");
      const targetPath = path.join(labsDir, safeName);
      fs.writeFileSync(targetPath, raw, "utf-8");

      const lab = parseFailureLabFile(targetPath, raw);
      revalidatePath("/", "layout");

      return NextResponse.json({
        success: true,
        isLab: true,
        path: "/",
        title: lab.title,
        id: lab.id,
      });
    } catch (err) {
      return NextResponse.json(
        { error: `Failed to save Failure Lab: ${(err as Error).message}` },
        { status: 500 }
      );
    }
  }

  // 2. Otherwise handle standard curriculum lesson upload
  if (await isCurriculumComplete()) {
    return NextResponse.json(
      { error: "The curriculum is complete — all 9 phases have content, so uploads are disabled." },
      { status: 403 }
    );
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
    isLab: false,
    path: lessonPath,
    phaseTitle: roadmapTitleForPhase(phase),
    title: data.title,
  });
}
