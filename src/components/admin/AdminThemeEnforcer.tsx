"use client";

import { useEffect } from "react";

/**
 * Enforces Light Theme across all administrative screens.
 * Temporarily removes 'dark' class on mount, and restores user's saved preference on unmount.
 */
export default function AdminThemeEnforcer() {
  useEffect(() => {
    // 1. Force light theme for administrative view
    const wasDark = document.documentElement.classList.contains("dark");
    document.documentElement.classList.remove("dark");
    document.documentElement.setAttribute("data-theme", "day");

    // 2. Restore user's preference when exiting admin area
    return () => {
      const savedTheme = localStorage.getItem("byteverse_theme");
      if (savedTheme === "night" || wasDark) {
        document.documentElement.classList.add("dark");
        document.documentElement.setAttribute("data-theme", "night");
      }
    };
  }, []);

  return null;
}
