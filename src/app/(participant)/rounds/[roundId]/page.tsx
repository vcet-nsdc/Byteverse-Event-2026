"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import SystemReadinessGate from "@/components/participant/SystemReadinessGate";
import AntiCheatShield from "@/components/participant/AntiCheatShield";
import AIAssistantDrawer from "@/components/participant/AIAssistantDrawer";
import Round4ProblemSelector from "@/components/participant/Round4ProblemSelector";
import Round5ProblemSelector from "@/components/participant/Round5ProblemSelector";
import Round5AnalysisModal from "@/components/participant/Round5AnalysisModal";
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
  Copy,
  Flag,
  ShieldAlert,
  Bot,
  Zap,
  Calendar
} from "lucide-react";
import { FormattedStatement } from "@/components/problem/formatted-statement";

const ROUND_TIMETABLE: Record<number, { window: string; start: string; end: string; duration: string; name: string }> = {
  1: { window: "12:30 PM - 12:50 PM", start: "12:30 PM", end: "12:50 PM", duration: "20 mins duration", name: "Code Logic" },
  2: { window: "12:55 PM - 01:20 PM", start: "12:55 PM", end: "01:20 PM", duration: "25 mins duration", name: "Code Optimization" },
  3: { window: "01:25 PM - 02:00 PM", start: "01:25 PM", end: "02:00 PM", duration: "35 mins duration", name: "Algorithmic Efficiency" },
  4: { window: "02:05 PM - 02:50 PM", start: "02:05 PM", end: "02:50 PM", duration: "45 mins duration", name: "Deep Problem Solving" },
  5: { window: "02:55 PM - 03:30 PM", start: "02:55 PM", end: "03:30 PM", duration: "35 mins duration", name: "AI vs Human Grand Finale" },
};

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
  sampleCount?: number;
  hiddenCount?: number;
  edgeCount?: number;
  aiAnalysisReport?: any;
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
    message?: string;
    compile_output?: string;
    stderr?: string;
    stdout?: string;
    error?: string;
  } | null>(null);

  const [roundState, setRoundState] = useState<RoundState>({ phase: "WAITING", timeLeftSeconds: null });
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [breakTimeLeft, setBreakTimeLeft] = useState<number>(300); // 5 min break timer
  const [isReadinessPassed, setIsReadinessPassed] = useState(false);
  const [hasEnteredArena, setHasEnteredArena] = useState(false);
  const [hasUserEndedRound, setHasUserEndedRound] = useState(false);
  const [showEndRoundModal, setShowEndRoundModal] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);

  // Round 4 Challenge Selection State
  const [isRound4Selected, setIsRound4Selected] = useState(false);
  const [round4Problems, setRound4Problems] = useState<any[]>([]);

  // Round 5 Human vs Machine Duel State
  const [isRound5Selected, setIsRound5Selected] = useState(false);
  const [round5Problems, setRound5Problems] = useState<any[]>([]);
  const [round5RunsRemaining, setRound5RunsRemaining] = useState(10);
  const [isRound5Locked, setIsRound5Locked] = useState(false);
  const [round5LatestReport, setRound5LatestReport] = useState<any>(null);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [isAnalyzingR5, setIsAnalyzingR5] = useState(false);
  const [showLockConfirmModal, setShowLockConfirmModal] = useState(false);

  // Instant Score & Next Round Telemetry
  const [myScore, setMyScore] = useState<{
    finalScore: number;
    rawScore: number;
    solvedCount: number;
    totalProblemsCount: number;
    durationSeconds: number;
  } | null>(null);
  const [nextRoundState, setNextRoundState] = useState<RoundState | null>(null);
  const [submittedProblems, setSubmittedProblems] = useState<Record<string, { status: string; rawScore?: number }>>({});

  // Fetch existing submissions for this round to prevent re-submission after refresh
  useEffect(() => {
    async function loadExistingSubmissions() {
      try {
        const res = await fetch(`/api/submissions?roundId=${roundId}`);
        if (res.ok) {
          const subs = await res.json();
          if (Array.isArray(subs)) {
            const map: Record<string, { status: string; rawScore?: number }> = {};
            for (const s of subs) {
              map[s.problemId] = { status: s.status, rawScore: s.rawScore };
            }
            setSubmittedProblems(map);
          }
        }
      } catch {
        // ignore
      }
    }
    if (roundId) loadExistingSubmissions();
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

  const round = roundState.round ?? allRounds.find((r) => r.id === roundId);
  const team = roundState.team;
  const currentRoundSequence = round?.sequence ?? 1;
  const nextRound = allRounds.find((r) => r.sequence === currentRoundSequence + 1);

  // Bypass System Readiness & Agreement if already agreed on Round 1 or if proceeding to later rounds
  useEffect(() => {
    try {
      const tournamentAgreed = localStorage.getItem("byteverse_tournament_agreed");
      const entered = sessionStorage.getItem(`byteverse_arena_entered_${roundId}`);
      if (tournamentAgreed === "true" || (round && round.sequence > 1)) {
        setIsReadinessPassed(true);
      }
      if (entered === "true") {
        setHasEnteredArena(true);
      }
      const ended = sessionStorage.getItem(`byteverse_round_ended_${roundId}`);
      if (ended === "true") {
        setHasUserEndedRound(true);
      }
    } catch {
      // ignore
    }
  }, [roundId, round]);

  // Fetch problems for this round
  const fetchProblems = useCallback(async () => {
    try {
      const res = await fetch(`/api/rounds/${roundId}/problem`);
      if (res.ok) {
        const data = await res.json();
        if (data.isRound5) {
          setIsRound5Selected(Boolean(data.hasSelected));
          setRound5Problems(data.problems || []);
          setRound5RunsRemaining(data.analysisRunsRemaining ?? 10);
          setIsRound5Locked(Boolean(data.isLocked));
          setRound5LatestReport(data.latestReport ?? null);
          if (data.hasSelected && Array.isArray(data.problems) && data.problems.length > 0) {
            setProblems(data.problems);
          }
        } else if (data.isRound4) {
          setIsRound4Selected(Boolean(data.hasSelected));
          setRound4Problems(data.problems || []);
          if (data.hasSelected && Array.isArray(data.problems) && data.problems.length > 0) {
            setProblems(data.problems);
          }
        } else if (Array.isArray(data.problems) && data.problems.length > 0) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProblemIdx, lang, problems]);

  // Reset terminal and execution results when switching questions
  useEffect(() => {
    setRunResult(null);
    setSubmissionResult(null);
    setActiveConsoleTab("output");
  }, [currentProblemIdx]);

  // Handle language switch from dropdown
  const handleLanguageChange = (newLang: "cpp" | "c" | "java" | "python") => {
    setLang(newLang);
    const curr = problems[currentProblemIdx];
    if (!curr) return;
    const saved = codeMap[curr.id]?.[newLang];
    if (saved !== undefined) {
      setCode(saved);
    } else {
      const starter = curr.starterCodes?.[newLang] || LANG_DEFAULTS[newLang];
      setCode(starter);
    }
  };

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

    if (submittedProblems[curr.id]) {
      return;
    }

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

      if (res.ok && data.status && data.status !== "SYSTEM_ERROR") {
        // Record as submitted to immediately lock this problem
        setSubmittedProblems((prev) => ({
          ...prev,
          [curr.id]: { status: data.status, rawScore: data.rawScore },
        }));

        // Switch to the next unsubmitted question automatically after a brief delay
        setTimeout(() => {
          setCurrentProblemIdx((prevIdx) => {
            const nextIdx = problems.findIndex(
              (p, idx) => idx > prevIdx && !submittedProblems[p.id] && p.id !== curr.id
            );
            if (nextIdx !== -1) return nextIdx;

            const anyUnsubmittedIdx = problems.findIndex(
              (p) => !submittedProblems[p.id] && p.id !== curr.id
            );
            if (anyUnsubmittedIdx !== -1) return anyUnsubmittedIdx;

            return prevIdx;
          });
        }, 1200);
      }
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
    const fallbackPoll = setInterval(pollState, 2000);

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

  // User Early Round Finalization or Timer Expiration
  const isRoundFinished = (timeLeft !== null && timeLeft <= 0) || roundState.phase === "BREAK" || roundState.phase === "ENDED" || hasUserEndedRound;
  const isTournamentConcluded = (currentRoundSequence === 5 && isRoundFinished) || (!nextRound && isRoundFinished);

  // When all 5 rounds conclude: automatically exit fullscreen
  useEffect(() => {
    if (isTournamentConcluded) {
      try {
        if (typeof document !== "undefined" && document.fullscreenElement) {
          document.exitFullscreen().catch(() => { });
        }
      } catch {
        // ignore
      }
    }
  }, [isTournamentConcluded]);

  // Fetch Participant Score when round ends
  useEffect(() => {
    if (!isRoundFinished) return;

    async function fetchFinalScore() {
      try {
        const res = await fetch(`/api/rounds/${roundId}/my-score`);
        if (res.ok) {
          const data = await res.json();
          setMyScore(data);
        }
      } catch {
        // ignore
      }
    }

    fetchFinalScore();
    const scoreInterval = setInterval(fetchFinalScore, 3000);
    return () => clearInterval(scoreInterval);
  }, [isRoundFinished, roundId]);

  // Poll Next Round State on Break Screen
  useEffect(() => {
    const nextId = nextRound?.id;
    if (!isRoundFinished || !nextId) return;

    async function pollNextRound() {
      try {
        const res = await fetch(`/api/rounds/${nextId}/state`);
        if (res.ok) {
          const data = await res.json();
          setNextRoundState(data);
        }
      } catch {
        // ignore
      }
    }

    pollNextRound();
    const nextInterval = setInterval(pollNextRound, 2000);
    return () => clearInterval(nextInterval);
  }, [isRoundFinished, nextRound?.id]);

  // Handle Participant Early Round End
  const handleConfirmEndRound = async () => {
    setHasUserEndedRound(true);
    setShowEndRoundModal(false);
    try {
      sessionStorage.setItem(`byteverse_round_ended_${roundId}`, "true");
    } catch {
      // ignore
    }

    // Call finish API to persist exact time taken into database
    try {
      const initialSeconds = (roundState.durationMin || 60) * 60;
      const timeSpentSeconds = timeLeft !== null ? Math.max(0, initialSeconds - timeLeft) : 0;
      const res = await fetch(`/api/rounds/${roundId}/finish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timeSpentSeconds }),
      });
      if (res.ok) {
        const data = await res.json();
        setMyScore(data);
      }
    } catch (err) {
      console.error("Failed to record round finish timestamp:", err);
    }
  };

  // Auto-end round when timer reaches 0
  useEffect(() => {
    if (timeLeft === 0 && roundState.phase === "ACTIVE" && !hasUserEndedRound) {
      handleConfirmEndRound();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, roundState.phase, hasUserEndedRound]);

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

  // Handle Round 5 7-Dimension Code Analysis & Locking
  const handleRound5Analysis = async (isFinal = false) => {
    const curr = problems[currentProblemIdx];
    if (!curr) return;
    setIsAnalyzingR5(true);
    try {
      const res = await fetch(`/api/rounds/${roundId}/analysis`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemId: curr.id,
          language: lang,
          sourceCode: code,
          isFinal,
        }),
      });
      const data = await res.json();
      if (data.success && data.analysisReport) {
        setRound5LatestReport(data.analysisReport);
        setRound5RunsRemaining(data.runsRemaining);
        setIsRound5Locked(Boolean(data.isLocked));
        setShowAnalysisModal(true);
        if (isFinal) {
          setShowLockConfirmModal(false);
          setSubmittedProblems((prev) => ({
            ...prev,
            [curr.id]: { status: "ACCEPTED", rawScore: data.score },
          }));
        }
      } else if (data.error) {
        alert(data.error);
      }
    } catch (err) {
      console.error("Round 5 Analysis Error:", err);
    } finally {
      setIsAnalyzingR5(false);
    }
  };

  // Start Round Action — Engages Fullscreen and platform restrictions
  const handleStartRound = async () => {
    if (problems.length === 0) {
      await fetchProblems();
    }
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen().catch(() => { });
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

  const currentProblem = problems[currentProblemIdx] ?? null;
  const activeRoundType = round?.type ?? allRounds.find((r) => r.id === roundId)?.type;
  const isMCQ = activeRoundType === "CODE_LOGIC" || (currentProblem?.options !== undefined && currentProblem?.options !== null);
  const isRound5 = currentRoundSequence === 5 || activeRoundType === "HUMAN_VS_MACHINE";

  // ── GATE 0: Disqualified Team Screen (Completely Frozen) ──
  if (roundState.phase === "DISQUALIFIED" || team?.status === "DISQUALIFIED") {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 font-sans relative z-50">
        <div className="text-center max-w-xl w-full bg-black/90 border-4 border-red-600 rounded-3xl p-8 shadow-[0_0_50px_rgba(239,68,68,0.5)] space-y-6 animate-in fade-in zoom-in-95">
          <div className="w-20 h-20 rounded-3xl bg-red-950/80 border-2 border-red-600 mx-auto flex items-center justify-center shadow-[4px_4px_0px_0px_#EF4444] animate-pulse">
            <ShieldAlert className="w-10 h-10 text-red-500" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-red-950 text-red-400 border border-red-600 text-xs font-mono font-black uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              Tournament Integrity Notice
            </div>
            <h1 className="font-display font-black text-3xl sm:text-4xl text-white tracking-tight uppercase">
              Workstation Disqualified
            </h1>
            <p className="text-sm text-red-300 font-mono leading-relaxed pt-2">
              Your team has been disqualified by tournament administrators. Access to problem statements, compiler execution, and submission verification has been revoked.
            </p>
          </div>

          <div className="bg-red-950/40 border border-red-800/60 p-4 rounded-2xl text-xs text-gray-300 font-mono text-center">
            If you believe this was done in error or an accidental trigger, please approach the stage or contact an event invigilator immediately.
          </div>
        </div>
      </div>
    );
  }

  // ── GATE 1: Pre-Round Readiness Check & Agreement Gate ──
  if (!isReadinessPassed && roundState.phase !== "GATE_TEAM") {
    return (
      <SystemReadinessGate
        roundName={round?.name ?? "Round " + currentRoundSequence}
        sequence={currentRoundSequence}
        durationMin={round?.durationMin ?? 20}
        onComplete={() => {
          localStorage.setItem("byteverse_tournament_agreed", "true");
          setIsReadinessPassed(true);
          setHasEnteredArena(true);
        }}
      />
    );
  }

  // ── CONSTANT SCREEN: Intermission & Tournament Concluded Screens ──
  if (isRoundFinished) {
    const isNextRoundLive = nextRoundState?.phase === "ACTIVE";

    return (
      <div className="min-h-screen bg-[#F8F9FD] flex items-center justify-center p-6 font-sans relative">
        <AntiCheatShield
          roundId={roundId}
          isActive={!isTournamentConcluded}
        />
        <div className="text-center max-w-2xl w-full bg-white border-2 border-[#1E1B4B] rounded-3xl p-6 sm:p-8 shadow-[8px_8px_0px_0px_#1E1B4B] space-y-6 animate-in fade-in zoom-in-95 relative z-10">
          {!isTournamentConcluded && nextRound ? (
            <>
              <div className="w-20 h-20 rounded-3xl bg-[#7F45DB]/10 border-2 border-[#1E1B4B] mx-auto flex items-center justify-center shadow-[4px_4px_0px_0px_#7F45DB] animate-bounce">
                <Coffee className="w-10 h-10 text-[#7F45DB]" />
              </div>

              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-400 text-xs font-mono font-black uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Round {currentRoundSequence} Finished · Submissions Saved
                </div>
                <h1 className="font-display font-black text-3xl sm:text-4xl text-[#0F172A] tracking-tight uppercase">
                  Round {currentRoundSequence} Concluded!
                </h1>
                <p className="text-xs text-[#6E6E6E] font-medium leading-relaxed font-mono">
                  All participant answers for Round {currentRoundSequence} have been securely registered.
                </p>
              </div>

              {/* Next Round Scheduled Timing Card */}
              <div className="p-6 bg-[#F0F2F8] rounded-2xl border-2 border-[#1E1B4B] text-center space-y-3 shadow-[4px_4px_0px_0px_#1E1B4B]">
                <div className="text-xs font-mono text-[#6E6E6E] uppercase font-bold flex items-center justify-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#7F45DB]" /> Upcoming Round Schedule
                </div>
                <div className="font-display text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
                  Next Round will begin at{" "}
                  <span className="text-[#7F45DB] underline decoration-[#7F45DB]/40">
                    {ROUND_TIMETABLE[nextRound.sequence]?.start ?? "scheduled time"}
                  </span>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-white border border-[#1E1B4B]/20 text-xs font-mono font-bold text-[#4A2293]">
                  <span>Timing Window: {ROUND_TIMETABLE[nextRound.sequence]?.window}</span>
                  <span>•</span>
                  <span>{ROUND_TIMETABLE[nextRound.sequence]?.duration}</span>
                </div>
                <div className="text-xs font-mono text-[#6E6E6E]">
                  Next Challenge: <strong className="text-[#0F172A]">Round {nextRound.sequence}: {nextRound.name}</strong>
                </div>
              </div>

              {/* Arena Open Status & Enter Button */}
              {isNextRoundLive ? (
                <button
                  onClick={() => router.push(`/rounds/${nextRound.id}`)}
                  className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-mono font-black text-sm uppercase tracking-wider border-2 border-[#1E1B4B] shadow-[4px_4px_0px_0px_#1E1B4B] hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer animate-pulse"
                >
                  <Rocket className="w-5 h-5 text-white" />
                  <span>Round {nextRound.sequence} is Live · Enter Arena Now ➔</span>
                </button>
              ) : (
                <div className="w-full py-4 px-4 rounded-2xl bg-white border-2 border-[#1E1B4B] text-[#475569] font-mono font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-[3px_3px_0px_0px_#1E1B4B]">
                  <Clock className="w-4 h-4 text-[#7F45DB] animate-spin" />
                  <span>Round {nextRound.sequence} will open at {ROUND_TIMETABLE[nextRound.sequence]?.start}...</span>
                </div>
              )}

              {/* Full 5-Round Timetable Preview (exact match to schedule image) */}
              <div className="pt-2 text-left space-y-2">
                <div className="text-[11px] font-mono text-[#6E6E6E] uppercase font-black">
                  Official Tournament Schedule:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 font-mono">
                  {[1, 2, 3, 4, 5].map((seq) => {
                    const sched = ROUND_TIMETABLE[seq];
                    const isDone = seq <= currentRoundSequence;
                    const isCurrentUpcoming = seq === nextRound.sequence;
                    return (
                      <div
                        key={seq}
                        className={`p-3 rounded-2xl border-2 transition-all ${isCurrentUpcoming
                            ? "bg-[#7F45DB]/10 border-[#7F45DB] shadow-[2px_2px_0px_0px_#7F45DB]"
                            : isDone
                              ? "bg-emerald-50/80 border-emerald-300"
                              : "bg-[#F8F9FD] border-[#E2E8F0]"
                          }`}
                      >
                        <div className="flex items-center justify-between text-[11px] font-black">
                          <span className={isCurrentUpcoming ? "text-[#7F45DB]" : isDone ? "text-emerald-800" : "text-[#0F172A]"}>
                            Round {seq}
                          </span>
                          {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                        </div>
                        <div className="text-xs text-[#7F45DB] font-black mt-1">
                          {sched.window}
                        </div>
                        <div className="text-[10px] text-[#6E6E6E] mt-0.5 font-medium">
                          {sched.duration}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            /* ── ALL 5 ROUNDS COMPLETE / TOURNAMENT CONCLUDED ── */
            <>
              <div className="w-20 h-20 rounded-3xl bg-[#7F45DB]/10 border-2 border-[#1E1B4B] mx-auto flex items-center justify-center shadow-[4px_4px_0px_0px_#7F45DB] animate-bounce">
                <Trophy className="w-10 h-10 text-[#7F45DB]" />
              </div>

              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-400 text-xs font-mono font-black uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  All 5 Rounds Completed · Tournament Finished
                </div>
                <h1 className="font-display font-black text-3xl sm:text-4xl text-[#0F172A] tracking-tight uppercase">
                  ByteVerse 2026 Concluded!
                </h1>
                <p className="text-xs sm:text-sm text-[#475569] font-mono leading-relaxed max-w-lg mx-auto">
                  Congratulations! You have completed all 5 tournament rounds. Fullscreen lock and Anti-Cheat restrictions have been disengaged.
                </p>
              </div>

              {/* All 5 Rounds Checklist */}
              <div className="p-4 bg-[#F8F9FD] rounded-2xl border-2 border-[#1E1B4B] text-left font-mono space-y-2.5 shadow-[3px_3px_0px_0px_#1E1B4B]">
                <div className="text-xs font-black text-[#0F172A] uppercase flex items-center justify-between">
                  <span>Tournament Rounds Status:</span>
                  <span className="text-emerald-700 font-extrabold">5 of 5 Completed</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((seq) => (
                    <div key={seq} className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-300 text-center">
                      <div className="flex items-center justify-center gap-1 text-xs font-black text-emerald-900">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Round {seq}
                      </div>
                      <div className="text-[10px] text-emerald-700 font-medium mt-0.5">Recorded</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submissions Recorded Notice */}
              <div className="bg-[#F0F2F8] p-5 rounded-2xl border-2 border-[#1E1B4B] shadow-[3px_3px_0px_0px_#1E1B4B] space-y-2 text-center font-mono">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Submissions Closed & Under Evaluation
                </div>
                <p className="text-xs text-[#334155] font-medium leading-relaxed pt-1">
                  Thank you for competing in ByteVerse 2026! Official scores, final tournament standings, and award winners will be announced by the organizers during the closing ceremony.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    if (typeof document !== "undefined" && document.fullscreenElement) {
                      document.exitFullscreen().catch(() => { });
                    }
                    router.push("/");
                  }}
                  className="w-full py-4 rounded-2xl bg-[#0F172A] hover:bg-[#1E1B4B] text-white font-mono font-black text-sm uppercase tracking-wider border-2 border-[#1E1B4B] shadow-[4px_4px_0px_0px_#1E1B4B] hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Return to Home</span>
                </button>
              </div>
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
            <div className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-mono font-black uppercase tracking-wider border ${isReadyToStart
                ? "bg-emerald-100 text-emerald-900 border-emerald-400"
                : "bg-amber-100 text-amber-900 border-amber-400"
              }`}>
              <span className={`w-2 h-2 rounded-full ${isReadyToStart ? "bg-emerald-600" : "bg-amber-600"} animate-pulse`} />
              Round {currentRoundSequence} · {isReadyToStart ? "Live in Progress" : "Scheduled"}
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
              <li>Problems will unlock automatically once the round officially begins.</li>
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
              <span>Round will open at {ROUND_TIMETABLE[currentRoundSequence]?.start ?? "scheduled time"}...</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── ROUND 4 CHALLENGE SELECTION SCREEN (PICK 1 OF 3) ──
  if (currentRoundSequence === 4 && !isRound4Selected && (roundState.phase === "ACTIVE" || hasEnteredArena)) {
    return (
      <div className="min-h-screen bg-[#F8F9FD] flex flex-col font-sans relative">
        <AntiCheatShield
          roundId={roundId}
          isActive={!isRoundFinished}
        />
        <Round4ProblemSelector
          roundId={roundId}
          problems={round4Problems}
          onSelectSuccess={fetchProblems}
        />
      </div>
    );
  }

  // ── ROUND 5 CHALLENGE SELECTION SCREEN (PICK 1 OF 3) ──
  if (isRound5 && !isRound5Selected && (roundState.phase === "ACTIVE" || hasEnteredArena)) {
    return (
      <div className="min-h-screen bg-[#F8F9FD] flex flex-col font-sans relative">
        <AntiCheatShield
          roundId={roundId}
          isActive={!isRoundFinished}
        />
        <Round5ProblemSelector
          roundId={roundId}
          problems={round5Problems}
          onSelectSuccess={fetchProblems}
        />
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

      {/* Paused Notification Banner Overlay */}
      {roundState.phase === "PAUSED" && (
        <div className="bg-amber-400 text-amber-950 px-4 py-2.5 font-mono text-xs font-black uppercase tracking-wider border-b-2 border-[#1E1B4B] shadow-md flex items-center justify-center gap-3 sticky top-0 z-50 animate-pulse">
          <Clock className="w-4 h-4 text-amber-950 animate-spin" />
          <span>⏸️ ROUND TEMPORARILY PAUSED — Workspace & countdown timer are frozen. Please standby.</span>
        </div>
      )}

      {/* Top Header Bar */}
      <header className="border-b-2 border-[#1E1B4B]/10 px-4 py-3 flex items-center justify-between flex-wrap gap-4 bg-white shadow-sm sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono font-black text-white px-3 py-1.5 rounded-xl bg-[#7F45DB] border-2 border-[#1E1B4B] shadow-[2px_2px_0px_0px_#1E1B4B]">
            Round {currentRoundSequence}
          </span>
          <span className="font-extrabold text-[#0F172A] text-sm sm:text-base font-display">
            {round?.name ?? "Tournament Arena"}
          </span>
        </div>

        {/* Center Timer */}
        <div className="flex items-center gap-3 bg-[#F0F2F8] px-4 py-2 rounded-xl border-2 border-[#1E1B4B] shadow-[2px_2px_0px_0px_#1E1B4B]">
          <span className="text-xs text-[#6E6E6E] font-mono uppercase font-black">Time Remaining:</span>
          <span className={`font-mono text-base sm:text-lg font-black tabular-nums ${roundState.phase === "PAUSED" ? "text-amber-600" : timeLeft !== null && timeLeft < 300 ? "text-destructive animate-pulse" : "text-[#7F45DB]"
            }`}>
            {roundState.phase === "PAUSED" ? "⏸️ PAUSED" : timeLeft !== null ? formatTime(timeLeft) : "--:--"}
          </span>
        </div>

        {/* Right Corner Controls: Enlarged, Bold & Highlighted */}
        <div className="flex items-center gap-3 flex-wrap">
          {team && (
            <span className="text-xs text-[#0F172A] font-mono bg-[#F0F2F8] px-3 py-1.5 rounded-xl border border-[#E2E8F0] font-bold hidden md:inline">
              Team: {team.name}
            </span>
          )}

          {/* Language Selector Dropdown (Enlarged & Highlighted) */}
          <div className="flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-xl border-2 border-[#1E1B4B] shadow-[3px_3px_0px_0px_#1E1B4B]">
            <Code2 className="w-4 h-4 text-[#7F45DB]" />
            <span className="text-xs font-mono text-[#6E6E6E] uppercase font-bold">Lang:</span>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as "cpp" | "c" | "java" | "python")}
              className="bg-transparent text-[#7F45DB] font-mono font-black text-xs sm:text-sm focus:outline-none cursor-pointer uppercase"
            >
              <option value="c" className="bg-white text-[#0F172A]">C</option>
              <option value="cpp" className="bg-white text-[#0F172A]">C++</option>
              <option value="java" className="bg-white text-[#0F172A]">Java</option>
              <option value="python" className="bg-white text-[#0F172A]">Python</option>
            </select>
          </div>

          {/* AI Assistant Toggle Button (Hidden in Round 5) */}
          {!isRound5 && (
            <button
              onClick={() => setIsAIOpen((prev) => !prev)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#7F45DB] hover:bg-[#6D35C7] text-white text-xs sm:text-sm font-mono font-black border-2 border-[#1E1B4B] shadow-[3px_3px_0px_0px_#1E1B4B] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_#1E1B4B] transition-all cursor-pointer"
              title="Open AI Tutor & Code Advisor"
            >
              <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
              <span>AI Assistant</span>
            </button>
          )}

          {/* Finish Round Early Button (Enlarged & Highlighted) */}
          <button
            onClick={() => setShowEndRoundModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-mono font-black border-2 border-[#1E1B4B] shadow-[3px_3px_0px_0px_#1E1B4B] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_#1E1B4B] transition-all cursor-pointer uppercase"
            title="Conclude your attempt for this round early"
          >
            <Flag className="w-4 h-4" />
            <span>Finish Round</span>
          </button>
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
                    className={`w-8 h-8 rounded-xl font-mono text-xs font-black transition-all cursor-pointer flex items-center justify-center border-2 ${isCurrent
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
              </div>

              <div className="text-sm text-[#0F172A] leading-relaxed">
                <FormattedStatement statement={currentProblem.statement} />
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
                  <span>Choose an Option:</span>
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
                        className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${isSelected
                            ? "bg-[#7F45DB]/10 border-[#7F45DB] shadow-[3px_3px_0px_0px_#7F45DB] translate-x-0.5 translate-y-0.5"
                            : "bg-white border-[#1E1B4B] shadow-[3px_3px_0px_0px_#1E1B4B] hover:border-[#7F45DB] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_#1E1B4B]"
                          }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-xs font-mono font-black px-2.5 py-0.5 rounded-lg border ${isSelected
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

                {currentProblemIdx === problems.length - 1 ? (
                  <button
                    onClick={() => setShowEndRoundModal(true)}
                    className="px-6 py-2.5 rounded-xl bg-destructive hover:bg-destructive/90 text-white font-mono font-black text-xs uppercase tracking-wider border-2 border-[#1E1B4B] shadow-[3px_3px_0px_0px_#1E1B4B] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_#1E1B4B] flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <Flag className="w-4 h-4" />
                    <span>Submit & Finish Round</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setCurrentProblemIdx((prev) => Math.min(problems.length - 1, prev + 1))}
                    className="px-6 py-2.5 rounded-xl bg-[#7F45DB] hover:bg-[#6D35C7] text-white font-mono font-black text-xs uppercase tracking-wider border-2 border-[#1E1B4B] shadow-[3px_3px_0px_0px_#1E1B4B] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_#1E1B4B] flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <span>Next Question</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
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
          {problems.length > 1 && (
            <div className="bg-white px-5 py-3 rounded-2xl border-2 border-[#1E1B4B] shadow-[4px_4px_0px_0px_#1E1B4B] flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-black text-[#0F172A] uppercase">
                  Challenge Problems:
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  {problems.map((p, idx) => {
                    const isCurrent = idx === currentProblemIdx;
                    const isSubmitted = !!submittedProblems[p.id];
                    return (
                      <button
                        key={p.id}
                        onClick={() => setCurrentProblemIdx(idx)}
                        className={`px-3.5 py-1.5 rounded-xl font-mono text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 border-2 ${isCurrent
                            ? "bg-[#7F45DB] text-white border-[#1E1B4B] shadow-[2px_2px_0px_0px_#1E1B4B] scale-105"
                            : isSubmitted
                              ? "bg-emerald-50 text-emerald-950 border-emerald-500 hover:border-[#1E1B4B]"
                              : "bg-[#F8F9FD] text-[#0F172A] border-[#1E1B4B]/30 hover:border-[#1E1B4B]"
                          }`}
                      >
                        <span>Q{idx + 1}</span>
                        {isSubmitted && (
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
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
          )}

          {/* Main Coding Workspace Grid: Left (Problem Narrative) | Right (Monaco Editor + Console) */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-[600px]">
            {/* Left Panel: Problem Statement */}
            <div className="lg:col-span-5 bg-white rounded-3xl border-2 border-[#1E1B4B] shadow-[4px_4px_0px_0px_#1E1B4B] p-6 overflow-y-auto space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                {/* Title & Badges */}
                <div className="border-b-2 border-[#1E1B4B]/10 pb-4 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-black px-2.5 py-0.5 rounded-lg bg-[#7F45DB]/10 text-[#4A2293] border border-[#7F45DB]/30">
                      {problems.length === 1 ? "Selected Challenge" : `Problem ${currentProblemIdx + 1} of ${problems.length}`}
                    </span>
                    <span className="text-xs font-mono text-[#6E6E6E] ml-auto">
                      Time Limit: {currentProblem?.timeLimitMs ?? 1000}ms
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-[#0F172A] font-display">
                    {currentProblem?.title ?? "Problem Statement"}
                  </h2>
                </div>

                {/* Round 5 Test Suite Breakdown Matrix */}
                {isRound5 && currentProblem?.sampleCount !== undefined && (
                  <div className="p-3.5 bg-[#F0F2F8] rounded-2xl border-2 border-[#1E1B4B] space-y-2 font-mono text-xs shadow-[3px_3px_0px_0px_#1E1B4B]">
                    <div className="font-black text-[#0F172A] uppercase flex items-center justify-between text-[11px]">
                      <span className="flex items-center gap-1.5"><Terminal className="w-3.5 h-3.5 text-[#7F45DB]" /> Test Suite Distribution</span>
                      <span className="text-[#7F45DB] font-extrabold">
                        {(currentProblem.sampleCount || 0) + (currentProblem.hiddenCount || 0) + (currentProblem.edgeCount || 0)} Total Cases
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                      <div className="p-2 bg-white rounded-xl border border-[#1E1B4B]/20">
                        <div className="text-emerald-700 font-extrabold text-xs">{currentProblem.sampleCount} Cases</div>
                        <div className="text-[#6E6E6E] font-medium">Sample (Public)</div>
                      </div>
                      <div className="p-2 bg-white rounded-xl border border-[#1E1B4B]/20">
                        <div className="text-blue-700 font-extrabold text-xs">{currentProblem.hiddenCount} Cases</div>
                        <div className="text-[#6E6E6E] font-medium">Hidden Stress</div>
                      </div>
                      <div className="p-2 bg-white rounded-xl border border-[#1E1B4B]/20">
                        <div className="text-amber-700 font-extrabold text-xs">{currentProblem.edgeCount} Cases</div>
                        <div className="text-[#6E6E6E] font-medium">Adversarial Edge</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Round 5 Machine Rival Baseline Report */}
                {isRound5 && currentProblem?.aiAnalysisReport && (
                  <div className="p-3.5 bg-purple-50/90 rounded-2xl border-2 border-[#7F45DB] space-y-2 font-mono text-xs shadow-[3px_3px_0px_0px_#7F45DB]">
                    <div className="flex items-center justify-between text-[#4A2293] font-black uppercase text-[11px]">
                      <span className="flex items-center gap-1.5"><Bot className="w-4 h-4 text-[#7F45DB]" /> Machine Rival Baseline</span>
                      <span className="text-[10px] bg-[#7F45DB]/10 px-2 py-0.5 rounded-md border border-[#7F45DB]/30 font-bold">
                        {currentProblem.aiAnalysisReport.model ?? "DeepByte-AI"}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="bg-white p-2 rounded-lg border border-[#7F45DB]/20">
                        <span className="text-[#6E6E6E] text-[10px] block">Time Complexity:</span>
                        <strong className="text-[#0F172A]">{currentProblem.aiAnalysisReport.timeComplexity?.estimate ?? "O(N log N)"}</strong>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-[#7F45DB]/20">
                        <span className="text-[#6E6E6E] text-[10px] block">Edge Cases Passed:</span>
                        <strong className="text-amber-700">{currentProblem.aiAnalysisReport.edgeCasesPass?.ratio ?? "2/3"}</strong>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-[#7F45DB]/20">
                        <span className="text-[#6E6E6E] text-[10px] block">Clean Names:</span>
                        <strong className="text-emerald-700">{currentProblem.aiAnalysisReport.cleanCodeNames?.score ?? 9}/10</strong>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-[#7F45DB]/20">
                        <span className="text-[#6E6E6E] text-[10px] block">Syntax Format:</span>
                        <strong className="text-blue-700">{currentProblem.aiAnalysisReport.syntaxFormat?.score ?? 10}/10</strong>
                      </div>
                    </div>
                    <div className="text-[10px] text-[#4A2293] font-medium italic pt-0.5">
                      Target: Out-code the Machine by passing 3/3 Edge Cases with optimal clean code & complexity.
                    </div>
                  </div>
                )}

                {/* Problem Statement Narrative */}
                <div className="bg-[#F8F9FD] p-4 rounded-2xl border border-[#1E1B4B]/10">
                  <FormattedStatement statement={currentProblem?.statement} />
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
                {/* Editor Action Header - LeetCode Style */}
                <div className="p-2.5 bg-[#1E1E1E] border-b border-[#333333] flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-mono font-bold text-xs">
                      <Code2 className="w-4 h-4" />
                      <span>Code</span>
                    </div>

                    {/* Language Dropdown Selector */}
                    <select
                      value={lang}
                      onChange={(e) => handleLanguageChange(e.target.value as any)}
                      className="px-2.5 py-1 rounded-lg bg-[#2D2D2D] text-gray-200 font-mono font-bold text-xs border border-[#404040] focus:outline-none focus:border-[#7F45DB] cursor-pointer"
                    >
                      <option value="cpp">C++ (GCC 9.2)</option>
                      <option value="c">C (GCC 9.2)</option>
                      <option value="java">Java (OpenJDK 17)</option>
                      <option value="python">Python (3.10)</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleResetCode}
                      className="px-3 py-1.5 rounded-lg bg-[#2D2D2D] hover:bg-[#3D3D3D] text-gray-300 font-mono font-medium text-xs border border-[#404040] transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                      title="Reset code"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-gray-400" />
                      <span>Reset</span>
                    </button>

                    <button
                      onClick={handleRunCode}
                      disabled={isRunning || isSubmitting}
                      className="px-3.5 py-1.5 rounded-lg bg-[#2D2D2D] hover:bg-[#3D3D3D] text-white font-mono font-bold text-xs border border-[#404040] transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                    >
                      <Play className={`w-3.5 h-3.5 fill-white ${isRunning ? "animate-spin" : ""}`} />
                      <span>{isRunning ? "Running..." : "Run"}</span>
                    </button>

                    {isRound5 ? (
                      <>
                        {round5LatestReport && (
                          <button
                            onClick={() => setShowAnalysisModal(true)}
                            className="px-3.5 py-1.5 rounded-lg bg-[#7F45DB]/20 hover:bg-[#7F45DB]/30 text-[#A472F7] font-mono font-bold text-xs border border-[#7F45DB]/50 transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <Zap className="w-3.5 h-3.5 text-amber-300" />
                            <span>View Report</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleRound5Analysis(false)}
                          disabled={isAnalyzingR5 || isRunning || round5RunsRemaining <= 0 || isRound5Locked}
                          className="px-3.5 py-1.5 rounded-lg bg-[#7F45DB] hover:bg-[#6D35C7] text-white font-mono font-bold text-xs border border-[#1E1B4B] transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                          title="Evaluate code against all test cases and receive 7-dimension quality report"
                        >
                          <Bot className={`w-3.5 h-3.5 ${isAnalyzingR5 ? "animate-spin" : ""}`} />
                          <span>{isAnalyzingR5 ? "Analyzing..." : `Run Analysis (${round5RunsRemaining}/10)`}</span>
                        </button>

                        {isRound5Locked ? (
                          <div className="px-3.5 py-1.5 rounded-lg bg-emerald-700 text-white font-mono font-bold text-xs flex items-center gap-1.5 shadow-sm">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Locked & Evaluated</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => setShowLockConfirmModal(true)}
                            disabled={isAnalyzingR5 || isRunning}
                            className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-mono font-black text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-md disabled:opacity-40"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Final Lock & Submit</span>
                          </button>
                        )}
                      </>
                    ) : (
                      submittedProblems[currentProblem?.id] ? (
                        <div className="px-3.5 py-1.5 rounded-lg bg-emerald-700 text-white font-mono font-bold text-xs flex items-center gap-1.5 shadow-sm">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Submitted & Locked</span>
                        </div>
                      ) : (
                        <button
                          onClick={handleSubmitCode}
                          disabled={isRunning || isSubmitting}
                          className="px-4 py-1.5 rounded-lg bg-[#2cbb5d] hover:bg-[#269f4f] text-white font-mono font-black text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-md disabled:opacity-40"
                        >
                          <Rocket className={`w-3.5 h-3.5 ${isSubmitting ? "animate-spin" : ""}`} />
                          <span>{isSubmitting ? "Judging..." : "Submit"}</span>
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Monaco Editor Container - Dark Mode */}
                <div className="flex-1 min-h-[360px] bg-[#1e1e1e]">
                  <MonacoEditor
                    height="100%"
                    language={lang === "c" ? "c" : lang === "cpp" ? "cpp" : lang === "java" ? "java" : "python"}
                    theme="vs-dark"
                    value={code}
                    onChange={handleCodeChange}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 13.5,
                      lineNumbers: "on",
                      roundedSelection: false,
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      tabSize: 4,
                      wordWrap: "on",
                      padding: { top: 12, bottom: 12 },
                    }}
                  />
                </div>
              </div>

              {/* Bottom Console Drawer - LeetCode Style */}
              <div className="bg-[#1E1E1E] rounded-2xl border-2 border-[#1E1B4B] shadow-[4px_4px_0px_0px_#1E1B4B] overflow-hidden flex flex-col">
                {/* Console Tabs */}
                <div className="px-3 py-2 bg-[#252526] border-b border-[#333333] flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setActiveConsoleTab("input")}
                      className={`px-3 py-1 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer ${activeConsoleTab === "input"
                          ? "bg-[#333333] text-emerald-400 shadow-sm"
                          : "text-gray-400 hover:text-gray-200"
                        }`}
                    >
                      Testcase (Input)
                    </button>
                    <button
                      onClick={() => setActiveConsoleTab("output")}
                      className={`px-3 py-1 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer ${activeConsoleTab === "output"
                          ? "bg-[#333333] text-emerald-400 shadow-sm"
                          : "text-gray-400 hover:text-gray-200"
                        }`}
                    >
                      Test Result
                    </button>
                    <button
                      onClick={() => setActiveConsoleTab("verdict")}
                      className={`px-3 py-1 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer ${activeConsoleTab === "verdict"
                          ? "bg-[#333333] text-emerald-400 shadow-sm"
                          : "text-gray-400 hover:text-gray-200"
                        }`}
                    >
                      Test Cases
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
                        <div className="text-white/40">Click &apos;Run&apos; to test your solution against standard input.</div>
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
                      {isSubmitting && <div className="text-amber-300">⏳ Running test cases against your solution...</div>}
                      {!isSubmitting && (submissionResult || submittedProblems[currentProblem?.id]) && (
                        <div className="space-y-2">
                          <div className="text-sm font-black flex items-center gap-2 text-emerald-400">
                            <CheckCircle className="w-5 h-5 text-emerald-400" />
                            <span>Test cases have been run successfully against our solution.</span>
                          </div>
                          <p className="text-xs text-white/70">
                            Your solution has been securely registered and locked for post-round evaluation.
                          </p>
                          {submissionResult?.compile_output && (
                            <div className="pt-1">
                              <div className="text-[10px] text-amber-400 font-bold uppercase">Compiler Output:</div>
                              <pre className="text-amber-300 whitespace-pre-wrap">{submissionResult.compile_output}</pre>
                            </div>
                          )}
                          {submissionResult?.stderr && (
                            <div className="pt-1">
                              <div className="text-[10px] text-red-400 font-bold uppercase">Runtime Notice:</div>
                              <pre className="text-red-300 whitespace-pre-wrap">{submissionResult.stderr}</pre>
                            </div>
                          )}
                        </div>
                      )}
                      {!isSubmitting && !submissionResult && !submittedProblems[currentProblem?.id] && (
                        <div className="text-white/40">Click &apos;Submit Solution&apos; to evaluate against all test cases.</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dedicated AI Assistant Drawer (Suppressed in Round 5) */}
      {!isRound5 && (
        <AIAssistantDrawer
          roundId={roundId}
          problemId={currentProblem?.id ?? null}
          isOpen={isAIOpen}
          onClose={() => setIsAIOpen(false)}
        />
      )}

      {/* Round 5 7-Dimension Code Analysis Report Modal */}
      {isRound5 && (
        <Round5AnalysisModal
          isOpen={showAnalysisModal}
          onClose={() => setShowAnalysisModal(false)}
          report={round5LatestReport}
          machineReport={currentProblem?.aiAnalysisReport}
          runsRemaining={round5RunsRemaining}
          isLocked={isRound5Locked}
        />
      )}

      {/* Round 5 Final Lock Confirmation Modal */}
      {showLockConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in zoom-in-95">
          <div className="max-w-md w-full bg-white border-4 border-[#1E1B4B] rounded-3xl p-6 sm:p-8 shadow-[8px_8px_0px_0px_#1E1B4B] space-y-5 text-center font-sans">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 border-2 border-rose-600 mx-auto flex items-center justify-center text-rose-600 shadow-[3px_3px_0px_0px_#E11D48]">
              <ShieldAlert className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h3 className="font-display font-black text-2xl text-[#0F172A] tracking-tight uppercase">
                Lock Final Solution?
              </h3>
              <p className="text-xs text-[#6E6E6E] font-mono leading-relaxed">
                Once locked, your solution is permanently scored for Round 5. You will not be able to edit code or run further analyses.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowLockConfirmModal(false)}
                className="flex-1 py-3 rounded-xl bg-[#F0F2F8] hover:bg-[#E2E8F0] text-[#0F172A] font-mono font-bold text-xs border-2 border-[#1E1B4B] transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRound5Analysis(true)}
                disabled={isAnalyzingR5}
                className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-mono font-black text-xs uppercase tracking-wider border-2 border-[#1E1B4B] shadow-[3px_3px_0px_0px_#1E1B4B] hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer"
              >
                {isAnalyzingR5 ? "Locking..." : "Yes, Lock & Submit"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── End Round Early Confirmation Modal ── */}
      {showEndRoundModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in zoom-in-95">
          <div className="max-w-md w-full bg-white border-2 border-[#1E1B4B] rounded-3xl p-6 sm:p-8 shadow-[8px_8px_0px_0px_#1E1B4B] space-y-5 text-center">
            <div className="w-14 h-14 rounded-2xl bg-destructive/10 border-2 border-destructive mx-auto flex items-center justify-center text-destructive shadow-[3px_3px_0px_0px_#EF4444]">
              <Flag className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-destructive/10 text-destructive border border-destructive text-[11px] font-mono font-black uppercase tracking-wider">
                <AlertCircle className="w-3.5 h-3.5" /> Early Finalization
              </div>
              <h3 className="font-display font-black text-2xl text-[#0F172A] tracking-tight uppercase">
                Finish Round {currentRoundSequence}?
              </h3>
              <p className="text-xs text-[#6E6E6E] font-medium leading-relaxed">
                Are you sure you want to conclude your attempt for this round? All your current answers and code submissions will be scored, and you will enter the intermission period.
              </p>
            </div>

            <div className="bg-[#F8F9FD] border-2 border-[#1E1B4B] rounded-2xl p-4 text-left text-xs font-mono space-y-1.5 shadow-[2px_2px_0px_0px_#1E1B4B]">
              <div className="font-extrabold text-[#0F172A] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#7F45DB]" /> Round Summary:
              </div>
              {isMCQ ? (
                <div className="text-[#6E6E6E]">
                  • Questions Answered: <strong className="text-[#7F45DB]">{Object.keys(answersMap).length} of {problems.length}</strong>
                </div>
              ) : (
                <div className="text-[#6E6E6E]">
                  • Challenge Problems in Arena: <strong className="text-[#7F45DB]">{problems.length}</strong>
                </div>
              )}
              <div className="text-[#6E6E6E]">• You will transition into the intermission screen until the next scheduled round begins.</div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowEndRoundModal(false)}
                className="w-full py-3.5 rounded-xl bg-white hover:bg-[#F0F2F8] text-[#0F172A] font-mono font-bold text-xs border-2 border-[#1E1B4B] shadow-[2px_2px_0px_0px_#1E1B4B] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_#1E1B4B] cursor-pointer transition-all uppercase"
              >
                Keep Working
              </button>
              <button
                type="button"
                onClick={handleConfirmEndRound}
                className="w-full py-3.5 rounded-xl bg-destructive hover:bg-destructive/90 text-white font-mono font-black text-xs uppercase tracking-wider border-2 border-[#1E1B4B] shadow-[3px_3px_0px_0px_#1E1B4B] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_#1E1B4B] cursor-pointer transition-all flex items-center justify-center gap-1.5"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Yes, Finish Round</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
