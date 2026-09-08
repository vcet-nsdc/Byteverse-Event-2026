"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Search,
  BookOpen,
  CheckCircle2,
  Filter,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Tag,
  Flame,
  Check,
} from "lucide-react";

interface ProblemItem {
  id: string;
  title: string;
  difficulty: string;
  tags: string[];
  acceptanceRate: string;
  isSolved: boolean;
  totalSubmissions: number;
}

export default function PracticePage() {
  const [problems, setProblems] = useState<ProblemItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [difficulty, setDifficulty] = useState<string>("All");
  const [tag, setTag] = useState<string>("All");
  const [status, setStatus] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  const fetchProblems = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (difficulty !== "All") params.set("difficulty", difficulty);
      if (tag !== "All") params.set("tag", tag);
      if (status !== "all") params.set("status", status);
      if (search.trim()) params.set("search", search.trim());
      params.set("page", page.toString());
      params.set("limit", "15");

      const res = await fetch(`/api/problems?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProblems(data.problems || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
        if (data.tags) setAvailableTags(data.tags);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [difficulty, tag, status, search, page]);

  useEffect(() => {
    fetchProblems();
  }, [fetchProblems]);

  const handleDifficultyChange = (d: string) => {
    setDifficulty(d);
    setPage(1);
  };

  const handleTagChange = (t: string) => {
    setTag(t);
    setPage(1);
  };

  const handleStatusChange = (s: string) => {
    setStatus(s);
    setPage(1);
  };

  return (
    <main className="min-h-screen bg-[#F8F9FD] text-[#0F172A] py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white border-2 border-[#1E1B4B] rounded-3xl p-6 sm:p-10 shadow-[6px_6px_0px_0px_#1E1B4B] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#7F45DB]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7F45DB]/10 text-[#7F45DB] border border-[#7F45DB]/30 text-xs font-mono font-black uppercase tracking-wider">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Practice Arena</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-display font-black text-[#0F172A] tracking-tight">
              Problem Library
            </h1>
            <p className="text-sm sm:text-base text-[#6E6E6E] font-medium leading-relaxed">
              Master classical algorithmic problems, data structures, and optimization patterns. Practice in C, C++, Java, or Python with instant Judge0 test evaluation.
            </p>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white border-2 border-[#1E1B4B] rounded-2xl p-5 shadow-[4px_4px_0px_0px_#1E1B4B] space-y-4">
          {/* Top row: Search input + Status Filter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#6E6E6E] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search problem title or keywords..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#F8F9FD] border-2 border-[#1E1B4B]/20 text-xs font-mono font-medium text-[#0F172A] placeholder:text-[#6E6E6E] focus:outline-none focus:border-[#7F45DB]"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1 bg-[#F8F9FD] p-1 rounded-xl border border-[#1E1B4B]/20">
              {[
                { key: "all", label: "All" },
                { key: "solved", label: "Solved" },
                { key: "unsolved", label: "Unsolved" },
              ].map((s) => (
                <button
                  key={s.key}
                  onClick={() => handleStatusChange(s.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                    status === s.key
                      ? "bg-[#7F45DB] text-white font-black"
                      : "text-[#6E6E6E] hover:text-[#0F172A]"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Filter Pills */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#1E1B4B]/10">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-mono text-[#6E6E6E] uppercase font-bold mr-1">
                Difficulty:
              </span>
              {["All", "Easy", "Medium", "Hard"].map((d) => (
                <button
                  key={d}
                  onClick={() => handleDifficultyChange(d)}
                  className={`px-3 py-1 rounded-xl text-xs font-mono font-bold border-2 transition-all ${
                    difficulty === d
                      ? d === "Easy"
                        ? "bg-emerald-500 text-white border-[#1E1B4B] shadow-[2px_2px_0px_0px_#1E1B4B]"
                        : d === "Medium"
                        ? "bg-amber-500 text-white border-[#1E1B4B] shadow-[2px_2px_0px_0px_#1E1B4B]"
                        : d === "Hard"
                        ? "bg-rose-500 text-white border-[#1E1B4B] shadow-[2px_2px_0px_0px_#1E1B4B]"
                        : "bg-[#7F45DB] text-white border-[#1E1B4B] shadow-[2px_2px_0px_0px_#1E1B4B]"
                      : "bg-white text-[#6E6E6E] border-[#1E1B4B]/20 hover:border-[#1E1B4B] hover:text-[#0F172A]"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>

            {/* Topic Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-mono text-[#6E6E6E] uppercase font-bold mr-1">
                Topic:
              </span>
              <button
                onClick={() => handleTagChange("All")}
                className={`px-2.5 py-0.5 rounded-lg text-[11px] font-mono border ${
                  tag === "All"
                    ? "bg-[#0F172A] text-white border-[#0F172A] font-bold"
                    : "bg-[#F8F9FD] text-[#6E6E6E] border-[#1E1B4B]/15 hover:text-[#0F172A]"
                }`}
              >
                All
              </button>
              {availableTags.slice(0, 5).map((t) => (
                <button
                  key={t}
                  onClick={() => handleTagChange(t)}
                  className={`px-2.5 py-0.5 rounded-lg text-[11px] font-mono border ${
                    tag === t
                      ? "bg-[#7F45DB] text-white border-[#7F45DB] font-bold"
                      : "bg-[#F8F9FD] text-[#6E6E6E] border-[#1E1B4B]/15 hover:text-[#0F172A]"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Problems Table */}
        <div className="bg-white border-2 border-[#1E1B4B] rounded-3xl p-6 shadow-[5px_5px_0px_0px_#1E1B4B]">
          {loading ? (
            <div className="py-16 text-center font-mono text-sm text-[#6E6E6E] animate-pulse">
              Retrieving problem repository...
            </div>
          ) : problems.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b-2 border-[#1E1B4B] text-[#6E6E6E] uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-3 font-black w-12 text-center">Status</th>
                    <th className="py-3 px-4 font-black">Title</th>
                    <th className="py-3 px-3 font-black hidden sm:table-cell">Topics</th>
                    <th className="py-3 px-3 font-black">Difficulty</th>
                    <th className="py-3 px-3 font-black text-right">Acceptance</th>
                    <th className="py-3 px-3 font-black text-right w-24">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E1B4B]/10">
                  {problems.map((prob) => {
                    const diffColor =
                      prob.difficulty === "Easy"
                        ? "text-emerald-700 bg-emerald-50 border-emerald-300"
                        : prob.difficulty === "Hard"
                        ? "text-rose-700 bg-rose-50 border-rose-300"
                        : "text-amber-700 bg-amber-50 border-amber-300";

                    return (
                      <tr
                        key={prob.id}
                        className="hover:bg-[#F8F9FD] transition-colors group"
                      >
                        <td className="py-3 px-3 text-center">
                          {prob.isSolved ? (
                            <div className="w-5 h-5 rounded-full bg-emerald-100 border border-emerald-400 text-emerald-700 flex items-center justify-center mx-auto">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          ) : (
                            <span className="text-[#6E6E6E]/40 text-sm">—</span>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <Link
                            href={`/practice/${prob.id}`}
                            className="font-bold text-[#0F172A] group-hover:text-[#7F45DB] transition-colors text-sm"
                          >
                            {prob.title}
                          </Link>
                        </td>

                        <td className="py-3 px-3 hidden sm:table-cell">
                          <div className="flex flex-wrap gap-1">
                            {prob.tags.slice(0, 2).map((t) => (
                              <span
                                key={t}
                                className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F8F9FD] text-[#6E6E6E] border border-[#1E1B4B]/10"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${diffColor}`}
                          >
                            {prob.difficulty}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-right font-black text-[#0F172A]">
                          {prob.acceptanceRate}
                        </td>

                        <td className="py-3 px-3 text-right">
                          <Link
                            href={`/practice/${prob.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white text-[#7F45DB] border-2 border-[#1E1B4B] shadow-[2px_2px_0px_0px_#1E1B4B] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none hover:bg-[#7F45DB] hover:text-white transition-all text-[11px] font-bold uppercase"
                          >
                            <span>Solve</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-16 text-center space-y-3">
              <BookOpen className="w-10 h-10 text-[#7F45DB] mx-auto" />
              <h3 className="text-base font-black text-[#0F172A]">No problems matched your filter criteria</h3>
              <p className="text-xs font-mono text-[#6E6E6E]">Try clearing the search query or switching the difficulty filter.</p>
              <button
                onClick={() => {
                  setDifficulty("All");
                  setTag("All");
                  setStatus("all");
                  setSearch("");
                }}
                className="px-4 py-2 rounded-xl bg-[#7F45DB] text-white text-xs font-mono font-bold uppercase border-2 border-[#1E1B4B] shadow-[2px_2px_0px_0px_#1E1B4B]"
              >
                Reset Filters
              </button>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t-2 border-[#1E1B4B]/10 pt-4 mt-4 font-mono text-xs">
              <span className="text-[#6E6E6E]">
                Showing {problems.length} of {total} problems
              </span>

              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="p-2 rounded-xl border-2 border-[#1E1B4B] bg-white shadow-[2px_2px_0px_0px_#1E1B4B] disabled:opacity-30 disabled:pointer-events-none hover:bg-[#F0F2F8]"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <span className="px-3 py-1 font-bold text-[#0F172A]">
                  Page {page} of {totalPages}
                </span>

                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="p-2 rounded-xl border-2 border-[#1E1B4B] bg-white shadow-[2px_2px_0px_0px_#1E1B4B] disabled:opacity-30 disabled:pointer-events-none hover:bg-[#F0F2F8]"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
