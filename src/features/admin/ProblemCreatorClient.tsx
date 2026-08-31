"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Trash2, Code2, Layers, ArrowLeft, CheckCircle2, HelpCircle } from "lucide-react";

interface TestCase {
  id?: string;
  input: string;
  expected: string;
  isHidden: boolean;
  score: number;
}

interface Problem {
  id: string;
  roundId: string;
  title: string;
  statement: string;
  constraints?: string | null;
  sampleInput?: string | null;
  sampleOutput?: string | null;
  inputFormat?: string | null;
  outputFormat?: string | null;
  set: string;
  sequence: number;
  starterCodes?: Record<string, string> | null;
  options?: Record<string, Record<string, string>> | null;
  correctOption?: string | null;
  testCases: TestCase[];
}

interface Round {
  id: string;
  name: string;
  type: string;
  sequence: number;
  durationMin: number;
}

export default function ProblemCreatorClient({ roundId }: { roundId: string }) {
  const [round, setRound] = useState<Round | null>(null);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSet, setFilterSet] = useState<"ALL" | "A" | "B">("ALL");
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [targetSet, setTargetSet] = useState<"A" | "B">("A");
  const [activeLang, setActiveLang] = useState<"cpp" | "c" | "java" | "python">("cpp");
  const [title, setTitle] = useState("");
  const [statement, setStatement] = useState("");
  const [constraints, setConstraints] = useState("");
  const [sampleInput, setSampleInput] = useState("");
  const [sampleOutput, setSampleOutput] = useState("");
  const [correctOption, setCorrectOption] = useState("A");

  // Multi-Language Starter Codes
  const [starterCodes, setStarterCodes] = useState<Record<string, string>>({
    cpp: "#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write solution here\n    return 0;\n}",
    c: "#include <stdio.h>\n\nint main() {\n    // Write solution here\n    return 0;\n}",
    java: "import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        // Write solution here\n    }\n}",
    python: "def main():\n    # Write solution here\n    pass\n\nif __name__ == '__main__':\n    main()",
  });

  // Multi-Language MCQ Options (Round 1)
  const [mcqOptions, setMcqOptions] = useState<Record<string, Record<string, string>>>({
    cpp: { A: "", B: "", C: "", D: "" },
    c: { A: "", B: "", C: "", D: "" },
    java: { A: "", B: "", C: "", D: "" },
    python: { A: "", B: "", C: "", D: "" },
  });

  // Test Cases
  const [testCases, setTestCases] = useState<TestCase[]>([
    { input: "", expected: "", isHidden: false, score: 10 },
  ]);

  const [saving, setSaving] = useState(false);

  const fetchProblems = async () => {
    try {
      const [rRes, pRes] = await Promise.all([
        fetch("/api/admin/rounds"),
        fetch(`/api/admin/rounds/${roundId}/problems`),
      ]);

      if (rRes.ok) {
        const roundsData = await rRes.json();
        const found = Array.isArray(roundsData) ? roundsData.find((r: Round) => r.id === roundId) : null;
        if (found) setRound(found);
      }

      if (pRes.ok) {
        const pData = await pRes.json();
        setProblems(Array.isArray(pData) ? pData : []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, [roundId]);

  const handleAddTestCase = () => {
    setTestCases((prev) => [
      ...prev,
      { input: "", expected: "", isHidden: prev.length >= 2, score: 10 },
    ]);
  };

  const handleRemoveTestCase = (index: number) => {
    setTestCases((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveProblem = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const isMCQ = round?.type === "CODE_LOGIC";

    const payload = {
      title,
      statement,
      constraints,
      sampleInput,
      sampleOutput,
      set: targetSet,
      starterCodes: isMCQ ? null : starterCodes,
      options: isMCQ ? mcqOptions : null,
      correctOption: isMCQ ? correctOption : null,
      allowedLangs: ["cpp", "c", "java", "python"],
      testCases: isMCQ ? [] : testCases.filter((tc) => tc.input || tc.expected),
    };

    try {
      const res = await fetch(`/api/admin/rounds/${roundId}/problems`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowModal(false);
        // Reset form
        setTitle("");
        setStatement("");
        setConstraints("");
        setSampleInput("");
        setSampleOutput("");
        setTestCases([{ input: "", expected: "", isHidden: false, score: 10 }]);
        fetchProblems();
      }
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProblem = async (id: string) => {
    if (!confirm("Are you sure you want to delete this problem?")) return;
    await fetch(`/api/admin/problems/${id}`, { method: "DELETE" });
    fetchProblems();
  };

  const filteredProblems = problems.filter((p) => {
    if (filterSet === "ALL") return true;
    return p.set === filterSet;
  });

  const isMCQ = round?.type === "CODE_LOGIC";

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 font-sans">
      {/* Header Navigation */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/rounds"
            className="p-2.5 rounded-xl bg-white border-2 border-[#1E1B4B] shadow-[3px_3px_0px_0px_#1E1B4B] hover:translate-x-0.5 hover:translate-y-0.5 text-[#0F172A] transition-all"
            title="Back to Round Control"
          >
            <ArrowLeft className="w-4 h-4 text-[#7F45DB]" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-black text-white px-2.5 py-0.5 rounded-lg bg-[#7F45DB] border border-[#1E1B4B]">
                Round {round?.sequence ?? "•"}
              </span>
              <h1 className="text-2xl font-extrabold text-[#0F172A] uppercase font-display tracking-tight">
                {round?.name ?? "Question Manager"}
              </h1>
            </div>
            <p className="text-xs text-[#6E6E6E] mt-0.5 font-mono">
              Manage parallel Set A & Set B challenges and 4-language starter codes
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Set Filter Tabs */}
          <div className="flex items-center bg-[#F0F2F8] p-1 rounded-xl border-2 border-[#1E1B4B] text-xs font-mono font-bold shadow-[3px_3px_0px_0px_#1E1B4B]">
            {(["ALL", "A", "B"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilterSet(s)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  filterSet === s
                    ? "bg-[#7F45DB] text-white shadow-sm"
                    : "text-[#6E6E6E] hover:text-[#0F172A]"
                }`}
              >
                {s === "ALL" ? "All Sets" : `Set ${s}`}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="px-5 py-2.5 rounded-xl bg-[#7F45DB] hover:bg-[#6D35C7] text-white font-mono font-black text-xs uppercase tracking-wider border-2 border-[#1E1B4B] shadow-[3px_3px_0px_0px_#1E1B4B] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_#1E1B4B] transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Problem</span>
          </button>
        </div>
      </div>

      {/* Problems Roster */}
      {loading ? (
        <div className="text-xs text-[#6E6E6E] font-mono">Loading questions...</div>
      ) : filteredProblems.length === 0 ? (
        <div className="bg-white p-12 text-center border-2 border-dashed border-[#1E1B4B]/30 rounded-2xl shadow-[4px_4px_0px_0px_#1E1B4B] space-y-3">
          <Layers className="w-10 h-10 text-[#7F45DB] mx-auto opacity-60" />
          <h3 className="text-lg font-bold text-[#0F172A] uppercase font-display">No Questions Created Yet</h3>
          <p className="text-xs text-[#6E6E6E] max-w-md mx-auto font-mono">
            Click &quot;+ Create Problem&quot; to author questions for Set A and Set B in C++, C, Java, and Python.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProblems.map((p) => (
            <div key={p.id} className="bg-white p-6 rounded-2xl border-2 border-[#1E1B4B] shadow-[4px_4px_0px_0px_#1E1B4B] space-y-3 relative">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-black px-2.5 py-0.5 rounded-lg bg-[#7F45DB]/10 text-[#4A2293] border border-[#7F45DB]/30">
                      SET {p.set}
                    </span>
                    <span className="text-[11px] font-mono font-bold text-[#6E6E6E]">
                      Problem #{p.sequence}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[#0F172A] font-display">{p.title}</h3>
                </div>

                <button
                  onClick={() => handleDeleteProblem(p.id)}
                  className="p-2 rounded-xl text-[#6E6E6E] hover:text-destructive hover:bg-destructive/10 border border-transparent hover:border-destructive/30 transition-all cursor-pointer"
                  title="Delete Problem"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-[#6E6E6E] line-clamp-2 leading-relaxed font-sans">
                {p.statement}
              </p>

              <div className="flex items-center justify-between pt-3 border-t-2 border-[#1E1B4B]/10 text-[11px] font-mono text-[#6E6E6E]">
                <span className="font-bold">
                  {isMCQ ? `Correct: Option ${p.correctOption ?? "A"}` : `Test Cases: ${p.testCases.length}`}
                </span>
                <span className="text-[#7F45DB] font-bold">
                  C++, C, Java, Python
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Creation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border-2 border-[#1E1B4B] rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col my-auto shadow-[8px_8px_0px_0px_#1E1B4B]">
            {/* Modal Header */}
            <div className="p-5 border-b-2 border-[#1E1B4B] flex items-center justify-between bg-[#F0F2F8]">
              <div>
                <h2 className="text-lg font-extrabold text-[#0F172A] uppercase font-display">
                  Create Question · Round {round?.sequence}
                </h2>
                <p className="text-xs text-[#6E6E6E] font-mono">
                  {isMCQ ? "Multiple Choice Logic Tracing Question" : "Algorithmic Problem with 4-Language Starter Code"}
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-[#0F172A] hover:text-[#7F45DB] text-lg font-mono font-black p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleSaveProblem} className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Set Selection & Title */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs text-[#0F172A] font-extrabold uppercase tracking-wider block mb-1 font-mono">
                    Question Set
                  </label>
                  <select
                    value={targetSet}
                    onChange={(e) => setTargetSet(e.target.value as "A" | "B")}
                    className="w-full bg-[#F8F9FD] text-[#0F172A] rounded-xl px-3 py-2.5 text-xs font-mono font-bold border-2 border-[#1E1B4B] focus:outline-none focus:border-[#7F45DB]"
                  >
                    <option value="A">Set A (Leader)</option>
                    <option value="B">Set B (Member)</option>
                  </select>
                </div>

                <div className="md:col-span-3">
                  <label className="text-xs text-[#0F172A] font-extrabold uppercase tracking-wider block mb-1 font-mono">
                    Problem Title
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Array Permutation Trace / Redundant Loop Optimization"
                    className="w-full bg-[#F8F9FD] text-[#0F172A] rounded-xl px-3.5 py-2.5 text-xs font-mono border-2 border-[#1E1B4B] focus:outline-none focus:border-[#7F45DB]"
                  />
                </div>
              </div>

              {/* Statement */}
              <div>
                <label className="text-xs text-[#0F172A] font-extrabold uppercase tracking-wider block mb-1 font-mono">
                  Problem Statement / Target Output Pattern
                </label>
                <textarea
                  required
                  rows={3}
                  value={statement}
                  onChange={(e) => setStatement(e.target.value)}
                  placeholder="Describe the logic challenge, output to analyze, or problem narrative..."
                  className="w-full bg-[#F8F9FD] text-[#0F172A] rounded-xl px-3.5 py-2.5 text-xs border-2 border-[#1E1B4B] focus:outline-none focus:border-[#7F45DB] font-mono resize-none"
                />
              </div>

              {/* Round 1 MCQ Options Editor */}
              {isMCQ ? (
                <div className="bg-[#F8F9FD] p-4 rounded-xl border-2 border-[#1E1B4B] space-y-4">
                  <div className="flex items-center justify-between border-b-2 border-[#1E1B4B]/10 pb-2">
                    <div className="text-xs font-bold text-[#0F172A] uppercase font-display">
                      MCQ Options per Language
                    </div>
                    {/* Language Tabs */}
                    <div className="flex items-center gap-1 bg-white p-1 rounded-lg border-2 border-[#1E1B4B] text-[11px] font-mono font-bold">
                      {(["cpp", "c", "java", "python"] as const).map((l) => (
                        <button
                          key={l}
                          type="button"
                          onClick={() => setActiveLang(l)}
                          className={`px-2.5 py-0.5 rounded cursor-pointer ${activeLang === l ? "bg-[#7F45DB] text-white" : "text-[#6E6E6E] hover:text-[#0F172A]"}`}
                        >
                          {l.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {(["A", "B", "C", "D"] as const).map((opt) => (
                      <div key={opt} className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-mono font-bold text-[#0F172A]">
                          <span>Option {opt} ({activeLang.toUpperCase()})</span>
                          <label className="flex items-center gap-1.5 cursor-pointer text-[#7F45DB]">
                            <input
                              type="radio"
                              name="correctOption"
                              checked={correctOption === opt}
                              onChange={() => setCorrectOption(opt)}
                              className="accent-[#7F45DB]"
                            />
                            <span>Correct</span>
                          </label>
                        </div>
                        <textarea
                          rows={3}
                          value={mcqOptions[activeLang]?.[opt] ?? ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setMcqOptions((prev) => ({
                              ...prev,
                              [activeLang]: {
                                ...(prev[activeLang] ?? {}),
                                [opt]: val,
                              },
                            }));
                          }}
                          placeholder={`Snippet for Option ${opt}...`}
                          className="w-full bg-white text-[#0F172A] font-mono text-xs p-2 rounded-lg border-2 border-[#1E1B4B] focus:outline-none focus:border-[#7F45DB] resize-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* Rounds 2-5 Starter Code & Test Cases */
                <>
                  {/* Multi-Language Starter Code Editor */}
                  <div className="bg-[#F8F9FD] p-4 rounded-xl border-2 border-[#1E1B4B] space-y-3">
                    <div className="flex items-center justify-between border-b-2 border-[#1E1B4B]/10 pb-2">
                      <div className="text-xs font-bold text-[#0F172A] uppercase font-display flex items-center gap-1.5">
                        <Code2 className="w-4 h-4 text-[#7F45DB]" />
                        <span>Starter / Buggy Code per Language</span>
                      </div>
                      {/* Language Switcher */}
                      <div className="flex items-center gap-1 bg-white p-1 rounded-lg border-2 border-[#1E1B4B] text-[11px] font-mono font-bold">
                        {(["cpp", "c", "java", "python"] as const).map((l) => (
                          <button
                            key={l}
                            type="button"
                            onClick={() => setActiveLang(l)}
                            className={`px-2.5 py-0.5 rounded cursor-pointer ${activeLang === l ? "bg-[#7F45DB] text-white" : "text-[#6E6E6E] hover:text-[#0F172A]"}`}
                          >
                            {l.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>

                    <textarea
                      rows={5}
                      value={starterCodes[activeLang] ?? ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setStarterCodes((prev) => ({ ...prev, [activeLang]: val }));
                      }}
                      className="w-full bg-white text-[#0F172A] font-mono text-xs p-3 rounded-xl border-2 border-[#1E1B4B] focus:outline-none focus:border-[#7F45DB] resize-none"
                    />
                  </div>

                  {/* Constraints & Sample I/O */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-[#0F172A] font-extrabold uppercase tracking-wider block mb-1 font-mono">
                        Sample Input
                      </label>
                      <textarea
                        rows={2}
                        value={sampleInput}
                        onChange={(e) => setSampleInput(e.target.value)}
                        placeholder="e.g. 5\n1 2 3 4 5"
                        className="w-full bg-[#F8F9FD] text-[#0F172A] font-mono text-xs p-2 rounded-xl border-2 border-[#1E1B4B] focus:outline-none focus:border-[#7F45DB] resize-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-[#0F172A] font-extrabold uppercase tracking-wider block mb-1 font-mono">
                        Sample Output
                      </label>
                      <textarea
                        rows={2}
                        value={sampleOutput}
                        onChange={(e) => setSampleOutput(e.target.value)}
                        placeholder="e.g. 15"
                        className="w-full bg-[#F8F9FD] text-[#0F172A] font-mono text-xs p-2 rounded-xl border-2 border-[#1E1B4B] focus:outline-none focus:border-[#7F45DB] resize-none"
                      />
                    </div>
                  </div>

                  {/* Test Cases List */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-[#0F172A] uppercase font-display">
                        Test Suite (Visible & Hidden Cases)
                      </h3>
                      <button
                        type="button"
                        onClick={handleAddTestCase}
                        className="text-xs font-mono font-bold text-[#7F45DB] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Test Case
                      </button>
                    </div>

                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {testCases.map((tc, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 p-2.5 bg-[#F8F9FD] rounded-xl border-2 border-[#1E1B4B] text-xs font-mono shadow-[2px_2px_0px_0px_#1E1B4B]"
                        >
                          <span className="text-[#6E6E6E] w-6 text-center font-bold">#{idx + 1}</span>
                          <input
                            type="text"
                            value={tc.input}
                            onChange={(e) => {
                              const val = e.target.value;
                              setTestCases((prev) =>
                                prev.map((t, i) => (i === idx ? { ...t, input: val } : t))
                              );
                            }}
                            placeholder="Input"
                            className="flex-1 bg-white text-[#0F172A] px-2.5 py-1.5 rounded-lg border border-[#1E1B4B] focus:outline-none"
                          />
                          <input
                            type="text"
                            value={tc.expected}
                            onChange={(e) => {
                              const val = e.target.value;
                              setTestCases((prev) =>
                                prev.map((t, i) => (i === idx ? { ...t, expected: val } : t))
                              );
                            }}
                            placeholder="Expected Output"
                            className="flex-1 bg-white text-[#0F172A] px-2.5 py-1.5 rounded-lg border border-[#1E1B4B] focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setTestCases((prev) =>
                                prev.map((t, i) => (i === idx ? { ...t, isHidden: !t.isHidden } : t))
                              );
                            }}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border-2 cursor-pointer ${tc.isHidden ? "bg-amber-100 text-amber-900 border-amber-500" : "bg-[#7F45DB]/10 text-[#4A2293] border-[#7F45DB]"}`}
                          >
                            {tc.isHidden ? "Hidden" : "Visible"}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveTestCase(idx)}
                            className="p-1 text-[#6E6E6E] hover:text-destructive cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Submit CTA */}
              <div className="pt-3 border-t-2 border-[#1E1B4B]/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-mono text-[#6E6E6E] hover:text-[#0F172A] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-[#7F45DB] hover:bg-[#6D35C7] text-white font-mono font-black text-xs uppercase tracking-wider border-2 border-[#1E1B4B] shadow-[3px_3px_0px_0px_#1E1B4B] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_#1E1B4B] transition-all disabled:opacity-50 cursor-pointer"
                >
                  {saving ? "Saving Problem..." : "Save Problem"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
