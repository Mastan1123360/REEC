"use client";
import Link from "next/link";
import { Moon, Sun, Search, GraduationCap, Command, UploadCloud, CheckCircle2 } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { Button } from "@/components/ui/button";
import { SearchDialog } from "./SearchDialog";
import { HamburgerMenu } from "./HamburgerMenu";
import * as React from "react";

export function Header({ uploadsDisabled = false }: { uploadsDisabled?: boolean }) {
  const { theme, toggle } = useTheme();
  const [searchOpen, setSearchOpen] = React.useState(false);

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between gap-3 px-4 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2 font-semibold tracking-tight">
          <GraduationCap size={20} className="text-primary" />
          <span className="hidden sm:inline">REEC Academy</span>
        </Link>

        <button
          onClick={() => setSearchOpen(true)}
          className="flex min-w-0 max-w-sm flex-1 items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
        >
          <Search size={13} className="shrink-0" />
          <span className="truncate">Search lessons...</span>
          <span className="ml-auto hidden shrink-0 items-center gap-0.5 rounded border border-border px-1 py-0.5 text-[10px] sm:flex">
            <Command size={10} />K
          </span>
        </button>

        <div className="flex shrink-0 items-center gap-1.5">
          {uploadsDisabled ? (
            <Button
              variant="outline"
              size="sm"
              disabled
              title="All 9 phases have content — uploads are disabled"
              className="hidden sm:inline-flex"
            >
              <CheckCircle2 size={14} />
              Curriculum complete
            </Button>
          ) : (
            <Link href="/upload">
              <Button variant="outline" size="sm" className="hidden sm:inline-flex">
                <UploadCloud size={14} />
                Upload lesson
              </Button>
              <Button variant="ghost" size="icon" className="sm:hidden" aria-label="Upload lesson">
                <UploadCloud size={16} />
              </Button>
            </Link>
          )}
          <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </Button>
          <HamburgerMenu />
        </div>
      </div>
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  );
}
