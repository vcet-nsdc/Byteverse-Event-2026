import React from "react";
import { BookOpen, Target, Lightbulb, AlertCircle, Calculator } from "lucide-react";

interface FormattedStatementProps {
  statement?: string;
  className?: string;
}

/**
 * Parses inline formatting like **bold**, `code`, and $O(N)$ math notations.
 */
function renderInlineFormatted(text: string): React.ReactNode[] {
  // Clean up any raw LaTeX artifacts if present
  const cleaned = text
    .replace(/\$\$\\text\{([^}]+)\}\s*=\s*\\frac\{([^}]+)\}\{([^}]+)\}\$\$/g, "$1 = ($2) / $3")
    .replace(/\\text\{([^}]+)\}/g, "$1")
    .replace(/\\times/g, "×")
    .replace(/\\le/g, "≤")
    .replace(/\\ge/g, "≥")
    .replace(/\\neq/g, "≠")
    .replace(/\\_/g, "_");

  // Regex tokenizes:
  // 1: `code`
  // 2: **bold**
  // 3: $math$ (e.g. $O(N)$)
  const regex = /(`[^`]+`|\*\*[^*]+\*\*|\$[^$]+\$)/g;
  const parts = cleaned.split(regex);

  return parts.map((part, index) => {
    if (!part) return null;

    // Inline Code: `...`
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={index}
          className="px-1.5 py-0.5 mx-0.5 font-mono text-[11px] font-bold bg-[#1E1B4B]/10 dark:bg-[#7F45DB]/20 text-[#7F45DB] dark:text-[#A472F7] rounded border border-[#1E1B4B]/15 dark:border-[#7F45DB]/30"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    // Bold text: **...**
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-extrabold text-[#0F172A] dark:text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }

    // Math / Big-O Notation: $...$
    if (part.startsWith("$") && part.endsWith("$")) {
      const mathContent = part.slice(1, -1);
      const isComplexity = /O\(.+\)/.test(mathContent);
      return (
        <span
          key={index}
          className={`inline-flex items-center px-1.5 py-0.5 mx-0.5 rounded font-mono text-[11px] font-bold ${
            isComplexity
              ? "bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700"
              : "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-700"
          }`}
        >
          {mathContent}
        </span>
      );
    }

    return <span key={index}>{part}</span>;
  });
}

export function FormattedStatement({ statement, className = "" }: FormattedStatementProps) {
  if (!statement) return null;

  // Split into paragraphs / sections
  const paragraphs = statement
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div className={`space-y-3.5 text-xs text-[#0F172A] dark:text-[#E2E8F0] font-sans leading-relaxed ${className}`}>
      {paragraphs.map((para, idx) => {
        // Detect section headers
        const isNarrative = /^\*{0,2}Narrative:?\*{0,2}/i.test(para);
        const isTask = /^\*{0,2}Task:?\*{0,2}/i.test(para);
        const isRule = /^\*{0,2}Rule:?\*{0,2}/i.test(para);
        const isHint = /^\*?\(?Hint:?/i.test(para);
        const isFormula = /^(Formula:|Sum\s*=|\$\$)/i.test(para) || para.includes("$$");

        // Strip the marker prefix for dedicated card bodies
        let content = para;
        if (isNarrative) {
          content = para.replace(/^\*{0,2}Narrative:?\*{0,2}\s*/i, "");
        } else if (isTask) {
          content = para.replace(/^\*{0,2}Task:?\*{0,2}\s*/i, "");
        } else if (isRule) {
          content = para.replace(/^\*{0,2}Rule:?\*{0,2}\s*/i, "");
        } else if (isHint) {
          content = para.replace(/^\*?\(?Hint:?\s*/i, "").replace(/\)\*?$/, "");
        }

        // 1. Narrative Section Card
        if (isNarrative) {
          return (
            <div
              key={idx}
              className="bg-white dark:bg-[#1A2338] p-3.5 rounded-xl border border-[#E2E8F0] dark:border-[#382F60] shadow-sm space-y-1.5"
            >
              <div className="flex items-center gap-1.5 text-[11px] font-mono font-black uppercase tracking-wider text-[#7F45DB] dark:text-[#A472F7]">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Scenario & Context</span>
              </div>
              <div className="text-xs text-[#334155] dark:text-[#CBD5E1] leading-relaxed">
                {renderInlineFormatted(content)}
              </div>
            </div>
          );
        }

        // 2. Task / Objective Card
        if (isTask) {
          return (
            <div
              key={idx}
              className="bg-[#EFF6FF] dark:bg-[#15243B] p-3.5 rounded-xl border-2 border-blue-300 dark:border-blue-600/60 shadow-sm space-y-1.5"
            >
              <div className="flex items-center gap-1.5 text-[11px] font-mono font-black uppercase tracking-wider text-blue-900 dark:text-blue-300">
                <Target className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                <span>Your Objective</span>
              </div>
              <div className="text-xs font-medium text-blue-950 dark:text-blue-100 leading-relaxed">
                {renderInlineFormatted(content)}
              </div>
            </div>
          );
        }

        // 3. Rule / Constraint Card
        if (isRule) {
          return (
            <div
              key={idx}
              className="bg-purple-50/70 dark:bg-[#201838] p-3.5 rounded-xl border border-purple-200 dark:border-purple-700 shadow-sm space-y-1.5"
            >
              <div className="flex items-center gap-1.5 text-[11px] font-mono font-black uppercase tracking-wider text-purple-900 dark:text-purple-300">
                <AlertCircle className="w-3.5 h-3.5 text-purple-700 dark:text-purple-400" />
                <span>Key Rule</span>
              </div>
              <div className="text-xs text-purple-950 dark:text-purple-100 leading-relaxed">
                {renderInlineFormatted(content)}
              </div>
            </div>
          );
        }

        // 4. Hint Callout
        if (isHint) {
          return (
            <div
              key={idx}
              className="bg-amber-50 dark:bg-[#2A2010] p-3 rounded-xl border border-amber-300 dark:border-amber-700 text-amber-950 dark:text-amber-100 flex items-start gap-2 text-xs"
            >
              <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold uppercase font-mono text-[10px] tracking-wider text-amber-800 dark:text-amber-300 block mb-0.5">
                  Pro-Tip / Hint:
                </span>
                <span>{renderInlineFormatted(content)}</span>
              </div>
            </div>
          );
        }

        // 5. Formula Block
        if (isFormula) {
          return (
            <div
              key={idx}
              className="bg-[#0F172A] dark:bg-[#0A0E1A] text-[#F8F9FD] p-3.5 rounded-xl border border-[#1E1B4B] dark:border-[#382F60] shadow-inner font-mono text-center my-2"
            >
              <div className="text-[10px] text-[#A472F7] font-bold uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
                <Calculator className="w-3.5 h-3.5" /> Mathematical Formula
              </div>
              <div className="text-sm font-black text-amber-300 tracking-wider">
                {renderInlineFormatted(content)}
              </div>
            </div>
          );
        }

        // Standard Paragraph
        return (
          <div key={idx} className="leading-relaxed">
            {renderInlineFormatted(para)}
          </div>
        );
      })}
    </div>
  );
}
