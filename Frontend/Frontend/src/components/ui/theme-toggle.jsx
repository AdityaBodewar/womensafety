"use client";

import React from "react";
import { MoonStar, SunMedium } from "lucide-react";
import { cn } from "@/lib/utils";

function ThemeToggle({ isDarkMode, onToggle, className = "" }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "group fixed right-4 top-5 z-[220] inline-flex items-center gap-3 rounded-full border px-3 py-2 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 sm:right-6 sm:top-6",
        isDarkMode
          ? "border-cyan-300/20 bg-slate-950/72 text-cyan-100 shadow-[0_18px_40px_rgba(8,47,73,0.38)]"
          : "border-slate-300/60 bg-white/88 text-slate-800 shadow-[0_18px_40px_rgba(148,163,184,0.26)]",
        className,
      )}
    >
      <span
        className={cn(
          "relative inline-flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300",
          isDarkMode
            ? "bg-[radial-gradient(circle_at_35%_35%,rgba(34,211,238,0.9),rgba(15,23,42,0.95))] shadow-[0_0_24px_rgba(34,211,238,0.38)]"
            : "bg-[radial-gradient(circle_at_35%_35%,rgba(255,255,255,0.95),rgba(251,191,36,0.88))] shadow-[0_0_24px_rgba(251,191,36,0.26)]",
        )}
      >
        <span
          className={cn(
            "pointer-events-none absolute inset-0 rounded-full opacity-70 blur-md transition-transform duration-300 group-hover:scale-110",
            isDarkMode ? "bg-cyan-300/30" : "bg-amber-300/40",
          )}
        ></span>
        {isDarkMode ? (
          <SunMedium className="relative z-10 h-4 w-4 text-white" />
        ) : (
          <MoonStar className="relative z-10 h-4 w-4 text-slate-900" />
        )}
      </span>

      <span className="pr-2 text-left">
        <span className="block text-[10px] font-semibold uppercase tracking-[0.28em] opacity-60">
          Theme
        </span>
        <span className="block text-sm font-semibold tracking-[0.08em]">
          {isDarkMode ? "Dark Mode" : "Light Mode"}
        </span>
      </span>
    </button>
  );
}

export { ThemeToggle };
