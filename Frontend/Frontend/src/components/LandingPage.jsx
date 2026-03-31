import React from "react";
import { Map, User } from "lucide-react";
import { HeroGeometric } from "@/components/ui/shape-landing-hero";
import { NavBar } from "@/components/ui/tube-light-navbar";
import { ThemeToggle } from "@/components/ui/theme-toggle";

function LandingPage({ isDarkMode = false, onOpenMap, onToggleTheme }) {
  const navItems = [
    { name: "Map", url: "#map", icon: Map, onClick: onOpenMap },
    { name: "Account", url: "#account", icon: User },
  ];

  return (
    <div
      className={`relative min-h-screen overflow-hidden ${isDarkMode ? "bg-[#030303] text-white" : "bg-[#f8fbff] text-slate-900"
        }`}
    >
      <ThemeToggle isDarkMode={isDarkMode} onToggle={onToggleTheme} />
      <NavBar items={navItems} isDarkMode={isDarkMode} />
      <HeroGeometric
        badge="Women Safety Navigation"
        title1="Navigate Smarter"
        title2="Stay Safer"
        description="AI-powered safe route guidance designed to protect you at every step.Avoid high-risk zones, get alerts, and reach your destination with confidence."
        primaryLabel="Launch Map"
        secondaryLabel="Account"
        accountHref="#account"
        onPrimaryAction={onOpenMap}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}

export default LandingPage;
