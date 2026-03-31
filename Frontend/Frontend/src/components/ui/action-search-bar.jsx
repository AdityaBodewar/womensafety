"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { AnimatePresence, motion } from "framer-motion";
import {
  AudioLines,
  BarChart2,
  Globe,
  PlaneTakeoff,
  Search,
  Send,
  Video,
} from "lucide-react";

function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

const allActions = [
  {
    id: "1",
    label: "Book tickets",
    icon: <PlaneTakeoff className="h-4 w-4 text-blue-500" />,
    description: "Operator",
    short: "⌘K",
    end: "Agent",
  },
  {
    id: "2",
    label: "Summarize",
    icon: <BarChart2 className="h-4 w-4 text-orange-500" />,
    description: "gpt-4o",
    short: "⌘cmd+p",
    end: "Command",
  },
  {
    id: "3",
    label: "Screen Studio",
    icon: <Video className="h-4 w-4 text-purple-500" />,
    description: "gpt-4o",
    short: "",
    end: "Application",
  },
  {
    id: "4",
    label: "Talk to Jarvis",
    icon: <AudioLines className="h-4 w-4 text-green-500" />,
    description: "gpt-4o voice",
    short: "",
    end: "Active",
  },
  {
    id: "5",
    label: "Translate",
    icon: <Globe className="h-4 w-4 text-blue-500" />,
    description: "gpt-4o",
    short: "",
    end: "Command",
  },
];

function ActionSearchBar({
  actions = allActions,
  query,
  onQueryChange,
  onActionSelect,
  className = "",
  theme = "light",
  label = "Search Commands",
  placeholder = "What's up?",
  emptyMessage = "No actions found.",
}) {
  const [internalQuery, setInternalQuery] = useState("");
  const [result, setResult] = useState(null);
  const [isFocused, setIsFocused] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const isControlled = typeof query === "string";
  const currentQuery = isControlled ? query : internalQuery;
  const debouncedQuery = useDebounce(currentQuery, 200);

  useEffect(() => {
    if (!isFocused) {
      setResult(null);
      return;
    }

    if (!debouncedQuery) {
      setResult({ actions });
      return;
    }

    const normalizedQuery = debouncedQuery.toLowerCase().trim();
    const filteredActions = actions.filter((action) => {
      const searchableText =
        `${action.label || ""} ${action.description || ""}`.toLowerCase();
      return searchableText.includes(normalizedQuery);
    });

    setResult({ actions: filteredActions });
  }, [actions, debouncedQuery, isFocused]);

  const handleInputChange = (event) => {
    const nextValue = event.target.value;
    if (!isControlled) {
      setInternalQuery(nextValue);
    }
    onQueryChange?.(nextValue);
    setSelectedAction(null);
  };

  const container = {
    hidden: { opacity: 0, height: 0 },
    show: {
      opacity: 1,
      height: "auto",
      transition: {
        height: {
          duration: 0.4,
        },
        staggerChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      height: 0,
      transition: {
        height: {
          duration: 0.3,
        },
        opacity: {
          duration: 0.2,
        },
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
      },
    },
    exit: {
      opacity: 0,
      y: -10,
      transition: {
        duration: 0.2,
      },
    },
  };

  const handleFocus = () => {
    setSelectedAction(null);
    setIsFocused(true);
  };

  const safeQuery = typeof currentQuery === "string" ? currentQuery : "";
  const isDark = theme === "dark";
  const labelClass = isDark ? "text-slate-300" : "text-slate-500";
  const shellClass = isDark
    ? "bg-slate-950/88 backdrop-blur-xl"
    : "bg-white/90 backdrop-blur-sm";
  const inputClass = isDark
    ? "border-slate-700 bg-slate-900 text-slate-100 placeholder:text-slate-400 focus-visible:ring-cyan-500/40"
    : "border-slate-300 bg-white text-slate-900 focus-visible:ring-slate-300";
  const dropdownClass = isDark
    ? "border-slate-800 bg-slate-950/96 shadow-[0_20px_40px_rgba(2,6,23,0.45)]"
    : "border-slate-200 bg-white shadow-sm";
  const itemClass = isDark
    ? "hover:bg-slate-900/90"
    : "hover:bg-gray-200";
  const primaryTextClass = isDark ? "text-slate-100" : "text-gray-900";
  const mutedTextClass = isDark ? "text-slate-400" : "text-gray-400";
  const footerClass = isDark
    ? "border-slate-800 text-slate-400"
    : "border-gray-100 text-gray-500";

  return (
    <div className={`w-full ${className}`.trim()}>
      <div className="relative flex flex-col items-start justify-start">
        <div className={`z-10 w-full pb-1 pt-4 ${shellClass}`}>
          <label
            className={`mb-1 block text-xs font-medium ${labelClass}`}
            htmlFor="search"
          >
            {label}
          </label>
          <div className="relative">
            <Input
              id="search"
              type="text"
              placeholder={placeholder}
              value={safeQuery}
              onChange={handleInputChange}
              onFocus={handleFocus}
              onBlur={() => setTimeout(() => setIsFocused(false), 200)}
              className={`h-9 rounded-lg py-1.5 pl-3 pr-9 text-sm focus-visible:ring-offset-0 ${inputClass}`}
            />
            <div className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2">
              <AnimatePresence mode="popLayout">
                {safeQuery.length > 0 ? (
                  <motion.div
                    key="send"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 20, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Send className={`h-4 w-4 ${mutedTextClass}`} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="search"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 20, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Search className={`h-4 w-4 ${mutedTextClass}`} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="w-full">
          <AnimatePresence>
            {isFocused && result && !selectedAction && (
              <motion.div
                className={`mt-1 w-full overflow-hidden rounded-md border ${dropdownClass}`}
                variants={container}
                initial="hidden"
                animate="show"
                exit="exit"
              >
                <motion.ul>
                  {result.actions.length > 0 ? (
                    result.actions.map((action) => (
                      <motion.li
                        key={action.id}
                        className={`flex cursor-pointer items-center justify-between rounded-md px-3 py-2 ${itemClass}`}
                        variants={item}
                        layout
                        onClick={() => {
                          setSelectedAction(action);
                          onActionSelect?.(action);
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <span className={mutedTextClass}>{action.icon}</span>
                          <span className={`text-sm font-medium ${primaryTextClass}`}>
                            {action.label}
                          </span>
                          <span className={`text-xs ${mutedTextClass}`}>
                            {action.description}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs ${mutedTextClass}`}>
                            {action.short}
                          </span>
                          <span className={`text-right text-xs ${mutedTextClass}`}>
                            {action.end}
                          </span>
                        </div>
                      </motion.li>
                    ))
                  ) : (
                    <motion.li
                      className={`px-3 py-3 text-left text-xs ${mutedTextClass}`}
                      variants={item}
                    >
                      {emptyMessage}
                    </motion.li>
                  )}
                </motion.ul>
                <div className={`mt-2 border-t px-3 py-2 ${footerClass}`}>
                  <div className="flex items-center justify-between text-xs">
                    <span>Press ⌘K to open commands</span>
                    <span>ESC to cancel</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export { ActionSearchBar, allActions };
