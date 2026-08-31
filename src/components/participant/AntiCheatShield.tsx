"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { ShieldAlert, Lock, KeyRound, AlertTriangle, CheckCircle2 } from "lucide-react";

interface AntiCheatShieldProps {
  roundId: string;
  isActive: boolean;
  lockAllKeys?: boolean;
  onLockStateChange?: (locked: boolean) => void;
}

export default function AntiCheatShield({
  roundId,
  isActive,
  lockAllKeys = false,
  onLockStateChange,
}: AntiCheatShieldProps) {
  const [isLocked, setIsLocked] = useState(false);
  const [lockReason, setLockReason] = useState<string>("");
  const [violationCount, setViolationCount] = useState(0);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [unlockedSuccess, setUnlockedSuccess] = useState(false);

  // Sync state into refs so event listeners always access current values without re-attaching
  const isLockedRef = useRef(isLocked);
  isLockedRef.current = isLocked;

  const lockAllKeysRef = useRef(lockAllKeys);
  lockAllKeysRef.current = lockAllKeys;

  // Track if fullscreen was established
  const hasEverBeenFullscreen = useRef(false);
  const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const unlockGracePeriodEnd = useRef<number>(0);

  // Notify parent of lock state
  useEffect(() => {
    onLockStateChange?.(isLocked);
  }, [isLocked, onLockStateChange]);

  // Log violation to backend
  const logViolation = useCallback(
    async (reason: string, count: number) => {
      try {
        await fetch("/api/audit/violation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roundId, reason, count }),
        });
      } catch {
        // ignore
      }
    },
    [roundId]
  );

  // Trigger Lock immediately
  const triggerLock = useCallback(
    (reason: string) => {
      if (!isActive) return;
      if (isLockedRef.current) return;
      if (Date.now() < unlockGracePeriodEnd.current) return;

      const nextCount = violationCount + 1;
      setViolationCount(nextCount);
      setLockReason(reason);
      setIsLocked(true);
      setPinInput("");
      setPinError(null);
      setUnlockedSuccess(false);

      logViolation(reason, nextCount);
    },
    [isActive, violationCount, logViolation]
  );

  // Helper to check if currently fullscreen across all browsers
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
      setIsLocked(false);
      hasEverBeenFullscreen.current = false;
      return;
    }

    // Initialize fullscreen state
    if (checkIsFullscreen()) {
      hasEverBeenFullscreen.current = true;
    }

    // 1. Visibility Change (Tab Switch or Minimization - Instant Trigger)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (!isLockedRef.current) {
          triggerLock("Tab switch or browser minimization detected");
        }
      }
    };

    // 2. Window Blur (Focus Lost to another app or snipping tool - Immediate Trigger)
    const handleBlur = () => {
      if (isLockedRef.current) return;
      if (Date.now() < unlockGracePeriodEnd.current) return;

      // Check after 50ms tick to ensure it wasn't an internal Monaco/input focus transition
      if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = setTimeout(() => {
        if (isLockedRef.current) return;
        if (Date.now() < unlockGracePeriodEnd.current) return;
        if (document.activeElement?.tagName === "IFRAME") return;

        if (document.hidden || !document.hasFocus()) {
          triggerLock("Workstation unfocused (switched to another window or screenshot tool)");
        }
      }, 50);
    };

    const handleFocus = () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
        blurTimeoutRef.current = null;
      }
    };

    // 3. Fullscreen Exit Detection (Chrome top "X" dropdown, Esc key, F11)
    const handleFullscreenChange = () => {
      const isFullscreen = checkIsFullscreen();
      if (isFullscreen) {
        hasEverBeenFullscreen.current = true;
      } else if (hasEverBeenFullscreen.current && !isLockedRef.current && Date.now() > unlockGracePeriodEnd.current) {
        triggerLock("Exited secure fullscreen mode (Chrome exit button or window change)");
      }
    };

    // 4. Continuous 100ms Active Heartbeat scanner for Chrome top-bar dropdown exit
    const fullscreenPollInterval = setInterval(() => {
      const isFullscreen = checkIsFullscreen();
      if (isFullscreen) {
        hasEverBeenFullscreen.current = true;
      } else if (hasEverBeenFullscreen.current && !isLockedRef.current && Date.now() > unlockGracePeriodEnd.current) {
        triggerLock("Exited secure fullscreen mode (Chrome exit button or window change)");
      }
    }, 100);

    // Helper to wipe clipboard if screenshot attempted
    const wipeClipboard = () => {
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText("Screenshots are strictly prohibited in ByteVerse 2026.");
        }
      } catch {
        // ignore
      }
    };

    // 5. Strict Keyboard Trapping (Allow normal typing for AI & editor, strictly block cheating shortcuts)
    const handleKeyDown = (e: KeyboardEvent) => {
      // When Workstation Lock modal is active:
      // STRICTLY ALLOW NUMBER KEYS (0-9), Numpad (0-9), Backspace, Delete, Enter, Arrows, Tab
      if (isLockedRef.current) {
        const isNumber = /^[0-9]$/.test(e.key);
        const isNumpad = e.code.startsWith("Numpad") && /^[0-9]$/.test(e.key);
        const isEditingKey = ["Backspace", "Delete", "Enter", "ArrowLeft", "ArrowRight", "Tab"].includes(e.key);

        if (isNumber || isNumpad || isEditingKey) {
          return; // Allow typing numbers into the PIN box
        }

        // Block any letters, shortcuts, or other keys
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // If full keyboard lock is explicitly requested
      if (lockAllKeysRef.current) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      const key = e.key;
      const code = e.code;
      const isCtrlOrMeta = e.ctrlKey || e.metaKey;

      // A. PrintScreen / Screenshot Keys (PrintScreen, Win+Shift+S, Cmd+Shift+3/4/5)
      if (
        key === "PrintScreen" ||
        code === "PrintScreen" ||
        (isCtrlOrMeta && e.shiftKey && (key === "3" || key === "4" || key === "5" || key === "S" || key === "s"))
      ) {
        e.preventDefault();
        e.stopPropagation();
        wipeClipboard();
        triggerLock("Screenshot capture attempted (PrintScreen / Snipping shortcut)");
        return false;
      }

      // B. Reload / Refresh: Ctrl+R, Ctrl+Shift+R, F5
      if ((isCtrlOrMeta && (key === "r" || key === "R")) || key === "F5") {
        e.preventDefault();
        e.stopPropagation();
        triggerLock("Attempted to refresh/reload page (Ctrl+R / F5)");
        return false;
      }

      // C. Tab / Window creation or closure: Ctrl+T, Ctrl+N, Ctrl+W, Ctrl+Q
      if (isCtrlOrMeta && (key === "t" || key === "T" || key === "n" || key === "N" || key === "w" || key === "W" || key === "q" || key === "Q")) {
        e.preventDefault();
        e.stopPropagation();
        triggerLock("Attempted to switch/open/close tabs or windows");
        return false;
      }

      // D. Developer Tools & Inspect: F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+U
      if (key === "F12" || (isCtrlOrMeta && (key === "u" || key === "U" || (e.shiftKey && (key === "I" || key === "i" || key === "J" || key === "j" || key === "C" || key === "c"))))) {
        e.preventDefault();
        e.stopPropagation();
        triggerLock("Attempted to open Developer Tools / Inspect Page");
        return false;
      }

      // E. Fullscreen Exit attempts: Escape, F11
      if (key === "Escape" || key === "F11") {
        e.preventDefault();
        e.stopPropagation();
        if (key === "Escape") {
          triggerLock("Attempted to exit fullscreen using Escape key");
        }
        return false;
      }

      // F. Browser Search, Save, Print: Ctrl+P, Ctrl+S, Ctrl+O, Ctrl+H, Ctrl+J
      if (isCtrlOrMeta && (key === "p" || key === "P" || key === "s" || key === "S" || key === "o" || key === "O" || key === "h" || key === "H" || key === "j" || key === "J")) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // G. History back / forward navigation: Alt + ArrowLeft / ArrowRight
      if (e.altKey && (key === "ArrowLeft" || key === "ArrowRight" || key === "Left" || key === "Right")) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (isLockedRef.current) {
        const isNumber = /^[0-9]$/.test(e.key);
        const isNumpad = e.code.startsWith("Numpad") && /^[0-9]$/.test(e.key);
        const isEditingKey = ["Backspace", "Delete", "Enter", "ArrowLeft", "ArrowRight", "Tab"].includes(e.key);
        if (isNumber || isNumpad || isEditingKey) return;
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      if (e.key === "PrintScreen" || e.code === "PrintScreen") {
        e.preventDefault();
        e.stopPropagation();
        wipeClipboard();
        triggerLock("Screenshot capture attempted (PrintScreen key released)");
        return false;
      }
    };

    // 6. Block Context Menu (Right Click)
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // 7. BeforeUnload Warning
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "Competition in progress! Exiting will lock your station.";
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
  }, [isActive, triggerLock]);

  // Handle Proctor PIN Unlock
  const handleUnlock = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!pinInput.trim() || verifying) return;

    setVerifying(true);
    setPinError(null);

    try {
      const res = await fetch("/api/audit/violation", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: pinInput.trim() }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setUnlockedSuccess(true);
        // Grant a 4-second unlock grace period so closing Chrome popups won't re-trigger blur
        unlockGracePeriodEnd.current = Date.now() + 4000;

        try {
          if (!document.fullscreenElement) {
            await document.documentElement.requestFullscreen().catch(() => {});
          }
        } catch {
          // ignore
        }

        setTimeout(() => {
          hasEverBeenFullscreen.current = true;
          setIsLocked(false);
          setUnlockedSuccess(false);
          setPinInput("");
        }, 800);
      } else {
        setPinError(data.error ?? "Invalid Master PIN. Please request proctor assistance.");
      }
    } catch {
      setPinError("Connection error. Please request proctor assistance.");
    } finally {
      setVerifying(false);
    }
  };

  if (!isLocked) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 selection:bg-destructive selection:text-white font-sans">
      {/* Lock Modal Card */}
      <div className="max-w-lg w-full bg-white border-2 border-[#1E1B4B] rounded-3xl p-8 shadow-[8px_8px_0px_0px_#1E1B4B] relative z-10 text-center animate-in fade-in zoom-in duration-200">
        {/* Pulsing Lock Icon */}
        <div className="w-16 h-16 rounded-2xl bg-destructive/10 border-2 border-destructive mx-auto flex items-center justify-center mb-5 shadow-[3px_3px_0px_0px_#EF4444]">
          <ShieldAlert className="w-8 h-8 text-destructive" />
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-destructive/10 text-destructive border border-destructive text-xs font-mono font-black uppercase tracking-wider mb-2">
          <AlertTriangle className="w-3.5 h-3.5" /> Integrity Violation Detected (#{violationCount})
        </div>

        {/* Headline */}
        <h2 className="font-display font-black text-2xl text-[#0F172A] tracking-tight uppercase mb-2">
          Workstation Locked
        </h2>

        {/* Violation Reason Box */}
        <div className="bg-destructive/10 border-2 border-destructive rounded-2xl p-4 mb-4 text-center">
          <div className="text-[11px] font-mono font-bold text-[#6E6E6E] uppercase tracking-wider">
            Reason For Lock:
          </div>
          <div className="text-destructive font-mono font-black text-sm sm:text-base mt-1">
            {lockReason || "Unauthorized navigation / background application switch"}
          </div>
        </div>

        <div className="bg-[#F8F9FD] border-2 border-[#1E1B4B] rounded-2xl p-4 mb-5 text-left text-xs text-[#0F172A] font-mono space-y-1 shadow-[2px_2px_0px_0px_#1E1B4B]">
          <div className="font-extrabold flex items-center gap-2 text-[#7F45DB]">
            <Lock className="w-3.5 h-3.5" /> On-Site Proctor Authorization Required
          </div>
          <div className="text-[#6E6E6E]">• Please remain at your workstation.</div>
          <div className="text-[#6E6E6E]">• Raise your hand for an NSDC event proctor.</div>
          <div className="text-[#6E6E6E]">• The proctor will enter the Master PIN (123456 or 2026) to resume your session.</div>
        </div>

        {/* Non-form container to prevent browser password managers from intercepting & popping up save dialogs */}
        <div className="space-y-4">
          <div>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-[#8A8A8A] absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                name="byteverse_proctor_token_auth"
                id="byteverse_proctor_token_auth"
                autoComplete="one-time-code"
                data-lpignore="true"
                data-1p-ignore="true"
                data-form-type="other"
                data-private="true"
                style={{ WebkitTextSecurity: "disc" } as React.CSSProperties}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ""))}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleUnlock();
                  }
                }}
                placeholder="Proctor Master PIN"
                maxLength={8}
                autoFocus
                className="w-full bg-[#F8F9FD] border-2 border-[#1E1B4B] focus:border-[#7F45DB] text-[#0F172A] text-center font-mono text-xl tracking-widest rounded-2xl pl-10 pr-4 py-3 focus:outline-none transition-all shadow-inner"
              />
            </div>
            {pinError && (
              <p className="text-xs font-mono text-destructive mt-2 font-bold">
                {pinError}
              </p>
            )}
            {unlockedSuccess && (
              <p className="text-xs font-mono text-emerald-600 mt-2 font-bold flex items-center justify-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Station Authorized. Resuming arena...
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => handleUnlock()}
            disabled={verifying || !pinInput.trim() || unlockedSuccess}
            className="w-full py-3.5 rounded-xl bg-destructive hover:bg-destructive/90 text-white font-mono font-black text-xs uppercase tracking-wider transition-all border-2 border-[#1E1B4B] shadow-[3px_3px_0px_0px_#1E1B4B] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Lock className="w-4 h-4" />
            <span>{verifying ? "Verifying PIN..." : unlockedSuccess ? "Unlocked!" : "Unlock Workstation"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
