"use client";

import { CheckCircle2, XCircle, Bot, User, Award, X, Zap } from "lucide-react";

interface DimensionReport {
  score?: number;
  feedback?: string;
  passed?: number;
  total?: number;
  ratio?: string;
  allPassed?: boolean;
  estimate?: string;
  optimal?: string;
}

interface AnalysisReport {
  evaluatedAt?: string;
  isFinalSubmission?: boolean;
  score?: number;
  cleanCodeNames?: DimensionReport;
  hiddenCasesPass?: DimensionReport;
  edgeCasesPass?: DimensionReport;
  commentFormat?: DimensionReport;
  syntaxFormat?: DimensionReport;
  timeComplexity?: DimensionReport;
  spaceComplexity?: DimensionReport;
  testCasesSummary?: {
    sample?: string;
    hidden?: string;
    edge?: string;
    totalPassed?: number;
    totalCases?: number;
  };
}

interface MachineRivalReport {
  model?: string;
  cleanCodeNames?: { score: number; feedback?: string };
  hiddenCasesPass?: { ratio: string };
  edgeCasesPass?: { ratio: string };
  commentFormat?: { score: number; feedback?: string };
  syntaxFormat?: { score: number; feedback?: string };
  timeComplexity?: { estimate: string };
  spaceComplexity?: { estimate: string };
}

interface Round5AnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: AnalysisReport | null;
  machineReport?: MachineRivalReport | null;
  runsRemaining: number;
  isLocked: boolean;
}

function formatScore10(score: number | undefined | null, fallback: number): string {
  if (score === undefined || score === null) return `${fallback} / 10`;
  const normalized = score > 10 ? (score / 10).toFixed(1).replace(/\.0$/, "") : score;
  return `${normalized} / 10`;
}

export default function Round5AnalysisModal({
  isOpen,
  onClose,
  report,
  machineReport,
  runsRemaining,
  isLocked,
}: Round5AnalysisModalProps) {
  if (!isOpen || !report) return null;

  const score = report.score ?? 0;
  const isPerfect = score === 100;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in zoom-in-95">
      <div className="max-w-3xl w-full bg-white border-4 border-[#1E1B4B] rounded-3xl p-6 sm:p-8 shadow-[8px_8px_0px_0px_#1E1B4B] space-y-6 my-auto font-sans relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-[#F0F2F8] hover:bg-[#E2E8F0] border-2 border-[#1E1B4B] text-[#0F172A] transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-[#1E1B4B]/10 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#7F45DB]/10 text-[#4A2293] border border-[#7F45DB]/30 font-mono font-black text-xs uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5" /> 7-Dimension Code Analysis
            </div>
            <h2 className="font-display font-black text-2xl text-[#0F172A] uppercase">
              Human vs Machine Duel Report
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right font-mono">
              <div className="text-[10px] text-[#6E6E6E] uppercase font-bold">Analysis Score</div>
              <div className="text-2xl font-black text-[#7F45DB]">{score} / 100 pts</div>
            </div>
            <div className={`p-3 rounded-2xl border-2 border-[#1E1B4B] ${isPerfect ? "bg-emerald-100" : "bg-purple-50"}`}>
              <Award className={`w-7 h-7 ${isPerfect ? "text-emerald-700" : "text-[#7F45DB]"}`} />
            </div>
          </div>
        </div>

        {/* Status Alert Banner */}
        <div className="flex items-center justify-between flex-wrap gap-2 px-4 py-2.5 rounded-2xl bg-[#F8F9FD] border-2 border-[#1E1B4B] font-mono text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              Runs Remaining: <strong className="text-[#7F45DB]">{runsRemaining} of 10</strong>
            </span>
          </div>
          {isLocked ? (
            <span className="text-red-700 font-bold uppercase bg-red-100 px-2.5 py-0.5 rounded-md border border-red-300">
              🔒 Solution Locked
            </span>
          ) : (
            <span className="text-emerald-700 font-bold">
              Draft Iteration Active
            </span>
          )}
        </div>

        {/* 7-Dimension Comparative Matrix */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono border-collapse">
            <thead>
              <tr className="border-b-2 border-[#1E1B4B] text-[#0F172A] uppercase bg-[#F0F2F8]">
                <th className="p-3 text-left font-black">Quality Dimension</th>
                <th className="p-3 text-center font-black">
                  <div className="flex items-center justify-center gap-1">
                    <User className="w-3.5 h-3.5 text-[#7F45DB]" /> Your Code
                  </div>
                </th>
                <th className="p-3 text-center font-black">
                  <div className="flex items-center justify-center gap-1 text-[#6E6E6E]">
                    <Bot className="w-3.5 h-3.5" /> Machine Rival
                  </div>
                </th>
                <th className="p-3 text-left font-black hidden sm:table-cell">Automated Feedback</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E1B4B]/10">
              {/* 1. Clean Code Names */}
              <tr>
                <td className="p-3 font-bold text-[#0F172A]">1. Clean Code Names</td>
                <td className="p-3 text-center font-black text-[#7F45DB]">
                  {formatScore10(report.cleanCodeNames?.score, 8)}
                </td>
                <td className="p-3 text-center text-[#6E6E6E] font-bold">
                  {formatScore10(machineReport?.cleanCodeNames?.score, 9)}
                </td>
                <td className="p-3 text-[11px] text-[#6E6E6E] hidden sm:table-cell">
                  {report.cleanCodeNames?.feedback ?? "Evaluates naming conventions and readability."}
                </td>
              </tr>

              {/* 2. Hidden Cases Pass */}
              <tr className="bg-[#F8F9FD]">
                <td className="p-3 font-bold text-[#0F172A]">2. Hidden Cases Pass</td>
                <td className="p-3 text-center font-black">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold ${
                    report.hiddenCasesPass?.allPassed ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                  }`}>
                    {report.hiddenCasesPass?.allPassed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    {report.hiddenCasesPass?.ratio ?? "0/4"}
                  </span>
                </td>
                <td className="p-3 text-center text-[#6E6E6E] font-bold">
                  {machineReport?.hiddenCasesPass?.ratio ?? "4/4"}
                </td>
                <td className="p-3 text-[11px] text-[#6E6E6E] hidden sm:table-cell">
                  Passes deep stress tests beyond standard sample inputs.
                </td>
              </tr>

              {/* 3. Edge Cases Pass */}
              <tr>
                <td className="p-3 font-bold text-[#0F172A]">3. Edge Cases Pass</td>
                <td className="p-3 text-center font-black">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold ${
                    report.edgeCasesPass?.allPassed ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                  }`}>
                    {report.edgeCasesPass?.allPassed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    {report.edgeCasesPass?.ratio ?? "0/3"}
                  </span>
                </td>
                <td className="p-3 text-center text-amber-700 font-bold">
                  {machineReport?.edgeCasesPass?.ratio ?? "0/2"}
                </td>
                <td className="p-3 text-[11px] text-[#6E6E6E] hidden sm:table-cell">
                  Boundary traps where AI failed (overflow, min/max bounds).
                </td>
              </tr>

              {/* 4. Comment Format */}
              <tr className="bg-[#F8F9FD]">
                <td className="p-3 font-bold text-[#0F172A]">4. Comment Format</td>
                <td className="p-3 text-center font-black text-[#7F45DB]">
                  {formatScore10(report.commentFormat?.score, 7)}
                </td>
                <td className="p-3 text-center text-[#6E6E6E] font-bold">
                  {formatScore10(machineReport?.commentFormat?.score, 8)}
                </td>
                <td className="p-3 text-[11px] text-[#6E6E6E] hidden sm:table-cell">
                  {report.commentFormat?.feedback ?? "Quality of inline documentation and logic explanation."}
                </td>
              </tr>

              {/* 5. Syntax Format */}
              <tr>
                <td className="p-3 font-bold text-[#0F172A]">5. Syntax Format</td>
                <td className="p-3 text-center font-black text-[#7F45DB]">
                  {formatScore10(report.syntaxFormat?.score, 9)}
                </td>
                <td className="p-3 text-center text-[#6E6E6E] font-bold">
                  {formatScore10(machineReport?.syntaxFormat?.score, 9)}
                </td>
                <td className="p-3 text-[11px] text-[#6E6E6E] hidden sm:table-cell">
                  {report.syntaxFormat?.feedback ?? "Adherence to idiomatic style and clean indentation."}
                </td>
              </tr>

              {/* 6. Time Complexity */}
              <tr className="bg-[#F8F9FD]">
                <td className="p-3 font-bold text-[#0F172A]">6. Time Complexity</td>
                <td className="p-3 text-center font-black text-emerald-700">
                  {report.timeComplexity?.estimate ?? "O(N log N)"}
                </td>
                <td className="p-3 text-center text-[#6E6E6E] font-bold">
                  {machineReport?.timeComplexity?.estimate ?? "O(N log N)"}
                </td>
                <td className="p-3 text-[11px] text-[#6E6E6E] hidden sm:table-cell">
                  {report.timeComplexity?.feedback ?? "Asymptotic algorithmic efficiency."}
                </td>
              </tr>

              {/* 7. Space Complexity */}
              <tr>
                <td className="p-3 font-bold text-[#0F172A]">7. Space Complexity</td>
                <td className="p-3 text-center font-black text-blue-700">
                  {report.spaceComplexity?.estimate ?? "O(N)"}
                </td>
                <td className="p-3 text-center text-[#6E6E6E] font-bold">
                  {machineReport?.spaceComplexity?.estimate ?? "O(N)"}
                </td>
                <td className="p-3 text-[11px] text-[#6E6E6E] hidden sm:table-cell">
                  {report.spaceComplexity?.feedback ?? "Auxiliary memory footprint."}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t-2 border-[#1E1B4B]/10 flex items-center justify-between flex-wrap gap-3">
          <div className="text-xs font-mono text-[#6E6E6E]">
            {report.testCasesSummary ? (
              <span>Total Tests: <strong className="text-[#0F172A]">{report.testCasesSummary.totalPassed} / {report.testCasesSummary.totalCases} Passed</strong></span>
            ) : (
              <span>Score calculated across all 7 dimensions</span>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-[#7F45DB] hover:bg-[#6D35C7] text-white font-mono font-black text-xs uppercase tracking-wider border-2 border-[#1E1B4B] shadow-[3px_3px_0px_0px_#1E1B4B] hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer"
          >
            <span>Continue Coding ➔</span>
          </button>
        </div>
      </div>
    </div>
  );
}
