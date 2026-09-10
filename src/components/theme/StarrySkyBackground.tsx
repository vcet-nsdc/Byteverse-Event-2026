"use client";

import React, { useMemo } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "./ThemeProvider";
import { Starfield } from "@/components/ui/starfield-1";

export default function StarrySkyBackground() {
  const pathname = usePathname();
  const { isNight } = useTheme();
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    // Defer canvas startup until critical path hydration is complete
    if (typeof window !== "undefined") {
      if ("requestIdleCallback" in window) {
        (window as any).requestIdleCallback(() => setIsMounted(true));
      } else {
        setTimeout(() => setIsMounted(true), 200);
      }
    }
  }, []);

  // Day vs Night palette
  const themeConfig = useMemo(() => {
    if (isNight) {
      return {
        // Deep midnight cosmic canvas with luminous starlight
        starfieldColor: "rgba(255, 255, 255, 0.95)",
        skyGradient: "bg-[#060913]",
        nebulaPrimary: "rgba(127, 69, 219, 0.20)",
        nebulaSecondary: "rgba(164, 114, 247, 0.14)",
      };
    } else {
      return {
        // Daytime golden-amber stardust floating gracefully across a gentle daylight sky
        starfieldColor: "rgba(180, 83, 9, 0.72)",
        skyGradient: "bg-[#F1F5F9]",
        nebulaPrimary: "rgba(127, 69, 219, 0.08)",
        nebulaSecondary: "rgba(245, 158, 11, 0.07)",
      };
    }
  }, [isNight]);

  // Hide cosmic starfield and animated nebulae on admin interfaces to enforce a clean light dashboard
  const isAdminRoute =
    pathname?.startsWith("/admin") ||
    pathname === "/admin-login" ||
    pathname === "/superadmin-login";

  if (isAdminRoute) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 pointer-events-none z-0 overflow-hidden transition-colors duration-700 ${themeConfig.skyGradient}`}
    >
      {/* 1. Hardware-Accelerated 60fps Starfield Canvas (Deferred post-hydration) */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        {isMounted && (
          <Starfield
            key={isNight ? "night-starfield" : "day-starfield"}
            starColor={themeConfig.starfieldColor}
            bgColor="transparent"
            speed={0.4}
            quantity={140}
            mouseAdjust={false}
            tiltAdjust={false}
            clickToWarp={false}
            hyperspace={false}
          />
        )}
      </div>

      {/* 2. Hardware-Accelerated CSS Ambient Nebula Backdrops (Zero Main-Thread Overhead) */}
      <div
        className="absolute -top-32 left-1/4 w-[700px] h-[500px] rounded-full blur-[140px] pointer-events-none animate-nebula-1"
        style={{ backgroundColor: themeConfig.nebulaPrimary }}
      />
      <div
        className="absolute -bottom-24 right-1/4 w-[600px] h-[450px] rounded-full blur-[130px] pointer-events-none animate-nebula-2"
        style={{ backgroundColor: themeConfig.nebulaSecondary }}
      />
    </div>
  );
}
