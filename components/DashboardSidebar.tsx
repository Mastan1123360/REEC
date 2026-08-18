"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Home,
  GitFork,
  Briefcase,
  Terminal,
  Bookmark,
  UploadCloud,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ReecLogo } from "@/components/ReecLogo";
import { SPRINGS } from "@/lib/motion";

interface DashboardSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function DashboardSidebar({
  collapsed,
  onToggleCollapse,
}: DashboardSidebarProps) {
  const pathname = usePathname();

  const primaryNavItems = [
    {
      name: "Overview",
      href: "/",
      icon: Home,
      isActive: pathname === "/",
    },
    {
      name: "Roadmap",
      href: "/roadmap",
      icon: GitFork,
      isActive:
        pathname === "/roadmap" ||
        pathname.startsWith("/roadmap") ||
        pathname.startsWith("/phase") ||
        pathname.startsWith("/lesson"),
    },
    {
      name: "Projects",
      href: "/projects",
      icon: Briefcase,
      isActive: pathname.startsWith("/projects"),
    },
  ];

  const secondaryNavItems = [
    {
      name: "Code Workspace",
      href: "/workspace",
      icon: Terminal,
      isActive: pathname.startsWith("/workspace") || pathname.startsWith("/hello-reec"),
    },
    {
      name: "Bookmarks",
      href: "/bookmarks",
      icon: Bookmark,
      isActive: pathname.startsWith("/bookmarks"),
    },
    {
      name: "Upload",
      href: "/upload",
      icon: UploadCloud,
      isActive: pathname.startsWith("/upload"),
    },
  ];

  return (
    <aside
      className={cn(
        "relative hidden lg:flex flex-col shrink-0 h-dvh top-0 bottom-0 left-0 transition-[width] duration-200 ease-out z-30 select-none",
        "border-r border-slate-900/[0.06] dark:border-white/[0.07]",
        "bg-white/60 dark:bg-[#080e1c]/80 backdrop-blur-3xl backdrop-saturate-180",
        collapsed ? "w-20 items-center" : "w-[250px]"
      )}
      style={{
        boxShadow: "var(--glass-specular), var(--glass-shadow)",
      }}
    >
      {/* 1. Top Brand Header: [R logo] REEC */}
      <div
        className={cn(
          "h-14 lg:h-16 flex items-center shrink-0 w-full transition-all",
          collapsed ? "justify-center px-2" : "px-5"
        )}
      >
        <Link href="/" className="group flex items-center">
          <ReecLogo size="md" showText={!collapsed} />
        </Link>
      </div>

      {/* Top Divider below brand */}
      <div className="w-full px-4 shrink-0">
        <div className="border-b border-slate-900/[0.05] dark:border-white/[0.06]" />
      </div>

      {/* 2. Main Navigation Rails */}
      <nav
        className={cn(
          "flex-1 overflow-y-auto overflow-x-hidden scrollbar-none py-3 space-y-1 w-full",
          collapsed ? "px-2" : "px-3"
        )}
      >
        {primaryNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.isActive;

          return (
            <Link
              key={item.name}
              href={item.href}
              title={collapsed ? item.name : undefined}
              className={cn(
                "group relative flex items-center rounded-xl transition-colors duration-150",
                collapsed
                  ? "h-10 w-10 justify-center mx-auto"
                  : "px-3.5 py-2.5 gap-3",
                isActive
                  ? "text-blue-700 dark:text-blue-400 font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/50 dark:hover:bg-white/[0.05] font-medium"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="active-sidebar-pill"
                  transition={SPRINGS.snappy}
                  className="absolute inset-0 rounded-xl bg-blue-500/[0.12] dark:bg-blue-500/[0.16] border border-blue-500/25 dark:border-blue-400/30"
                  style={{
                    boxShadow:
                      "var(--glass-inner-highlight), 0 2px 8px -2px rgba(59, 130, 246, 0.2)",
                  }}
                />
              )}
              <Icon
                size={17}
                className={cn(
                  "relative z-10 shrink-0 transition-colors",
                  isActive
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200"
                )}
              />
              {!collapsed && (
                <span className="relative z-10 text-xs tracking-tight truncate flex-1">
                  {item.name}
                </span>
              )}
            </Link>
          );
        })}

        {/* Divider between Primary Nav and Tools */}
        <div className="py-2">
          <div className="border-b border-slate-900/[0.05] dark:border-white/[0.06]" />
        </div>

        {/* 3. Secondary Tools Navigation */}
        {secondaryNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.isActive;

          return (
            <Link
              key={item.name}
              href={item.href}
              title={collapsed ? item.name : undefined}
              className={cn(
                "group relative flex items-center rounded-xl transition-colors duration-150",
                collapsed
                  ? "h-10 w-10 justify-center mx-auto"
                  : "px-3.5 py-2.5 gap-3",
                isActive
                  ? "text-blue-700 dark:text-blue-400 font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/50 dark:hover:bg-white/[0.05] font-medium"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="active-sidebar-pill"
                  transition={SPRINGS.snappy}
                  className="absolute inset-0 rounded-xl bg-blue-500/[0.12] dark:bg-blue-500/[0.16] border border-blue-500/25 dark:border-blue-400/30"
                  style={{
                    boxShadow:
                      "var(--glass-inner-highlight), 0 2px 8px -2px rgba(59, 130, 246, 0.2)",
                  }}
                />
              )}
              <Icon
                size={17}
                className={cn(
                  "relative z-10 shrink-0 transition-colors",
                  isActive
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200"
                )}
              />
              {!collapsed && (
                <>
                  <span className="relative z-10 text-xs tracking-tight truncate flex-1">
                    {item.name}
                  </span>
                  {item.href === "/workspace" && (
                    <ChevronRight
                      size={14}
                      className="relative z-10 text-slate-400 dark:text-slate-500 transition-transform group-hover:translate-x-0.5"
                    />
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Ambient background glow near bottom */}
      <div className="pointer-events-none absolute bottom-14 left-2 right-2 h-28 rounded-full bg-blue-500/5 dark:bg-blue-500/10 blur-2xl" />

      {/* 4. Bottom Collapse Control Button « */}
      <div
        className={cn(
          "p-3 w-full shrink-0 flex items-center border-t border-slate-900/[0.05] dark:border-white/[0.06]",
          collapsed ? "justify-center" : "justify-start"
        )}
      >
        <button
          onClick={onToggleCollapse}
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-900/[0.06] dark:border-white/[0.08] bg-white/60 dark:bg-white/[0.05] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/90 dark:hover:bg-white/[0.09] hover:border-blue-500/40 dark:hover:border-blue-400/30 transition-all active:scale-95 shadow-xs backdrop-blur-xl"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          style={{
            boxShadow: "var(--glass-inner-highlight)",
          }}
        >
          {collapsed ? <ChevronsRight size={14} /> : <ChevronsLeft size={14} />}
        </button>
      </div>
    </aside>
  );
}

export const AppSidebar = DashboardSidebar;
