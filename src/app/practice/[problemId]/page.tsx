"use client";

import { useEffect, useState, use } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  Play,
  Send,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  Terminal,
  FileCode,
  History,
  MessageSquare,
  ArrowLeft,
  Copy,
  Check,
  Zap,
} from "lucide-react";
import { FormattedStatement } from "@/components/problem/formatted-statement";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

const LANG_DEFAULTS: Record<string, string> = {
  cpp: `#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    // Write your C++ solution here\n    return 0;\n}`,
  c: `#include <stdio.h>\n\nint main() {\n    // Write your C solution here\n    return 0;\n}`,
  java: `import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        // Write your Java solution here\n    }\n}`,
  python: `import sys\n\ndef main():\n    # Write your Python solution here\n    pass\n\nif __name__ == "__main__":\n    main()`,
};

interface ProblemData {
  id: string;
  title: string;
  statement: string;
  inputFormat?: string;
  outputFormat?: string;
  constraints?: string;
  sampleInput?: string;
  sampleOutput?: string;
  difficulty?: string;
  tags: string[];
  timeLimitMs: number;
  memoryLimitMb: number;
  allowedLangs: string[];
  starterCodes?: Record<string, string>;
  sampleTestCases: { id: string; input: string; expected: string; sequence: number }[];
  totalTestCasesCount: number;
  isSolved: boolean;
  userSubmissions: any[];
}

export default function PracticeWorkspacePage({
  params,
}: {
  params: Promise<{ problemId: string }>;
}) {
  const { problemId } = use(params);

  const [problem, setProblem] = useState<ProblemData | null>(null);
  const [loading, setLoading] = useState(true);

  // Left pane active tab
  const [leftTab, setLeftTab] = useState<"statement" | "submissions">("statement");

  // Code editor state
  const [lang, setLang] = useState<"cpp" | "c" | "java" | "python">("cpp");
  const [code, setCode] = useState<string>(LANG_DEFAULTS.cpp);
  const [codeMap, setCodeMap] = useState<Record<string, string>>({});

  // Terminal & Execution state
  const [customInput, setCustomInput] = useState("");
  const [activeConsoleTab, setActiveConsoleTab] = useState<"input" | "output" | "verdict">("output");
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    testCasesPassed?: number;
    totalTestCases?: number;
    message?: string;
    compile_output?: string;
    stderr?: string;
    stdout?: string;
    executionTimeMs?: number;
    memoryUsedMb?: number;
    error?: string;
  } | null>(null);

  const [submissionsList, setSubmissionsList] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);

  // Load problem data
  useEffect(() => {
    async function loadProblem() {
      try {
        const res = await fetch(`/api/problems/${problemId}`);
        if (res.ok) {
          const data = await res.json();
          setProblem(data);
          setSubmissionsList(data.userSubmissions || []);
          if (data.sampleInput) setCustomInput(data.sampleInput);

          // Setup initial starter code
          const initialLang = "cpp";
          const starter = data.starterCodes?.[initialLang] || LANG_DEFAULTS[initialLang];
          setCode(starter);
          setCodeMap({ [initialLang]: starter });
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    loadProblem();
  }, [problemId]);

  // Handle language switch
  const handleLangChange = (newLang: "cpp" | "c" | "java" | "python") => {
    setLang(newLang);
    if (codeMap[newLang]) {
      setCode(codeMap[newLang]);
    } else {
      const starter = problem?.starterCodes?.[newLang] || LANG_DEFAULTS[newLang];
      setCode(starter);
      setCodeMap((prev) => ({ ...prev, [newLang]: starter }));
    }
  };

  const handleCodeChange = (newVal: string | undefined) => {
    const val = newVal ?? "";
    setCode(val);
    setCodeMap((prev) => ({ ...prev, [lang]: val }));
  };

  const handleResetCode = () => {
    const starter = problem?.starterCodes?.[lang] || LANG_DEFAULTS[lang];
    setCode(starter);
    setCodeMap((prev) => ({ ...prev, [lang]: starter }));
  };

  // Run code with custom input
  const handleRunCode = async () => {
    setIsRunning(true);
    setActiveConsoleTab("output");
    setRunResult(null);

    try {
      const res = await fetch("/api/submissions/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemId,
          language: lang,
          sourceCode: code,
          customInput,
        }),
      });
      const data = await res.json();
      setRunResult(data);
    } catch (err: any) {
      setRunResult({ error: err.message || "Run failed", status: "ERROR" });
    } finally {
      setIsRunning(false);
    }
  };

  // Submit code solution
  const handleSubmitCode = async () => {
    setIsSubmitting(true);
    setActiveConsoleTab("verdict");
    setSubmissionResult(null);

    try {
      const idempotencyKey =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `sub-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemId,
          language: lang,
          sourceCode: code,
          idempotencyKey,
        }),
      });

      const data = await res.json();
      setSubmissionResult(data);

      if (res.ok) {
        // Add to submission history list
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
      setSubmissionResult({ error: err.message || "Submission failed", status: "ERROR" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F8F9FD] flex items-center justify-center font-mono text-sm text-[#6E6E6E]">
        Loading problem workspace...
      </main>
    );
  }

  if (!problem) {
    return (
      <main className="min-h-screen bg-[#F8F9FD] flex flex-col items-center justify-center p-6 space-y-4">
        <h1 className="text-2xl font-black text-[#0F172A]">Problem Not Found</h1>
        <Link href="/practice" className="px-5 py-2.5 rounded-xl bg-[#7F45DB] text-white font-mono font-bold text-xs uppercase">
          Back to Practice Library
        </Link>
      </main>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-[#F8F9FD] text-[#0F172A] overflow-hidden font-sans">
      {/* Top Header Bar */}
      <div className="h-12 bg-white border-b-2 border-[#1E1B4B] px-4 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-3">
          <Link
            href="/practice"
            className="p-1.5 rounded-lg border border-[#1E1B4B]/20 text-[#6E6E6E] hover:text-[#0F172A] hover:bg-[#F0F2F8] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="font-mono font-black text-sm text-[#0F172A] max-w-xs sm:max-w-md truncate">
              {problem.title}
            </h1>
            <span
              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${
                problem.difficulty === "Easy"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                  : problem.difficulty === "Hard"
                  ? "bg-rose-50 text-rose-700 border-rose-300"
                  : "bg-amber-50 text-amber-700 border-amber-300"
              }`}
            >
              {problem.difficulty}
            </span>
            {problem.isSolved && (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Solved
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Discussion Link */}
          <Link
            href={`/discussion?problemId=${problem.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#1E1B4B]/20 text-xs font-mono font-bold text-[#6E6E6E] hover:text-[#0F172A] hover:bg-[#F0F2F8] transition-all"
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#7F45DB]" />
            <span className="hidden sm:inline">Discuss Solution</span>
          </Link>

          {/* Run Code Button */}
          <button
            onClick={handleRunCode}
            disabled={isRunning}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border-2 border-[#1E1B4B] bg-white text-[#0F172A] font-mono font-bold text-xs uppercase shadow-[2px_2px_0px_0px_#1E1B4B] hover:bg-[#F0F2F8] disabled:opacity-50 transition-all"
          >
            <Play className="w-3.5 h-3.5 text-[#7F45DB] fill-[#7F45DB]" />
            <span>{isRunning ? "Running..." : "Run"}</span>
          </button>

          {/* Submit Solution Button */}
          <button
            onClick={handleSubmitCode}
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl border-2 border-[#1E1B4B] bg-[#7F45DB] text-white font-mono font-black text-xs uppercase tracking-wider shadow-[2px_2px_0px_0px_#1E1B4B] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none disabled:opacity-50 transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSubmitting ? "Judging..." : "Submit"}</span>
          </button>
        </div>
      </div>

      {/* Main Split Body: Left Pane (Statement/History) | Right Pane (Editor/Terminal) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
        {/* LEFT PANE */}
        <div className="h-full border-r-2 border-[#1E1B4B] bg-white flex flex-col overflow-hidden">
          {/* Left Tabs */}
          <div className="h-10 border-b-2 border-[#1E1B4B]/10 px-4 flex items-center gap-3 shrink-0 bg-[#F8F9FD]">
            <button
              onClick={() => setLeftTab("statement")}
              className={`text-xs font-mono font-bold flex items-center gap-1.5 py-2 border-b-2 transition-all ${
                leftTab === "statement"
                  ? "text-[#7F45DB] border-[#7F45DB] font-black"
                  : "text-[#6E6E6E] border-transparent hover:text-[#0F172A]"
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Description</span>
            </button>

            <button
              onClick={() => setLeftTab("submissions")}
              className={`text-xs font-mono font-bold flex items-center gap-1.5 py-2 border-b-2 transition-all ${
                leftTab === "submissions"
                  ? "text-[#7F45DB] border-[#7F45DB] font-black"
                  : "text-[#6E6E6E] border-transparent hover:text-[#0F172A]"
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Submissions ({submissionsList.length})</span>
            </button>
          </div>

          {/* Left Content Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {leftTab === "statement" ? (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-display font-black text-[#0F172A]">
                    {problem.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {problem.tags.map((t) => (
                      <span
                        key={t}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F8F9FD] text-[#6E6E6E] border border-[#1E1B4B]/20"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Formatted Problem Statement */}
                <div className="prose prose-sm max-w-none text-[#0F172A] font-sans leading-relaxed">
                  <FormattedStatement statement={problem.statement} />
                </div>

                {/* Input / Output Format */}
                {problem.inputFormat && (
                  <div className="space-y-1">
                    <h3 className="text-xs font-mono uppercase font-black text-[#6E6E6E]">Input Format</h3>
                    <div className="p-3 rounded-xl bg-[#F8F9FD] border border-[#1E1B4B]/20 text-xs font-mono whitespace-pre-wrap">
                      {problem.inputFormat}
                    </div>
                  </div>
                )}

                {problem.outputFormat && (
                  <div className="space-y-1">
                    <h3 className="text-xs font-mono uppercase font-black text-[#6E6E6E]">Output Format</h3>
                    <div className="p-3 rounded-xl bg-[#F8F9FD] border border-[#1E1B4B]/20 text-xs font-mono whitespace-pre-wrap">
                      {problem.outputFormat}
                    </div>
                  </div>
                )}

                {/* Constraints */}
                {problem.constraints && (
                  <div className="space-y-1">
                    <h3 className="text-xs font-mono uppercase font-black text-[#6E6E6E]">Constraints</h3>
                    <div className="p-3 rounded-xl bg-[#F8F9FD] border border-[#1E1B4B]/20 text-xs font-mono whitespace-pre-wrap">
                      {problem.constraints}
                    </div>
                  </div>
                )}

                {/* Examples */}
                {problem.sampleInput && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-mono uppercase font-black text-[#6E6E6E]">Sample Case 1</h3>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(problem.sampleInput || "");
                          setCopied(true);
                          setTimeout(() => setCopied(false), 1500);
                        }}
                        className="inline-flex items-center gap-1 text-[10px] font-mono text-[#7F45DB] hover:underline"
                      >
                        {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copied ? "Copied" : "Copy Input"}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <span className="text-[10px] font-mono text-[#6E6E6E] block mb-1">Input</span>
                        <pre className="p-3 rounded-xl bg-[#F8F9FD] border border-[#1E1B4B]/20 text-xs font-mono overflow-x-auto">
                          {problem.sampleInput}
                        </pre>
                      </div>
                      {problem.sampleOutput && (
                        <div>
                          <span className="text-[10px] font-mono text-[#6E6E6E] block mb-1">Output</span>
                          <pre className="p-3 rounded-xl bg-[#F8F9FD] border border-[#1E1B4B]/20 text-xs font-mono overflow-x-auto">
                            {problem.sampleOutput}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Submissions History Tab */
              <div className="space-y-4">
                <h3 className="text-sm font-mono font-bold text-[#0F172A]">
                  Your Submission History
                </h3>
                {submissionsList.length > 0 ? (
                  <div className="space-y-3">
                    {submissionsList.map((sub, idx) => (
                      <div
                        key={sub.id || idx}
                        className="p-4 rounded-xl bg-[#F8F9FD] border border-[#1E1B4B]/20 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                              sub.status === "ACCEPTED"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            {sub.status === "ACCEPTED" ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <XCircle className="w-3.5 h-3.5 text-rose-600" />
                            )}
                            <span>{sub.status.replace(/_/g, " ")}</span>
                          </span>

                          <span className="text-[11px] font-mono text-[#6E6E6E]">
                            {new Date(sub.submittedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs font-mono text-[#6E6E6E]">
                          <span className="uppercase font-bold text-[#0F172A]">{sub.language}</span>
                          <div className="flex items-center gap-3">
                            {sub.executionTimeMs !== undefined && (
                              <span>{sub.executionTimeMs} ms</span>
                            )}
                            {sub.memoryUsedMb !== undefined && (
                              <span>{sub.memoryUsedMb} MB</span>
                            )}
                          </div>
                        </div>

                        {sub.sourceCode && (
                          <button
                            onClick={() => setCode(sub.sourceCode)}
                            className="text-[10px] font-mono font-bold text-[#7F45DB] hover:underline"
                          >
                            Load this code into editor
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center text-xs font-mono text-[#6E6E6E]">
                    You haven&apos;t submitted any solutions for this problem yet.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANE: Monaco Editor + Console */}
        <div className="h-full flex flex-col overflow-hidden bg-[#1E1E1E]">
          {/* Editor Header: Language selector + reset */}
          <div className="h-10 bg-[#252526] border-b border-[#333333] px-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-[#CCCCCC]">Language:</span>
              <select
                value={lang}
                onChange={(e) => handleLangChange(e.target.value as any)}
                className="bg-[#1E1E1E] text-white border border-[#444444] rounded px-2.5 py-1 text-xs font-mono focus:outline-none focus:border-[#7F45DB]"
              >
                <option value="cpp">C++ (GCC 9.2)</option>
                <option value="c">C (GCC 9.2)</option>
                <option value="java">Java (OpenJDK 13)</option>
                <option value="python">Python 3 (3.8.1)</option>
              </select>
            </div>

            <button
              onClick={handleResetCode}
              title="Reset code template"
              className="p-1 rounded text-[#888888] hover:text-white hover:bg-[#333333] transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Monaco Editor Component */}
          <div className="flex-1 relative overflow-hidden">
            <MonacoEditor
              height="100%"
              language={lang === "c" || lang === "cpp" ? "cpp" : lang === "python" ? "python" : "java"}
              theme="vs-dark"
              value={code}
              onChange={handleCodeChange}
              options={{
                fontSize: 13,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbers: "on",
                automaticLayout: true,
                tabSize: 4,
              }}
            />
          </div>

          {/* Bottom Terminal Console (Height 200px) */}
          <div className="h-52 bg-[#181818] border-t border-[#333333] flex flex-col shrink-0">
            {/* Console Tab Header */}
            <div className="h-8 bg-[#222222] px-3 flex items-center justify-between border-b border-[#333333]">
              <div className="flex items-center gap-4 text-xs font-mono">
                <button
                  onClick={() => setActiveConsoleTab("output")}
                  className={`py-1 flex items-center gap-1.5 transition-colors ${
                    activeConsoleTab === "output" ? "text-white font-bold border-b border-[#7F45DB]" : "text-[#888888] hover:text-white"
                  }`}
                >
                  <Terminal className="w-3 h-3" />
                  <span>Output</span>
                </button>

                <button
                  onClick={() => setActiveConsoleTab("verdict")}
                  className={`py-1 flex items-center gap-1.5 transition-colors ${
                    activeConsoleTab === "verdict" ? "text-white font-bold border-b border-[#7F45DB]" : "text-[#888888] hover:text-white"
                  }`}
                >
                  <Zap className="w-3 h-3" />
                  <span>Verdict</span>
                </button>

                <button
                  onClick={() => setActiveConsoleTab("input")}
                  className={`py-1 flex items-center gap-1.5 transition-colors ${
                    activeConsoleTab === "input" ? "text-white font-bold border-b border-[#7F45DB]" : "text-[#888888] hover:text-white"
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
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-[#888888]">Status:</span>
                      <span className="text-emerald-400 font-bold">{runResult.status || "OK"}</span>
                      {runResult.time && <span className="text-[10px] text-[#888888]">({runResult.time}s)</span>}
                    </div>

                    {runResult.stdout && (
                      <div>
                        <span className="text-[10px] text-[#888888] block">Standard Output:</span>
                        <pre className="p-2 rounded bg-[#0A0A0A] text-emerald-300 overflow-x-auto whitespace-pre-wrap">
                          {runResult.stdout}
                        </pre>
                      </div>
                    )}

                    {runResult.stderr && (
                      <div>
                        <span className="text-[10px] text-rose-400 block">Stderr:</span>
                        <pre className="p-2 rounded bg-[#0A0A0A] text-rose-300 overflow-x-auto whitespace-pre-wrap">
                          {runResult.stderr}
                        </pre>
                      </div>
                    )}

                    {runResult.compile_output && (
                      <div>
                        <span className="text-[10px] text-amber-400 block">Compilation Output:</span>
                        <pre className="p-2 rounded bg-[#0A0A0A] text-amber-300 overflow-x-auto whitespace-pre-wrap">
                          {runResult.compile_output}
                        </pre>
                      </div>
                    )}

                    {runResult.error && (
                      <div className="text-rose-400">{runResult.error}</div>
                    )}
                  </div>
                ) : (
                  <div className="text-[#666666] py-6 text-center">
                    Click &quot;Run&quot; to execute your code with test input.
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
                            ? "bg-emerald-900/60 text-emerald-300 border border-emerald-500"
                            : "bg-rose-900/60 text-rose-300 border border-rose-500"
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
                        <span className="text-xs font-mono text-[#AAAAAA]">
                          {submissionResult.testCasesPassed} / {submissionResult.totalTestCases} test cases passed
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-[#DDDDDD]">{submissionResult.message}</p>

                    <div className="flex items-center gap-4 text-[11px] text-[#888888] pt-1">
                      {submissionResult.executionTimeMs !== undefined && (
                        <span>Runtime: <strong className="text-white">{submissionResult.executionTimeMs} ms</strong></span>
                      )}
                      {submissionResult.memoryUsedMb !== undefined && (
                        <span>Memory: <strong className="text-white">{submissionResult.memoryUsedMb} MB</strong></span>
                      )}
                    </div>

                    {submissionResult.compile_output && (
                      <div className="pt-2">
                        <span className="text-[10px] text-amber-400 block">Compile Error:</span>
                        <pre className="p-2 rounded bg-[#0A0A0A] text-amber-300 overflow-x-auto text-[11px]">
                          {submissionResult.compile_output}
                        </pre>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-[#666666] py-6 text-center">
                    Click &quot;Submit&quot; to evaluate your solution against all strict hidden test cases.
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
