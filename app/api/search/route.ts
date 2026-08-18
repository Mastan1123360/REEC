import { NextRequest, NextResponse } from "next/server";
import { searchLessons } from "@/lib/content/discover";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  const results = await searchLessons(q);
  return NextResponse.json(
    results.slice(0, 20).map((l) => ({
      title: l.frontmatter.title,
      subtitle: l.frontmatter.subtitle,
      path: l.path,
      phase: l.frontmatter.phase,
      excerpt: l.excerpt,
    }))
  );
}
