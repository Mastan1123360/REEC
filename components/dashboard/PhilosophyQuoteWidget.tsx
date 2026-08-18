"use client";

import * as React from "react";

export function PhilosophyQuoteWidget() {
  return (
    <div
      className="rounded-[22px] border border-slate-900/[0.06] dark:border-white/[0.07] bg-white/68 dark:bg-[#0b1220]/75 p-2.5 sm:p-3 xl:p-3.5 backdrop-blur-xl backdrop-saturate-160 flex items-start gap-2.5 transition-all duration-200"
      style={{
        boxShadow: "var(--glass-specular), var(--glass-shadow)",
      }}
    >
      {/* Large quotation mark icon */}
      <div className="text-blue-600 dark:text-blue-400 select-none text-2xl sm:text-3xl font-serif font-black leading-none shrink-0 -mt-0.5">
        “
      </div>

      <div className="space-y-0.5 min-w-0">
        <blockquote className="text-[10.5px] sm:text-[11px] font-medium text-slate-800 dark:text-slate-200 leading-snug">
          Understand the machine.
          <br />
          Then make it yours.
        </blockquote>

        <div className="text-[9.5px] font-semibold text-blue-600 dark:text-blue-400 pt-0.5">
          — REEC Philosophy
        </div>
      </div>
    </div>
  );
}
