"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import SystemReadinessGate from "@/components/participant/SystemReadinessGate";
import AntiCheatShield from "@/components/participant/AntiCheatShield";
import AIAssistantDrawer from "@/components/participant/AIAssistantDrawer";
import { 
  Play, 
  Send, 
  Terminal, 
  CheckCircle2, 
  FileQuestion, 
  ArrowLeft, 
  ArrowRight, 
  Sparkles, 
  Rocket, 
  ShieldCheck, 
  Clock, 
  Coffee, 
  Trophy, 
  Timer, 
  Users,
  RotateCcw,
  AlertCircle,
  Code2,
  CheckCircle,
  XCircle,
  HelpCircle,
  Copy
} from "lucide-react";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

interface Problem {
  id: string;
  sequence: number;
  title: string;
  statement: string;
  difficulty?: string | null;
  constraints?: string | null;
  sampleInput?: string | null;
  sampleOutput?: string | null;
  inputFormat?: string | null;
  outputFormat?: string | null;
  timeLimitMs: number;
  memoryLimitMb: number;
  allowedLangs: string[];
  set?: string;
  starterCodes?: Record<string, string> | null;
  options?: Record<string, Record<string, string>> | null;
}

interface TeamMember {
  name: string | null;
  email: string;
  isLeader: boolean;
}

interface RoundInfo {
  id: string;
  name: string;
  type: string;
  sequence: number;
  durationMin: number;
  startsAt: string | null;
}

interface TeamInfo {
  id: string;
  name: string;
  status: string;
  members: TeamMember[];
}

interface RoundState {
  phase: "GATE_TEAM" | "WAITING" | "ACTIVE" | "BREAK" | "PAUSED" | "ENDED" | "LOCKED" | "DISQUALIFIED";
  timeLeftSeconds: number | null;
  breakEndsAt?: string;
  endsAt?: string;
  startsAt?: string;
  durationMin?: number;
  assignedProblemId?: string | null;
  round?: RoundInfo;
  team?: TeamInfo;
  hasCustomSession?: boolean;
}

const LANG_DEFAULTS: Record<string, string> = {
  cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your C++ solution here\n    return 0;\n}`,
  c: `#include <stdio.h>\n\nint main() {\n    // Write your C solution here\n    return 0;\n}`,
  java: `import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        // Write your Java solution here\n    }\n}`,
  python: `def main():\n    # Write your Python solution here\n    pass\n\nif __name__ == "__main__":\n    main()`,
};

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60).toString().padStart(2, "0");
  const s = (sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function RoundWorkspacePage() {
  const { roundId } = useParams<{ roundId: string }>();
  const router = useRouter();

  // All tournament rounds list for seamless navigation between rounds
  const [allRounds, setAllRounds] = useState<RoundInfo[]>([]);

  // Multi-problem state
  const [problems, setProblems] = useState<Problem[]>([]);
  const [currentProblemIdx, setCurrentProblemIdx] = useState(0);
  const [answersMap, setAnswersMap] = useState<Record<string, "A" | "B" | "C" | "D">>({});
  const [savingAnswer, setSavingAnswer] = useState(false);

  // Coding Workspace State
  const [codeMap, setCodeMap] = useState<Record<string, Record<string, string>>>({});
  const [code, setCode] = useState(LANG_DEFAULTS.c);
  const [lang, setLang] = useState<"cpp" | "c" | "java" | "python">("c");
  const [customInput, setCustomInput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeConsoleTab, setActiveConsoleTab] = useState<"input" | "output" | "verdict">("output");
  const [runResult, setRunResult] = useState<{
    stdout?: string;
    stderr?: string;
    compile_output?: string;
    status?: string;
    time?: string;
    memory?: number;
    error?: string;
  } | null>(null);
  const [submissionResult, setSubmissionResult] = useState<{
    submissionId?: string;
    status?: string;
    rawScore?: number;
    error?: string;
  } | null>(null);

  const [roundState, setRoundState] = useState<RoundState>({ phase: "WAITING", timeLeftSeconds: null });
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [breakTimeLeft, setBreakTimeLeft] = useState<number>(300); // 5 min break timer
  const [isReadinessPassed, setIsReadinessPassed] = useState(false);
  const [hasEnteredArena, setHasEnteredArena] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);

  // Ensure System Readiness & Agreement is always presented fresh
  useEffect(() => {
    try {
      localStorage.removeItem(`byteverse_readiness_${roundId}`);
      const entered = sessionStorage.getItem(`byteverse_arena_entered_${roundId}`);
      if (entered === "true") {
        setHasEnteredArena(true);
        setIsReadinessPassed(true);
      }
    } catch {
      // ignore
    }
  }, [roundId]);

  // Fetch all rounds in tournament
  useEffect(() => {
    async function loadAllRounds() {
      try {
        const res = await fetch("/api/rounds/current");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.rounds)) {
            setAllRounds(data.rounds);
          }
        }
      } catch {
        // ignore
      }
    }
    loadAllRounds();
  }, []);

  // Fetch problems for this round
  const fetchProblems = useCallback(async () => {
    try {
      const res = await fetch(`/api/rounds/${roundId}/problem`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.problems) && data.problems.length > 0) {
          setProblems(data.problems);
          if (data.answers) setAnswersMap(data.answers);
        }
      }
    } catch {
      // ignore
    }
  }, [roundId]);

  useEffect(() => {
    fetchProblems();
  }, [fetchProblems]);

  // Re-fetch immediately if problems are empty and round becomes active
  useEffect(() => {
    if (roundState.phase === "ACTIVE" && problems.length === 0) {
      fetchProblems();
    }
  }, [roundState.phase, problems.length, fetchProblems]);

  // Synchronize starter code when current problem or language changes
  useEffect(() => {
    const curr = problems[currentProblemIdx];
    if (!curr) return;

    const saved = codeMap[curr.id]?.[lang];
    if (saved !== undefined) {
      setCode(saved);
    } else {
      const starter = curr.starterCodes?.[lang] || LANG_DEFAULTS[lang];
      setCode(starter);
    }
    if (curr.sampleInput) {
      setCustomInput(curr.sampleInput);
    }
  }, [currentProblemIdx, lang, problems]);

  // Handle user typing in Monaco editor
  const handleCodeChange = (newVal: string | undefined) => {
    const val = newVal ?? "";
    setCode(val);
    const curr = problems[currentProblemIdx];
    if (curr) {
      setCodeMap((prev) => ({
        ...prev,
        [curr.id]: {
          ...(prev[curr.id] || {}),
          [lang]: val,
        },
      }));
    }
  };

  // Reset starter code to original AI naive code
  const handleResetCode = () => {
    const curr = problems[currentProblemIdx];
    if (!curr) return;
    const starter = curr.starterCodes?.[lang] || LANG_DEFAULTS[lang];
    setCode(starter);
    setCodeMap((prev) => ({
      ...prev,
      [curr.id]: {
        ...(prev[curr.id] || {}),
        [lang]: starter,
      },
    }));
  };

  // Run Code with Custom Input
  const handleRunCode = async () => {
    const curr = problems[currentProblemIdx];
    if (!curr) return;

    setIsRunning(true);
    setActiveConsoleTab("output");
    setRunResult(null);

    try {
      const res = await fetch("/api/submissions/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemId: curr.id,
          roundId,
          language: lang,
          sourceCode: code,
          customInput,
        }),
      });
      const data = await res.json();
      setRunResult(data);
    } catch (err: unknown) {
      setRunResult({
        error: err instanceof Error ? err.message : "Run request failed.",
        status: "ERROR",
      });
    } finally {
      setIsRunning(false);
    }
  };

  // Submit Code Solution
  const handleSubmitCode = async () => {
    const curr = problems[currentProblemIdx];
    if (!curr) return;

    setIsSubmitting(true);
    setActiveConsoleTab("verdict");
    setSubmissionResult(null);

    try {
      const idempotencyKey = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `sub-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemId: curr.id,
          roundId,
          language: lang,
          sourceCode: code,
          idempotencyKey,
        }),
      });
      const data = await res.json();
      setSubmissionResult(data);
    } catch (err: unknown) {
      setSubmissionResult({
        error: err instanceof Error ? err.message : "Submission request failed.",
        status: "SYSTEM_ERROR",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fast polling + SSE for immediate round start synchronization
  useEffect(() => {
    let es: EventSource | null = null;

    function applyState(state: RoundState) {
      setRoundState(state);
      if (state.timeLeftSeconds !== null) {
        setTimeLeft(state.timeLeftSeconds);
      }
      if (state.phase === "BREAK" && state.breakEndsAt) {
        const remaining = Math.max(0, Math.floor((new Date(state.breakEndsAt).getTime() - Date.now()) / 1000));
        setBreakTimeLeft(remaining);
      }
    }

    async function pollState() {
      try {
        const res = await fetch(`/api/rounds/${roundId}/state`);
        if (res.ok) {
          const data: RoundState = await res.json();
          applyState(data);
        }
      } catch {
        // ignore
      }
    }

    pollState();
    const fallbackPoll = setInterval(pollState, 6000);

    try {
      es = new EventSource(`/api/rounds/${roundId}/stream`);
      es.onmessage = (e) => {
        try { applyState(JSON.parse(e.data) as RoundState); } catch { /* ignore */ }
      };
    } catch {
      // ignore
    }

    return () => {
      if (es) es.close();
      clearInterval(fallbackPoll);
    };
  }, [roundId, router]);

  // Clock countdown timer for active round
  useEffect(() => {
    if (roundState.phase !== "ACTIVE" || !hasEnteredArena) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 0) return 0;
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [roundState.phase, hasEnteredArena]);

  // 5-Minute Break Countdown Timer
  const isRoundFinished = (timeLeft !== null && timeLeft <= 0) || roundState.phase === "BREAK" || roundState.phase === "ENDED";
  useEffect(() => {
    if (!isRoundFinished) return;

    const breakTimer = setInterval(() => {
      setBreakTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(breakTimer);
  }, [isRoundFinished]);

  // Handle MCQ Option Selection with auto-save (Round 1)
  const handleSelectOption = async (option: "A" | "B" | "C" | "D") => {
    const currentProb = problems[currentProblemIdx];
    if (!currentProb) return;

    setAnswersMap((prev) => ({ ...prev, [currentProb.id]: option }));
    setSavingAnswer(true);

    try {
      await fetch("/api/mcq/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemId: currentProb.id,
          roundId,
          selectedOption: option,
        }),
      });
    } catch {
      // ignore
    } finally {
      setSavingAnswer(false);
    }
  };

  // Start Round Action — Engages Fullscreen and platform restrictions
  const handleStartRound = async () => {
    if (problems.length === 0) {
      await fetchProblems();
    }
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen().catch(() => {});
      }
    } catch {
      // ignore
    }
    setHasEnteredArena(true);
    try {
      sessionStorage.setItem(`byteverse_arena_entered_${roundId}`, "true");
    } catch {
      // ignore
    }
  };

  const round = roundState.round ?? allRounds.find((r) => r.id === roundId);
  const team = roundState.team;
  const currentProblem = problems[currentProblemIdx] ?? null;
  const activeRoundType = round?.type ?? allRounds.find((r) => r.id === roundId)?.type;
  const isMCQ = activeRoundType === "CODE_LOGIC" || (currentProblem?.options !== undefined && currentProblem?.options !== null);

  // Determine next round info
  const currentRoundSequence = round?.sequence ?? 1;
  const nextRound = allRounds.find((r) => r.sequence === currentRoundSequence + 1);

  // ── GATE 1: Pre-Round Readiness Check & Agreement Gate ──
  if (!isReadinessPassed && roundState.phase !== "GATE_TEAM") {
    return (
      <SystemReadinessGate
        roundName={round?.name ?? "Round " + currentRoundSequence}
        sequence={currentRoundSequence}
        durationMin={round?.durationMin ?? 20}
        onComplete={() => {
          setIsReadinessPassed(true);
        }}
      />
    );
  }

  // ── CONSTANT SCREEN: 5-Minute Break & Round Concluded Screen ──
  if (isRoundFinished) {
    return (
      <div className="min-h-screen bg-[#F8F9FD] flex items-center justify-center p-6 font-sans relative">
        <AntiCheatShield
          roundId={roundId}
          isActive={true}
        />
        <div className="text-center max-w-xl w-full bg-white border-2 border-[#1E1B4B] rounded-3xl p-8 shadow-[8px_8px_0px_0px_#1E1B4B] space-y-6 animate-in fade-in zoom-in-95 relative z-10">
          {nextRound ? (
            <>
              <div className="w-20 h-20 rounded-3xl bg-amber-100 border-2 border-[#1E1B4B] mx-auto flex items-center justify-center shadow-[4px_4px_0px_0px_#D97706] animate-bounce">
                <Coffee className="w-10 h-10 text-amber-800" />
              </div>

              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-400 text-xs font-mono font-black uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
                  Round {currentRoundSequence} Finished · Break Period
                </div>
                <h1 className="font-display font-black text-3xl sm:text-4xl text-[#0F172A] tracking-tight uppercase">
                  Round {currentRoundSequence} Has Concluded!
                </h1>
                <p className="text-xs text-[#6E6E6E] font-medium leading-relaxed">
                  Great effort! Take a quick 5-minute break to stretch, hydrate, and prepare for the next challenge.
                </p>
              </div>

              {/* Live 5-Minute Break Countdown Card */}
              <div className="p-6 bg-[#F8F9FD] rounded-2xl border-2 border-[#1E1B4B] text-center space-y-2 shadow-[3px_3px_0px_0px_#1E1B4B]">
                <div className="text-xs font-mono text-[#6E6E6E] uppercase font-bold flex items-center justify-center gap-1.5">
                  <Timer className="w-4 h-4 text-[#7F45DB]" /> Break Time Remaining
                </div>
                <div className="font-mono text-4xl sm:text-5xl font-black text-[#7F45DB] tabular-nums tracking-wider">
                  {formatTime(breakTimeLeft)}
                </div>
                <div className="text-[11px] font-mono text-[#6E6E6E]">
                  Next challenge: <strong className="text-[#0F172A]">Round {nextRound.sequence}: {nextRound.name}</strong> ({nextRound.durationMin} Mins)
                </div>
              </div>

              <button
                onClick={() => router.push(`/rounds/${nextRound.id}`)}
                className="w-full py-4 rounded-2xl bg-[#7F45DB] hover:bg-[#6D35C7] text-white font-mono font-black text-sm uppercase tracking-wider border-2 border-[#1E1B4B] shadow-[4px_4px_0px_0px_#1E1B4B] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_#1E1B4B] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Proceed to Round {nextRound.sequence} Arena</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <div className="w-20 h-20 rounded-3xl bg-[#7F45DB]/10 border-2 border-[#1E1B4B] mx-auto flex items-center justify-center shadow-[4px_4px_0px_0px_#7F45DB] animate-bounce">
                <Trophy className="w-10 h-10 text-[#7F45DB]" />
              </div>
              <div className="space-y-2">
                <h1 className="font-display font-black text-3xl sm:text-4xl text-[#0F172A] tracking-tight uppercase">
                  ByteVerse 2026 Concluded!
                </h1>
                <p className="text-xs text-[#6E6E6E] font-mono leading-relaxed">
                  All tournament rounds are complete. Head over to the Grand Leaderboard to view final team standings and rankings!
                </p>
              </div>
              <button
                onClick={() => router.push("/leaderboard")}
                className="w-full py-4 rounded-2xl bg-[#7F45DB] hover:bg-[#6D35C7] text-white font-mono font-black text-sm uppercase tracking-wider border-2 border-[#1E1B4B] shadow-[4px_4px_0px_0px_#1E1B4B] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>View Grand Leaderboard</span>
                <Trophy className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  // ── SCREEN 1: Waiting Room (Held until Admin starts round) ──
  if (roundState.phase === "WAITING" || (!hasEnteredArena && roundState.phase === "ACTIVE")) {
    const isReadyToStart = roundState.phase === "ACTIVE";

    return (
      <div className="min-h-screen bg-[#F8F9FD] flex items-center justify-center p-6 font-sans relative">
        <AntiCheatShield
          roundId={roundId}
          isActive={!isRoundFinished}
        />

        <div className="max-w-lg w-full bg-white border-2 border-[#1E1B4B] rounded-3xl p-8 shadow-[8px_8px_0px_0px_#1E1B4B] space-y-6 text-center animate-in fade-in zoom-in-95">
          <div className="w-16 h-16 rounded-2xl bg-[#7F45DB]/10 border-2 border-[#1E1B4B] mx-auto flex items-center justify-center shadow-[3px_3px_0px_0px_#7F45DB] animate-pulse">
            {isReadyToStart ? (
              <Rocket className="w-8 h-8 text-[#7F45DB]" />
            ) : (
              <Clock className="w-8 h-8 text-[#7F45DB]" />
            )}
          </div>

          <div className="space-y-1.5">
            <div className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-mono font-black uppercase tracking-wider border ${
              isReadyToStart
                ? "bg-emerald-100 text-emerald-900 border-emerald-400"
                : "bg-amber-100 text-amber-900 border-amber-400"
            }`}>
              <span className={`w-2 h-2 rounded-full ${isReadyToStart ? "bg-emerald-600" : "bg-amber-600"} animate-pulse`} />
              Round {currentRoundSequence} · {isReadyToStart ? "Live in Progress" : "Waiting for Proctor"}
            </div>
            <h1 className="font-display font-black text-2xl sm:text-3xl text-[#0F172A] tracking-tight uppercase">
              {round?.name ?? `Round ${currentRoundSequence}`}
            </h1>
            <p className="text-xs text-[#6E6E6E] font-medium leading-relaxed">
              {team ? `Team: ${team.name}` : "Workstation Connected"}
            </p>
          </div>

          <div className="p-4 bg-[#F8F9FD] rounded-2xl border-2 border-[#1E1B4B] text-left space-y-2 text-xs font-mono">
            <div className="font-black text-[#0F172A] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#7F45DB]" /> Security Directives:
            </div>
            <ul className="text-[#6E6E6E] space-y-1 list-disc list-inside">
              <li>Anti-Cheat Shield and keyboard lockouts are actively engaged.</li>
              <li>Switching tabs, exiting fullscreen, or blurring will lock the workstation.</li>
              <li>Problems will unlock automatically as soon as the proctor starts the round.</li>
            </ul>
          </div>

          {isReadyToStart ? (
            <button
              onClick={handleStartRound}
              className="w-full py-4 rounded-2xl bg-[#7F45DB] hover:bg-[#6D35C7] text-white font-mono font-black text-sm uppercase tracking-wider border-2 border-[#1E1B4B] shadow-[4px_4px_0px_0px_#1E1B4B] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_#1E1B4B] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Enter Round {currentRoundSequence} Arena</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-300 text-amber-900 font-mono text-xs font-bold flex items-center justify-center gap-2">
              <Clock className="w-4 h-4 text-amber-700 animate-spin" />
              <span>Waiting for Tournament Host to Launch Round...</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── ACTIVE ARENA ──
  return (
    <div className="min-h-screen bg-[#F8F9FD] flex flex-col font-sans relative">
      <AntiCheatShield
        roundId={roundId}
        isActive={!isRoundFinished}
      />

      {/* Top Header Bar */}
      <header className="border-b-2 border-[#1E1B4B]/10 px-4 py-2.5 flex items-center justify-between flex-wrap gap-4 bg-white shadow-sm sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono font-black text-white px-2.5 py-1 rounded-lg bg-[#7F45DB] border border-[#1E1B4B]">
            Round {currentRoundSequence}
          </span>
          <span className="font-extrabold text-[#0F172A] text-sm sm:text-base font-display">
            {round?.name ?? "Tournament Arena"}
          </span>
        </div>

        {/* Center Timer */}
        <div className="flex items-center gap-3 bg-[#F0F2F8] px-3.5 py-1.5 rounded-xl border border-[#E2E8F0]">
          <span className="text-[11px] text-[#6E6E6E] font-mono uppercase font-bold">Time Remaining:</span>
          <span className={`font-mono text-base font-black tabular-nums ${timeLeft !== null && timeLeft < 300 ? "text-destructive" : "text-[#7F45DB]"}`}>
            {timeLeft !== null ? formatTime(timeLeft) : "--:--"}
          </span>
        </div>

        {/* Right Corner Controls */}
        <div className="flex items-center gap-3">
          {team && (
            <span className="text-xs text-[#0F172A] font-mono bg-[#F0F2F8] px-3 py-1 rounded-lg border border-[#E2E8F0] font-semibold hidden sm:inline">
              Team: {team.name}
            </span>
          )}

          {/* AI Assistant Toggle Button */}
          <button
            onClick={() => setIsAIOpen((prev) => !prev)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#7F45DB] hover:bg-[#6D35C7] text-white text-xs font-mono font-bold border-2 border-[#1E1B4B] shadow-[2px_2px_0px_0px_#1E1B4B] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_#1E1B4B] transition-all cursor-pointer"
            title="Open AI Tutor & Code Advisor"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
            <span>AI Assistant</span>
          </button>

          {/* Language Selector Dropdown */}
          <div className="flex items-center gap-1.5 bg-[#F0F2F8] px-3 py-1 rounded-xl border-2 border-[#1E1B4B] shadow-[2px_2px_0px_0px_#1E1B4B]">
            <span className="text-[11px] font-mono text-[#6E6E6E] uppercase font-bold">Language:</span>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as "cpp" | "c" | "java" | "python")}
              className="bg-transparent text-[#7F45DB] font-mono font-black text-xs focus:outline-none cursor-pointer uppercase"
            >
              <option value="c" className="bg-white text-[#0F172A]">C</option>
              <option value="cpp" className="bg-white text-[#0F172A]">C++</option>
              <option value="java" className="bg-white text-[#0F172A]">Java</option>
              <option value="python" className="bg-white text-[#0F172A]">Python</option>
            </select>
          </div>
        </div>
      </header>

      {/* Main Workspace Body */}
      {isMCQ ? (
        /* ── ROUND 1: 10 MCQ QUESTIONS WITH NEXT/BACK & QUESTION PALETTE ── */
        <div className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 space-y-5">
          {/* Question Navigation Palette (1 to 10) */}
          <div className="bg-white p-4 rounded-2xl border-2 border-[#1E1B4B] shadow-[4px_4px_0px_0px_#1E1B4B] flex items-center justify-between flex-wrap gap-3">
            <div className="text-xs font-mono font-bold text-[#0F172A] uppercase flex items-center gap-2">
              <span>Question Palette:</span>
              <span className="text-[#7F45DB]">
                ({Object.keys(answersMap).length}/{problems.length} Answered)
              </span>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {problems.map((p, idx) => {
                const isAnswered = Boolean(answersMap[p.id]);
                const isCurrent = idx === currentProblemIdx;

                return (
                  <button
                    key={p.id}
                    onClick={() => setCurrentProblemIdx(idx)}
                    className={`w-8 h-8 rounded-xl font-mono text-xs font-black transition-all cursor-pointer flex items-center justify-center border-2 ${
                      isCurrent
                        ? "bg-[#7F45DB] text-white border-[#1E1B4B] shadow-[2px_2px_0px_0px_#1E1B4B] scale-105"
                        : isAnswered
                        ? "bg-[#7F45DB]/20 text-[#4A2293] border-[#7F45DB]/50"
                        : "bg-[#F0F2F8] text-[#6E6E6E] border-[#E2E8F0] hover:border-[#1E1B4B]"
                    }`}
                    title={`Go to Question ${idx + 1}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Question Card */}
          {currentProblem ? (
            <div className="bg-white p-6 rounded-2xl border-2 border-[#1E1B4B] shadow-[4px_4px_0px_0px_#1E1B4B] space-y-4">
              <div className="flex items-center justify-between border-b-2 border-[#1E1B4B]/10 pb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-black px-2.5 py-0.5 rounded-lg bg-[#7F45DB]/10 text-[#4A2293] border border-[#7F45DB]/30">
                    Question {currentProblemIdx + 1} of {problems.length}
                  </span>
                  <h2 className="text-base font-bold text-[#0F172A] font-display">
                    {currentProblem.title}
                  </h2>
                </div>
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-[#F0F2F8] text-[#0F172A] border border-[#E2E8F0]">
                  Question Value: 10 Points
                </span>
              </div>

              <div className="text-sm font-semibold text-[#0F172A] leading-relaxed">
                {currentProblem.statement}
              </div>

              {/* Code Snippet rendered in selected language */}
              {currentProblem.starterCodes?.[lang] && (
                <div className="bg-[#0F172A] text-[#F8F9FD] p-4 rounded-xl border-2 border-[#1E1B4B] shadow-inner font-mono text-xs overflow-x-auto">
                  <div className="text-[10px] text-[#A472F7] font-bold uppercase tracking-wider mb-2 border-b border-white/10 pb-1 flex items-center justify-between">
                    <span>{lang.toUpperCase()} Code Snippet</span>
                    <span className="text-white/40">Read & Trace Logic</span>
                  </div>
                  <pre className="whitespace-pre font-mono leading-relaxed">{currentProblem.starterCodes[lang]}</pre>
                </div>
              )}

              {/* 4 Options Grid */}
              <div className="space-y-3 pt-2">
                <div className="text-xs font-mono uppercase text-[#0F172A] font-black tracking-wider flex items-center justify-between">
                  <span>Select the correct option ({lang.toUpperCase()}):</span>
                  {answersMap[currentProblem.id] && (
                    <span className="text-emerald-700 font-bold text-xs flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Answer Saved
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {(["A", "B", "C", "D"] as const).map((opt) => {
                    const optText = currentProblem.options?.[lang]?.[opt] || currentProblem.options?.["c"]?.[opt] || currentProblem.options?.["cpp"]?.[opt] || `Option ${opt}`;
                    const isSelected = answersMap[currentProblem.id] === opt;

                    return (
                      <div
                        key={opt}
                        onClick={() => handleSelectOption(opt)}
                        className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#7F45DB]/10 border-[#7F45DB] shadow-[3px_3px_0px_0px_#7F45DB] translate-x-0.5 translate-y-0.5"
                            : "bg-white border-[#1E1B4B] shadow-[3px_3px_0px_0px_#1E1B4B] hover:border-[#7F45DB] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_#1E1B4B]"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-xs font-mono font-black px-2.5 py-0.5 rounded-lg border ${
                            isSelected
                              ? "bg-[#7F45DB] text-white border-[#1E1B4B]"
                              : "bg-[#F0F2F8] text-[#0F172A] border-[#1E1B4B]"
                          }`}>
                            Option {opt}
                          </span>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-[#7F45DB]" />}
                        </div>
                        <div className="text-xs font-mono font-bold text-[#0F172A] bg-[#F8F9FD] p-3 rounded-lg border border-[#E2E8F0] overflow-x-auto whitespace-pre-wrap">
                          {optText}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Next and Back Navigation Controls */}
              <div className="flex items-center justify-between pt-4 border-t-2 border-[#1E1B4B]/10 flex-wrap gap-3">
                <button
                  onClick={() => setCurrentProblemIdx((prev) => Math.max(0, prev - 1))}
                  disabled={currentProblemIdx === 0}
                  className="px-5 py-2.5 rounded-xl bg-white hover:bg-[#F0F2F8] text-[#0F172A] font-mono font-bold text-xs border-2 border-[#1E1B4B] shadow-[2px_2px_0px_0px_#1E1B4B] hover:translate-x-0.5 hover:translate-y-0.5 disabled:opacity-30 disabled:pointer-events-none flex items-center gap-2 cursor-pointer transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous Question</span>
                </button>

                <div className="text-xs font-mono text-[#6E6E6E]">
                  Question {currentProblemIdx + 1} of {problems.length}
                </div>

                <button
                  onClick={() => setCurrentProblemIdx((prev) => Math.min(problems.length - 1, prev + 1))}
                  disabled={currentProblemIdx === problems.length - 1}
                  className="px-6 py-2.5 rounded-xl bg-[#7F45DB] hover:bg-[#6D35C7] text-white font-mono font-black text-xs uppercase tracking-wider border-2 border-[#1E1B4B] shadow-[3px_3px_0px_0px_#1E1B4B] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_#1E1B4B] disabled:opacity-30 disabled:pointer-events-none flex items-center gap-2 cursor-pointer transition-all"
                >
                  <span>Next Question</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white p-12 text-center rounded-2xl border-2 border-[#1E1B4B] text-xs font-mono text-[#6E6E6E]">
              Loading Round questions...
            </div>
          )}
        </div>
      ) : problems.length === 0 ? (
        <div className="flex-1 flex items-center justify-center p-8 max-w-xl mx-auto">
          <div className="bg-white p-8 text-center rounded-3xl border-2 border-[#1E1B4B] shadow-[6px_6px_0px_0px_#1E1B4B] space-y-4">
            <FileQuestion className="w-12 h-12 text-[#7F45DB] mx-auto animate-bounce" />
            <div className="font-display font-black text-xl text-[#0F172A] uppercase">
              Loading {round?.name ?? "Round"} Problems...
            </div>
            <p className="text-xs font-mono text-[#6E6E6E]">
              Synchronizing problem bank with tournament server...
            </p>
          </div>
        </div>
      ) : (
        /* ── ROUNDS 2–5: ADVANCED CODING & OPTIMIZATION WORKSPACE ── */
        <div className="flex-1 flex flex-col p-4 gap-4 max-w-[1700px] w-full mx-auto overflow-hidden">
          {/* Question Selector Palette Bar */}
          <div className="bg-white px-5 py-3 rounded-2xl border-2 border-[#1E1B4B] shadow-[4px_4px_0px_0px_#1E1B4B] flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-black text-[#0F172A] uppercase">
                Challenge Problems:
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                {problems.map((p, idx) => {
                  const isCurrent = idx === currentProblemIdx;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setCurrentProblemIdx(idx)}
                      className={`px-3.5 py-1.5 rounded-xl font-mono text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 border-2 ${
                        isCurrent
                          ? "bg-[#7F45DB] text-white border-[#1E1B4B] shadow-[2px_2px_0px_0px_#1E1B4B] scale-105"
                          : "bg-[#F8F9FD] text-[#0F172A] border-[#1E1B4B]/30 hover:border-[#1E1B4B]"
                      }`}
                    >
                      <span>Q{idx + 1}</span>
                      {p.difficulty && (
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                          p.difficulty === "Easy" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                        }`}>
                          {p.difficulty}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentProblemIdx((prev) => Math.max(0, prev - 1))}
                disabled={currentProblemIdx === 0}
                className="px-3.5 py-1.5 rounded-xl bg-white text-[#0F172A] font-mono font-bold text-xs border border-[#1E1B4B]/30 hover:border-[#1E1B4B] disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Prev
              </button>
              <button
                onClick={() => setCurrentProblemIdx((prev) => Math.min(problems.length - 1, prev + 1))}
                disabled={currentProblemIdx === problems.length - 1}
                className="px-3.5 py-1.5 rounded-xl bg-white text-[#0F172A] font-mono font-bold text-xs border border-[#1E1B4B]/30 hover:border-[#1E1B4B] disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1 cursor-pointer"
              >
                Next <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Main Coding Workspace Grid: Left (Problem Narrative) | Right (Monaco Editor + Console) */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-[600px]">
            {/* Left Panel: Problem Statement */}
            <div className="lg:col-span-5 bg-white rounded-3xl border-2 border-[#1E1B4B] shadow-[4px_4px_0px_0px_#1E1B4B] p-6 overflow-y-auto space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                {/* Title & Badges */}
                <div className="border-b-2 border-[#1E1B4B]/10 pb-4 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-black px-2.5 py-0.5 rounded-lg bg-[#7F45DB]/10 text-[#4A2293] border border-[#7F45DB]/30">
                      Problem {currentProblemIdx + 1} of {problems.length}
                    </span>
                    {currentProblem?.difficulty && (
                      <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg border ${
                        currentProblem.difficulty === "Easy"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                          : "bg-red-50 text-red-800 border-red-300"
                      }`}>
                        {currentProblem.difficulty}
                      </span>
                    )}
                    <span className="text-xs font-mono text-[#6E6E6E] ml-auto">
                      Time Limit: {currentProblem?.timeLimitMs ?? 1000}ms
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-[#0F172A] font-display">
                    {currentProblem?.title ?? "Problem Statement"}
                  </h2>
                </div>

                {/* Problem Statement Narrative */}
                <div className="text-xs text-[#0F172A] leading-relaxed whitespace-pre-wrap font-sans space-y-3 bg-[#F8F9FD] p-4 rounded-2xl border border-[#1E1B4B]/10">
                  {currentProblem?.statement}
                </div>

                {/* Input & Output Specifications */}
                {currentProblem?.inputFormat && (
                  <div className="space-y-1 text-xs font-mono">
                    <span className="font-bold text-[#0F172A] uppercase">Input Format:</span>
                    <div className="p-2.5 bg-[#F0F2F8] rounded-xl border border-[#E2E8F0] text-[#0F172A]">
                      {currentProblem.inputFormat}
                    </div>
                  </div>
                )}

                {currentProblem?.outputFormat && (
                  <div className="space-y-1 text-xs font-mono">
                    <span className="font-bold text-[#0F172A] uppercase">Output Format:</span>
                    <div className="p-2.5 bg-[#F0F2F8] rounded-xl border border-[#E2E8F0] text-[#0F172A]">
                      {currentProblem.outputFormat}
                    </div>
                  </div>
                )}

                {/* Constraints */}
                {currentProblem?.constraints && (
                  <div className="space-y-1 text-xs font-mono">
                    <span className="font-bold text-[#0F172A] uppercase">Constraints:</span>
                    <div className="p-2.5 bg-[#F0F2F8] rounded-xl border border-[#E2E8F0] text-[#0F172A]">
                      {currentProblem.constraints}
                    </div>
                  </div>
                )}

                {/* Sample Test Case */}
                {currentProblem?.sampleInput && (
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="space-y-1 text-xs font-mono">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#0F172A] uppercase">Sample Input:</span>
                        <button
                          onClick={() => setCustomInput(currentProblem.sampleInput ?? "")}
                          className="text-[10px] text-[#7F45DB] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Copy className="w-3 h-3" /> Load in Input
                        </button>
                      </div>
                      <pre className="p-3 bg-[#0F172A] text-emerald-400 rounded-xl font-mono text-xs overflow-x-auto whitespace-pre">
                        {currentProblem.sampleInput}
                      </pre>
                    </div>

                    <div className="space-y-1 text-xs font-mono">
                      <span className="font-bold text-[#0F172A] uppercase">Sample Output:</span>
                      <pre className="p-3 bg-[#0F172A] text-amber-300 rounded-xl font-mono text-xs overflow-x-auto whitespace-pre">
                        {currentProblem.sampleOutput}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel: Monaco Editor + Console Bar */}
            <div className="lg:col-span-7 flex flex-col gap-3">
              {/* Editor Window */}
              <div className="flex-1 bg-white rounded-3xl border-2 border-[#1E1B4B] shadow-[4px_4px_0px_0px_#1E1B4B] flex flex-col overflow-hidden min-h-[450px]">
                {/* Editor Action Header */}
                <div className="p-3 bg-[#F0F2F8] border-b-2 border-[#1E1B4B]/10 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-[#7F45DB]" />
                    <span className="text-xs font-mono font-black text-[#0F172A] uppercase">
                      Code Editor ({lang.toUpperCase()})
                    </span>
                    <span className="text-[10px] font-mono text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-300 font-bold">
                      Pre-Loaded AI Naive Code
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleResetCode}
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-[#0F172A] font-mono font-bold text-xs border border-[#1E1B4B]/30 hover:border-[#1E1B4B] transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                      title="Reset back to initial naive AI code snippet"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-[#6E6E6E]" />
                      <span>Reset AI Code</span>
                    </button>

                    <button
                      onClick={handleRunCode}
                      disabled={isRunning || isSubmitting}
                      className="px-4 py-1.5 rounded-xl bg-white hover:bg-[#F0F2F8] text-[#0F172A] font-mono font-black text-xs border-2 border-[#1E1B4B] shadow-[2px_2px_0px_0px_#1E1B4B] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_#1E1B4B] transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                    >
                      <Play className={`w-3.5 h-3.5 fill-[#0F172A] ${isRunning ? "animate-spin" : ""}`} />
                      <span>{isRunning ? "Running..." : "Run Code"}</span>
                    </button>

                    <button
                      onClick={handleSubmitCode}
                      disabled={isRunning || isSubmitting}
                      className="px-5 py-1.5 rounded-xl bg-[#7F45DB] hover:bg-[#6D35C7] text-white font-mono font-black text-xs uppercase tracking-wider border-2 border-[#1E1B4B] shadow-[2px_2px_0px_0px_#1E1B4B] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_#1E1B4B] transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                    >
                      <Rocket className={`w-3.5 h-3.5 ${isSubmitting ? "animate-spin" : ""}`} />
                      <span>{isSubmitting ? "Judging..." : "Submit Solution"}</span>
                    </button>
                  </div>
                </div>

                {/* Monaco Editor Container */}
                <div className="flex-1 min-h-[350px]">
                  <MonacoEditor
                    height="100%"
                    language={lang === "c" ? "c" : lang === "cpp" ? "cpp" : lang === "java" ? "java" : "python"}
                    theme="vs"
                    value={code}
                    onChange={handleCodeChange}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 13,
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      tabSize: 4,
                    }}
                  />
                </div>
              </div>

              {/* Bottom Console Drawer */}
              <div className="bg-white rounded-3xl border-2 border-[#1E1B4B] shadow-[4px_4px_0px_0px_#1E1B4B] overflow-hidden flex flex-col">
                {/* Console Tabs */}
                <div className="px-4 py-2 bg-[#F0F2F8] border-b-2 border-[#1E1B4B]/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveConsoleTab("output")}
                      className={`px-3 py-1 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer ${
                        activeConsoleTab === "output"
                          ? "bg-white text-[#7F45DB] border border-[#1E1B4B] shadow-sm"
                          : "text-[#6E6E6E] hover:text-[#0F172A]"
                      }`}
                    >
                      Output Console
                    </button>
                    <button
                      onClick={() => setActiveConsoleTab("input")}
                      className={`px-3 py-1 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer ${
                        activeConsoleTab === "input"
                          ? "bg-white text-[#7F45DB] border border-[#1E1B4B] shadow-sm"
                          : "text-[#6E6E6E] hover:text-[#0F172A]"
                      }`}
                    >
                      Custom Input
                    </button>
                    <button
                      onClick={() => setActiveConsoleTab("verdict")}
                      className={`px-3 py-1 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer ${
                        activeConsoleTab === "verdict"
                          ? "bg-white text-[#7F45DB] border border-[#1E1B4B] shadow-sm"
                          : "text-[#6E6E6E] hover:text-[#0F172A]"
                      }`}
                    >
                      Submission Verdict
                    </button>
                  </div>
                </div>

                {/* Console Content */}
                <div className="p-4 font-mono text-xs min-h-[120px] max-h-[220px] overflow-y-auto bg-[#0F172A] text-[#F8F9FD]">
                  {activeConsoleTab === "input" && (
                    <textarea
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      placeholder="Enter custom standard input (stdin) here..."
                      className="w-full h-24 bg-transparent text-[#F8F9FD] font-mono text-xs focus:outline-none resize-none"
                    />
                  )}

                  {activeConsoleTab === "output" && (
                    <div>
                      {isRunning && <div className="text-amber-300">⏳ Compiling and executing code in sandbox...</div>}
                      {!isRunning && !runResult && (
                        <div className="text-white/40">Click &apos;Run Code&apos; to test your solution against standard input.</div>
                      )}
                      {runResult && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-3 border-b border-white/10 pb-1.5 text-[11px] text-white/60">
                            <span>Status: <strong className="text-white">{runResult.status ?? "DONE"}</strong></span>
                            <span>Time: <strong className="text-white">{runResult.time ?? "0.00"}s</strong></span>
                            <span>Memory: <strong className="text-white">{runResult.memory ?? 0} KB</strong></span>
                          </div>
                          {runResult.stdout && (
                            <div>
                              <div className="text-[10px] text-emerald-400 font-bold uppercase">Standard Output:</div>
                              <pre className="text-emerald-300 whitespace-pre-wrap">{runResult.stdout}</pre>
                            </div>
                          )}
                          {runResult.compile_output && (
                            <div>
                              <div className="text-[10px] text-amber-400 font-bold uppercase">Compiler Output:</div>
                              <pre className="text-amber-300 whitespace-pre-wrap">{runResult.compile_output}</pre>
                            </div>
                          )}
                          {runResult.stderr && (
                            <div>
                              <div className="text-[10px] text-red-400 font-bold uppercase">Error Output:</div>
                              <pre className="text-red-300 whitespace-pre-wrap">{runResult.stderr}</pre>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {activeConsoleTab === "verdict" && (
                    <div>
                      {isSubmitting && <div className="text-amber-300">🚀 Evaluating all test cases against Judge0...</div>}
                      {!isSubmitting && !submissionResult && (
                        <div className="text-white/40">Click &apos;Submit Solution&apos; to evaluate against all hidden test cases.</div>
                      )}
                      {submissionResult && (
                        <div className="space-y-2">
                          <div className="text-base font-black flex items-center gap-2">
                            {submissionResult.status === "ACCEPTED" || submissionResult.status === "QUEUED" ? (
                              <span className="text-emerald-400 flex items-center gap-1.5">
                                <CheckCircle className="w-5 h-5" /> Verdict: {submissionResult.status}
                              </span>
                            ) : (
                              <span className="text-red-400 flex items-center gap-1.5">
                                <XCircle className="w-5 h-5" /> Verdict: {submissionResult.status ?? "FAILED"}
                              </span>
                            )}
                          </div>
                          {submissionResult.rawScore !== undefined && (
                            <div className="text-xs text-white/80">
                              Score Awarded: <strong className="text-[#A472F7]">{submissionResult.rawScore} Points</strong>
                            </div>
                          )}
                          {submissionResult.error && (
                            <div className="text-xs text-red-300">{submissionResult.error}</div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dedicated AI Assistant Drawer (AI Chat + AI Code) */}
      <AIAssistantDrawer
        roundId={roundId}
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
      />
    </div>
  );
}
