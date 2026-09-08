"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Trophy, Clock, Users, ArrowRight, Sparkles, BookOpen, AlertCircle } from "lucide-react";

interface Contest {
  id: string;
  title: string;
  description: string | null;
  status: string;
  startsAt: string;
  endsAt: string;
  problemCount: number;
  participantCount: number;
  difficulty?: string;
  isRegistered?: boolean;
}

export default function HomeActiveContest() {
  const [activeContest, setActiveContest] = useState<Contest | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    async function loadContest() {
      try {
        const res = await fetch("/api/contests");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.active) && data.active.length > 0) {
            setActiveContest(data.active[0]);
          }
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    loadContest();
  }, []);

  // Countdown ticker
  useEffect(() => {
    if (!activeContest) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(activeContest.endsAt).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft(null);
        clearInterval(timer);
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [activeContest]);

  return (
    <div className="bg-white border-2 border-[#1E1B4B] rounded-2xl p-6 sm:p-8 shadow-[5px_5px_0px_0px_#1E1B4B] text-left transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-[#1E1B4B]/10 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#7F45DB] text-white flex items-center justify-center border-2 border-[#1E1B4B] shadow-[2px_2px_0px_0px_#1E1B4B]">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-mono font-black tracking-widest text-[#7F45DB] uppercase">
                ACTIVE CONTEST
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-display font-black text-[#0F172A]">
              {activeContest ? activeContest.title : "Live Competitive Arena"}
            </h2>
          </div>
        </div>

        {timeLeft && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 border-2 border-[#1E1B4B] shadow-[2px_2px_0px_0px_#1E1B4B]">
            <Clock className="w-4 h-4 text-amber-600 animate-spin" style={{ animationDuration: "10s" }} />
            <span className="text-xs font-mono font-black text-[#0F172A]">
              ENDS IN: {String(timeLeft.hours).padStart(2, "0")}:{String(timeLeft.minutes).padStart(2, "0")}:{String(timeLeft.seconds).padStart(2, "0")}
            </span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="py-8 text-center font-mono text-sm text-[#6E6E6E] animate-pulse">
          Loading live contest telemetry...
        </div>
      ) : activeContest ? (
        <div className="space-y-6">
          <p className="text-sm sm:text-base text-[#6E6E6E] font-medium leading-relaxed">
            {activeContest.description || "Tackle algorithmic problems under timed constraints and climb the live scoreboard."}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3.5 rounded-xl bg-[#F8F9FD] border-2 border-[#1E1B4B]">
              <span className="text-[10px] font-mono font-bold text-[#6E6E6E] uppercase block">Problems</span>
              <div className="text-lg font-mono font-black text-[#0F172A] flex items-center gap-1.5 mt-0.5">
                <BookOpen className="w-4 h-4 text-[#7F45DB]" />
                <span>{activeContest.problemCount} Tasks</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F8F9FD] border-2 border-[#1E1B4B]">
              <span className="text-[10px] font-mono font-bold text-[#6E6E6E] uppercase block">Participants</span>
              <div className="text-lg font-mono font-black text-[#0F172A] flex items-center gap-1.5 mt-0.5">
                <Users className="w-4 h-4 text-[#7F45DB]" />
                <span>{activeContest.participantCount} Coders</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F8F9FD] border-2 border-[#1E1B4B]">
              <span className="text-[10px] font-mono font-bold text-[#6E6E6E] uppercase block">Difficulty</span>
              <div className="text-lg font-mono font-black text-[#7F45DB] mt-0.5">
                {activeContest.difficulty || "Mixed"}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F8F9FD] border-2 border-[#1E1B4B]">
              <span className="text-[10px] font-mono font-bold text-[#6E6E6E] uppercase block">Format</span>
              <div className="text-lg font-mono font-black text-emerald-600 mt-0.5">
                Standard ICPC
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="text-xs font-mono text-[#6E6E6E]">
              Window: <span className="font-bold text-[#0F172A]">{new Date(activeContest.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(activeContest.endsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>

            <Link
              href={`/contest/${activeContest.id}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#7F45DB] text-white font-mono font-black text-xs uppercase tracking-wider border-2 border-[#1E1B4B] shadow-[4px_4px_0px_0px_#1E1B4B] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_#1E1B4B] transition-all"
            >
              <span>Enter Active Contest</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="py-8 text-center space-y-3">
          <div className="inline-flex p-3 rounded-2xl bg-amber-50 text-amber-700 border-2 border-[#1E1B4B] shadow-[2px_2px_0px_0px_#1E1B4B]">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#0F172A]">No contest actively in progress</h3>
          <p className="text-xs font-mono text-[#6E6E6E] max-w-md mx-auto">
            Weekly Contest 101 and the ByteVerse Speed Duels will go live soon. In the meantime, hone your skills in the Practice Arena!
          </p>
          <div className="pt-2">
            <Link
              href="/practice"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border-2 border-[#1E1B4B] shadow-[3px_3px_0px_0px_#1E1B4B] font-mono font-bold text-xs uppercase text-[#7F45DB] hover:bg-[#F0F2F8]"
            >
              <span>Explore Practice Problems</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
