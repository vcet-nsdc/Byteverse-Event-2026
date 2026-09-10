"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "day" | "night";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isNight: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "day",
  toggleTheme: () => {},
  isNight: false,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("day");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("byteverse_theme") as Theme | null;
    if (saved === "night" || saved === "day") {
      setTheme(saved);
      if (saved === "night") {
        document.documentElement.classList.add("dark");
        document.documentElement.setAttribute("data-theme", "night");
      } else {
        document.documentElement.classList.remove("dark");
        document.documentElement.setAttribute("data-theme", "day");
      }
    } else {
      // Default to day mode as requested
      document.documentElement.classList.remove("dark");
      document.documentElement.setAttribute("data-theme", "day");
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme: Theme = theme === "day" ? "night" : "day";
    setTheme(nextTheme);
    localStorage.setItem("byteverse_theme", nextTheme);

    if (nextTheme === "night") {
      document.documentElement.classList.add("dark");
      document.documentElement.setAttribute("data-theme", "night");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.setAttribute("data-theme", "day");
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isNight: theme === "night" }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
