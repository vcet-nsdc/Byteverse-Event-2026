"use client";

import { useState } from "react";
import { ArrowRight, Code2, Cpu, Sparkles } from "lucide-react";

interface ProblemChoice {
  id: string;
  sequence: number;
  title: string;
  statement: string;
  constraints?: string;
  sampleInput?: string;
  sampleOutput?: string;
  timeLimitMs?: number;
}

interface Round4ProblemSelectorProps {
  roundId: string;
  problems: ProblemChoice[];
  onSelectSuccess: () => Promise<void>;
}

export default function Round4ProblemSelector({
  roundId,
  problems,
  onSelectSuccess,
}: Round4ProblemSelectorProps) {
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
      {/* Round 4 Header */}
      <div className="bg-white border-2 border-[#1E1B4B] rounded-3xl p-6 sm:p-8 shadow-[6px_6px_0px_0px_#1E1B4B] text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#7F45DB]/10 text-[#4A2293] border border-[#7F45DB]/30 font-mono font-black text-xs uppercase tracking-wider">
          <Cpu className="w-4 h-4 text-[#7F45DB]" /> Round 4 · Deep Problem Solving
        </div>
        <h1 className="font-display font-black text-3xl sm:text-4xl text-[#0F172A] uppercase tracking-tight">
          Select Your Challenge
        </h1>
        <p className="text-xs sm:text-sm text-[#6E6E6E] font-mono max-w-2xl mx-auto leading-relaxed">
          In this round, you must choose and solve <strong>1 of the 3 challenges</strong> below. Once you select a challenge, your workstation will load it for testing and solution submission.
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
                    Option {idx + 1}
                  </span>
                </div>

                <div>
                  <h3 className="font-display font-black text-xl text-[#0F172A] leading-tight">
                    {p.title}
                  </h3>
                  <div className="text-[11px] font-mono text-[#7F45DB] font-bold mt-1 flex items-center gap-1">
                    <Code2 className="w-3.5 h-3.5" /> Algorithmic Challenge
                  </div>
                </div>

                {/* Brief Synopsis Preview */}
                <div className="text-xs text-[#6E6E6E] font-mono leading-relaxed line-clamp-4 bg-[#F8F9FD] p-3 rounded-xl border border-[#E2E8F0]">
                  {p.statement.replace(/[#$`\\]/g, "").slice(0, 180)}...
                </div>

                {/* Constraints & Time Limit Badge */}
                <div className="p-3 bg-[#F0F2F8] rounded-2xl border border-[#1E1B4B]/20 space-y-1 font-mono text-[11px]">
                  <div className="flex items-center justify-between text-[#0F172A]">
                    <span className="font-bold">Time Limit:</span>
                    <span>{p.timeLimitMs ?? 1500}ms</span>
                  </div>
                  {p.constraints && (
                    <div className="text-[#6E6E6E] text-[10px] truncate">
                      Constraints: {p.constraints}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-6">
                <button
                  type="button"
                  disabled={isBusy || selectingId !== null}
                  onClick={() => handleSelect(p.id)}
                  className="w-full py-3.5 rounded-2xl bg-[#7F45DB] hover:bg-[#6832BD] text-white font-mono font-black text-xs uppercase tracking-wider border-2 border-[#1E1B4B] shadow-[3px_3px_0px_0px_#1E1B4B] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_#1E1B4B] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isBusy ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin" />
                      <span>Entering Arena...</span>
                    </>
                  ) : (
                    <>
                      <span>Choose Challenge {idx + 1}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
