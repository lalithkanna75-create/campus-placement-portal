import React from "react";
import { Award, FileText, TrendingUp, Building2, CheckCircle2, ArrowUpRight } from "lucide-react";

/**
 * Modern Bright / Light Theme Metrics Ribbon
 */
export default function MetricsRibbon({ profile, applicationsCount, shortlistsCount, drivesCount }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
      
      {/* Metric 1: Academic Standing */}
      <div className="glass-card-interactive group rounded-2xl p-5 border border-slate-200/80 bg-white">
        <div className="flex items-center justify-between">
          <span className="micro-badge bg-slate-100 text-slate-700 border border-slate-200">
            Academic Status
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 group-hover:scale-110 transition-transform">
            <Award size={16} />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="font-heading text-2xl font-extrabold tracking-tight text-slate-900">
            {profile?.cgpa !== undefined && profile?.cgpa !== null ? profile.cgpa : "—"}
          </span>
          <span className="text-xs font-bold text-slate-500">CGPA</span>
        </div>
        <div className="mt-2.5 flex items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={11} /> {profile?.activeBacklogs ?? 0} Backlogs
          </span>
          <span className="truncate text-slate-600 font-medium text-[11px]">
            {profile?.department || "Not Set"}
          </span>
        </div>
      </div>

      {/* Metric 2: Active Applications */}
      <div className="glass-card-interactive group rounded-2xl p-5 border border-slate-200/80 bg-white">
        <div className="flex items-center justify-between">
          <span className="micro-badge bg-slate-100 text-slate-700 border border-slate-200">
            My Submissions
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 border border-cyan-100 group-hover:scale-110 transition-transform">
            <FileText size={16} />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="font-heading text-2xl font-extrabold tracking-tight text-slate-900">
            {applicationsCount}
          </span>
          <span className="text-xs font-semibold text-slate-500">drives applied</span>
        </div>
        <div className="mt-2.5 flex items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1 rounded-md bg-cyan-50 px-2 py-0.5 text-[11px] font-bold text-cyan-700 border border-cyan-200">
            Active
          </span>
          <span className="text-slate-600 font-medium text-[11px]">Direct recruiter pipeline</span>
        </div>
      </div>

      {/* Metric 3: Shortlists & Interviews */}
      <div className="glass-card-interactive group rounded-2xl p-5 border border-slate-200/80 bg-white">
        <div className="flex items-center justify-between">
          <span className="micro-badge bg-slate-100 text-slate-700 border border-slate-200">
            Shortlists & Offers
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 group-hover:scale-110 transition-transform">
            <TrendingUp size={16} />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="font-heading text-2xl font-extrabold tracking-tight text-emerald-600">
            {shortlistsCount}
          </span>
          <span className="text-xs font-semibold text-slate-500">in progression</span>
        </div>
        <div className="mt-2.5 flex items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200">
            <ArrowUpRight size={11} /> Next Stage
          </span>
          <span className="text-slate-600 font-medium text-[11px]">Round 1 Scheduled</span>
        </div>
      </div>

      {/* Metric 4: Live Placement Drives */}
      <div className="glass-card-interactive group rounded-2xl p-5 border border-slate-200/80 bg-white">
        <div className="flex items-center justify-between">
          <span className="micro-badge bg-slate-100 text-slate-700 border border-slate-200">
            Active Drives
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-50 text-purple-600 border border-purple-100 group-hover:scale-110 transition-transform">
            <Building2 size={16} />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="font-heading text-2xl font-extrabold tracking-tight text-slate-900">
            {drivesCount}
          </span>
          <span className="text-xs font-semibold text-slate-500">companies hiring</span>
        </div>
        <div className="mt-2.5 flex items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1 rounded-md bg-purple-50 px-2 py-0.5 text-[11px] font-bold text-purple-700 border border-purple-200">
            Live
          </span>
          <span className="text-slate-600 font-medium text-[11px]">Accepting applications</span>
        </div>
      </div>
    </div>
  );
}
