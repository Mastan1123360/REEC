"use client";

import * as React from "react";
import Link from "next/link";
import { Bookmark, BookmarkX, ArrowRight, Clock } from "lucide-react";
import { useProgressStore } from "@/lib/progress/store";
import { Badge } from "@/components/ui/badge";

interface LessonSummary {
  path: string;
  title: string;
  subtitle: string | null;
  phase: number;
  readingTimeMinutes: number;
}

export default function BookmarksPage() {
  const bookmarks = useProgressStore((s) => s.bookmarks);
  const toggleBookmark = useProgressStore((s) => s.toggleBookmark);
  const [lessons, setLessons] = React.useState<LessonSummary[]>([]);
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    fetch("/api/lessons/list")
      .then((r) => r.json())
      .then((data) => {
        setLessons(data);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  const bookmarked = lessons.filter((l) => bookmarks.has(l.path));

  return (
    <div className="mx-auto max-w-2xl px-4 py-14 lg:px-8">
      <div className="mb-8">
        <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
          <Bookmark size={12} /> Saved for later
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Bookmarks</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Lessons you&rsquo;ve bookmarked, stored locally in your browser.
        </p>
      </div>

      {!loaded && <p className="text-sm text-muted-foreground">Loading…</p>}

      {loaded && bookmarked.length === 0 && (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-16 text-center">
          <Bookmark size={26} className="text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">
            No bookmarks yet — open a lesson and click Bookmark.
          </p>
        </div>
      )}

      <ul className="space-y-2">
        {bookmarked.map((l) => (
          <li
            key={l.path}
            className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3.5"
          >
            <Link href={l.path} className="min-w-0 flex-1">
              <div className="mb-1 flex items-center gap-2">
                <Badge variant="outline">Phase {l.phase}</Badge>
                <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Clock size={11} /> {l.readingTimeMinutes}m
                </span>
              </div>
              <div className="truncate font-medium">{l.title}</div>
              {l.subtitle && <div className="truncate text-xs text-muted-foreground">{l.subtitle}</div>}
            </Link>
            <div className="flex shrink-0 items-center gap-1">
              <button
                onClick={() => toggleBookmark(l.path)}
                title="Remove bookmark"
                className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-destructive"
              >
                <BookmarkX size={16} />
              </button>
              <Link href={l.path} className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground">
                <ArrowRight size={16} />
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
