"use client";

import { useState } from "react";
import { ArrowRight, Bot, Cpu, ShieldCheck, Zap } from "lucide-react";

interface ProblemChoice {
  id: string;
  sequence: number;
  title: string;
  statement: string;
  difficulty?: string;
  constraints?: string;
  sampleCount: number;
  hiddenCount: number;
  edgeCount: number;
  aiAnalysisReport?: {
    model?: string;
    cleanCodeNames?: { score: number };
    timeComplexity?: { estimate: string };
    edgeCasesPass?: { ratio: string };
  } | null;
}

interface Round5ProblemSelectorProps {
  roundId: string;
  problems: ProblemChoice[];
  onSelectSuccess: () => Promise<void>;
}

export default function Round5ProblemSelector({
  roundId,
  problems,
  onSelectSuccess,
}: Round5ProblemSelectorProps) {
  const [selectingId, setSelectingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSelect = async (problemId: string) => {
    setSelectingId(problemId);
    setError(null);
    try {
      const res = await fetch(`/api/rounds/${roundId}/select-problem`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to select problem. Please try again.");
        setSelectingId(null);
        return;
      }
      await onSelectSuccess();
    } catch {
      setError("Network error selecting problem. Please try again.");
      setSelectingId(null);
    }
  };

  return (
    <div className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-8 space-y-8 font-sans">
      {/* Grand Finale Header */}
      <div className="bg-white border-2 border-[#1E1B4B] rounded-3xl p-6 sm:p-8 shadow-[6px_6px_0px_0px_#1E1B4B] text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#7F45DB]/10 text-[#4A2293] border border-[#7F45DB]/30 font-mono font-black text-xs uppercase tracking-wider">
          <Bot className="w-4 h-4 text-[#7F45DB]" /> Round 5 · Human vs Machine Grand Finale
        </div>
        <h1 className="font-display font-black text-3xl sm:text-4xl text-[#0F172A] uppercase tracking-tight">
          Select Your Arena Challenge
        </h1>
        <p className="text-xs sm:text-sm text-[#6E6E6E] font-mono max-w-2xl mx-auto leading-relaxed">
          Choose <strong>1 of the 3 challenges</strong> below. You will compete without AI assistance against the Machine Rival&apos;s baseline. Your code will be evaluated across <strong>7 dimensions</strong> including edge-case resilience, clean naming, and asymptotic efficiency.
        </p>

        {error && (
          <div className="p-3 bg-red-50 text-red-800 border-2 border-red-500 rounded-xl font-mono text-xs font-bold">
            {error}
          </div>
        )}
      </div>

      {/* 3 Challenge Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {problems.map((p, idx) => {
          const isBusy = selectingId === p.id;
          const totalCases = p.sampleCount + p.hiddenCount + p.edgeCount;

          return (
            <div
              key={p.id}
              className="bg-white border-2 border-[#1E1B4B] rounded-3xl p-6 shadow-[5px_5px_0px_0px_#1E1B4B] flex flex-col justify-between hover:translate-x-0.5 hover:translate-y-0.5 transition-all relative overflow-hidden"
            >
              <div className="space-y-4">
                {/* Badge Header */}
                <div className="flex items-center justify-between">
                  <span className="w-7 h-7 rounded-xl bg-[#7F45DB] text-white font-mono font-black text-xs flex items-center justify-center border border-[#1E1B4B]">
                    #{idx + 1}
                  </span>
                  <span className="px-3 py-0.5 rounded-full bg-[#7F45DB]/10 text-[#4A2293] border border-[#7F45DB]/30 font-mono font-bold text-[11px] uppercase">
                    Challenge {idx + 1}
                  </span>
                </div>

                <div>
                  <h3 className="font-display font-black text-xl text-[#0F172A] leading-tight">
                    {p.title}
                  </h3>
                  <div className="text-[11px] font-mono text-[#7F45DB] font-bold mt-1 flex items-center gap-1">
                    <Cpu className="w-3.5 h-3.5" /> Competitive Coding
                  </div>
                </div>

                {/* Brief Synopsis Preview */}
                <div className="text-xs text-[#6E6E6E] font-mono leading-relaxed line-clamp-4 bg-[#F8F9FD] p-3 rounded-xl border border-[#E2E8F0]">
                  {p.statement.replace(/[#$`\\]/g, "").slice(0, 180)}...
                </div>

                {/* Test Suite Distribution Matrix */}
                <div className="p-3 bg-[#F0F2F8] rounded-2xl border border-[#1E1B4B]/20 space-y-1.5 font-mono text-xs">
                  <div className="font-bold text-[#0F172A] text-[11px] uppercase flex items-center justify-between">
                    <span>Test Suite Breakdown</span>
                    <span className="text-[#7F45DB] font-black">{totalCases} Cases</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
                    <div className="p-1.5 bg-white rounded-lg border border-[#1E1B4B]/10">
                      <div className="font-black text-emerald-700">{p.sampleCount}</div>
                      <div className="text-[#8A8A8A]">Sample</div>
                    </div>
                    <div className="p-1.5 bg-white rounded-lg border border-[#1E1B4B]/10">
                      <div className="font-black text-blue-700">{p.hiddenCount}</div>
                      <div className="text-[#8A8A8A]">Hidden</div>
                    </div>
                    <div className="p-1.5 bg-white rounded-lg border border-[#1E1B4B]/10">
                      <div className="font-black text-amber-700">{p.edgeCount}</div>
                      <div className="text-[#8A8A8A]">Edge</div>
                    </div>
                  </div>
                </div>

                {/* Machine Rival Target */}
                {p.aiAnalysisReport && (
                  <div className="p-3 bg-purple-50/80 rounded-2xl border border-[#7F45DB]/40 space-y-1 font-mono text-xs">
                    <div className="text-[10px] text-[#4A2293] font-black uppercase flex items-center gap-1">
                      <Zap className="w-3 h-3 text-[#7F45DB]" /> Rival Machine Target
                    </div>
                    <div className="text-[11px] text-[#0F172A] flex items-center justify-between">
                      <span>Time: <strong>{p.aiAnalysisReport.timeComplexity?.estimate ?? "O(N log N)"}</strong></span>
                      <span>Edge Cases: <strong className="text-amber-700">{p.aiAnalysisReport.edgeCasesPass?.ratio ?? "2/3"}</strong></span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="pt-5 border-t border-[#1E1B4B]/10 mt-4">
                <button
                  onClick={() => handleSelect(p.id)}
                  disabled={Boolean(selectingId)}
                  className="w-full py-3.5 rounded-xl bg-[#7F45DB] hover:bg-[#6D35C7] text-white font-mono font-black text-xs uppercase tracking-wider border-2 border-[#1E1B4B] shadow-[3px_3px_0px_0px_#1E1B4B] hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isBusy ? "Locking Selection..." : "Select Challenge ➔"}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
