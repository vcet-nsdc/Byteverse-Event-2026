import Image from "next/image";
import Link from "next/link";
import { Trophy, Code2, Calendar, ShieldCheck, Zap, Sparkles, Terminal, Flame } from "lucide-react";
import HomeActiveContest from "@/components/home/HomeActiveContest";
import HomeContestLeaderboard from "@/components/home/HomeContestLeaderboard";
import HomeLanguageStats from "@/components/home/HomeLanguageStats";

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center relative overflow-hidden bg-transparent text-[#0F172A] dark:text-[#F8FAFC] px-3 sm:px-4 pt-1 sm:pt-3 md:pt-4 pb-12 font-sans transition-colors duration-500">
      {/* Floating Language Badges — Java, C, C++, Python (visible on mobile, tablet & desktop) */}
      <div className="block absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Java Badge */}
        <div className="absolute top-4 sm:top-8 lg:top-10 left-1.5 sm:left-3 lg:left-[5%] opacity-85 hover:opacity-100 transition-opacity animate-float">
          <div className="w-10 h-10 sm:w-13 sm:h-13 lg:w-16 lg:h-16 rounded-xl sm:rounded-2xl bg-white dark:bg-[#111726] border-2 border-[#1E1B4B] dark:border-[#7F45DB] shadow-[2px_2px_0px_0px_#1E1B4B] sm:shadow-[3px_3px_0px_0px_#1E1B4B] lg:shadow-[4px_4px_0px_0px_#1E1B4B] dark:shadow-[2px_2px_0px_0px_#7F45DB] dark:sm:shadow-[3px_3px_0px_0px_#7F45DB] dark:lg:shadow-[4px_4px_0px_0px_#7F45DB] flex items-center justify-center font-mono font-black text-[11px] sm:text-xs lg:text-base text-[#7F45DB] dark:text-[#A472F7]">
            Java
          </div>
        </div>

        {/* C Badge */}
        <div className="absolute top-8 sm:top-14 lg:top-16 right-1.5 sm:right-3 lg:right-[6%] opacity-85 hover:opacity-100 transition-opacity animate-float" style={{ animationDelay: "1.5s" }}>
          <div className="w-9 h-9 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-xl sm:rounded-2xl bg-white dark:bg-[#111726] border-2 border-[#1E1B4B] dark:border-[#7F45DB] shadow-[2px_2px_0px_0px_#1E1B4B] sm:shadow-[3px_3px_0px_0px_#1E1B4B] lg:shadow-[4px_4px_0px_0px_#1E1B4B] dark:shadow-[2px_2px_0px_0px_#7F45DB] dark:sm:shadow-[3px_3px_0px_0px_#7F45DB] dark:lg:shadow-[4px_4px_0px_0px_#7F45DB] flex items-center justify-center font-mono font-black text-[11px] sm:text-xs lg:text-base text-[#4A2293] dark:text-[#C084FC]">
            C
          </div>
        </div>

        {/* C++ Badge */}
        <div className="absolute bottom-24 sm:bottom-32 lg:bottom-36 left-1.5 sm:left-3 lg:left-[6%] opacity-85 hover:opacity-100 transition-opacity animate-float" style={{ animationDelay: "3s" }}>
          <div className="w-10 h-10 sm:w-13 sm:h-13 lg:w-16 lg:h-16 rounded-xl sm:rounded-2xl bg-white dark:bg-[#111726] border-2 border-[#1E1B4B] dark:border-[#7F45DB] shadow-[2px_2px_0px_0px_#1E1B4B] sm:shadow-[3px_3px_0px_0px_#1E1B4B] lg:shadow-[4px_4px_0px_0px_#1E1B4B] dark:shadow-[2px_2px_0px_0px_#7F45DB] dark:sm:shadow-[3px_3px_0px_0px_#7F45DB] dark:lg:shadow-[4px_4px_0px_0px_#7F45DB] flex items-center justify-center font-mono font-black text-[11px] sm:text-xs lg:text-base text-[#7F45DB] dark:text-[#A472F7]">
            C++
          </div>
        </div>

        {/* Python Badge */}
        <div className="absolute bottom-32 sm:bottom-40 lg:bottom-44 right-1.5 sm:right-3 lg:right-[8%] opacity-85 hover:opacity-100 transition-opacity animate-float" style={{ animationDelay: "2s" }}>
          <div className="w-10 h-10 sm:w-13 sm:h-13 lg:w-16 lg:h-16 rounded-xl sm:rounded-2xl bg-white dark:bg-[#111726] border-2 border-[#1E1B4B] dark:border-[#7F45DB] shadow-[2px_2px_0px_0px_#1E1B4B] sm:shadow-[3px_3px_0px_0px_#1E1B4B] lg:shadow-[4px_4px_0px_0px_#1E1B4B] dark:shadow-[2px_2px_0px_0px_#7F45DB] dark:sm:shadow-[3px_3px_0px_0px_#7F45DB] dark:lg:shadow-[4px_4px_0px_0px_#7F45DB] flex items-center justify-center font-mono font-black text-[10px] sm:text-xs lg:text-base text-[#4A2293] dark:text-[#C084FC]">
            Python
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="relative z-10 text-center max-w-5xl mx-auto space-y-5 sm:space-y-6 w-full">

        {/* Primary SEO Heading */}
        <h1 className="sr-only">
          Department of Artificial Intelligence & Data Science — NSDC ByteVerse 2026 Collegiate Competitive Programming Platform & Online Judge
        </h1>

        {/* 1. Grand Department & Institutional Header */}
        <div className="flex flex-col items-center justify-center gap-2 sm:gap-2.5 w-full pt-0">
          {/* Institutional Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-1 sm:py-1.5 rounded-full bg-white/90 dark:bg-[#15112E]/90 border-2 border-[#1E1B4B]/30 dark:border-[#7F45DB]/50 shadow-[2px_2px_0px_0px_#1E1B4B] dark:shadow-[2px_2px_0px_0px_#7F45DB] backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-[#7F45DB] dark:bg-[#A472F7] animate-ping inline-block" />
            <span className="text-[10px] sm:text-xs font-mono font-black tracking-widest text-[#0F172A] dark:text-[#E2E8F0] uppercase">
              Vidyavardhini&apos;s College of Engineering &amp; Technology
            </span>
          </div>

          {/* Grand Department Title in Technor Font */}
          <div className="space-y-1 sm:space-y-1.5 max-w-4xl px-2">
            <h2 className="font-technor font-black text-2xl sm:text-3xl md:text-5xl lg:text-[54px] uppercase tracking-wide text-[#0F172A] dark:text-white leading-[1.12] drop-shadow-sm select-none">
              Department of{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7F45DB] via-[#9333EA] to-[#EC4899] dark:from-[#A472F7] dark:via-[#C084FC] dark:to-[#F472B6]">
                Artificial Intelligence
              </span>{" "}
              &amp;{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7F45DB] via-[#9333EA] to-[#EC4899] dark:from-[#A472F7] dark:via-[#C084FC] dark:to-[#F472B6]">
                Data Science
              </span>
            </h2>
          </div>
        </div>

        {/* 2. Large NSDC Committee Logo on High-Contrast Dark Card with Cyber Accents */}
        <div className="flex flex-col items-center justify-center gap-2.5 sm:gap-3 w-full">
          <div className="relative w-[260px] sm:w-72 md:w-80 h-[80px] sm:h-[100px] md:h-[115px] rounded-2xl bg-[#0F172A] border-3 border-[#1E1B4B] dark:border-[#7F45DB] shadow-[4px_4px_0px_0px_#1E1B4B] sm:shadow-[6px_6px_0px_0px_#1E1B4B] dark:shadow-[4px_4px_0px_0px_#7F45DB] dark:sm:shadow-[6px_6px_0px_0px_#7F45DB] px-4 sm:px-5 py-2.5 sm:py-3 flex items-center justify-center hover:translate-x-0.5 hover:translate-y-0.5 transition-all overflow-hidden mx-auto group">
            {/* Cybernetic HUD Corner Crosshairs */}
            <span className="absolute top-1.5 left-2.5 text-[10px] font-mono text-[#7F45DB]/70 select-none pointer-events-none">+</span>
            <span className="absolute top-1.5 right-2.5 text-[10px] font-mono text-[#7F45DB]/70 select-none pointer-events-none">+</span>
            <span className="absolute bottom-1.5 left-2.5 text-[10px] font-mono text-[#7F45DB]/70 select-none pointer-events-none">+</span>
            <span className="absolute bottom-1.5 right-2.5 text-[10px] font-mono text-[#7F45DB]/70 select-none pointer-events-none">+</span>

            <Image
              src="/assets/nsdc-logo.png"
              alt="NSDC Logo - National Skill Development Committee"
              width={260}
              height={90}
              className="object-contain w-full h-full drop-shadow-sm group-hover:scale-[1.03] transition-transform duration-300"
              priority
            />
          </div>

          {/* Presents Badge in Technor */}
          <div className="inline-flex items-center gap-2 px-5 sm:px-6 py-1 sm:py-1.5 rounded-full border-2 border-[#1E1B4B] dark:border-[#7F45DB] bg-white dark:bg-[#16122C] text-[#0F172A] dark:text-white text-xs sm:text-sm font-technor font-bold uppercase tracking-[0.25em] shadow-[2px_2px_0px_0px_#1E1B4B] sm:shadow-[3px_3px_0px_0px_#1E1B4B] dark:shadow-[2px_2px_0px_0px_#7F45DB] dark:sm:shadow-[3px_3px_0px_0px_#7F45DB]">
            <span className="w-2 h-2 rounded-full bg-[#7F45DB] animate-pulse" />
            <span>PRESENTS</span>
          </div>
        </div>

        {/* 3. ByteVerse Main Hero Box with Official 3D Logo & Cyber HUD Accents */}
        <div className="space-y-4 sm:space-y-5 w-full">
          <div className="relative max-w-2xl sm:max-w-3xl w-full mx-auto p-4 sm:p-8 md:p-10 bg-white dark:bg-[#111726] border-3 border-[#1E1B4B] dark:border-[#7F45DB] rounded-3xl shadow-[5px_5px_0px_0px_#1E1B4B] sm:shadow-[8px_8px_0px_0px_#1E1B4B] dark:shadow-[5px_5px_0px_0px_#7F45DB] dark:sm:shadow-[8px_8px_0px_0px_#7F45DB] hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_0px_#1E1B4B] dark:hover:shadow-[4px_4px_0px_0px_#7F45DB] transition-all duration-300 cursor-pointer group select-none flex items-center justify-center overflow-hidden">
            {/* Ambient Purple Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#7F45DB]/10 via-transparent to-[#A472F7]/10 pointer-events-none group-hover:opacity-100 transition-opacity" />

            {/* Corner Cyber HUD Accents */}
            <div className="absolute top-3 left-4 hidden sm:flex items-center gap-1.5 text-[10px] font-mono text-[#6E6E6E] dark:text-[#94A3B8] font-bold">
              <span className="text-[#7F45DB] dark:text-[#A472F7]">{"//"}</span> SYS.ARENA v2.6
            </div>
            <div className="absolute top-3 right-4 hidden sm:flex items-center gap-1.5 text-[10px] font-mono text-[#6E6E6E] dark:text-[#94A3B8] font-bold">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              ONLINE JUDGE · LIVE
            </div>
            <div className="absolute bottom-3 left-4 hidden sm:flex items-center gap-1.5 text-[10px] font-mono text-[#6E6E6E] dark:text-[#94A3B8]">
              LATENCY &lt; 450MS
            </div>
            <div className="absolute bottom-3 right-4 hidden sm:flex items-center gap-1.5 text-[10px] font-mono text-[#6E6E6E] dark:text-[#94A3B8]">
              SANDBOX · SANDBOXED
            </div>
            
            <div className="relative w-full h-[170px] sm:h-[230px] md:h-[270px] flex items-center justify-center overflow-visible my-1 sm:my-2">
              <Image
                src="/assets/byteverse-logo.png?v=3"
                alt="ByteVerse 2026 Official 3D Logo"
                fill
                className="object-contain object-center drop-shadow-xl dark:drop-shadow-[0_0_28px_rgba(164,114,247,0.4)] scale-95 sm:scale-100 transition-all duration-300 ease-out group-hover:scale-[1.06] sm:group-hover:scale-[1.10] md:group-hover:scale-[1.12] group-hover:-translate-y-1.5 group-active:scale-[0.96] group-active:translate-y-1"
                priority
              />
            </div>
          </div>

          {/* 4. Tagline & Command Action Dock */}
          <div className="space-y-4 sm:space-y-5 max-w-3xl mx-auto px-2">
            {/* Tagline Badge in Technor */}
            <div className="inline-flex items-center gap-2 sm:gap-3 px-5 sm:px-7 py-2 sm:py-2.5 rounded-2xl bg-[#7F45DB] text-white border-2 border-[#1E1B4B] dark:border-[#A472F7] shadow-[3px_3px_0px_0px_#1E1B4B] sm:shadow-[4px_4px_0px_0px_#1E1B4B] dark:shadow-[3px_3px_0px_0px_#A472F7] hover:scale-[1.02] transition-transform">
              <span className="font-technor font-black text-base sm:text-2xl md:text-3xl tracking-widest uppercase">
                THINK <span className="text-amber-300">·</span> CODE <span className="text-amber-300">·</span> VERSE
              </span>
            </div>

            <p className="text-base sm:text-lg md:text-xl text-[#334155] dark:text-[#E2E8F0] font-semibold leading-relaxed">
              Welcome to <strong className="text-[#7F45DB] dark:text-[#A472F7] font-black font-technor tracking-wide">ByteVerse</strong> — the modern collegiate competitive programming arena and automated online judge.
            </p>

            <p className="text-sm sm:text-base text-[#6E6E6E] dark:text-[#94A3B8] font-medium leading-relaxed max-w-2xl mx-auto">
              ByteVerse empowers coders to battle in timed algorithmic contests, solve curated data structure challenges in C++, Python, Java, and C, receive real-time judge telemetry, and climb live ratings on the global leaderboard.
            </p>

            {/* Quick-Action Command Dock */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                href="/contest"
                className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-[#7F45DB] hover:bg-[#6D36C4] text-white font-technor font-bold text-sm sm:text-base uppercase tracking-wider border-2 border-[#1E1B4B] dark:border-[#A472F7] shadow-[3px_3px_0px_0px_#1E1B4B] sm:shadow-[4px_4px_0px_0px_#1E1B4B] dark:shadow-[3px_3px_0px_0px_#A472F7] hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
              >
                <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300" />
                <span>Enter Contest Arena</span>
              </Link>

              <Link
                href="/practice"
                className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-white dark:bg-[#16122C] text-[#0F172A] dark:text-white font-technor font-bold text-sm sm:text-base uppercase tracking-wider border-2 border-[#1E1B4B] dark:border-[#7F45DB] shadow-[3px_3px_0px_0px_#1E1B4B] sm:shadow-[4px_4px_0px_0px_#1E1B4B] dark:shadow-[3px_3px_0px_0px_#7F45DB] hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
              >
                <Code2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#7F45DB] dark:text-[#A472F7]" />
                <span>Practice Problems</span>
              </Link>

              <Link
                href="/event"
                className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-transparent text-[#0F172A] dark:text-white font-mono font-bold text-xs sm:text-sm uppercase tracking-wider border-2 border-[#1E1B4B]/30 dark:border-white/20 hover:border-[#7F45DB] dark:hover:border-[#A472F7] hover:bg-white/40 dark:hover:bg-white/5 transition-all"
              >
                <Calendar className="w-4 h-4" />
                <span>Event Timeline</span>
              </Link>
            </div>

            {/* Live Tournament Status Ribbon */}
            <div className="inline-flex flex-wrap items-center justify-center gap-3 sm:gap-5 px-4 sm:px-6 py-2 rounded-xl bg-white/60 dark:bg-[#111726]/80 border border-[#1E1B4B]/15 dark:border-[#7F45DB]/30 text-[11px] sm:text-xs font-mono font-bold text-[#64748B] dark:text-[#94A3B8]">
              <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                LIVE ARENA ACTIVE
              </span>
              <span className="hidden sm:inline text-[#CBD5E1] dark:text-[#334155]">|</span>
              <span className="inline-flex items-center gap-1.5 text-[#7F45DB] dark:text-[#A472F7]">
                <Zap className="w-3.5 h-3.5" />
                SUB-SECOND COMPILATION
              </span>
              <span className="hidden sm:inline text-[#CBD5E1] dark:text-[#334155]">|</span>
              <span className="inline-flex items-center gap-1.5 text-[#0F172A] dark:text-white">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                PROCTOR SENTINEL
              </span>
            </div>
          </div>
        </div>

        {/* 5. Detailed ByteVerse Platform Capabilities (Neo-Brutalist Grid) */}
        <div className="space-y-4 text-left">
          <div className="flex items-center gap-2.5 px-1">
            <div className="w-3 h-3 rounded-full bg-[#7F45DB]" />
            <h2 className="text-lg sm:text-2xl font-technor font-black text-[#0F172A] dark:text-white uppercase tracking-wide">
              The ByteVerse Platform Architecture
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Feature 1: Real-Time Contests (Codeforces CP Standard) */}
            <div className="bg-white dark:bg-[#111726] border-2 border-[#1E1B4B] dark:border-[#382F60] rounded-2xl p-5 shadow-[4px_4px_0px_0px_#1E1B4B] dark:shadow-[4px_4px_0px_0px_#382F60] hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex flex-col justify-between group">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-xl bg-[#0F172A] border-2 border-[#1E1B4B] dark:border-[#382F60] flex items-center justify-center shadow-[2px_2px_0px_0px_#1E1B4B] dark:shadow-[2px_2px_0px_0px_#382F60] group-hover:scale-105 transition-transform">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Codeforces Competitive Contests">
                      <path d="M4.5 7.5C5.328 7.5 6 8.172 6 9v10.5c0 .828-.672 1.5-1.5 1.5h-3C.673 21 0 20.328 0 19.5V9c0-.828.673-1.5 1.5-1.5h3z" fill="#EAB308" />
                      <path d="M13.5 3c.828 0 1.5.672 1.5 1.5v15c0 .828-.672 1.5-1.5 1.5h-3c-.827 0-1.5-.672-1.5-1.5v-15c0-.828.673-1.5 1.5-1.5h3z" fill="#3B82F6" />
                      <path d="M22.5 12c.828 0 1.5.672 1.5 1.5v7.5c0 .828-.672 1.5-1.5 1.5h-3c-.828 0-1.5-.672-1.5-1.5V12c0-.828.672-1.5 1.5-1.5h3z" fill="#EF4444" />
                    </svg>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-[#7F45DB] dark:text-[#A472F7] tracking-wider px-2 py-0.5 rounded bg-[#7F45DB]/10 dark:bg-[#7F45DB]/20 border border-[#7F45DB]/30">01 // ARENA</span>
                </div>
                <h3 className="font-technor font-black text-base text-[#0F172A] dark:text-white uppercase tracking-wide">
                  Rated Coding Contests
                </h3>
                <p className="text-xs text-[#6E6E6E] dark:text-[#94A3B8] leading-relaxed font-medium">
                  Compete in scheduled tournaments with live countdown clocks, strict time windows, weighted problem points, and dynamic tie-breaking.
                </p>
              </div>
              <div className="pt-3 border-t border-[#1E1B4B]/10 dark:border-[#2D2755] mt-3 flex items-center justify-between text-[11px] font-mono font-bold text-[#7F45DB] dark:text-[#A472F7]">
                <span>Automated Scoring</span>
                <span>Live Ranking</span>
              </div>
            </div>

            {/* Feature 2: High-Performance Judge0 Compiler */}
            <div className="bg-white dark:bg-[#111726] border-2 border-[#1E1B4B] dark:border-[#382F60] rounded-2xl p-5 shadow-[4px_4px_0px_0px_#1E1B4B] dark:shadow-[4px_4px_0px_0px_#382F60] hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex flex-col justify-between group">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-xl bg-[#0F172A] border-2 border-[#1E1B4B] dark:border-[#382F60] flex items-center justify-center shadow-[2px_2px_0px_0px_#1E1B4B] dark:shadow-[2px_2px_0px_0px_#382F60] group-hover:scale-105 transition-transform">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Judge0 Online Judge Compiler">
                      <rect x="2.5" y="2.5" width="19" height="19" rx="4" stroke="#10B981" strokeWidth="1.75" />
                      <path d="M6 1v1.5M12 1v1.5M18 1v1.5M6 21.5V23M12 21.5V23M18 21.5V23M1 6h1.5M1 12h1.5M1 18h1.5M21.5 6H23M21.5 12H23M21.5 18H23" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" />
                      <path d="M7 8.5l3.5 3.5L7 15.5" stroke="#34D399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M12.5 15.5H17" stroke="#34D399" strokeWidth="2" strokeLinecap="round" />
                      <circle cx="16" cy="8.5" r="1.5" fill="#10B981" className="animate-ping" />
                    </svg>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/30">02 // JUDGE0</span>
                </div>
                <h3 className="font-technor font-black text-base text-[#0F172A] dark:text-white uppercase tracking-wide">
                  Automated Online Judge
                </h3>
                <p className="text-xs text-[#6E6E6E] dark:text-[#94A3B8] leading-relaxed font-medium">
                  Sub-second compilation and sandboxed execution via Judge0 for C++, Python, Java, and C with comprehensive testcase validation and runtime profiling.
                </p>
              </div>
              <div className="pt-3 border-t border-[#1E1B4B]/10 dark:border-[#2D2755] mt-3 flex items-center justify-between text-[11px] font-mono font-bold text-[#0F172A] dark:text-white">
                <span>C, C++, Java, Python</span>
                <span>Memory & Time Limits</span>
              </div>
            </div>

            {/* Feature 3: Practice Problem Bank (LeetCode Standard) */}
            <div className="bg-white dark:bg-[#111726] border-2 border-[#1E1B4B] dark:border-[#382F60] rounded-2xl p-5 shadow-[4px_4px_0px_0px_#1E1B4B] dark:shadow-[4px_4px_0px_0px_#382F60] hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex flex-col justify-between group">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-xl bg-[#0F172A] border-2 border-[#1E1B4B] dark:border-[#382F60] flex items-center justify-center shadow-[2px_2px_0px_0px_#1E1B4B] dark:shadow-[2px_2px_0px_0px_#382F60] group-hover:scale-105 transition-transform">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="LeetCode Practice Problem Bank">
                      <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0z" fill="#FFA116" />
                      <path d="M10.617 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H20.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z" fill="#3B82F6" />
                    </svg>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 tracking-wider px-2 py-0.5 rounded bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/30">03 // PRACTICE</span>
                </div>
                <h3 className="font-technor font-black text-base text-[#0F172A] dark:text-white uppercase tracking-wide">
                  Curated Practice Arena
                </h3>
                <p className="text-xs text-[#6E6E6E] dark:text-[#94A3B8] leading-relaxed font-medium">
                  Filter by difficulty (Easy, Medium, Hard), explore fundamental algorithmic patterns, debug custom edge cases, and elevate your technical interview readiness.
                </p>
              </div>
              <div className="pt-3 border-t border-[#1E1B4B]/10 dark:border-[#2D2755] mt-3 flex items-center justify-between text-[11px] font-mono font-bold text-amber-700 dark:text-amber-400">
                <span>Monaco Editor</span>
                <span>Custom Inputs</span>
              </div>
            </div>

            {/* Feature 4: Real-time Projector Leaderboard */}
            <div className="bg-white dark:bg-[#111726] border-2 border-[#1E1B4B] dark:border-[#382F60] rounded-2xl p-5 shadow-[4px_4px_0px_0px_#1E1B4B] dark:shadow-[4px_4px_0px_0px_#382F60] hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex flex-col justify-between group">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-xl bg-[#0F172A] border-2 border-[#1E1B4B] dark:border-[#382F60] flex items-center justify-center shadow-[2px_2px_0px_0px_#1E1B4B] dark:shadow-[2px_2px_0px_0px_#382F60] group-hover:scale-105 transition-transform">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Live Projector & Scoreboard">
                      <rect x="2" y="3.5" width="20" height="13" rx="2.5" stroke="#F43F5E" strokeWidth="1.75" />
                      <rect x="5" y="10" width="3" height="4" rx="0.75" fill="#F43F5E" />
                      <rect x="10.5" y="7" width="3" height="7" rx="0.75" fill="#FB7185" />
                      <rect x="16" y="8.5" width="3" height="5.5" rx="0.75" fill="#E11D48" />
                      <path d="M7 20.5l4-4M17 20.5l-4-4M12 16.5v4" stroke="#F43F5E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="18.5" cy="6.5" r="1.25" fill="#EF4444" />
                    </svg>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-rose-600 dark:text-rose-400 tracking-wider px-2 py-0.5 rounded bg-rose-500/10 dark:bg-rose-500/20 border border-rose-500/30">04 // PROJECTOR</span>
                </div>
                <h3 className="font-technor font-black text-base text-[#0F172A] dark:text-white uppercase tracking-wide">
                  Global Leaderboard & Projector
                </h3>
                <p className="text-xs text-[#6E6E6E] dark:text-[#94A3B8] leading-relaxed font-medium">
                  Watch standings update in real-time as submissions clear test suites. Includes dedicated auditorium projector views for collegiate championships.
                </p>
              </div>
              <div className="pt-3 border-t border-[#1E1B4B]/10 dark:border-[#2D2755] mt-3 flex items-center justify-between text-[11px] font-mono font-bold text-rose-700 dark:text-rose-400">
                <span>Live Webhooks</span>
                <span>Projector Mode</span>
              </div>
            </div>

            {/* Feature 5: Socratic AI Hints & Diagnostics (Google Gemini) */}
            <div className="bg-white dark:bg-[#111726] border-2 border-[#1E1B4B] dark:border-[#382F60] rounded-2xl p-5 shadow-[4px_4px_0px_0px_#1E1B4B] dark:shadow-[4px_4px_0px_0px_#382F60] hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex flex-col justify-between group">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-xl bg-[#0F172A] border-2 border-[#1E1B4B] dark:border-[#382F60] flex items-center justify-center shadow-[2px_2px_0px_0px_#1E1B4B] dark:shadow-[2px_2px_0px_0px_#382F60] group-hover:scale-105 transition-transform">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Google Gemini AI Diagnostics">
                      <defs>
                        <linearGradient id="geminiStarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#1BA1E3" />
                          <stop offset="35%" stopColor="#6366F1" />
                          <stop offset="70%" stopColor="#A855F7" />
                          <stop offset="100%" stopColor="#EC4899" />
                        </linearGradient>
                      </defs>
                      <path d="M11.04 19.32Q12 21.51 12 24q0-2.49.93-4.68.96-2.19 2.58-3.81t3.81-2.55Q21.51 12 24 12q-2.49 0-4.68-.93a12.3 12.3 0 0 1-3.81-2.58 12.3 12.3 0 0 1-2.58-3.81Q12 2.49 12 0q0 2.49-.96 4.68-.93 2.19-2.55 3.81a12.3 12.3 0 0 1-3.81 2.58Q2.49 12 0 12q2.49 0 4.68.96 2.19.93 3.81 2.55t2.55 3.81" fill="url(#geminiStarGrad)" />
                    </svg>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-purple-600 dark:text-purple-400 tracking-wider px-2 py-0.5 rounded bg-purple-500/10 dark:bg-purple-500/20 border border-purple-500/30">05 // GEMINI AI</span>
                </div>
                <h3 className="font-technor font-black text-base text-[#0F172A] dark:text-white uppercase tracking-wide">
                  AI Code Diagnostics
                </h3>
                <p className="text-xs text-[#6E6E6E] dark:text-[#94A3B8] leading-relaxed font-medium">
                  Built-in AI Assistant offers socratic guidance, algorithmic hint tiers, and complexity estimation without spoiling contest solutions.
                </p>
              </div>
              <div className="pt-3 border-t border-[#1E1B4B]/10 dark:border-[#2D2755] mt-3 flex items-center justify-between text-[11px] font-mono font-bold text-[#7F45DB] dark:text-[#C084FC]">
                <span>Hint Progression</span>
                <span>Complexity Analysis</span>
              </div>
            </div>

            {/* Feature 6: Integrity & Proctor Shield */}
            <div className="bg-white dark:bg-[#111726] border-2 border-[#1E1B4B] dark:border-[#382F60] rounded-2xl p-5 shadow-[4px_4px_0px_0px_#1E1B4B] dark:shadow-[4px_4px_0px_0px_#382F60] hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex flex-col justify-between group">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-xl bg-[#0F172A] border-2 border-[#1E1B4B] dark:border-[#382F60] flex items-center justify-center shadow-[2px_2px_0px_0px_#1E1B4B] dark:shadow-[2px_2px_0px_0px_#382F60] group-hover:scale-105 transition-transform">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Anti-Cheat & Proctoring Sentinel">
                      <defs>
                        <linearGradient id="proctorShieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#3B82F6" />
                          <stop offset="100%" stopColor="#10B981" />
                        </linearGradient>
                      </defs>
                      <path d="M12 2L4 5.5v6.2c0 5.2 3.4 10.1 8 11.3 4.6-1.2 8-6.1 8-11.3V5.5L12 2z" stroke="url(#proctorShieldGrad)" strokeWidth="1.75" strokeLinejoin="round" fill="#1E293B" fillOpacity="0.5" />
                      <rect x="9" y="10.5" width="6" height="5" rx="1.5" stroke="#60A5FA" strokeWidth="1.5" fill="#0F172A" />
                      <path d="M10 10.5V8.75a2 2 0 0 1 4 0v1.75" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" />
                      <circle cx="12" cy="13" r="0.75" fill="#34D399" />
                    </svg>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 tracking-wider px-2 py-0.5 rounded bg-blue-500/10 dark:bg-blue-500/20 border border-blue-500/30">06 // SENTINEL</span>
                </div>
                <h3 className="font-technor font-black text-base text-[#0F172A] dark:text-white uppercase tracking-wide">
                  Fair Play & Proctoring
                </h3>
                <p className="text-xs text-[#6E6E6E] dark:text-[#94A3B8] leading-relaxed font-medium">
                  State-of-the-art proctoring safeguards, anti-tamper clipboard protection, tab change tracking, and audit logging ensure fair competition.
                </p>
              </div>
              <div className="pt-3 border-t border-[#1E1B4B]/10 dark:border-[#2D2755] mt-3 flex items-center justify-between text-[11px] font-mono font-bold text-blue-700 dark:text-blue-400">
                <span>Anti-Cheat Guard</span>
                <span>Admin Audit Logs</span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4.2: Active Contest Card */}
        <HomeActiveContest />

        {/* SECTION 4.1: Active Contest Leaderboard */}
        <HomeContestLeaderboard />

        {/* Platform Technology Bar */}
        <div className="bg-white dark:bg-[#111726] border-2 border-[#1E1B4B] dark:border-[#382F60] rounded-2xl p-6 shadow-[5px_5px_0px_0px_#1E1B4B] dark:shadow-[5px_5px_0px_0px_#382F60] text-left">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 text-left">
            <div className="space-y-1">
              <div className="text-[10px] sm:text-[11px] font-mono uppercase text-[#6E6E6E] dark:text-[#94A3B8] font-bold tracking-wider">
                Platform Arena
              </div>
              <div className="text-base sm:text-lg font-technor font-black text-[#0F172A] dark:text-white">
                ByteVerse 2026
              </div>
              <div className="text-[10px] font-mono text-[#7F45DB] dark:text-[#A472F7]">
                Collegiate CP Arena
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-[10px] sm:text-[11px] font-mono uppercase text-[#6E6E6E] dark:text-[#94A3B8] font-bold tracking-wider">
                Supported Compilers
              </div>
              <div className="text-base sm:text-lg font-technor font-black text-[#7F45DB] dark:text-[#A472F7]">
                C, C++, Java, Python
              </div>
              <div className="text-[10px] font-mono text-[#6E6E6E] dark:text-[#94A3B8]">
                GCC 14 · Py3 · OpenJDK 21
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-[10px] sm:text-[11px] font-mono uppercase text-[#6E6E6E] dark:text-[#94A3B8] font-bold tracking-wider">
                Judge Engine
              </div>
              <div className="text-base sm:text-lg font-technor font-black text-emerald-600 dark:text-emerald-400">
                Judge0 Sandbox
              </div>
              <div className="text-[10px] font-mono text-[#6E6E6E] dark:text-[#94A3B8]">
                Sub-Second Latency (&lt;450ms)
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-[10px] sm:text-[11px] font-mono uppercase text-[#6E6E6E] dark:text-[#94A3B8] font-bold tracking-wider">
                Integrity Shield
              </div>
              <div className="text-base sm:text-lg font-technor font-black text-blue-600 dark:text-blue-400">
                Proctor Sentinel
              </div>
              <div className="text-[10px] font-mono text-[#6E6E6E] dark:text-[#94A3B8]">
                Anti-Cheat &amp; Audit Logs
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4.3: Most Used Languages Platform Telemetry */}
        <HomeLanguageStats />
      </div>
    </main>
  );
}
