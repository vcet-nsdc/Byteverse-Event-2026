"use client";

import { useEffect, useState } from "react";
import { Terminal, BarChart2 } from "lucide-react";

interface LanguageStat {
  name: string;
  key: string;
  count: number;
  percentage: number;
  color: string;
  badgeBg: string;
}

export default function HomeLanguageStats() {
  const [languages, setLanguages] = useState<LanguageStat[]>([]);
  const [totalSubmissions, setTotalSubmissions] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch("/api/stats/languages");
        if (res.ok) {
          const data = await res.json();
          setLanguages(data.languages || []);
          setTotalSubmissions(data.totalSubmissions || 0);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="bg-white border-2 border-[#1E1B4B] rounded-2xl p-6 sm:p-8 shadow-[5px_5px_0px_0px_#1E1B4B] text-left transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-[#1E1B4B]/10 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#4A2293] text-white flex items-center justify-center border-2 border-[#1E1B4B] shadow-[2px_2px_0px_0px_#1E1B4B]">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-mono font-black tracking-widest text-[#7F45DB] uppercase">
              ECOSYSTEM TELEMETRY
            </span>
            <h2 className="text-xl sm:text-2xl font-display font-black text-[#0F172A]">
              Most Used Languages
            </h2>
          </div>
        </div>

        <div className="text-xs font-mono text-[#6E6E6E]">
          Total Evaluated: <span className="font-bold text-[#0F172A]">{totalSubmissions.toLocaleString()}</span> submissions
        </div>
      </div>

      {loading ? (
        <div className="py-6 text-center font-mono text-sm text-[#6E6E6E] animate-pulse">
          Computing real-time execution statistics...
        </div>
      ) : languages.length > 0 ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {languages.map((lang) => (
              <div
                key={lang.key}
                className="p-4 rounded-xl bg-[#F8F9FD] border-2 border-[#1E1B4B] shadow-[2px_2px_0px_0px_#1E1B4B] space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: lang.color }}
                    />
                    <span className="font-mono font-bold text-sm text-[#0F172A]">
                      {lang.name}
                    </span>
                  </div>
                  <span className="text-sm font-mono font-black text-[#7F45DB]">
                    {lang.percentage}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2.5 bg-white rounded-full overflow-hidden border border-[#1E1B4B]/20">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${lang.percentage}%`,
                      backgroundColor: lang.color,
                    }}
                  />
                </div>

                <div className="flex justify-between text-[11px] font-mono text-[#6E6E6E]">
                  <span>{lang.count.toLocaleString()} submissions</span>
                  <span>Formula: count / total × 100</span>
                </div>
              </div>
            ))}
          </div>

          {/* Unified bar */}
          <div className="pt-2">
            <div className="text-[11px] font-mono uppercase text-[#6E6E6E] font-bold mb-1.5">
              Aggregate Share
            </div>
            <div className="w-full h-4 rounded-xl border-2 border-[#1E1B4B] bg-white overflow-hidden flex shadow-[2px_2px_0px_0px_#1E1B4B]">
              {languages.map((l) => (
                <div
                  key={l.key}
                  style={{
                    width: `${l.percentage}%`,
                    backgroundColor: l.color,
                  }}
                  title={`${l.name}: ${l.percentage}%`}
                  className="h-full transition-all hover:opacity-80"
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="py-6 text-center text-xs font-mono text-[#6E6E6E]">
          No submission telemetry available yet.
        </div>
      )}
    </div>
  );
}
