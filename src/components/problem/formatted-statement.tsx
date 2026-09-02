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
          className="px-1.5 py-0.5 mx-0.5 font-mono text-[11px] font-bold bg-[#1E1B4B]/10 text-[#7F45DB] rounded border border-[#1E1B4B]/15"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    // Bold text: **...**
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-extrabold text-[#0F172A]">
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
              ? "bg-amber-100 text-amber-900 border border-amber-300"
              : "bg-indigo-50 text-indigo-900 border border-indigo-200"
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
    <div className={`space-y-3.5 text-xs text-[#0F172A] font-sans leading-relaxed ${className}`}>
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
              className="bg-white p-3.5 rounded-xl border border-[#E2E8F0] shadow-sm space-y-1.5"
            >
              <div className="flex items-center gap-1.5 text-[11px] font-mono font-black uppercase tracking-wider text-[#7F45DB]">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Scenario & Context</span>
              </div>
              <div className="text-xs text-[#334155] leading-relaxed">
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
              className="bg-[#EFF6FF] p-3.5 rounded-xl border-2 border-blue-300 shadow-sm space-y-1.5"
            >
              <div className="flex items-center gap-1.5 text-[11px] font-mono font-black uppercase tracking-wider text-blue-900">
                <Target className="w-4 h-4 text-blue-700" />
                <span>Your Objective</span>
              </div>
              <div className="text-xs font-medium text-blue-950 leading-relaxed">
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
              className="bg-purple-50/70 p-3.5 rounded-xl border border-purple-200 shadow-sm space-y-1.5"
            >
              <div className="flex items-center gap-1.5 text-[11px] font-mono font-black uppercase tracking-wider text-purple-900">
                <AlertCircle className="w-3.5 h-3.5 text-purple-700" />
                <span>Key Rule</span>
              </div>
              <div className="text-xs text-purple-950 leading-relaxed">
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
              className="bg-amber-50 p-3 rounded-xl border border-amber-300 text-amber-950 flex items-start gap-2 text-xs"
            >
              <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold uppercase font-mono text-[10px] tracking-wider text-amber-800 block mb-0.5">
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
              className="bg-[#0F172A] text-[#F8F9FD] p-3.5 rounded-xl border border-[#1E1B4B] shadow-inner font-mono text-center my-2"
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
