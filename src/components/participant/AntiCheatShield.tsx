"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, AlertTriangle, Heart, LogOut, ArrowRight } from "lucide-react";

interface AntiCheatShieldProps {
  roundId: string;
  isActive: boolean;
  lockAllKeys?: boolean;
  redirectUrl?: string;
  onLockStateChange?: (locked: boolean) => void;
}

export default function AntiCheatShield({
  roundId,
  isActive,
  lockAllKeys = false,
  redirectUrl = "/event?disqualified=true",
  onLockStateChange,
}: AntiCheatShieldProps) {
  const router = useRouter();

  const [hearts, setHearts] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem(`byteverse_hearts_${roundId}`);
      if (stored !== null) return parseInt(stored, 10);
    }
    return 3;
  });

  const [isDisqualified, setIsDisqualified] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return (
        sessionStorage.getItem(`byteverse_disqualified_${roundId}`) === "true" ||
        localStorage.getItem(`byteverse_disqualified_${roundId}`) === "true"
      );
    }
    return false;
  });

  const [showWarning, setShowWarning] = useState(false);
  const [lockReason, setLockReason] = useState<string>("");
  const [violationCount, setViolationCount] = useState(0);

  // Sync state into refs
  const isLockedRef = useRef(isDisqualified || showWarning);
  isLockedRef.current = isDisqualified || showWarning;

  const isDisqualifiedRef = useRef(isDisqualified);
  isDisqualifiedRef.current = isDisqualified;

  const lockAllKeysRef = useRef(lockAllKeys);
  lockAllKeysRef.current = lockAllKeys;

  const hasEverBeenFullscreen = useRef(false);
  const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const unlockGracePeriodEnd = useRef<number>(0);

  // Notify parent of lock state
  useEffect(() => {
    onLockStateChange?.(isDisqualified || showWarning);
  }, [isDisqualified, showWarning, onLockStateChange]);

  // If already disqualified when loading, immediately redirect out
  useEffect(() => {
    if (isDisqualified) {
      const timer = setTimeout(() => {
        router.push(redirectUrl);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isDisqualified, redirectUrl, router]);

  // Log violation to backend
  const logViolation = useCallback(
    async (reason: string, count: number, currentHearts: number, actionType: string) => {
      try {
        await fetch("/api/audit/violation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roundId,
            reason,
            count,
            action: actionType,
            status: currentHearts <= 0 ? "DISQUALIFIED" : "ACTIVE",
            heartsRemaining: currentHearts,
          }),
        });
      } catch {
        // ignore
      }
    },
    [roundId]
  );

  // Trigger violation & heart deduction (Zero Tolerance - No Master PIN)
  const triggerViolation = useCallback(
    (reason: string) => {
      if (!isActive || isDisqualifiedRef.current) return;
      if (Date.now() < unlockGracePeriodEnd.current) return;

      const nextCount = violationCount + 1;
      setViolationCount(nextCount);
      setLockReason(reason);

      const nextHearts = Math.max(0, hearts - 1);
      setHearts(nextHearts);

      if (typeof window !== "undefined") {
        sessionStorage.setItem(`byteverse_hearts_${roundId}`, String(nextHearts));
      }

      if (nextHearts <= 0) {
        setIsDisqualified(true);
        if (typeof window !== "undefined") {
          sessionStorage.setItem(`byteverse_disqualified_${roundId}`, "true");
          localStorage.setItem(`byteverse_disqualified_${roundId}`, "true");
        }
        logViolation(reason, nextCount, 0, "DISQUALIFIED");

        // Automatically quit to outside competition
        setTimeout(() => {
          router.push(redirectUrl);
        }, 1600);
      } else {
        setShowWarning(true);
        logViolation(reason, nextCount, nextHearts, "WARNING");
      }
    },
    [isActive, hearts, violationCount, roundId, logViolation, redirectUrl, router]
  );

  // Helper to check if currently fullscreen
  const checkIsFullscreen = () => {
    return Boolean(
      document.fullscreenElement ||
      // @ts-expect-error browser compatibility prefix
      document.webkitFullscreenElement ||
      // @ts-expect-error browser compatibility prefix
      document.mozFullScreenElement ||
      // @ts-expect-error browser compatibility prefix
      document.msFullscreenElement
    );
  };

  // Event Listeners for Anti-Cheat
  useEffect(() => {
    if (!isActive) {
      hasEverBeenFullscreen.current = false;
      return;
    }

    if (checkIsFullscreen()) {
      hasEverBeenFullscreen.current = true;
    }

    // 1. Visibility Change (Tab Switch or Minimization)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (!isDisqualifiedRef.current) {
          triggerViolation("Tab switch or browser minimization detected");
        }
      }
    };

    // 2. Window Blur (Focus Lost to another app or snipping tool)
    const handleBlur = () => {
      if (isDisqualifiedRef.current) return;
      if (Date.now() < unlockGracePeriodEnd.current) return;

      if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = setTimeout(() => {
        if (isDisqualifiedRef.current) return;
        if (Date.now() < unlockGracePeriodEnd.current) return;
        if (document.activeElement?.tagName === "IFRAME") return;

        if (document.hidden || !document.hasFocus()) {
          triggerViolation("Workstation unfocused (external application, background assistant, or screen capture detected)");
        }
      }, 50);
    };

    const handleFocus = () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
        blurTimeoutRef.current = null;
      }
    };

    // 3. Fullscreen Exit Detection
    const handleFullscreenChange = () => {
      const isFullscreen = checkIsFullscreen();
      if (isFullscreen) {
        hasEverBeenFullscreen.current = true;
      } else if (hasEverBeenFullscreen.current && !isDisqualifiedRef.current && Date.now() > unlockGracePeriodEnd.current) {
        triggerViolation("Exited secure fullscreen mode (Window unmaximized or altered)");
      }
    };

    // 4. Continuous 120ms Scanner
    const fullscreenPollInterval = setInterval(() => {
      const isFullscreen = checkIsFullscreen();
      if (isFullscreen) {
        hasEverBeenFullscreen.current = true;
      } else if (hasEverBeenFullscreen.current && !isDisqualifiedRef.current && Date.now() > unlockGracePeriodEnd.current) {
        triggerViolation("Exited secure fullscreen mode (Chrome exit button or window change)");
      }
    }, 120);

    // Clipboard Wipe
    const wipeClipboard = () => {
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText("Screenshots are strictly prohibited in ByteVerse 2026.");
        }
      } catch {
        // ignore
      }
    };

    // 5. Strict Keyboard Trapping
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isDisqualifiedRef.current) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      if (lockAllKeysRef.current) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      const key = e.key;
      const code = e.code;
      const isCtrlOrMeta = e.ctrlKey || e.metaKey;

      // Screenshot Keys
      if (
        key === "PrintScreen" ||
        code === "PrintScreen" ||
        (isCtrlOrMeta && e.shiftKey && (key === "3" || key === "4" || key === "5" || key === "S" || key === "s"))
      ) {
        e.preventDefault();
        e.stopPropagation();
        wipeClipboard();
        triggerViolation("Screenshot capture attempted (PrintScreen / Snipping shortcut)");
        return false;
      }

      // Reload / Refresh: Ctrl+R, F5
      if ((isCtrlOrMeta && (key === "r" || key === "R")) || key === "F5") {
        e.preventDefault();
        e.stopPropagation();
        triggerViolation("Attempted to refresh/reload page (Ctrl+R / F5)");
        return false;
      }

      // Tab / Window: Ctrl+T, Ctrl+N, Ctrl+W
      if (isCtrlOrMeta && (key === "t" || key === "T" || key === "n" || key === "N" || key === "w" || key === "W")) {
        e.preventDefault();
        e.stopPropagation();
        triggerViolation("Attempted to switch/open/close tabs or windows");
        return false;
      }

      // Dev Tools: F12, Ctrl+Shift+I/J/C, Ctrl+U
      if (key === "F12" || (isCtrlOrMeta && (key === "u" || key === "U" || (e.shiftKey && (key === "I" || key === "i" || key === "J" || key === "j" || key === "C" || key === "c"))))) {
        e.preventDefault();
        e.stopPropagation();
        triggerViolation("Attempted to open Developer Tools / Inspect Page");
        return false;
      }

      // Fullscreen Exit
      if (key === "Escape" || key === "F11") {
        e.preventDefault();
        e.stopPropagation();
        if (key === "Escape") {
          triggerViolation("Attempted to exit fullscreen using Escape key");
        }
        return false;
      }

      // Search, Save, Print
      if (isCtrlOrMeta && (key === "p" || key === "P" || key === "s" || key === "S" || key === "o" || key === "O" || key === "h" || key === "H" || key === "j" || key === "J")) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (isDisqualifiedRef.current) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      if (e.key === "PrintScreen" || e.code === "PrintScreen") {
        e.preventDefault();
        e.stopPropagation();
        wipeClipboard();
        triggerViolation("Screenshot capture attempted (PrintScreen key released)");
        return false;
      }
    };

    // Right Click
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // BeforeUnload Warning
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "Competition in progress! Exiting will disqualify you.";
      return e.returnValue;
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);
    window.addEventListener("keydown", handleKeyDown, true);
    window.addEventListener("keyup", handleKeyUp, true);
    document.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      clearInterval(fullscreenPollInterval);
      if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
      document.removeEventListener("MSFullscreenChange", handleFullscreenChange);
      window.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("keyup", handleKeyUp, true);
      document.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isActive, triggerViolation]);

  // Acknowledge Warning & Resume
  const handleAcknowledgeWarning = () => {
    unlockGracePeriodEnd.current = Date.now() + 2500;
    setShowWarning(false);
    try {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } catch {
      // ignore
    }
  };

  // 1. DISQUALIFIED MODAL (Zero-Tolerance: No Master PIN Prompt)
  if (isDisqualified) {
    return (
      <div className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 selection:bg-red-600 selection:text-white font-sans">
        <div className="max-w-md w-full bg-[#0F0B1E] border-2 border-red-600 rounded-3xl p-8 shadow-[0_0_50px_rgba(239,68,68,0.4)] text-center animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border-2 border-red-500 mx-auto flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(239,68,68,0.3)]">
            <ShieldAlert className="w-9 h-9 text-red-500 animate-pulse" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 text-xs font-mono font-black uppercase tracking-wider mb-3">
            <AlertTriangle className="w-3.5 h-3.5" /> Station Disqualified (0 Hearts)
          </div>

          <h2 className="font-display font-black text-2xl text-white tracking-tight uppercase mb-2">
            Disqualified From Contest
          </h2>

          {/* Hearts Display (All 3 lost) */}
          <div className="flex items-center justify-center gap-3 my-4 py-2 px-4 rounded-xl bg-black/40 border border-white/10 w-fit mx-auto">
            {[0, 1, 2].map((idx) => (
              <div key={idx} className="flex flex-col items-center">
                <Heart className="w-6 h-6 text-gray-600 fill-gray-800 stroke-gray-600 opacity-40" />
                <span className="text-[10px] font-mono font-bold text-red-400 mt-0.5">Lost</span>
              </div>
            ))}
          </div>

          <div className="bg-red-950/40 border border-red-800/60 rounded-2xl p-4 mb-4 text-center">
            <div className="text-[11px] font-mono font-bold text-gray-400 uppercase tracking-wider">
              Termination Cause:
            </div>
            <div className="text-red-400 font-mono font-bold text-xs sm:text-sm mt-1">
              {lockReason || "Zero-tolerance integrity policy violation detected"}
            </div>
          </div>

          <p className="text-xs text-gray-300 font-mono leading-relaxed mb-6">
            All 3 hearts have been depleted. Per competition regulations, your workstation has been ejected and your status is marked as <strong className="text-red-400">DISQUALIFIED</strong> on the organizer admin screen.
          </p>

          <button
            type="button"
            onClick={() => router.push(redirectUrl)}
            className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-mono font-black text-xs uppercase tracking-wider transition-all border-2 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)] flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Exit to Competition Hub</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // 2. WARNING OVERLAY (When a heart is lost, hearts remaining > 0)
  if (showWarning) {
    return (
      <div className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-[#16122C] border-2 border-amber-500/70 rounded-3xl p-7 shadow-[0_0_35px_rgba(245,158,11,0.25)] text-center animate-in fade-in zoom-in-95 duration-200">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border-2 border-amber-500 mx-auto flex items-center justify-center mb-3">
            <AlertTriangle className="w-7 h-7 text-amber-400" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-mono font-black uppercase tracking-wider mb-2">
            Anti-Cheat Warning ({violationCount}/3)
          </div>

          <h3 className="font-display font-black text-xl text-white uppercase tracking-tight mb-2">
            Heart Lost! {hearts} {hearts === 1 ? "Life" : "Lives"} Remaining
          </h3>

          {/* Hearts Status */}
          <div className="flex items-center justify-center gap-3 my-3">
            {[0, 1, 2].map((idx) => {
              const isAlive = idx < hearts;
              return (
                <Heart
                  key={idx}
                  className={`w-7 h-7 transition-all ${
                    isAlive
                      ? "text-red-500 fill-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.7)]"
                      : "text-gray-600 fill-gray-800 opacity-30"
                  }`}
                />
              );
            })}
          </div>

          <div className="bg-amber-950/30 border border-amber-800/40 rounded-xl p-3 my-3 text-left font-mono text-xs">
            <div className="text-amber-400 font-bold">Detected: {lockReason}</div>
            <div className="text-gray-400 mt-1 text-[11px]">
              Note: Do not switch tabs, unmaximize your screen, or use external screenshot applications.
            </div>
          </div>

          <button
            type="button"
            onClick={handleAcknowledgeWarning}
            className="w-full mt-2 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-mono font-black text-xs uppercase tracking-wider transition-all cursor-pointer"
          >
            I Understand & Return to Contest ({hearts} Hearts Left)
          </button>
        </div>
      </div>
    );
  }

  return null;
}
