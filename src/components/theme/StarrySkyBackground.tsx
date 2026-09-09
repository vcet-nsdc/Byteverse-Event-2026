"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { useTheme } from "./ThemeProvider";
import { Starfield } from "@/components/ui/starfield-1";

export default function StarrySkyBackground() {
  const { isNight } = useTheme();

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

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 pointer-events-none z-0 overflow-hidden transition-colors duration-700 ${themeConfig.skyGradient}`}
    >
      {/* 1. Hardware-Accelerated 60fps Starfield Canvas */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        <Starfield
          key={isNight ? "night-starfield" : "day-starfield"}
          starColor={themeConfig.starfieldColor}
          bgColor="transparent"
          speed={0.4}
          quantity={420}
          mouseAdjust={false}
          tiltAdjust={false}
          clickToWarp={false}
          hyperspace={false}
        />
      </div>

      {/* 2. Ambient Nebula Backdrops */}
      <motion.div
        animate={{
          scale: [1, 1.05, 1],
          opacity: isNight ? [0.45, 0.6, 0.45] : [0.2, 0.35, 0.2],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-32 left-1/4 w-[700px] h-[500px] rounded-full blur-[140px] pointer-events-none"
        style={{ backgroundColor: themeConfig.nebulaPrimary }}
      />
      <motion.div
        animate={{
          scale: [1, 1.06, 1],
          opacity: isNight ? [0.35, 0.5, 0.35] : [0.15, 0.28, 0.15],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute -bottom-24 right-1/4 w-[600px] h-[450px] rounded-full blur-[130px] pointer-events-none"
        style={{ backgroundColor: themeConfig.nebulaSecondary }}
      />
    </div>
  );
}
