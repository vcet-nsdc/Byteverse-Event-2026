"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { 
  Sparkles, 
  MessageSquare, 
  Terminal, 
  Send, 
  X, 
  AlertCircle, 
  Loader2, 
  Info,
  CornerDownLeft
} from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  type: "EXPLAIN" | "CODE";
  timestamp: string;
}

interface AIAssistantDrawerProps {
  roundId: string;
  problemId?: string | null;
  isOpen: boolean;
  onClose: () => void;
}

// ─── Custom Markdown & Formatting Renderer ──────────────────────────────────
function FormattedMessageContent({ content, isUser }: { content: string; isUser: boolean }) {
  if (isUser) {
    return <div className="whitespace-pre-wrap font-sans text-xs">{content}</div>;
  }

  // Split by code blocks
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-2 text-xs leading-relaxed text-[#0F172A]">
      {parts.map((part, idx) => {
        if (part.startsWith("```") && part.endsWith("```")) {
          // Code block
          const lines = part.slice(3, -3).trim().split("\n");
          const firstLine = lines[0]?.trim() ?? "";
          const isLang = /^[a-z0-9_-]+$/i.test(firstLine);
          const lang = isLang ? firstLine : "";
          const codeText = (isLang ? lines.slice(1) : lines).join("\n");

          return (
            <div
              key={idx}
              className="my-2 rounded-xl bg-[#0F172A] border-2 border-[#1E1B4B] text-emerald-400 font-mono text-[11px] p-3 overflow-x-auto shadow-inner"
            >
              {lang && (
                <div className="text-[9px] uppercase tracking-wider text-slate-400 font-bold mb-1 border-b border-slate-700/60 pb-1">
                  {lang}
                </div>
              )}
              <pre className="font-mono whitespace-pre">{codeText}</pre>
            </div>
          );
        }

        // Regular text paragraph
        const paragraphs = part.split("\n\n").filter(Boolean);

        return (
          <div key={idx} className="space-y-1.5">
            {paragraphs.map((p, pIdx) => {
              const lines = p.split("\n");

              return (
                <div key={pIdx} className="space-y-1">
                  {lines.map((line, lIdx) => {
                    const trimmed = line.trim();

                    // Blockquote
                    if (trimmed.startsWith(">")) {
                      return (
                        <div
                          key={lIdx}
                          className="pl-3 py-1 my-1 border-l-4 border-[#7F45DB] bg-[#7F45DB]/5 text-[#4A2293] font-medium text-[11px] rounded-r-lg"
                        >
                          {parseInlineFormatting(trimmed.replace(/^>\s*/, ""))}
                        </div>
                      );
                    }

                    // Bullet items
                    if (trimmed.startsWith("•") || trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
                      const cleanBullet = trimmed.replace(/^[•*-]\s*/, "");
                      return (
                        <div key={lIdx} className="flex items-start gap-2 pl-1 py-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#7F45DB] mt-1.5 shrink-0" />
                          <span className="flex-1">{parseInlineFormatting(cleanBullet)}</span>
                        </div>
                      );
                    }

                    // Header
                    if (trimmed.startsWith("### ")) {
                      return (
                        <h4 key={lIdx} className="font-display font-bold text-[12px] text-[#7F45DB] uppercase tracking-wide pt-1">
                          {trimmed.replace(/^###\s*/, "")}
                        </h4>
                      );
                    }

                    // Standard line
                    return (
                      <p key={lIdx} className="leading-relaxed">
                        {parseInlineFormatting(line)}
                      </p>
                    );
                  })}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

// Inline formatting helper for **bold** and `code`
function parseInlineFormatting(text: string) {
  const tokens = text.split(/(\*\*.*?\*\*|`.*?`)/g);

  return tokens.map((token, i) => {
    if (token.startsWith("**") && token.endsWith("**")) {
      return (
        <strong key={i} className="font-extrabold text-[#0F172A]">
          {token.slice(2, -2)}
        </strong>
      );
    }
    if (token.startsWith("`") && token.endsWith("`")) {
      return (
        <code
          key={i}
          className="px-1.5 py-0.5 mx-0.5 rounded-md bg-[#7F45DB]/10 text-[#4A2293] font-mono text-[11px] font-bold border border-[#7F45DB]/20"
        >
          {token.slice(1, -1)}
        </code>
      );
    }
    return token;
  });
}

// ─── Main AI Assistant Drawer Component ─────────────────────────────────────
export default function AIAssistantDrawer({ roundId, problemId, isOpen, onClose }: AIAssistantDrawerProps) {
  const [activeTab, setActiveTab] = useState<"EXPLAIN" | "CODE">("EXPLAIN");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-1",
      sender: "ai",
      text: `Hello! I am Navigator, your AI Tutor for ByteVerse 2026.

To recommend the best algorithmic pattern or explain logic, please specify:
• Problem Goal: What are you trying to find or compute?
• Input & Constraints: E.g., array size, sorted/unsorted, graph type, range of numbers.
• Specific Edge Cases: E.g., handling duplicates, empty input, or large inputs.
• Complexity Requirements: What time and space complexity are you aiming for?

Once you provide these details, I will guide you toward an appropriate high-level approach (e.g., Two Pointers, Sliding Window, DP, Graph Traversal) and ask Socratic questions to help you derive the solution yourself.

⚠️ Remember: I operate under strict competition integrity rules and cannot provide full code or direct solutions.`,
      type: "EXPLAIN",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
    {
      id: "welcome-2",
      sender: "ai",
      text: `Hello! I am Forge, your AI Code Advisor for ByteVerse 2026.

To get help with debugging, syntax, or code optimization, please specify:
• Language: C, C++, Java, or Python.
• Current Behavior: What error or unexpected output are you seeing? (e.g., WA, TLE, Segmentation Fault).
• Code Snippet / Context: Share the specific loop, recursion, or block you are stuck on.
• Goal: What data structure or logic optimization are you trying to achieve?

I will point out logical bugs and explain syntax gotchas without writing the full solution for you.`,
      type: "CODE",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Quotas (Tournament lifetime: 15 Chat, 25 Code)
  const [quota, setQuota] = useState({
    explainUsed: 0,
    codeUsed: 0,
    explainLeft: 15,
    codeLeft: 25,
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch current AI usage quota
  const fetchUsage = useCallback(async () => {
    try {
      const res = await fetch("/api/ai");
      if (res.ok) {
        const data = await res.json();
        setQuota({
          explainUsed: data.explainUsed ?? 0,
          codeUsed: data.codeUsed ?? 0,
          explainLeft: data.explainLeft ?? 15,
          codeLeft: data.codeLeft ?? 25,
        });
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchUsage();
    }
  }, [isOpen, fetchUsage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeTab, loading]);

  // Send Prompt to AI
  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const promptText = input.trim();
    if (!promptText || loading) return;

    // Check remaining quota for this module
    const remaining = activeTab === "EXPLAIN" ? quota.explainLeft : quota.codeLeft;
    if (remaining <= 0) {
      setErrorMsg(`You have exhausted all ${activeTab === "EXPLAIN" ? "15 AI Chat" : "25 AI Code"} requests for this tournament.`);
      return;
    }

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: promptText,
      type: activeTab,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setErrorMsg(null);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roundId,
          problemId: problemId || undefined,
          type: activeTab,
          message: promptText,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "AI service temporarily unavailable.");
        if (data.explainLeft !== undefined) {
          setQuota((prev) => ({
            ...prev,
            explainLeft: data.explainLeft,
            codeLeft: data.codeLeft,
          }));
        }
        return;
      }

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: data.response,
        type: activeTab,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, aiMsg]);
      setQuota({
        explainUsed: 15 - (data.explainLeft ?? 0),
        codeUsed: 25 - (data.codeLeft ?? 0),
        explainLeft: data.explainLeft ?? 0,
        codeLeft: data.codeLeft ?? 0,
      });
    } catch {
      setErrorMsg("Network error contacting AI service. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Keyboard shortcut handler: Enter to send, Shift+Enter for newline
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-grow textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  const currentTabMessages = messages.filter((m) => m.type === activeTab);
  const remainingInActiveTab = activeTab === "EXPLAIN" ? quota.explainLeft : quota.codeLeft;
  const maxInActiveTab = activeTab === "EXPLAIN" ? 15 : 25;
  const usedInActiveTab = activeTab === "EXPLAIN" ? quota.explainUsed : quota.codeUsed;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[460px] bg-white border-l-2 border-[#1E1B4B] shadow-[-8px_0px_0px_0px_rgba(30,27,75,0.15)] flex flex-col font-sans animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 border-b-2 border-[#1E1B4B]/10 bg-[#F8F9FD] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#7F45DB] text-white flex items-center justify-center border border-[#1E1B4B] shadow-[2px_2px_0px_0px_#1E1B4B]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="font-display font-extrabold text-sm text-[#0F172A] flex items-center gap-1.5">
              <span>ByteVerse AI Assistant</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#7F45DB]/10 text-[#7F45DB] font-mono font-bold">
                Socratic
              </span>
            </div>
            <p className="text-[11px] text-[#6E6E6E] font-mono">
              Guided hints & conceptual guidance
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-xl border-2 border-[#1E1B4B]/20 text-[#6E6E6E] hover:text-[#0F172A] hover:bg-[#E2E8F0] transition-colors cursor-pointer"
          title="Close AI Assistant"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Module Tabs: AI Chat vs AI Code */}
      <div className="p-3 border-b-2 border-[#1E1B4B]/10 bg-white grid grid-cols-2 gap-2">
        {/* Tab 1: AI Chat */}
        <button
          onClick={() => {
            setActiveTab("EXPLAIN");
            setErrorMsg(null);
          }}
          className={`p-2.5 rounded-xl border-2 font-mono text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
            activeTab === "EXPLAIN"
              ? "bg-[#7F45DB] text-white border-[#1E1B4B] shadow-[2px_2px_0px_0px_#1E1B4B]"
              : "bg-[#F8F9FD] text-[#0F172A] border-[#E2E8F0] hover:border-[#1E1B4B]"
          }`}
        >
          <div className="flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>AI Chat</span>
          </div>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
            activeTab === "EXPLAIN" ? "bg-white/20 text-white" : "bg-[#E2E8F0] text-[#0F172A]"
          }`}>
            {quota.explainLeft}/15 Left
          </span>
        </button>

        {/* Tab 2: AI Code */}
        <button
          onClick={() => {
            setActiveTab("CODE");
            setErrorMsg(null);
          }}
          className={`p-2.5 rounded-xl border-2 font-mono text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
            activeTab === "CODE"
              ? "bg-[#7F45DB] text-white border-[#1E1B4B] shadow-[2px_2px_0px_0px_#1E1B4B]"
              : "bg-[#F8F9FD] text-[#0F172A] border-[#E2E8F0] hover:border-[#1E1B4B]"
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5" />
            <span>AI Code</span>
          </div>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
            activeTab === "CODE" ? "bg-white/20 text-white" : "bg-[#E2E8F0] text-[#0F172A]"
          }`}>
            {quota.codeLeft}/25 Left
          </span>
        </button>
      </div>

      {/* Quota Banner */}
      <div className="px-4 py-2 bg-[#F0F2F8] border-b border-[#1E1B4B]/10 flex items-center justify-between text-[11px] font-mono text-[#0F172A]">
        <div className="flex items-center gap-1.5 text-[#6E6E6E]">
          <Info className="w-3.5 h-3.5 text-[#7F45DB]" />
          <span>
            {activeTab === "EXPLAIN" ? "AI Concept & Logic Tutor" : "AI Code & Syntax Advisor"}
          </span>
        </div>
        <span className="font-bold text-[#7F45DB]">
          Used: {usedInActiveTab} / {maxInActiveTab}
        </span>
      </div>

      {/* Messages List Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FAFBFF]">
        {currentTabMessages.map((m) => {
          const isUser = m.sender === "user";
          return (
            <div
              key={m.id}
              className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[92%] rounded-2xl p-4 text-xs font-sans leading-relaxed border-2 shadow-[2px_2px_0px_0px_#1E1B4B] ${
                  isUser
                    ? "bg-[#7F45DB] text-white border-[#1E1B4B]"
                    : "bg-white text-[#0F172A] border-[#1E1B4B]"
                }`}
              >
                {/* Header inside Bubble */}
                <div className={`font-mono text-[9px] uppercase font-bold mb-2 flex items-center justify-between gap-4 border-b pb-1 ${
                  isUser ? "border-white/20 text-white/80" : "border-[#1E1B4B]/10 text-[#6E6E6E]"
                }`}>
                  <span>{isUser ? "You" : activeTab === "EXPLAIN" ? "Navigator AI" : "Forge AI"}</span>
                  <span>{m.timestamp}</span>
                </div>

                {/* Formatted Markdown Content */}
                <FormattedMessageContent content={m.text} isUser={isUser} />
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-2.5 text-xs font-mono text-[#7F45DB] bg-white border-2 border-[#1E1B4B] p-3.5 rounded-2xl shadow-[2px_2px_0px_0px_#1E1B4B] max-w-[75%] animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin text-[#7F45DB]" />
            <span>AI is reasoning Socratically...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Error Alert Box */}
      {errorMsg && (
        <div className="px-4 py-2.5 bg-destructive/10 border-t-2 border-destructive text-destructive text-xs font-mono font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Enhanced Multi-line Prompt Form */}
      <form
        onSubmit={handleSend}
        className="p-3.5 border-t-2 border-[#1E1B4B]/10 bg-white space-y-2"
      >
        <div className="relative flex items-end gap-2">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={
              remainingInActiveTab <= 0
                ? `Quota exhausted (${maxInActiveTab}/${maxInActiveTab})`
                : activeTab === "EXPLAIN"
                ? "Ask logic/concept question (Press Enter to send)..."
                : "Ask coding/syntax question (Press Enter to send)..."
            }
            disabled={loading || remainingInActiveTab <= 0}
            maxLength={1000}
            className="flex-1 bg-[#F8F9FD] border-2 border-[#1E1B4B] focus:border-[#7F45DB] text-[#0F172A] text-xs font-mono rounded-xl p-3 focus:outline-none transition-all shadow-inner disabled:opacity-50 resize-none max-h-32 leading-relaxed"
          />
          <button
            type="submit"
            disabled={loading || !input.trim() || remainingInActiveTab <= 0}
            className="p-3 rounded-xl bg-[#7F45DB] hover:bg-[#6D35C7] text-white border-2 border-[#1E1B4B] shadow-[2px_2px_0px_0px_#1E1B4B] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_#1E1B4B] disabled:opacity-40 transition-all cursor-pointer shrink-0"
            title="Send Question to AI (Enter)"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        {/* Input Footer with Keyboard Hint & Character Count */}
        <div className="flex items-center justify-between text-[10px] font-mono text-[#8A8A8A] px-1">
          <div className="flex items-center gap-1">
            <CornerDownLeft className="w-3 h-3 text-[#7F45DB]" />
            <span><strong className="text-[#0F172A]">Enter</strong> to send · <strong className="text-[#0F172A]">Shift+Enter</strong> for newline</span>
          </div>
          <span>{input.length}/1000</span>
        </div>
      </form>
    </div>
  );
}
