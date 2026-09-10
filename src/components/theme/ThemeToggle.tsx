"use client";

import { useTheme } from "./ThemeProvider";
import { Sun, Moon, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ThemeToggle() {
  const { theme, toggleTheme, isNight } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isNight ? "Day" : "Night"} Mode`}
      title={`Switch to ${isNight ? "Day" : "Night"} Mode`}
      className={`relative inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 font-mono font-black text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer select-none hover:translate-x-0.5 hover:translate-y-0.5 ${
        isNight
          ? "bg-[#1E1738] border-[#A472F7] text-white shadow-[3px_3px_0px_0px_#A472F7] hover:shadow-[1px_1px_0px_0px_#A472F7]"
          : "bg-amber-50/80 border-[#1E1B4B] text-[#1E1B4B] shadow-[3px_3px_0px_0px_#1E1B4B] hover:shadow-[1px_1px_0px_0px_#1E1B4B]"
      }`}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isNight ? (
          <motion.div
            key="night"
            initial={{ opacity: 0, rotate: -45, scale: 0.8 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 45, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-1.5 text-[#E2E8F0]"
          >
            <Moon className="w-4 h-4 text-purple-300 fill-purple-300/30" />
            <span className="hidden sm:inline-block">NIGHT</span>
          </motion.div>
        ) : (
          <motion.div
            key="day"
            initial={{ opacity: 0, rotate: 45, scale: 0.8 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: -45, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-1.5 text-[#B45309]"
          >
            <Sun className="w-4 h-4 text-amber-500 fill-amber-400" />
            <span className="hidden sm:inline-block">DAY</span>
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}
