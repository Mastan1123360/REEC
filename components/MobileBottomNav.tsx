"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, GitFork, Briefcase, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";
import { SPRINGS } from "@/lib/motion";

export function MobileBottomNav() {
  const pathname = usePathname();

  const navItems = [
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
    {
      name: "Code",
      href: "/workspace",
      icon: Terminal,
      isActive: pathname.startsWith("/workspace") || pathname.startsWith("/hello-reec"),
    },
  ];

  return (
    <div className="fixed bottom-3 inset-x-3 z-40 lg:hidden">
      <nav
        className="mx-auto max-w-md flex items-center justify-around rounded-3xl border border-slate-900/[0.08] dark:border-white/[0.1] bg-white/75 dark:bg-[#070c18]/85 px-2 py-1.5 shadow-2xl backdrop-blur-3xl backdrop-saturate-180"
        style={{
          boxShadow: "var(--glass-specular), var(--glass-shadow-heavy)",
        }}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.isActive;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-colors duration-150 relative min-w-[52px]",
                isActive
                  ? "text-blue-600 dark:text-blue-400 font-semibold"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              )}
            >
              <div className="relative flex h-7 w-7 items-center justify-center rounded-xl">
                {isActive && (
                  <motion.div
                    layoutId="active-mobile-pill"
                    transition={SPRINGS.snappy}
                    className="absolute inset-0 rounded-xl bg-blue-500/15 border border-blue-500/35 dark:border-blue-400/30"
                    style={{
                      boxShadow: "var(--glass-inner-highlight)",
                    }}
                  />
                )}
                <Icon
                  size={15}
                  className={cn(
                    "relative z-10 transition-colors",
                    isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-400"
                  )}
                />
              </div>
              <span className="relative z-10 text-[10px] mt-0.5 tracking-tight font-medium">
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

