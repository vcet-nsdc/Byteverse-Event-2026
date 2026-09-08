import Image from "next/image";
import HomeActiveContest from "@/components/home/HomeActiveContest";
import HomeContestLeaderboard from "@/components/home/HomeContestLeaderboard";
import HomeLanguageStats from "@/components/home/HomeLanguageStats";

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center relative overflow-hidden bg-[#F8F9FD] text-[#0F172A] px-4 py-8 md:py-12 font-sans">
      {/* Soft Ambient Purple Gradients */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-[#7F45DB]/8 blur-[160px] pointer-events-none rounded-full" />
      <div className="fixed bottom-0 right-1/4 w-[800px] h-[300px] bg-[#A472F7]/10 blur-[140px] pointer-events-none rounded-full" />

      {/* Floating Language Badges — Java, C, C++, Python */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-24 left-[6%] opacity-70 hover:opacity-100 transition-opacity animate-float">
          <div className="w-16 h-16 rounded-2xl bg-white border-2 border-[#1E1B4B] shadow-[4px_4px_0px_0px_#1E1B4B] flex items-center justify-center font-mono font-black text-base text-[#7F45DB]">
            Java
          </div>
        </div>

        <div className="absolute top-32 right-[8%] opacity-70 hover:opacity-100 transition-opacity animate-float" style={{ animationDelay: "1.5s" }}>
          <div className="w-14 h-14 rounded-2xl bg-white border-2 border-[#1E1B4B] shadow-[4px_4px_0px_0px_#1E1B4B] flex items-center justify-center font-mono font-black text-base text-[#4A2293]">
            C
          </div>
        </div>

        <div className="absolute bottom-36 left-[8%] opacity-70 hover:opacity-100 transition-opacity animate-float" style={{ animationDelay: "3s" }}>
          <div className="w-16 h-16 rounded-2xl bg-white border-2 border-[#1E1B4B] shadow-[4px_4px_0px_0px_#1E1B4B] flex items-center justify-center font-mono font-black text-base text-[#7F45DB]">
            C++
          </div>
        </div>

        <div className="absolute bottom-44 right-[10%] opacity-70 hover:opacity-100 transition-opacity animate-float" style={{ animationDelay: "2s" }}>
          <div className="w-16 h-16 rounded-2xl bg-white border-2 border-[#1E1B4B] shadow-[4px_4px_0px_0px_#1E1B4B] flex items-center justify-center font-mono font-black text-base text-[#4A2293]">
            Python
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="relative z-10 text-center max-w-4xl mx-auto space-y-8 w-full">

        {/* 1. Large NSDC Committee Logo on High-Contrast Dark Card */}
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="relative w-64 sm:w-72 md:w-80 h-[85px] sm:h-[100px] md:h-[115px] rounded-2xl bg-[#0F172A] border-3 border-[#1E1B4B] shadow-[6px_6px_0px_0px_#1E1B4B] px-5 py-3 flex items-center justify-center hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[4px_4px_0px_0px_#1E1B4B] transition-all overflow-hidden">
            <Image
              src="/assets/nsdc-logo.png"
              alt="NSDC Committee Logo"
              width={260}
              height={90}
              className="object-contain w-full h-full drop-shadow-sm"
              priority
            />
          </div>

          {/* 2. NSDC Presents Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full border-2 border-[#1E1B4B] bg-white text-[#0F172A] text-xs sm:text-sm font-mono font-black uppercase tracking-widest shadow-[3px_3px_0px_0px_#1E1B4B]">
            <span className="w-2 h-2 rounded-full bg-[#7F45DB] animate-pulse" />
            <span>NSDC PRESENTS</span>
          </div>
        </div>

        {/* 3. ByteVerse Event Title Artwork */}
        <div className="space-y-6">
          <div className="relative max-w-2xl w-full mx-auto p-4 sm:p-6 bg-white border-3 border-[#1E1B4B] rounded-3xl shadow-[8px_8px_0px_0px_#1E1B4B] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[6px_6px_0px_0px_#1E1B4B] transition-all overflow-hidden flex items-center justify-center">
            {/* Subtle background glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#7F45DB]/5 via-amber-400/5 to-[#7F45DB]/5 pointer-events-none" />
            <div className="relative w-full h-[140px] sm:h-[180px] md:h-[210px] flex items-center justify-center overflow-hidden">
              <Image
                src="/assets/byteverse-title.png"
                alt="ByteVerse 2026 Title"
                fill
                className="object-contain object-center drop-shadow-md scale-[2.7] sm:scale-[3.0] md:scale-[3.3]"
                priority
              />
            </div>
          </div>

          {/* 4. THINK • CODE • ADAPT Tagline */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-2xl bg-[#7F45DB] text-white border-2 border-[#1E1B4B] shadow-[4px_4px_0px_0px_#1E1B4B]">
              <span className="font-display font-black text-xl sm:text-2xl md:text-3xl tracking-wider uppercase">
                THINK <span className="text-amber-300">·</span> CODE <span className="text-amber-300">·</span> ADAPT
              </span>
            </div>

            <p className="text-sm sm:text-base md:text-lg text-[#6E6E6E] max-w-2xl mx-auto font-medium leading-relaxed">
              Ready to put your coding skills to the test? Welcome to our official college coding tournament! Team up with a partner to tackle tough algorithmic puzzles, optimize AI models, and debug complex logic on the fly. The clock is ticking, the arena timer is perfectly synced, and every single second counts.
            </p>
          </div>
        </div>

        {/* SECTION 4.2: Active Contest Card */}
        <HomeActiveContest />

        {/* SECTION 4.1: Active Contest Leaderboard */}
        <HomeContestLeaderboard />

        {/* Contest Info Header Bar (Neo-Brutalism Card) */}
        <div className="bg-white border-2 border-[#1E1B4B] rounded-2xl p-6 shadow-[5px_5px_0px_0px_#1E1B4B] text-left">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left">
            <div>
              <div className="text-[11px] font-mono uppercase text-[#6E6E6E] font-bold">Tournament Format</div>
              <div className="text-lg font-bold text-[#0F172A] font-mono">5 Competitive Rounds</div>
            </div>
            <div>
              <div className="text-[11px] font-mono uppercase text-[#6E6E6E] font-bold">Team Size</div>
              <div className="text-lg font-bold text-[#0F172A] font-mono">2 Members / Team</div>
            </div>
            <div>
              <div className="text-[11px] font-mono uppercase text-[#6E6E6E] font-bold">Languages</div>
              <div className="text-lg font-mono font-black text-[#7F45DB]">C, C++, Java, Python</div>
            </div>
          </div>
        </div>

        {/* SECTION 4.3: Most Used Languages Platform Telemetry */}
        <HomeLanguageStats />
      </div>
    </main>
  );
}
