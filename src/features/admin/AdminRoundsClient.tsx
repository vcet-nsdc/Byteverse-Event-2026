"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Play, Pause, Square, FileEdit, Clock, Calendar, CheckCircle2 } from "lucide-react";

interface Round {
  id: string;
  name: string;
  type: string;
  status: string;
  sequence: number;
  durationMin: number;
  startsAt: string | null;
  endsAt: string | null;
  _count?: { problems: number };
}

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "text-[#6E6E6E] border-[#8A8A8A]/40 bg-[#F0F2F8]",
  SCHEDULED: "text-blue-600 border-blue-400/40 bg-blue-50",
  ACTIVE: "text-[#7F45DB] border-[#7F45DB]/40 bg-[#7F45DB]/10",
  PAUSED: "text-amber-600 border-amber-400/40 bg-amber-50",
  ENDED: "text-destructive border-destructive/30 bg-destructive/5",
};

const FIXED_EVENT_SCHEDULE = [
  { sequence: 1, label: "12:00 PM – 12:20 PM", durationMin: 20 },
  { sequence: 2, label: "12:25 PM – 12:50 PM", durationMin: 25 },
  { sequence: 3, label: "12:55 PM – 01:30 PM", durationMin: 35 },
  { sequence: 4, label: "01:35 PM – 02:20 PM", durationMin: 45 },
  { sequence: 5, label: "02:25 PM – 03:00 PM", durationMin: 35 },
] as const;

function getScheduleForRound(sequence: number) {
  return FIXED_EVENT_SCHEDULE.find((entry) => entry.sequence === sequence) ?? null;
}

export default function AdminRoundsClient() {
  const [rounds, setRounds] = useState<Round[]>([]);
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState<string | null>(null);

  const fetchRounds = async () => {
    try {
      const res = await fetch(`/api/admin/rounds`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      setRounds(list);
    } catch {
      setRounds([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRounds();
    const interval = setInterval(fetchRounds, 3000);
    return () => clearInterval(interval);
  }, []);

  const setStatus = async (id: string, status: string) => {
    setWorkingId(id);
    try {
      await fetch(`/api/admin/rounds/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      await fetchRounds();
    } finally {
      setWorkingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-[#7F45DB] font-mono text-sm">
        Loading Round Control...
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-[#0F172A] tracking-tight font-display">
            Round Control
          </h1>
          <p className="text-xs text-[#6E6E6E] mt-1 font-mono">
            Manual launch, live pause/resume, and question management for all 5 rounds
          </p>
        </div>
      </div>

      {/* Official Schedule Banner */}
      <div className="bg-white p-5 rounded-2xl border-2 border-[#1E1B4B] shadow-[4px_4px_0px_0px_#1E1B4B]">
        <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#7F45DB] mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4" /> Official Event Timeline (September 3, 2026)
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs font-mono">
          {FIXED_EVENT_SCHEDULE.map((slot) => (
            <div
              key={slot.sequence}
              className="rounded-xl border border-[#E2E8F0] bg-[#F8F9FD] p-3 space-y-1"
            >
              <div className="font-bold text-[#0F172A]">Round {slot.sequence}</div>
              <div className="text-[#7F45DB] font-bold">{slot.label}</div>
              <div className="text-[#6E6E6E]">{slot.durationMin} mins duration</div>
            </div>
          ))}
        </div>
      </div>

      {/* 5 Rounds List */}
      <div className="space-y-4">
        {rounds.map((round) => {
          const fixedSlot = getScheduleForRound(round.sequence);
          const isWorking = workingId === round.id;
          const isDraft = round.status === "DRAFT" || round.status === "SCHEDULED";
          const isActive = round.status === "ACTIVE";
          const isPaused = round.status === "PAUSED";
          const isEnded = round.status === "ENDED";

          return (
            <div
              key={round.id}
              className={`bg-white p-6 rounded-2xl border-2 border-[#1E1B4B] transition-all ${
                isActive
                  ? "shadow-[5px_5px_0px_0px_#7F45DB] bg-[#7F45DB]/5"
                  : isPaused
                  ? "shadow-[5px_5px_0px_0px_#F59E0B] bg-amber-50"
                  : "shadow-[4px_4px_0px_0px_#1E1B4B]"
              }`}
            >
              <div className="flex items-start justify-between gap-6 flex-wrap">
                {/* Left: Round Info */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-white font-mono font-black text-xs px-2.5 py-1 rounded-lg bg-[#7F45DB] border border-[#1E1B4B]">
                      Round {round.sequence}
                    </span>
                    <h3 className="font-display font-bold text-[#0F172A] text-xl">
                      {round.name}
                    </h3>
                    <span
                      className={`text-xs font-mono font-bold uppercase px-3 py-0.5 rounded-full border ${
                        STATUS_COLORS[round.status] ?? "text-muted-foreground"
                      }`}
                    >
                      {round.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono text-[#6E6E6E]">
                    <span className="flex items-center gap-1 text-[#0F172A] font-bold">
                      <Clock className="w-3.5 h-3.5 text-[#7F45DB]" /> Fixed Duration:{" "}
                      <span className="font-bold text-[#7F45DB]">{round.durationMin} mins</span>
                    </span>
                    <span>•</span>
                    <span>Type: {round.type}</span>
                    <span>•</span>
                    <span>Problems: {round._count?.problems ?? 0}</span>
                  </div>

                  {fixedSlot && (
                    <div className="text-xs text-[#6E6E6E] font-mono">
                      Official Slot: <span className="text-[#0F172A] font-semibold">{fixedSlot.label}</span>
                    </div>
                  )}

                  {round.startsAt && (
                    <div className="text-xs text-[#6E6E6E] font-mono">
                      Started: {new Date(round.startsAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      {round.endsAt &&
                        ` · Scheduled End: ${new Date(round.endsAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
                    </div>
                  )}
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-3 flex-wrap">
                  {/* START ROUND BUTTON */}
                  {isDraft && (
                    <button
                      onClick={() => setStatus(round.id, "ACTIVE")}
                      disabled={isWorking}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#7F45DB] hover:bg-[#6D35C7] text-white font-mono font-black text-xs border-2 border-[#1E1B4B] shadow-[3px_3px_0px_0px_#1E1B4B] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_#1E1B4B] transition-all disabled:opacity-50 cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      <span>Start Round</span>
                    </button>
                  )}

                  {/* PAUSE BUTTON (When Active) */}
                  {isActive && (
                    <>
                      <button
                        onClick={() => setStatus(round.id, "PAUSED")}
                        disabled={isWorking}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-black font-mono font-black text-xs border-2 border-[#1E1B4B] shadow-[3px_3px_0px_0px_#1E1B4B] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_#1E1B4B] transition-all disabled:opacity-50 cursor-pointer"
                      >
                        <Pause className="w-4 h-4 fill-black" />
                        <span>Pause Round</span>
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to END Round ${round.sequence}? Participants will no longer be able to submit.`)) {
                            setStatus(round.id, "ENDED");
                          }
                        }}
                        disabled={isWorking}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border-2 border-destructive bg-destructive/10 text-destructive hover:bg-destructive/20 font-mono font-bold text-xs transition-all disabled:opacity-50 cursor-pointer"
                      >
                        <Square className="w-3.5 h-3.5" />
                        <span>End</span>
                      </button>
                    </>
                  )}

                  {/* RESUME BUTTON (When Paused) */}
                  {isPaused && (
                    <>
                      <button
                        onClick={() => setStatus(round.id, "ACTIVE")}
                        disabled={isWorking}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#7F45DB] hover:bg-[#6D35C7] text-white font-mono font-black text-xs border-2 border-[#1E1B4B] shadow-[3px_3px_0px_0px_#1E1B4B] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_#1E1B4B] transition-all disabled:opacity-50 cursor-pointer"
                      >
                        <Play className="w-4 h-4 fill-white" />
                        <span>Resume Round</span>
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to END Round ${round.sequence}?`)) {
                            setStatus(round.id, "ENDED");
                          }
                        }}
                        disabled={isWorking}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border-2 border-destructive bg-destructive/10 text-destructive hover:bg-destructive/20 font-mono font-bold text-xs transition-all disabled:opacity-50 cursor-pointer"
                      >
                        <Square className="w-3.5 h-3.5" />
                        <span>End</span>
                      </button>
                    </>
                  )}

                  {/* ENDED STATE */}
                  {isEnded && (
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F0F2F8] text-[#6E6E6E] font-mono text-xs font-bold border border-[#E2E8F0]">
                        <CheckCircle2 className="w-4 h-4 text-[#7F45DB]" /> Completed
                      </span>
                      <button
                        onClick={() => {
                          if (confirm(`Reopen Round ${round.sequence} to ACTIVE state?`)) {
                            setStatus(round.id, "ACTIVE");
                          }
                        }}
                        className="text-xs text-[#7F45DB] hover:underline font-mono ml-1 cursor-pointer"
                      >
                        Restart
                      </button>
                    </div>
                  )}

                  {/* MANAGE QUESTIONS BUTTON */}
                  <Link
                    href={`/admin/rounds/${round.id}/problems`}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border-2 border-[#1E1B4B] text-[#0F172A] hover:bg-[#F0F2F8] font-mono font-bold text-xs bg-white shadow-[3px_3px_0px_0px_#1E1B4B] hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
                  >
                    <FileEdit className="w-3.5 h-3.5 text-[#7F45DB]" />
                    <span>Manage Questions</span>
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
