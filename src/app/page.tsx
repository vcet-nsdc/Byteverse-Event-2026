import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-[#F8F9FD] text-[#0F172A] px-4 py-16 font-sans">
      {/* Soft Ambient Purple Gradients */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-[#7F45DB]/8 blur-[160px] pointer-events-none rounded-full" />
      <div className="fixed bottom-0 right-1/4 w-[800px] h-[300px] bg-[#A472F7]/10 blur-[140px] pointer-events-none rounded-full" />

      {/* Floating Language Badges — Java, C, C++, Python */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-20 left-[8%] opacity-70 hover:opacity-100 transition-opacity animate-float">
          <div className="w-16 h-16 rounded-2xl bg-white border-2 border-[#1E1B4B] shadow-[4px_4px_0px_0px_#1E1B4B] flex items-center justify-center font-mono font-black text-base text-[#7F45DB]">
            Java
          </div>
        </div>

        <div className="absolute top-28 right-[10%] opacity-70 hover:opacity-100 transition-opacity animate-float" style={{ animationDelay: "1.5s" }}>
          <div className="w-14 h-14 rounded-2xl bg-white border-2 border-[#1E1B4B] shadow-[4px_4px_0px_0px_#1E1B4B] flex items-center justify-center font-mono font-black text-base text-[#4A2293]">
            C
          </div>
        </div>

        <div className="absolute bottom-36 left-[10%] opacity-70 hover:opacity-100 transition-opacity animate-float" style={{ animationDelay: "3s" }}>
          <div className="w-16 h-16 rounded-2xl bg-white border-2 border-[#1E1B4B] shadow-[4px_4px_0px_0px_#1E1B4B] flex items-center justify-center font-mono font-black text-base text-[#7F45DB]">
            C++
          </div>
        </div>

        <div className="absolute bottom-44 right-[12%] opacity-70 hover:opacity-100 transition-opacity animate-float" style={{ animationDelay: "2s" }}>
          <div className="w-16 h-16 rounded-2xl bg-white border-2 border-[#1E1B4B] shadow-[4px_4px_0px_0px_#1E1B4B] flex items-center justify-center font-mono font-black text-base text-[#4A2293]">
            Python
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="relative z-10 text-center max-w-4xl mx-auto space-y-10">
        {/* Header Tag */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border-2 border-[#1E1B4B] bg-[#7F45DB]/10 text-[#4A2293] text-xs font-mono font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_#1E1B4B]">
          <span className="w-2 h-2 rounded-full bg-[#7F45DB] animate-pulse" />
          ByteVerse 2026 · National Student Data Corps
        </div>

        {/* Title & Tagline */}
        <div className="space-y-4">
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-extrabold tracking-tight text-[#0F172A] uppercase font-display leading-[1.05]">
            Don&apos;t Just Code. <br />
            <span className="text-[#7F45DB] drop-shadow-sm">Conquer.</span>
          </h1>
          <p className="text-base md:text-xl text-[#6E6E6E] max-w-2xl mx-auto font-medium leading-relaxed">
            The official 5-round college coding tournament. Compete in teams of 2 to solve algorithmic challenges, optimize AI code, and trace logic under synchronized arena timing.
          </p>
        </div>

        {/* Contest Info Header Bar (Neo-Brutalism Card) */}
        <div className="bg-white border-2 border-[#1E1B4B] rounded-2xl p-6 shadow-[5px_5px_0px_0px_#1E1B4B] text-left">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center md:text-left">
            <div>
              <div className="text-[11px] font-mono uppercase text-[#6E6E6E] font-bold">Format</div>
              <div className="text-lg font-bold text-[#0F172A] font-mono">5 Rounds</div>
            </div>
            <div>
              <div className="text-[11px] font-mono uppercase text-[#6E6E6E] font-bold">Team Size</div>
              <div className="text-lg font-bold text-[#0F172A] font-mono">2 Members / Team</div>
            </div>
            <div>
              <div className="text-[11px] font-mono uppercase text-[#6E6E6E] font-bold">Languages</div>
              <div className="text-lg font-mono font-black text-[#7F45DB]">C, C++, Java, Python</div>
            </div>
            <div>
              <div className="text-[11px] font-mono uppercase text-[#6E6E6E] font-bold">Status</div>
              <div className="text-lg font-bold text-emerald-600 flex items-center gap-1.5 justify-center md:justify-start font-mono">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                Registration Open
              </div>
            </div>
          </div>
        </div>

        {/* Official 5 Rounds Stacked Vertically */}
        <div className="space-y-4 text-left pt-2">
          <div className="flex items-center justify-between border-b-2 border-[#1E1B4B]/20 pb-3">
            <h2 className="text-xl font-extrabold text-[#0F172A] uppercase tracking-wider font-display">
              Tournament Structure & Rounds
            </h2>
            <span className="text-xs font-mono font-bold text-[#7F45DB]">Sequential Progression</span>
          </div>

          <div className="space-y-4">
            {[
              {
                seq: "01",
                duration: "20 Minutes",
                title: "1. Logical Thinking",
                desc: "Analyze program behaviour, trace execution and identify the correct logic from given outputs or possibilities. This tests how accurately you reason through code without relying solely on syntax.",
              },
              {
                seq: "02",
                duration: "25 Minutes",
                title: "2. AI Code Optimization",
                desc: "Review and improve code generated by AI or inefficient implementations. Participants refine structures, improve performance, reduce time complexity, and ensure optimal execution.",
              },
              {
                seq: "03",
                duration: "35 Minutes",
                title: "3. Debugging & Code Analysis",
                desc: "Identify, isolate, and fix subtle logic errors, runtime edge cases, and algorithmic flaws in provided codebases to make them pass all strict hidden test cases.",
              },
              {
                seq: "04",
                duration: "45 Minutes",
                title: "4. Data Structures & Algorithms",
                desc: "Choose and solve algorithmic problems applying classical data structures (arrays, hash maps, two pointers, sliding window, trees, dynamic structures).",
              },
              {
                seq: "05",
                duration: "35 Minutes",
                title: "5. AI vs Human (Grand Finale)",
                desc: "Solve complex algorithmic puzzles where human intuition, creative problem solving, and edge-case mastery battle against AI models for championship supremacy.",
              },
            ].map((round) => (
              <div
                key={round.seq}
                className="bg-white border-2 border-[#1E1B4B] rounded-2xl p-6 shadow-[4px_4px_0px_0px_#1E1B4B] hover:translate-x-1 transition-all space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-black text-white bg-[#7F45DB] px-3 py-1 rounded-lg border border-[#1E1B4B]">
                      ROUND {round.seq}
                    </span>
                    <h3 className="text-xl font-bold text-[#0F172A] font-display">
                      {round.title}
                    </h3>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#4A2293] bg-[#7F45DB]/10 px-3 py-1 rounded-full border border-[#7F45DB]/30">
                    ⏱ {round.duration}
                  </span>
                </div>
                <p className="text-sm text-[#6E6E6E] font-medium leading-relaxed pl-1">
                  {round.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA Button — Directly links to /team for registration */}
        <div className="pt-6 pb-12 flex items-center justify-center">
          <Link
            href="/team"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-10 py-4 rounded-2xl bg-[#7F45DB] text-white font-mono font-black text-base uppercase tracking-wider border-2 border-[#1E1B4B] shadow-[5px_5px_0px_0px_#1E1B4B] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_#1E1B4B] hover:bg-[#6D35C7] transition-all"
          >
            <span>Enter Tournament Arena</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </main>
  );
}
