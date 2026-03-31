"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

function NavBar({ items, className, isDarkMode = false }) {
  const [activeTab, setActiveTab] = useState(items[0]?.name ?? "");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      className={cn(
        "fixed bottom-0 left-1/2 z-[200] mb-6 h-max -translate-x-1/2 sm:top-0 sm:mb-0 sm:pt-6",
        className,
      )}
    >
      <div
        className={cn(
          "flex items-center gap-3 rounded-full px-1 py-1 backdrop-blur-lg",
          isDarkMode
            ? "border border-white/10 bg-slate-950/55 shadow-[0_18px_40px_rgba(0,0,0,0.35)]"
            : "border border-slate-300/70 bg-white/85 shadow-[0_18px_40px_rgba(148,163,184,0.25)]",
        )}
      >
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.name;

          return (
            <a
              key={item.name}
              href={item.url}
              onClick={(event) => {
                setActiveTab(item.name);
                if (item.onClick) {
                  event.preventDefault();
                  item.onClick();
                }
              }}
              className={cn(
                "relative cursor-pointer rounded-full px-6 py-2 text-sm font-semibold transition-colors",
                isDarkMode
                  ? "text-white/80 hover:text-cyan-200"
                  : "text-slate-700/90 hover:text-sky-700",
                isActive &&
                  (isDarkMode
                    ? "bg-white/5 text-cyan-200"
                    : "bg-sky-100/80 text-sky-700"),
                isMobile && "px-4",
              )}
            >
              <span className="hidden md:inline">{item.name}</span>
              <span className="md:hidden">
                <Icon size={18} strokeWidth={2.5} />
              </span>
              {isActive && (
                <motion.div
                  layoutId="lamp"
                  className={cn(
                    "absolute inset-0 -z-10 w-full rounded-full",
                    isDarkMode ? "bg-cyan-300/5" : "bg-sky-500/10",
                  )}
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                >
                  <div
                    className={cn(
                      "absolute left-1/2 top-0 h-1 w-8 -translate-x-1/2 rounded-t-full sm:-top-2",
                      isDarkMode ? "bg-cyan-300" : "bg-sky-500",
                    )}
                  >
                    <div
                      className={cn(
                        "absolute -left-2 -top-2 h-6 w-12 rounded-full blur-md",
                        isDarkMode ? "bg-cyan-300/20" : "bg-sky-400/20",
                      )}
                    />
                    <div
                      className={cn(
                        "absolute -top-1 h-6 w-8 rounded-full blur-md",
                        isDarkMode ? "bg-cyan-300/20" : "bg-sky-400/20",
                      )}
                    />
                    <div
                      className={cn(
                        "absolute left-2 top-0 h-4 w-4 rounded-full blur-sm",
                        isDarkMode ? "bg-cyan-300/20" : "bg-sky-400/20",
                      )}
                    />
                  </div>
                </motion.div>
              )}
            </a>
          );
        })}
      </div>
    </div>
  );
}

export { NavBar };
