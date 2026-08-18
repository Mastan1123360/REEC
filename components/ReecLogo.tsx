"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ReecLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function ReecLogo({
  className,
  size = "md",
  showText = true,
}: ReecLogoProps) {
  const boxSize =
    size === "sm"
      ? "w-7 h-7"
      : size === "lg"
      ? "w-9 h-9"
      : "w-8 h-8";

  const iconPx = size === "sm" ? "15px" : size === "lg" ? "20px" : "18px";

  return (
    <div className={cn("flex items-center gap-2.5 select-none", className)}>
      {/* Brand Hexagon Glass Badge with crisp R Symbol */}
      <div
        className={cn(
          "relative flex shrink-0 items-center justify-center rounded-xl",
          "border border-blue-500/40 dark:border-blue-400/40",
          "bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400",
          "shadow-xs backdrop-blur-md transition-all duration-200",
          "group-hover:scale-105 group-hover:border-blue-500/60 group-hover:bg-blue-500/25",
          boxSize
        )}
        style={{
          boxShadow:
            "inset 0 1px 0 rgba(255, 255, 255, 0.45), 0 2px 8px -2px rgba(59, 130, 246, 0.25)",
        }}
      >
        <svg
          viewBox="0 0 24 24"
          style={{ width: iconPx, height: iconPx }}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-blue-600 dark:text-blue-400 shrink-0"
        >
          {/* Hexagonal container stroke */}
          <path
            d="M12 2.5L3.5 7.4V16.6L12 21.5L20.5 16.6V7.4L12 2.5Z"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinejoin="round"
            className="opacity-60"
          />
          {/* Distinct R character monogram */}
          <path
            d="M9 7.5H13.2C14.3 7.5 15.2 8.3 15.2 9.4C15.2 10.5 14.3 11.3 13.2 11.3H9V7.5Z"
            stroke="currentColor"
            strokeWidth="2.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9 11.3H12.5L15.3 16.5M9 7V16.5"
            stroke="currentColor"
            strokeWidth="2.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {showText && (
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-slate-100 font-sans">
            REEC
          </span>
          <span className="text-slate-300 dark:text-slate-700 font-light text-base">
            |
          </span>
        </div>
      )}
    </div>
  );
}
