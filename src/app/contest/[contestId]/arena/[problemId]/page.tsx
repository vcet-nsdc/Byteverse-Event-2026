"use client";

import { useEffect, useState, use, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Trophy,
  Clock,
  Play,
  Send,
  ArrowLeft,
  ChevronDown,
  CheckCircle2,
  XCircle,
  Zap,
  RotateCcw,
  Copy,
  Check,
  FileCode,
  History,
  ShieldAlert,
  AlertCircle,
  ExternalLink,
  Layers,
  Heart,
  Lock,
  KeyRound,
  AlertTriangle,
} from "lucide-react";
import { FormattedStatement } from "@/components/problem/formatted-statement";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

const LANG_DEFAULTS: Record<string, string> = {
  cpp: `#include <iostream>
#include <vector>
#include <string>
#include <algorithm>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    // Read input and implement your solution
    
    return 0;
}`,
  c: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main() {
    // Read input and implement your solution
    
    return 0;
}`,
  java: `import java.io.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        
        // Read input and implement your solution
    }
}`,
  python: `import sys

def main():
    input_data = sys.stdin.read().split()
    if not input_data:
        return

    # Read input and implement your solution

if __name__ == '__main__':
    main()`,
};

interface ProblemItem {
  id: string;
  title: string;
  difficulty: string;
  tags?: string[];
  points?: number;
}

interface ContestDetail {
  id: string;
  title: string;
  type: string;
  status: string;
  endsAt: string;
  problems: ProblemItem[];
  leaderboard?: any[];
}

export default function ContestArenaPage({
  params,
}: {
  params: Promise<{ contestId: string; problemId: string }>;
}) {
  const { contestId, problemId } = use(params);
  const router = useRouter();

  // Active Problem State (allows zero-lag client switching without unmounting workspace)
  const [activeProblemId, setActiveProblemId] = useState<string>(problemId);
  const problemGlobalCache = useRef<Record<string, any>>({});
  const problemCodesRef = useRef<Record<string, Record<string, string>>>({});

  // Contest and Problem Data
  const [contest, setContest] = useState<ContestDetail | null>(null);
  const [problem, setProblem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Editor State
  const [lang, setLang] = useState<"cpp" | "c" | "java" | "python">("cpp");
  const [code, setCode] = useState<string>("");
  const [codeMap, setCodeMap] = useState<Record<string, string>>({});

  // Console & Execution State
  const [customInput, setCustomInput] = useState("");
  const [activeConsoleTab, setActiveConsoleTab] = useState<"output" | "verdict" | "input">("output");
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [runResult, setRunResult] = useState<any>(null);
  const [submissionResult, setSubmissionResult] = useState<any>(null);
  const [submissionsList, setSubmissionsList] = useState<any[]>([]);

  // Navigation & UI
  const [leftTab, setLeftTab] = useState<"statement" | "submissions">("statement");
  const [copied, setCopied] = useState(false);
  const [isProblemDropdownOpen, setIsProblemDropdownOpen] = useState(false);

  // Timer
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);

  // ── Zero-Tolerance Anti-Cheat 3 Hearts System ──
  const [lives, setLives] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem(`bv_contest_lives_${contestId}`);
      if (saved !== null) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 3) return parsed;
      }
    }
    return 3;
  });
  const [isDisqualified, setIsDisqualified] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const isDisqual =
        sessionStorage.getItem(`bv_contest_disqualified_${contestId}`) === "true" ||
        localStorage.getItem(`bv_contest_disqualified_${contestId}`) === "true" ||
        sessionStorage.getItem(`bv_contest_lives_${contestId}`) === "0";
      return Boolean(isDisqual);
    }
    return false;
  });
  const [showViolationWarning, setShowViolationWarning] = useState(false);
  const [lastViolationReason, setLastViolationReason] = useState("");
  const [recentlyLostHeartIndex, setRecentlyLostHeartIndex] = useState<number | null>(null);
  const [warningCountdown, setWarningCountdown] = useState(3);

  const gracePeriodEndRef = useRef<number>(0);
  const isDisqualifiedRef = useRef(isDisqualified);
  isDisqualifiedRef.current = isDisqualified;
  const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasEverBeenFullscreen = useRef(false);

  // Mandatory Contestant Authentication Gate
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [authChecking, setAuthChecking] = useState(true);

  useEffect(() => {
    async function verifyAuth() {
      try {
        const res = await fetch("/api/auth/session");
        if (res.ok) {
          const data = await res.json();
          if (data?.user?.id) {
            setSessionUser(data.user);
            setAuthChecking(false);
            return;
          }
        }
      } catch {
        // ignore
      }
      setAuthChecking(false);
      router.replace(`/login?callbackUrl=${encodeURIComponent(`/contest/${contestId}/arena/${activeProblemId}`)}`);
    }
    verifyAuth();
  }, [contestId, activeProblemId, router]);

  // If already disqualified, immediately kick outside to contest overview
  useEffect(() => {
    if (isDisqualified) {
      router.replace(`/contest/${contestId}?disqualified=true`);
    }
  }, [isDisqualified, contestId, router]);

  // 1. Trigger an Anti-Cheat Violation
  const triggerViolation = useCallback(
    (reason: string) => {
      if (isDisqualifiedRef.current) return;
      if (Date.now() < gracePeriodEndRef.current) return;

      // Cooldown buffer to prevent cascading triggers
      gracePeriodEndRef.current = Date.now() + 3500;

      setLives((prevLives) => {
        const next = Math.max(0, prevLives - 1);
        if (typeof window !== "undefined") {
          sessionStorage.setItem(`bv_contest_lives_${contestId}`, next.toString());
        }

        // Animate the lost heart slowly
        setRecentlyLostHeartIndex(prevLives);
        setTimeout(() => setRecentlyLostHeartIndex(null), 2000);

        setLastViolationReason(reason);

        const isNowDisqualified = next <= 0;

        // Audit log
        fetch("/api/audit/violation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roundId: contestId,
            reason,
            count: 4 - next,
            action: isNowDisqualified ? "DISQUALIFIED" : "WARNING",
            status: isNowDisqualified ? "DISQUALIFIED" : "ACTIVE",
          }),
        }).catch(() => {});

        if (isNowDisqualified) {
          setIsDisqualified(true);
          setShowViolationWarning(false);
          if (typeof window !== "undefined") {
            sessionStorage.setItem(`bv_contest_disqualified_${contestId}`, "true");
            localStorage.setItem(`bv_contest_disqualified_${contestId}`, "true");
            try {
              const cur = JSON.parse(localStorage.getItem("bv_disqualified_participants") || "[]");
              if (!cur.includes(contestId)) {
                cur.push(contestId);
                localStorage.setItem("bv_disqualified_participants", JSON.stringify(cur));
              }
            } catch {}
          }
          // Eject outside to competition overview after 1.5s
          setTimeout(() => {
            router.replace(`/contest/${contestId}?disqualified=true`);
          }, 1500);
        } else {
          setShowViolationWarning(true);
          setWarningCountdown(3);
        }

        return next;
      });
    },
    [contestId, router]
  );

  // 2. Countdown on Violation Warning Modal
  useEffect(() => {
    if (!showViolationWarning) return;
    const interval = setInterval(() => {
      setWarningCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [showViolationWarning]);

  const handleAcknowledgeWarning = () => {
    gracePeriodEndRef.current = Date.now() + 3000;
    setShowViolationWarning(false);
  };

  // 4. Zero-Tolerance Anti-Cheat Listeners (Context and rules from AntiCheatShield)
  useEffect(() => {
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

    if (checkIsFullscreen()) {
      hasEverBeenFullscreen.current = true;
    }

    // A. Tab switch or browser minimization
    const handleVisibilityChange = () => {
      if (document.hidden) {
        triggerViolation("Tab switch or browser minimization detected");
      }
    };

    // B. Window blur (focus lost to external app, screen-display tool, or background window)
    const handleBlur = () => {
      if (isDisqualifiedRef.current || Date.now() < gracePeriodEndRef.current) return;
      if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = setTimeout(() => {
        if (isDisqualifiedRef.current || Date.now() < gracePeriodEndRef.current) return;
        if (document.activeElement?.tagName === "IFRAME") return;

        if (document.hidden || !document.hasFocus()) {
          triggerViolation("Workstation unfocused (external application, background assistant, or screen capture detected)");
        }
      }, 60);
    };

    const handleFocus = () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
        blurTimeoutRef.current = null;
      }
    };

    // C. Fullscreen exit detection
    const handleFullscreenChange = () => {
      const isFs = checkIsFullscreen();
      if (isFs) {
        hasEverBeenFullscreen.current = true;
      } else if (hasEverBeenFullscreen.current && !isDisqualifiedRef.current && Date.now() > gracePeriodEndRef.current) {
        triggerViolation("Exited secure fullscreen mode (Chrome exit button or window change)");
      }
    };

    const fullscreenPollInterval = setInterval(() => {
      const isFs = checkIsFullscreen();
      if (isFs) {
        hasEverBeenFullscreen.current = true;
      } else if (hasEverBeenFullscreen.current && !isDisqualifiedRef.current && Date.now() > gracePeriodEndRef.current) {
        triggerViolation("Exited secure fullscreen mode / display twitched");
      }
    }, 250);

    const wipeClipboard = () => {
      try {
        if (navigator.clipboard?.writeText) {
          navigator.clipboard.writeText("Screenshots are strictly prohibited in ByteVerse contests.");
        }
      } catch {}
    };

    // D. Strict Keyboard Trapping
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isDisqualifiedRef.current) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      const key = e.key;
      const code = e.code;
      const isCtrlOrMeta = e.ctrlKey || e.metaKey;

      // PrintScreen / Screenshot Keys
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

      // Tab / Window creation or closure: Ctrl+T, Ctrl+N, Ctrl+W, Ctrl+Q
      if (isCtrlOrMeta && ["t", "T", "n", "N", "w", "W", "q", "Q"].includes(key)) {
        e.preventDefault();
        e.stopPropagation();
        triggerViolation("Attempted to switch or open/close tabs or windows");
        return false;
      }

      // Developer Tools: F12, Ctrl+Shift+I/J/C, Ctrl+U
      if (key === "F12" || (isCtrlOrMeta && (key === "u" || key === "U" || (e.shiftKey && ["I", "i", "J", "j", "C", "c"].includes(key))))) {
        e.preventDefault();
        e.stopPropagation();
        triggerViolation("Attempted to open Developer Tools / Inspect Page");
        return false;
      }

      // Fullscreen Exit: Escape, F11
      if (key === "Escape" || key === "F11") {
        e.preventDefault();
        e.stopPropagation();
        if (key === "Escape") {
          triggerViolation("Attempted to exit fullscreen using Escape key");
        }
        return false;
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "Competition in progress! Exiting will lock your workstation.";
      return e.returnValue;
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    window.addEventListener("keydown", handleKeyDown, true);
    document.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      clearInterval(fullscreenPollInterval);
      if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      window.removeEventListener("keydown", handleKeyDown, true);
      document.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [triggerViolation]);

  // 5. Load Contest Details & Pre-fetch All Problems in Background (Instant 0ms Switching)
  useEffect(() => {
    async function loadContest() {
      try {
        const res = await fetch(`/api/contests/${contestId}`);
        if (res.ok) {
          const data = await res.json();
          setContest(data);

          if (data.endsAt) {
            const endMs = new Date(data.endsAt).getTime();
            const nowMs = Date.now();
            const diffSec = Math.max(0, Math.floor((endMs - nowMs) / 1000));
            setRemainingSeconds(diffSec);
          }

          // Pre-fetch all problems in the contest in the background so switching is completely smooth
          if (data.problems && Array.isArray(data.problems)) {
            data.problems.forEach(async (p: ProblemItem) => {
              if (!problemGlobalCache.current[p.id]) {
                try {
                  const pRes = await fetch(`/api/problems/${p.id}`);
                  if (pRes.ok) {
                    const pData = await pRes.json();
                    problemGlobalCache.current[p.id] = pData;
                  }
                } catch {
                  // ignore background prefetch errors
                }
              }
            });
          }
        }
      } catch (err) {
        console.error("Failed to load contest metadata:", err);
      }
    }
    loadContest();
  }, [contestId]);

  // 6. Countdown Timer Interval
  useEffect(() => {
    if (remainingSeconds === null || remainingSeconds <= 0) return;
    const timer = setInterval(() => {
      setRemainingSeconds((prev) => (prev && prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [remainingSeconds]);

  // 7. Load Problem Data Helper (Instant from cache or non-blocking)
  const loadProblemData = useCallback(
    async (id: string, currentLang: string, showInitialSpinner = false) => {
      if (problemGlobalCache.current[id]) {
        const data = problemGlobalCache.current[id];
        setProblem(data);
        setSubmissionsList(data.userSubmissions || []);
        if (data.sampleInput) setCustomInput(data.sampleInput);

        const savedCode =
          problemCodesRef.current[id]?.[currentLang] ||
          data.starterCodes?.[currentLang] ||
          LANG_DEFAULTS[currentLang];
        setCode(savedCode);
        setCodeMap((prev) => ({ ...prev, [currentLang]: savedCode }));
        setLoading(false);
        return;
      }

      if (showInitialSpinner) {
        setLoading(true);
      }
      try {
        const res = await fetch(`/api/problems/${id}`);
        if (res.ok) {
          const data = await res.json();
          problemGlobalCache.current[id] = data;
          setProblem(data);
          setSubmissionsList(data.userSubmissions || []);
          if (data.sampleInput) setCustomInput(data.sampleInput);

          const savedCode =
            problemCodesRef.current[id]?.[currentLang] ||
            data.starterCodes?.[currentLang] ||
            LANG_DEFAULTS[currentLang];
          setCode(savedCode);
          setCodeMap((prev) => ({ ...prev, [currentLang]: savedCode }));
        }
      } catch (err) {
        console.error("Failed to load problem statement:", err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Initial problem load
  useEffect(() => {
    loadProblemData(activeProblemId, lang, true);
  }, [activeProblemId]); // eslint-disable-line react-hooks/exhaustive-deps

  // 8. Handle Zero-Lag Problem Switcher
  const handleSelectProblem = (newProblemId: string) => {
    setIsProblemDropdownOpen(false);
    if (newProblemId === activeProblemId) return;

    // Save active code in memory for current problem & lang
    if (!problemCodesRef.current[activeProblemId]) {
      problemCodesRef.current[activeProblemId] = {};
    }
    problemCodesRef.current[activeProblemId][lang] = code;

    // Update URL smoothly without Next.js unmounting the workspace
    window.history.pushState(null, "", `/contest/${contestId}/arena/${newProblemId}`);
    setActiveProblemId(newProblemId);
    loadProblemData(newProblemId, lang, false);
  };

  // Synchronize with browser Back / Forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const parts = window.location.pathname.split("/");
      const pId = parts[parts.length - 1];
      if (pId && pId !== activeProblemId) {
        handleSelectProblem(pId);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [activeProblemId, contestId, lang, code]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle language switch
  const handleLangChange = (newLang: "cpp" | "c" | "java" | "python") => {
    if (!problemCodesRef.current[activeProblemId]) {
      problemCodesRef.current[activeProblemId] = {};
    }
    problemCodesRef.current[activeProblemId][lang] = code;
    setLang(newLang);

    const savedCode =
      problemCodesRef.current[activeProblemId]?.[newLang] ||
      problem?.starterCodes?.[newLang] ||
      LANG_DEFAULTS[newLang];
    setCode(savedCode);
    setCodeMap((prev) => ({ ...prev, [newLang]: savedCode }));
  };

  const handleCodeChange = (newVal: string | undefined) => {
    const val = newVal || "";
    setCode(val);
    setCodeMap((prev) => ({ ...prev, [lang]: val }));
    if (!problemCodesRef.current[activeProblemId]) {
      problemCodesRef.current[activeProblemId] = {};
    }
    problemCodesRef.current[activeProblemId][lang] = val;
  };

  const handleResetCode = () => {
    const starter = problem?.starterCodes?.[lang] || LANG_DEFAULTS[lang];
    setCode(starter);
    setCodeMap((prev) => ({ ...prev, [lang]: starter }));
    if (!problemCodesRef.current[activeProblemId]) {
      problemCodesRef.current[activeProblemId] = {};
    }
    problemCodesRef.current[activeProblemId][lang] = starter;
  };

  // Run code against test input
  const handleRunCode = async () => {
    if (isDisqualified) return;
    setIsRunning(true);
    setActiveConsoleTab("output");
    setRunResult(null);

    const inputToSend =
      customInput !== undefined && customInput !== ""
        ? customInput
        : problem?.sampleInput || "";

    try {
      const res = await fetch("/api/submissions/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemId: activeProblemId,
          language: lang,
          sourceCode: code,
          customInput: inputToSend,
        }),
      });
      const data = await res.json();
      if (!res.ok && !data.status) {
        data.status = "ERROR";
      }
      setRunResult(data);
    } catch (err: any) {
      setRunResult({ error: err.message || "Execution failed", status: "ERROR" });
    } finally {
      setIsRunning(false);
    }
  };

  // Submit code to official Contest Evaluation
  const handleSubmitCode = async () => {
    if (isDisqualified) return;
    setIsSubmitting(true);
    setActiveConsoleTab("verdict");
    setSubmissionResult(null);

    try {
      const idempotencyKey =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `contest-sub-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemId: activeProblemId,
          contestId,
          language: lang,
          sourceCode: code,
          idempotencyKey,
        }),
      });

      const data = await res.json();
      setSubmissionResult(data);

      if (res.ok) {
        setSubmissionsList((prev) => [
          {
            id: data.submissionId || idempotencyKey,
            status: data.status,
            language: lang,
            executionTimeMs: data.executionTimeMs,
            memoryUsedMb: data.memoryUsedMb,
            submittedAt: new Date().toISOString(),
            sourceCode: code,
          },
          ...prev,
        ]);
        if (data.status === "ACCEPTED" && problem) {
          setProblem({ ...problem, isSolved: true });
        }
      }
    } catch (err: any) {
      setSubmissionResult({ error: err.message || "Contest submission failed", status: "ERROR" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format timer HH:MM:SS
  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Find index of current problem in contest (1-based numeric)
  const currentProblemIndex = contest?.problems?.findIndex((p) => p.id === activeProblemId) ?? -1;
  const problemNumber = currentProblemIndex >= 0 ? (currentProblemIndex + 1).toString() : "1";

  if (authChecking) {
    return (
      <main className="min-h-screen bg-[#0F172A] text-white flex flex-col items-center justify-center font-mono text-sm space-y-3">
        <div className="w-7 h-7 border-2 border-[#7F45DB] border-t-transparent rounded-full animate-spin" />
        <div className="text-center space-y-1">
          <p className="font-bold text-white">Verifying Contestant Authorization...</p>
          <p className="text-xs text-slate-400">Authenticating session for ByteVerse 2026 Arena</p>
        </div>
      </main>
    );
  }

  if (!sessionUser) {
    return (
      <main className="min-h-screen bg-[#0F172A] text-white flex flex-col items-center justify-center p-6 space-y-4 font-sans text-center">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-black">Authentication Required</h1>
        <p className="text-xs font-mono text-slate-400 max-w-md">
          You must be logged in as a registered contestant or administrator to participate in the contest arena. Redirecting to login...
        </p>
        <Link
          href={`/login?callbackUrl=${encodeURIComponent(`/contest/${contestId}/arena/${activeProblemId}`)}`}
          className="px-6 py-2.5 rounded-xl bg-[#7F45DB] hover:bg-[#6D34C9] text-white font-mono font-bold text-xs uppercase tracking-wider"
        >
          Proceed to Login
        </Link>
      </main>
    );
  }

  if (loading && !problem) {
    return (
      <main className="min-h-screen bg-[#0F172A] text-white flex items-center justify-center font-mono text-sm">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-[#7F45DB] border-t-transparent rounded-full animate-spin" />
          <span>Entering Contest Arena...</span>
        </div>
      </main>
    );
  }

  if (!problem) {
    return (
      <main className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 space-y-4">
        <h1 className="text-2xl font-black">Contest Problem Not Found</h1>
        <Link
          href={`/contest/${contestId}`}
          className="px-5 py-2.5 rounded-xl bg-[#7F45DB] text-white font-mono font-bold text-xs uppercase"
        >
          Return to Contest Overview
        </Link>
      </main>
    );
  }

  const isContestEnded = contest?.status === "ENDED" || (remainingSeconds !== null && remainingSeconds <= 0);

  return (
    <div className="fixed inset-0 flex flex-col bg-slate-950 text-[#F8FAFC] overflow-hidden font-sans z-20">
      {/* 1. TOP COMPETITION HEADER BAR */}
      <header className="h-14 bg-[#111726] border-b-2 border-[#1E1B4B] dark:border-[#382F60] px-4 flex items-center justify-between shrink-0 z-20">
        {/* Left: Back Link & Problem Switcher */}
        <div className="flex items-center gap-3">
          <Link
            href={`/contest/${contestId}`}
            title="Return to Contest Overview"
            className="p-1.5 rounded-lg border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          {/* Contest Title Badge */}
          <div className="hidden md:flex items-center gap-2 pr-3 border-r border-slate-800">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-xs font-bold text-slate-300 truncate max-w-[180px]">
              {contest?.title || "Contest Arena"}
            </span>
          </div>

          {/* Quick Problem Navigator Dropdown (Numeric 1..N Representation) */}
          <div className="relative">
            <button
              onClick={() => setIsProblemDropdownOpen(!isProblemDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#1A2338] border border-[#382F60] hover:border-[#7F45DB] font-mono text-xs font-bold text-white transition-all shadow-sm"
            >
              <span className="w-5 h-5 rounded-md bg-[#7F45DB] text-white text-[11px] font-black flex items-center justify-center">
                {problemNumber}
              </span>
              <span className="truncate max-w-[180px] sm:max-w-[240px] text-left">
                {problem.title}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isProblemDropdownOpen && contest?.problems && (
              <div className="absolute left-0 mt-2 w-80 max-h-96 overflow-y-auto bg-[#111726] border-2 border-[#382F60] rounded-2xl shadow-2xl p-2 z-50 divide-y divide-slate-800/60 font-mono text-xs">
                <div className="px-3 py-2 text-[10px] uppercase font-black tracking-wider text-[#A472F7]">
                  Contest Problem Set ({contest.problems.length})
                </div>
                {contest.problems.map((p, idx) => {
                  const numStr = (idx + 1).toString();
                  const isCurrent = p.id === activeProblemId;
                  return (
                    <button
                      key={p.id}
                      onClick={() => handleSelectProblem(p.id)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between gap-3 transition-colors ${
                        isCurrent
                          ? "bg-[#7F45DB]/25 text-[#A472F7] font-black border border-[#7F45DB]/40"
                          : "hover:bg-slate-800/70 text-slate-300 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span className="w-5 h-5 rounded-md bg-slate-800 text-slate-200 text-[10px] font-bold flex items-center justify-center shrink-0">
                          {numStr}
                        </span>
                        <span className="truncate">{p.title}</span>
                      </div>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-bold shrink-0 ${
                          p.difficulty === "Easy"
                            ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                            : p.difficulty === "Hard"
                            ? "bg-rose-950 text-rose-400 border border-rose-800"
                            : "bg-amber-950 text-amber-400 border border-amber-800"
                        }`}
                      >
                        {p.difficulty}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Center: Contest Countdown Timer */}
        <div className="flex items-center gap-2 bg-[#0A0E1A] px-4 py-1.5 rounded-xl border border-[#382F60]">
          <Clock className={`w-4 h-4 ${remainingSeconds && remainingSeconds < 900 ? "text-rose-400 animate-pulse" : "text-[#A472F7]"}`} />
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider hidden sm:inline">Time Left:</span>
          <span className={`font-mono font-black text-sm tracking-wider ${remainingSeconds && remainingSeconds < 900 ? "text-rose-400 animate-pulse" : "text-emerald-400"}`}>
            {remainingSeconds !== null ? formatTime(remainingSeconds) : "--:--:--"}
          </span>
        </div>

        {/* Right: Actions (3 Hearts Live Display instead of Standings, Run, Submit) */}
        <div className="flex items-center gap-2">
          {/* Zero-Tolerance Anti-Cheat 3 Hearts Indicator (Replaces Standings button) */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border font-mono text-xs shadow-sm transition-all duration-300 ${
              lives === 3
                ? "bg-rose-950/25 border-rose-800/40 text-rose-300"
                : lives === 2
                ? "bg-amber-950/30 border-amber-600/50 text-amber-300 animate-pulse"
                : lives === 1
                ? "bg-rose-950/70 border-rose-500 text-rose-400 animate-pulse shadow-[0_0_12px_rgba(244,63,94,0.4)]"
                : "bg-red-950 border-red-600 text-red-500"
            }`}
            title={`Zero-Tolerance Integrity Shield: ${lives} / 3 Lives Remaining`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span className="text-[11px] uppercase tracking-wider font-bold hidden md:inline text-slate-300">
              Lives:
            </span>
            <div className="flex items-center gap-1">
              {[1, 2, 3].map((heartIndex) => {
                const isAlive = heartIndex <= lives;
                const isRecentlyLost = recentlyLostHeartIndex === heartIndex;
                return (
                  <span
                    key={heartIndex}
                    className={`inline-block transition-all duration-700 transform ${
                      isRecentlyLost ? "scale-150 animate-bounce text-rose-400" : ""
                    } ${
                      isAlive
                        ? "text-rose-500 drop-shadow-[0_0_6px_rgba(244,63,94,0.8)]"
                        : "text-slate-600 opacity-30"
                    }`}
                  >
                    <Heart
                      className={`w-3.5 h-3.5 ${
                        isAlive ? "fill-rose-500 text-rose-500" : "fill-slate-800 text-slate-700"
                      }`}
                    />
                  </span>
                );
              })}
            </div>
            <span
              className={`font-mono font-black text-xs ${
                lives === 3 ? "text-emerald-400" : lives === 2 ? "text-amber-400" : "text-rose-400"
              }`}
            >
              {lives}/3
            </span>
          </div>

          {/* Run Code Button */}
          <button
            onClick={handleRunCode}
            disabled={isRunning || isDisqualified}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-700 bg-slate-800 text-white font-mono font-bold text-xs uppercase hover:bg-slate-700 disabled:opacity-50 transition-all"
          >
            <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
            <span>{isRunning ? "Running..." : "Run"}</span>
          </button>

          {/* Submit Solution Button */}
          <button
            onClick={handleSubmitCode}
            disabled={isSubmitting || isContestEnded || isDisqualified}
            title={isContestEnded ? "Contest has concluded" : isDisqualified ? "Contestant is disqualified" : "Submit official solution to contest"}
            className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl border-2 font-mono font-black text-xs uppercase tracking-wider transition-all ${
              isContestEnded || isDisqualified
                ? "bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed"
                : "bg-[#7F45DB] text-white border-[#1E1B4B] shadow-[2px_2px_0px_0px_#1E1B4B] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none disabled:opacity-50"
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isContestEnded ? "Contest Closed" : isSubmitting ? "Judging..." : "Submit"}</span>
          </button>
        </div>
      </header>

      {/* 2. SPLIT WORKSPACE: LEFT PANE (Problem) | RIGHT PANE (Editor & Console) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
        {/* LEFT PANE */}
        <div className="h-full border-r-2 border-[#1E1B4B] dark:border-[#382F60] bg-[#111726] flex flex-col overflow-hidden">
          {/* Tabs */}
          <div className="h-10 border-b-2 border-[#1E1B4B]/20 dark:border-[#382F60] px-4 flex items-center gap-3 shrink-0 bg-[#151D30]">
            <button
              onClick={() => setLeftTab("statement")}
              className={`text-xs font-mono font-bold flex items-center gap-1.5 py-2 border-b-2 transition-all ${
                leftTab === "statement"
                  ? "text-[#A472F7] border-[#A472F7] font-black"
                  : "text-slate-400 border-transparent hover:text-white"
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Problem Statement</span>
            </button>

            <button
              onClick={() => setLeftTab("submissions")}
              className={`text-xs font-mono font-bold flex items-center gap-1.5 py-2 border-b-2 transition-all ${
                leftTab === "submissions"
                  ? "text-[#A472F7] border-[#A472F7] font-black"
                  : "text-slate-400 border-transparent hover:text-white"
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Contest Submissions ({submissionsList.length})</span>
            </button>
          </div>

          {/* Left Content Scrollable */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 text-[#F8FAFC]">
            {leftTab === "statement" ? (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-mono font-black px-2 py-0.5 rounded bg-[#7F45DB]/20 text-[#A472F7] border border-[#7F45DB]/30">
                      Problem {problemNumber}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                        problem.difficulty === "Easy"
                          ? "bg-emerald-950 text-emerald-400 border-emerald-800"
                          : problem.difficulty === "Hard"
                          ? "bg-rose-950 text-rose-400 border-rose-800"
                          : "bg-amber-950 text-amber-400 border-amber-800"
                      }`}
                    >
                      {problem.difficulty}
                    </span>
                    {problem.isSolved && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Solved in Contest
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-display font-black text-white">
                    {problem.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {(problem.tags || []).map((t: string) => (
                      <span
                        key={t}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1A2338] text-slate-300 border border-[#382F60]"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Formatted Problem Statement */}
                <div className="prose prose-sm max-w-none text-[#E2E8F0] font-sans leading-relaxed">
                  <FormattedStatement statement={problem.statement} />
                </div>

                {/* Input Format */}
                {problem.inputFormat && (
                  <div className="space-y-1.5">
                    <h3 className="text-xs font-mono uppercase font-black text-slate-400">Input Format</h3>
                    <div className="p-3 rounded-xl bg-[#1A2338] border border-[#334155] text-xs font-mono text-[#F8FAFC] whitespace-pre-wrap font-medium">
                      {problem.inputFormat}
                    </div>
                  </div>
                )}

                {/* Output Format */}
                {problem.outputFormat && (
                  <div className="space-y-1.5">
                    <h3 className="text-xs font-mono uppercase font-black text-slate-400">Output Format</h3>
                    <div className="p-3 rounded-xl bg-[#1A2338] border border-[#334155] text-xs font-mono text-[#F8FAFC] whitespace-pre-wrap font-medium">
                      {problem.outputFormat}
                    </div>
                  </div>
                )}

                {/* Constraints */}
                {problem.constraints && (
                  <div className="space-y-1.5">
                    <h3 className="text-xs font-mono uppercase font-black text-slate-400">Constraints</h3>
                    <div className="p-3 rounded-xl bg-[#1A2338] border border-[#334155] text-xs font-mono text-[#F8FAFC] whitespace-pre-wrap font-medium">
                      {problem.constraints}
                    </div>
                  </div>
                )}

                {/* Sample Case */}
                {problem.sampleInput && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-mono uppercase font-black text-slate-400">Sample Case 1</h3>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(problem.sampleInput || "");
                          setCopied(true);
                          setTimeout(() => setCopied(false), 1500);
                        }}
                        className="inline-flex items-center gap-1 text-[10px] font-mono text-[#A472F7] hover:underline font-bold"
                      >
                        {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copied ? "Copied" : "Copy Input"}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <span className="text-[10px] font-mono text-slate-400 block mb-1 font-bold">Input</span>
                        <pre className="p-3 rounded-xl bg-[#1A2338] border border-[#334155] text-xs font-mono text-[#F8FAFC] overflow-x-auto font-medium">
                          {problem.sampleInput}
                        </pre>
                      </div>
                      {problem.sampleOutput && (
                        <div>
                          <span className="text-[10px] font-mono text-slate-400 block mb-1 font-bold">Output</span>
                          <pre className="p-3 rounded-xl bg-[#1A2338] border border-[#334155] text-xs font-mono text-[#F8FAFC] overflow-x-auto font-medium">
                            {problem.sampleOutput}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Submissions Tab */
              <div className="space-y-4">
                <h3 className="text-sm font-mono font-bold text-white">
                  Contest Submission Records
                </h3>
                {submissionsList.length > 0 ? (
                  <div className="space-y-3">
                    {submissionsList.map((sub, idx) => (
                      <div
                        key={sub.id || idx}
                        className="p-3.5 rounded-xl bg-[#1A2338] border border-[#382F60] flex items-center justify-between font-mono text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                sub.status === "ACCEPTED"
                                  ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                                  : "bg-rose-950 text-rose-400 border border-rose-800"
                              }`}
                            >
                              {sub.status}
                            </span>
                            <span className="text-slate-400 uppercase text-[10px]">{sub.language}</span>
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {new Date(sub.submittedAt).toLocaleTimeString()}
                          </div>
                        </div>

                        <div className="text-right">
                          {sub.executionTimeMs !== undefined && (
                            <div className="text-[10px] text-slate-400">{sub.executionTimeMs} ms</div>
                          )}
                          {sub.memoryUsedMb !== undefined && (
                            <div className="text-[10px] text-slate-400">{sub.memoryUsedMb} MB</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-500 font-mono text-xs border border-dashed border-slate-800 rounded-2xl">
                    No submissions made for this problem in this contest yet.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANE (EDITOR & CONSOLE) */}
        <div className="h-full flex flex-col bg-[#0A0E1A] overflow-hidden">
          {/* Editor Header Bar */}
          <div className="h-10 border-b border-slate-800 px-4 flex items-center justify-between shrink-0 bg-[#0E1322]">
            {/* Language Selector */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Language:</span>
              <select
                value={lang}
                onChange={(e) => handleLangChange(e.target.value as any)}
                className="bg-[#1A2338] text-white border border-[#382F60] rounded-lg px-2.5 py-1 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#7F45DB]"
              >
                <option value="cpp">C++ (GCC 16.1 / C++17)</option>
                <option value="c">C (GCC 16.1 / C11)</option>
                <option value="python">Python 3 (3.13.14)</option>
                <option value="java">Java (JDK 21)</option>
              </select>
            </div>

            {/* Reset Starter Code */}
            <button
              onClick={handleResetCode}
              title="Reset to starter template"
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Monaco Editor Canvas */}
          <div className="flex-1 min-h-0 bg-[#0A0E1A]">
            <MonacoEditor
              height="100%"
              language={lang === "c" || lang === "cpp" ? "cpp" : lang}
              theme="vs-dark"
              value={code}
              onChange={handleCodeChange}
              options={{
                fontSize: 13,
                fontFamily: "JetBrains Mono, Menlo, monospace",
                minimap: { enabled: false },
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 4,
                wordWrap: "on",
              }}
            />
          </div>

          {/* Bottom Console Drawer */}
          <div className="h-56 border-t-2 border-[#1E1B4B] dark:border-[#382F60] bg-[#0E1322] flex flex-col shrink-0">
            {/* Console Tabs */}
            <div className="h-9 border-b border-slate-800 px-4 flex items-center justify-between bg-[#111726]">
              <div className="flex items-center gap-4 text-xs font-mono">
                <button
                  onClick={() => setActiveConsoleTab("output")}
                  className={`py-1 flex items-center gap-1.5 transition-colors ${
                    activeConsoleTab === "output"
                      ? "text-white font-black border-b-2 border-[#7F45DB]"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Play className="w-3 h-3 text-emerald-400" />
                  <span>Output</span>
                </button>

                <button
                  onClick={() => setActiveConsoleTab("verdict")}
                  className={`py-1 flex items-center gap-1.5 transition-colors ${
                    activeConsoleTab === "verdict"
                      ? "text-white font-black border-b-2 border-[#7F45DB]"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Zap className="w-3 h-3 text-amber-400" />
                  <span>Verdict</span>
                </button>

                <button
                  onClick={() => setActiveConsoleTab("input")}
                  className={`py-1 flex items-center gap-1.5 transition-colors ${
                    activeConsoleTab === "input"
                      ? "text-white font-black border-b-2 border-[#7F45DB]"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <span>Custom Input</span>
                </button>
              </div>
            </div>

            {/* Console Content */}
            <div className="flex-1 p-3 overflow-y-auto font-mono text-xs text-[#CCCCCC]">
              {activeConsoleTab === "input" ? (
                <textarea
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder="Enter custom stdin test input here..."
                  className="w-full h-full bg-transparent resize-none focus:outline-none text-[#EAEAEA] font-mono text-xs placeholder:text-[#555555]"
                />
              ) : activeConsoleTab === "output" ? (
                runResult ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-[#888888]">Status:</span>
                      <span
                        className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                          runResult.status === "ACCEPTED" || runResult.status === "OK"
                            ? "bg-emerald-950/60 text-emerald-400 border border-emerald-700/50"
                            : "bg-rose-950/60 text-rose-400 border border-rose-700/50"
                        }`}
                      >
                        {runResult.status || (runResult.error ? "ERROR" : "OK")}
                      </span>
                      {runResult.time && (
                        <span className="text-[11px] font-mono text-[#888888]">
                          ({runResult.time}s)
                        </span>
                      )}
                    </div>

                    {runResult.stdout !== undefined && runResult.stdout !== "" && (
                      <div className="space-y-1">
                        <span className="text-[11px] font-mono text-[#A472F7] font-bold block uppercase tracking-wider">
                          Standard Output
                        </span>
                        <pre className="p-3 rounded-lg bg-[#0A0A0A] border border-[#262626] text-emerald-300 overflow-x-auto whitespace-pre-wrap font-mono text-xs font-medium">
                          {runResult.stdout}
                        </pre>
                      </div>
                    )}

                    {runResult.stderr && (
                      <div className="space-y-1">
                        <span className="text-[11px] font-mono text-rose-400 font-bold block uppercase tracking-wider">
                          Stderr
                        </span>
                        <pre className="p-3 rounded-lg bg-[#0A0A0A] border border-rose-900/40 text-rose-300 overflow-x-auto whitespace-pre-wrap font-mono text-xs font-medium">
                          {runResult.stderr}
                        </pre>
                      </div>
                    )}

                    {runResult.compile_output && (
                      <div className="space-y-1">
                        <span className="text-[11px] font-mono text-amber-400 font-bold block uppercase tracking-wider">
                          Compilation Output
                        </span>
                        <pre className="p-3 rounded-lg bg-[#0A0A0A] border border-amber-900/40 text-amber-300 overflow-x-auto whitespace-pre-wrap font-mono text-xs font-medium">
                          {runResult.compile_output}
                        </pre>
                      </div>
                    )}

                    {runResult.error && (
                      <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800 text-rose-300 text-xs font-mono font-medium">
                        {runResult.error}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-slate-500 py-8 text-center font-mono text-xs">
                    Click &quot;Run&quot; to test your code before submitting to the contest.
                  </div>
                )
              ) : (
                /* Verdict Tab */
                submissionResult ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                          submissionResult.status === "ACCEPTED"
                            ? "bg-emerald-950/80 text-emerald-300 border border-emerald-500"
                            : "bg-rose-950/80 text-rose-300 border border-rose-500"
                        }`}
                      >
                        {submissionResult.status === "ACCEPTED" ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-400" />
                        )}
                        <span>{submissionResult.status?.replace(/_/g, " ")}</span>
                      </span>

                      {submissionResult.testCasesPassed !== undefined && (
                        <span className="text-xs font-mono text-slate-300">
                          {submissionResult.testCasesPassed} / {submissionResult.totalTestCases} test cases passed
                        </span>
                      )}

                      {submissionResult.rawScore !== undefined && (
                        <span className="text-xs font-mono text-amber-400 font-bold">
                          +{submissionResult.rawScore} pts
                        </span>
                      )}
                    </div>

                    {submissionResult.message && (
                      <div className="text-xs text-slate-300 font-medium">
                        {submissionResult.message}
                      </div>
                    )}

                    {submissionResult.stdout && (
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 block uppercase">Test Output:</span>
                        <pre className="p-2 rounded bg-[#0A0A0A] text-emerald-300 text-xs whitespace-pre-wrap">
                          {submissionResult.stdout}
                        </pre>
                      </div>
                    )}

                    {submissionResult.compile_output && (
                      <div className="space-y-1">
                        <span className="text-[10px] text-amber-400 block uppercase">Compiler Error:</span>
                        <pre className="p-2 rounded bg-[#0A0A0A] text-amber-300 text-xs whitespace-pre-wrap">
                          {submissionResult.compile_output}
                        </pre>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-slate-500 py-8 text-center font-mono text-xs">
                    Click &quot;Submit&quot; to test your solution across all hidden contest test cases.
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Zero-Tolerance Anti-Cheat Warning Modal (Heart Lost) ── */}
      {showViolationWarning && lives > 0 && (
        <div className="fixed inset-0 z-[9998] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 selection:bg-rose-500 selection:text-white font-sans animate-in fade-in duration-200">
          <div className="max-w-md w-full bg-[#111726] border-2 border-rose-500/80 rounded-3xl p-6 shadow-[0_0_50px_rgba(244,63,94,0.35)] text-center relative z-10 animate-in zoom-in-95 duration-200">
            {/* Pulsing Icon */}
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border-2 border-rose-500 mx-auto flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(244,63,94,0.3)]">
              <ShieldAlert className="w-7 h-7 text-rose-500 animate-pulse" />
            </div>

            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/40 text-xs font-mono font-black uppercase tracking-wider mb-2">
              <AlertTriangle className="w-3.5 h-3.5" /> Integrity Rule Violation
            </div>

            <h2 className="font-sans font-black text-xl text-white tracking-tight uppercase mb-1">
              Warning: You Lost 1 Heart!
            </h2>

            {/* Lives / Hearts Visual */}
            <div className="flex items-center justify-center gap-3 my-4 bg-slate-900/80 border border-slate-800 py-3 rounded-2xl">
              {[1, 2, 3].map((hIdx) => {
                const isAlive = hIdx <= lives;
                const wasLostNow = hIdx === lives + 1;
                return (
                  <div key={hIdx} className="flex flex-col items-center gap-1">
                    <Heart
                      className={`w-7 h-7 transition-all duration-700 ${
                        isAlive
                          ? "fill-rose-500 text-rose-500 drop-shadow-[0_0_10px_rgba(244,63,94,0.8)]"
                          : wasLostNow
                          ? "fill-rose-900/40 text-rose-500/50 scale-90 animate-pulse"
                          : "fill-slate-800 text-slate-700 opacity-40 scale-75"
                      }`}
                    />
                    <span className="text-[10px] font-mono text-slate-400 font-bold">
                      {isAlive ? "Active" : "Lost"}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Violation Reason Box */}
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-3.5 mb-4 text-center">
              <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                Detected Infraction:
              </div>
              <div className="text-rose-400 font-mono font-black text-xs sm:text-sm mt-1">
                {lastViolationReason || "Window focus lost / unauthorized tab twitch detected"}
              </div>
            </div>

            {/* Context and Rules */}
            <div className="bg-[#0A0E1A] border border-[#1E1B4B] rounded-2xl p-4 mb-5 text-left text-xs text-slate-300 font-mono space-y-1.5">
              <div className="font-extrabold flex items-center gap-1.5 text-rose-400 uppercase text-[11px]">
                <ShieldAlert className="w-3.5 h-3.5" /> Zero-Tolerance Anti-Cheat In Effect
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                • Switching tabs or browser minimization is strictly banned.
              </p>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                • Background apps (AI assistants, screen overlay / display scrapers) trigger an immediate penalty.
              </p>
              <p className="text-rose-400/90 text-[11px] leading-relaxed font-bold">
                • You have {lives} {lives === 1 ? "heart" : "hearts"} remaining. Losing all 3 hearts locks your station permanently.
              </p>
            </div>

            <button
              type="button"
              onClick={handleAcknowledgeWarning}
              disabled={warningCountdown > 0}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-[#7F45DB] hover:from-rose-500 hover:to-[#9055ee] text-white font-mono font-black text-xs uppercase tracking-wider transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              <Check className="w-4 h-4" />
              <span>
                {warningCountdown > 0
                  ? `Reviewing Rules (${warningCountdown}s)...`
                  : "I Understand & Resume Arena"}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* ── Zero-Tolerance Disqualification Ejection Modal (0 Hearts Remaining) ── */}
      {isDisqualified && (
        <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 selection:bg-rose-500 selection:text-white font-sans animate-in fade-in duration-300">
          <div className="max-w-md w-full bg-[#0F172A] border-2 border-red-600 rounded-3xl p-8 shadow-[0_0_80px_rgba(220,38,38,0.6)] text-center relative z-10 animate-in zoom-in-95 duration-200">
            {/* Disqualified Shield Icon */}
            <div className="w-16 h-16 rounded-2xl bg-red-600/15 border-2 border-red-600 mx-auto flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(220,38,38,0.5)]">
              <ShieldAlert className="w-9 h-9 text-red-500 animate-pulse" />
            </div>

            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600/20 text-red-400 border border-red-500/50 text-xs font-mono font-black uppercase tracking-wider mb-2">
              <AlertTriangle className="w-3.5 h-3.5" /> Disqualification Notice
            </div>

            <h2 className="font-sans font-black text-2xl text-white tracking-tight uppercase mb-1">
              You Are Disqualified
            </h2>

            {/* Zero Hearts Indicator */}
            <div className="flex items-center justify-center gap-3 my-4 bg-slate-900 border border-red-900/50 py-3 rounded-2xl">
              {[1, 2, 3].map((hIdx) => (
                <div key={hIdx} className="flex flex-col items-center gap-1">
                  <Heart className="w-7 h-7 fill-slate-800 text-slate-700 opacity-30 scale-90" />
                  <span className="text-[10px] font-mono text-red-400 font-bold">Lost</span>
                </div>
              ))}
            </div>

            {/* Termination Cause */}
            <div className="bg-red-950/40 border border-red-800/60 rounded-2xl p-4 mb-4 text-center">
              <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                Infraction Cause:
              </div>
              <div className="text-red-400 font-mono font-black text-xs sm:text-sm mt-1">
                {lastViolationReason || "All 3 hearts exhausted via zero-tolerance anti-cheat triggers"}
              </div>
            </div>

            <p className="text-xs font-mono text-slate-300 mb-6 leading-relaxed">
              Zero tolerance policy triggered. All 3 hearts have been depleted. Your workstation session is terminated and you are disqualified from this competition.
            </p>

            <button
              type="button"
              onClick={() => router.replace(`/contest/${contestId}?disqualified=true`)}
              className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-mono font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(220,38,38,0.4)]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Exit to Competition Hub</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
