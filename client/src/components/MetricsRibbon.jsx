import React from "react";
import { Award, FileText, TrendingUp, Building2, CheckCircle2, ArrowUpRight } from "lucide-react";

/**
 * 4-Card Top Stat Metrics Ribbon with Linear-style hover glows & micro trend badges
 */
export default function MetricsRibbon({ profile, applicationsCount, shortlistsCount, drivesCount }) {
  return (
    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
      
      {/* Metric 1: Academic Standing */}
      <div className="glass-card-interactive group relative overflow-hidden rounded-2xl p-5">
        <div className="flex items-center justify-between">
          <span className="micro-badge bg-white/5 text-slate-400 border border-white/5">
            Academic Status
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:scale-110 transition-transform">
            <Award size={16} />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="font-heading text-2xl font-bold tracking-tight text-white">
            {profile?.cgpa || "8.85"}
          </span>
          <span className="text-xs font-semibold text-slate-400">CGPA</span>
        </div>
        <div className="mt-2.5 flex items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 size={11} /> 0 Backlogs
          </span>
          <span className="truncate text-slate-400 text-[11px]">
            {profile?.department || "Computer Science"}
          </span>
        </div>
      </div>

      {/* Metric 2: Active Applications */}
      <div className="glass-card-interactive group relative overflow-hidden rounded-2xl p-5">
        <div className="flex items-center justify-between">
          <span className="micro-badge bg-white/5 text-slate-400 border border-white/5">
            My Submissions
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 group-hover:scale-110 transition-transform">
            <FileText size={16} />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="font-heading text-2xl font-bold tracking-tight text-white">
            {applicationsCount}
          </span>
          <span className="text-xs font-medium text-slate-400">drives applied</span>
        </div>
        <div className="mt-2.5 flex items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1 rounded-md bg-cyan-500/10 px-2 py-0.5 text-[11px] font-semibold text-cyan-400 border border-cyan-500/20">
            Active
          </span>
          <span className="text-slate-400 text-[11px]">Direct recruiter pipeline</span>
        </div>
      </div>

      {/* Metric 3: Shortlists & Interviews */}
      <div className="glass-card-interactive group relative overflow-hidden rounded-2xl p-5">
        <div className="flex items-center justify-between">
          <span className="micro-badge bg-white/5 text-slate-400 border border-white/5">
            Shortlists & Offers
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-110 transition-transform">
            <TrendingUp size={16} />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="font-heading text-2xl font-bold tracking-tight text-emerald-400">
            {shortlistsCount}
          </span>
          <span className="text-xs font-medium text-slate-400">in progression</span>
        </div>
        <div className="mt-2.5 flex items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-400 border border-emerald-500/20">
            <ArrowUpRight size={11} /> Next Stage
          </span>
          <span className="text-slate-400 text-[11px]">Round 1 scheduled</span>
        </div>
      </div>

      {/* Metric 4: Live Placement Drives */}
      <div className="glass-card-interactive group relative overflow-hidden rounded-2xl p-5">
        <div className="flex items-center justify-between">
          <span className="micro-badge bg-white/5 text-slate-400 border border-white/5">
            Active Drives
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 group-hover:scale-110 transition-transform">
            <Building2 size={16} />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="font-heading text-2xl font-bold tracking-tight text-white">
            {drivesCount}
          </span>
          <span className="text-xs font-medium text-slate-400">companies hiring</span>
        </div>
        <div className="mt-2.5 flex items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1 rounded-md bg-purple-500/10 px-2 py-0.5 text-[11px] font-semibold text-purple-300 border border-purple-500/20">
            Live
          </span>
          <span className="text-slate-400 text-[11px]">Accepting applications</span>
        </div>
      </div>
    </div>
  );
}
