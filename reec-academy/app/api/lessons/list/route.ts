import { NextResponse } from "next/server";
import { getAllLessons } from "@/lib/content/discover";

export async function GET() {
  const lessons = await getAllLessons();
  return NextResponse.json(
    lessons.map((l) => ({
      path: l.path,
      title: l.frontmatter.title,
      subtitle: l.frontmatter.subtitle,
      phase: l.frontmatter.phase,
      readingTimeMinutes: l.readingTimeMinutes,
    }))
  );
}
