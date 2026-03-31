"use client";

import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { ArrowRight, Circle } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

function ElegantShape({
  className,
  delay = 0,
  width = 400,
  height = 100,
  rotate = 0,
  gradient = "from-white/[0.08]",
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: -150,
        rotate: rotate - 15,
      }}
      animate={{
        opacity: 1,
        y: 0,
        rotate,
      }}
      transition={{
        duration: 2.4,
        delay,
        ease: [0.23, 0.86, 0.39, 0.96],
        opacity: { duration: 1.2 },
      }}
      className={cn("absolute", className)}
    >
      <motion.div
        animate={{
          y: [0, 15, 0],
        }}
        transition={{
          duration: 12,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        style={{
          width,
          height,
        }}
        className="relative"
      >
        <div
          className={cn(
            "absolute inset-0 rounded-full",
            "bg-gradient-to-r to-transparent",
            gradient,
            "border-2 border-white/[0.15] backdrop-blur-[2px]",
            "shadow-[0_8px_32px_0_rgba(255,255,255,0.1)]",
            "after:absolute after:inset-0 after:rounded-full",
            "after:bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2),transparent_70%)]",
          )}
        />
      </motion.div>
    </motion.div>
  );
}

function HeroGeometric({
  badge = "Women Safety Navigation",
  title1 = "Navigate with",
  title2 = "Calm Precision",
  description = "Move from a refined landing experience into the live safety map, with account access kept visible and your routing tools ready when you need them.",
  primaryLabel = "Open Map",
  secondaryLabel = "Account",
  accountHref = "#account",
  onPrimaryAction,
  isDarkMode = false,
}) {
  const [isReady, setIsReady] = useState(false);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const glowX = useTransform(pointerX, [-0.5, 0.5], ["-10%", "10%"]);
  const glowY = useTransform(pointerY, [-0.5, 0.5], ["-8%", "8%"]);

  useEffect(() => {
    setIsReady(true);
  }, []);

  const fadeUpVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (index) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 1,
        delay: 0.35 + index * 0.18,
        ease: [0.25, 0.4, 0.25, 1],
      },
    }),
  };

  const handleMove = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const normalizedX = (event.clientX - bounds.left) / bounds.width - 0.5;
    const normalizedY = (event.clientY - bounds.top) / bounds.height - 0.5;

    animate(pointerX, normalizedX, { duration: 0.35, ease: "easeOut" });
    animate(pointerY, normalizedY, { duration: 0.35, ease: "easeOut" });
  };

  return (
    <div
      className={cn(
        "relative flex min-h-screen w-full items-center justify-center overflow-hidden transition-colors duration-500",
        isDarkMode ? "bg-[#030303]" : "bg-[#f8fbff]",
      )}
      onMouseMove={handleMove}
      onMouseLeave={() => {
        animate(pointerX, 0, { duration: 0.45, ease: "easeOut" });
        animate(pointerY, 0, { duration: 0.45, ease: "easeOut" });
      }}
    >
      <motion.div
        style={{ x: glowX, y: glowY }}
        className={cn(
          "absolute inset-0 blur-3xl",
          isDarkMode
            ? "bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.18),transparent_32%),radial-gradient(circle_at_80%_20%,rgba(244,63,94,0.14),transparent_24%),radial-gradient(circle_at_20%_80%,rgba(34,211,238,0.16),transparent_24%)]"
            : "bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.18),transparent_32%),radial-gradient(circle_at_80%_20%,rgba(251,146,60,0.14),transparent_24%),radial-gradient(circle_at_20%_80%,rgba(129,140,248,0.16),transparent_24%)]",
        )}
      />

      <div
        className={cn(
          "absolute inset-0 blur-3xl",
          isDarkMode
            ? "bg-gradient-to-br from-indigo-500/[0.05] via-transparent to-rose-500/[0.05]"
            : "bg-gradient-to-br from-sky-400/[0.08] via-transparent to-amber-400/[0.06]",
        )}
      />

      <div className="absolute inset-0 overflow-hidden">
        <ElegantShape
          delay={0.3}
          width={600}
          height={140}
          rotate={12}
          gradient="from-indigo-500/[0.15]"
          className="left-[-10%] top-[15%] md:left-[-5%] md:top-[20%]"
        />

        <ElegantShape
          delay={0.5}
          width={500}
          height={120}
          rotate={-15}
          gradient="from-rose-500/[0.15]"
          className="right-[-5%] top-[70%] md:right-[0%] md:top-[75%]"
        />

        <ElegantShape
          delay={0.4}
          width={300}
          height={80}
          rotate={-8}
          gradient="from-violet-500/[0.15]"
          className="bottom-[5%] left-[5%] md:bottom-[10%] md:left-[10%]"
        />

        <ElegantShape
          delay={0.6}
          width={200}
          height={60}
          rotate={20}
          gradient="from-amber-500/[0.15]"
          className="right-[15%] top-[10%] md:right-[20%] md:top-[15%]"
        />

        <ElegantShape
          delay={0.7}
          width={150}
          height={40}
          rotate={-25}
          gradient="from-cyan-500/[0.15]"
          className="left-[20%] top-[5%] md:left-[25%] md:top-[10%]"
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 pb-12 pt-24 md:px-6">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            custom={0}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className={cn(
              "mb-8 inline-flex items-center gap-2 rounded-full px-3 py-1 md:mb-12",
              isDarkMode
                ? "border border-white/[0.08] bg-white/[0.03]"
                : "border border-slate-300/70 bg-white/80 shadow-[0_10px_30px_rgba(148,163,184,0.18)]",
            )}
          >
            <Circle className={cn("h-2 w-2", isDarkMode ? "fill-rose-500/80" : "fill-sky-500/80")} />
            <span
              className={cn(
                "text-sm tracking-wide",
                isDarkMode ? "text-white/60" : "text-slate-600",
              )}
            >
              {badge}
            </span>
          </motion.div>

          <motion.div custom={1} variants={fadeUpVariants} initial="hidden" animate="visible">
            <h1 className="mb-6 text-5xl font-bold tracking-tight sm:text-6xl md:mb-8 md:text-8xl">
              <span
                className={cn(
                  "bg-clip-text text-transparent",
                  isDarkMode
                    ? "bg-gradient-to-b from-white to-white/80"
                    : "bg-gradient-to-b from-slate-950 to-slate-700",
                )}
              >
                {title1}
              </span>
              <br />
              <span
                className={cn(
                  "bg-clip-text text-transparent",
                  isDarkMode
                    ? "bg-gradient-to-r from-indigo-300 via-white/90 to-rose-300"
                    : "bg-gradient-to-r from-sky-600 via-slate-800 to-amber-500",
                )}
              >
                {title2}
              </span>
            </h1>
          </motion.div>

          <motion.div custom={2} variants={fadeUpVariants} initial="hidden" animate="visible">
            <p
              className={cn(
                "mx-auto mb-8 max-w-2xl px-4 text-base font-light leading-relaxed tracking-wide sm:text-lg md:text-xl",
                isDarkMode ? "text-white/40" : "text-slate-600",
              )}
            >
              {description}
            </p>
          </motion.div>

          <motion.div
            custom={3}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <button
              type="button"
              onClick={onPrimaryAction}
              className={cn(
                "group inline-flex items-center justify-center gap-3 rounded-full px-6 py-3 text-sm font-semibold transition hover:-translate-y-0.5",
                isDarkMode
                  ? "bg-white text-slate-950"
                  : "bg-slate-950 text-white shadow-[0_18px_40px_rgba(15,23,42,0.18)]",
              )}
            >
              {primaryLabel}
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </button>

            <a
              href={accountHref}
              className={cn(
                "inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition",
                isDarkMode
                  ? "border border-white/10 bg-white/[0.04] text-white hover:border-white/25 hover:bg-white/[0.08]"
                  : "border border-slate-300 bg-white/75 text-slate-800 hover:border-slate-400 hover:bg-white",
              )}
            >
              {secondaryLabel}
            </a>
          </motion.div>

          <motion.div
            custom={4}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className={cn(
              "mx-auto mt-16 max-w-2xl rounded-[28px] p-5 backdrop-blur-xl",
              isDarkMode
                ? "border border-white/10 bg-white/[0.04]"
                : "border border-slate-300/70 bg-white/75 shadow-[0_20px_50px_rgba(148,163,184,0.18)]",
              isReady ? "opacity-100" : "opacity-0",
            )}
            id="account"
          >
            <p
              className={cn(
                "text-xs uppercase tracking-[0.28em]",
                isDarkMode ? "text-cyan-100/60" : "text-sky-700/70",
              )}
            >
              Account
            </p>
            <h2
              className={cn(
                "mt-3 text-2xl font-semibold md:text-3xl",
                isDarkMode ? "text-white" : "text-slate-900",
              )}
            >
              Keep trusted contacts, saved places, and safety preferences within reach.
            </h2>
            <p
              className={cn(
                "mt-3 text-sm leading-7 md:text-base",
                isDarkMode ? "text-white/50" : "text-slate-600",
              )}
            >
              This landing page is now intentionally minimal: the navbar, the hero,
              and a compact account anchor. The `Map` link still opens your existing
              live navigation experience immediately.
            </p>
          </motion.div>
        </div>
      </div>

      <div
        className={cn(
          "pointer-events-none absolute inset-0 bg-gradient-to-t via-transparent",
          isDarkMode ? "from-[#030303] to-[#030303]/80" : "from-[#f8fbff] to-[#f8fbff]/80",
        )}
      />
    </div>
  );
}

export { HeroGeometric };
