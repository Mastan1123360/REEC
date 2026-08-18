"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { AppHeader } from "@/components/AppHeader";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { SearchDialog } from "@/components/SearchDialog";
import { FocusBackdrop } from "@/components/rust-ide/FocusBackdrop";
import { RustWorkspacePanel } from "@/components/rust-ide/RustWorkspacePanel";
import { StudySessionTracker } from "@/components/StudySessionTracker";

interface AppShellProps {
  children: React.ReactNode;
  uploadsDisabled?: boolean;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);

  // Initialize collapse state from localStorage once mounted
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem("reec_sidebar_collapsed");
      if (saved !== null) {
        setCollapsed(saved === "true");
      }
    } catch {
      // ignore
    }
  }, []);

  const handleToggleCollapse = React.useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("reec_sidebar_collapsed", String(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  // Global Keyboard shortcut for search (⌘K / Ctrl+K)
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((o) => !o);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="relative h-dvh w-dvw overflow-hidden flex flex-row font-sans selection:bg-blue-500/20 bg-[#edf2f8] dark:bg-[#060a12] text-slate-900 dark:text-slate-100">
      {/* 0. Atmospheric Light Refraction System (Apple Ambient Light Physics) */}
      <div
        className="pointer-events-none fixed inset-0 z-0 dark:hidden"
        style={{
          background: `
            radial-gradient(ellipse 90% 70% at 8% 5%, rgba(193, 219, 255, 0.65) 0%, rgba(220, 236, 255, 0.35) 45%, transparent 70%),
            radial-gradient(ellipse 80% 60% at 92% 20%, rgba(204, 227, 255, 0.55) 0%, rgba(230, 242, 255, 0.25) 50%, transparent 72%),
            radial-gradient(ellipse 100% 75% at 50% 95%, rgba(198, 223, 255, 0.5) 0%, rgba(228, 240, 255, 0.3) 55%, transparent 80%)
          `,
        }}
      />
      <div
        className="pointer-events-none fixed inset-0 z-0 hidden dark:block"
        style={{
          background: `
            radial-gradient(ellipse 85% 60% at 10% 8%, rgba(29, 78, 216, 0.18) 0%, rgba(30, 58, 138, 0.08) 42%, transparent 70%),
            radial-gradient(ellipse 70% 55% at 90% 18%, rgba(37, 99, 235, 0.13) 0%, rgba(15, 23, 42, 0.05) 48%, transparent 68%),
            radial-gradient(ellipse 80% 65% at 50% 92%, rgba(29, 78, 216, 0.15) 0%, rgba(10, 18, 38, 0.06) 50%, transparent 76%),
            radial-gradient(ellipse 45% 45% at 30% 48%, rgba(59, 130, 246, 0.06) 0%, transparent 60%)
          `,
        }}
      />

      <StudySessionTracker />

      {/* 1. PERSISTENT APPLICATION CHROME: LEFT SIDEBAR (100dvh) */}
      <DashboardSidebar
        collapsed={collapsed}
        onToggleCollapse={handleToggleCollapse}
      />

      {/* 2. RIGHT SIDE: PERSISTENT HEADER + DYNAMIC CONTENT AREA */}
      <div className="relative z-10 flex-1 min-w-0 h-dvh flex flex-col overflow-hidden">
        {/* Persistent Top Header (Spans remaining width) */}
        <AppHeader
          onSearchOpen={() => setSearchOpen(true)}
        />

        {/* Dynamic Route Content Area (Changes on route navigation) */}
        <main className="flex-1 min-h-0 min-w-0 relative overflow-hidden flex flex-col pb-16 lg:pb-0">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 min-h-0 min-w-0 flex flex-col h-full overflow-hidden"
          >
            {children}
          </motion.div>
        </main>
      </div>

      {/* 3. MOBILE FLOATING BOTTOM NAVIGATION CAPSULE (No hamburger) */}
      <MobileBottomNav />

      {/* 4. PERSISTENT GLOBAL DIALOGS AND OVERLAYS */}
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
      <FocusBackdrop />
      <RustWorkspacePanel />
    </div>
  );
}
