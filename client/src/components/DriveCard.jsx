import React from "react";
import {
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Sparkles,
  Building,
} from "lucide-react";

/**
 * Company Color palette generator for logo monograms
 */
const getCompanyBadgeColor = (name = "") => {
  const char = name.charAt(0).toUpperCase();
  if (["G", "A", "M"].includes(char)) return "from-indigo-500 to-cyan-500";
  if (["M", "N", "O"].includes(char)) return "from-purple-500 to-pink-500";
  return "from-emerald-500 to-teal-500";
};

/**
 * Modern Placement Drive Card with high-density layout and eligibility states
 */
export default function DriveCard({ drive, applied, onSelectDetails, onApply }) {
  const isEligible = drive.isEligible !== false;
  const ineligibilityReason = drive.ineligibilityReasons?.[0] || "Requirements not met";

  return (
    <div className="glass-card-interactive group relative flex flex-col justify-between rounded-2xl p-6 transition-all duration-200">
      <div>
        {/* Card Header: Company Monogram + Title + CTC Badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${getCompanyBadgeColor(
                drive.companyName
              )} text-sm font-bold text-white shadow-md`}
            >
              {drive.companyName ? drive.companyName.substring(0, 2).toUpperCase() : "CO"}
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
                {drive.companyName}
              </span>
              <h3 className="font-heading text-base font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                {drive.title}
              </h3>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <span className="inline-flex items-center rounded-lg bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/20 shadow-glow-emerald">
              {drive.ctc}
            </span>
          </div>
        </div>

        {/* Location and Deadline meta */}
        <div className="mt-4 flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <MapPin size={13} className="text-slate-500" />
            <span className="truncate max-w-[150px]">{drive.location}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Clock size={13} className="text-slate-500" />
            <span>Due {new Date(drive.deadline).toLocaleDateString()}</span>
          </span>
        </div>

        {/* Requirements Pills */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          <span className="micro-badge bg-white/5 text-slate-300 border border-white/10">
            Min CGPA {drive.minCgpa}
          </span>
          <span className="micro-badge bg-white/5 text-slate-300 border border-white/10">
            Max {drive.maxBacklogs} Backlog
          </span>
          {drive.allowedBranches?.slice(0, 2).map((b) => (
            <span key={b} className="micro-badge bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              {b}
            </span>
          ))}
        </div>

        {/* Eligibility State Pill */}
        <div
          className={`mt-4 flex items-center gap-2 rounded-xl p-2.5 text-xs font-medium border ${
            isEligible
              ? "bg-emerald-500/[0.08] border-emerald-500/20 text-emerald-300"
              : "bg-rose-500/[0.08] border-rose-500/20 text-rose-300"
          }`}
        >
          {isEligible ? (
            <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
          ) : (
            <XCircle size={15} className="text-rose-400 shrink-0" />
          )}
          <span className="truncate">
            {isEligible ? "You meet all eligibility criteria" : ineligibilityReason}
          </span>
        </div>
      </div>

      {/* Action CTA Buttons */}
      <div className="mt-6 flex items-center gap-2.5 pt-2">
        <button
          onClick={() => onSelectDetails(drive)}
          className="flex-1 rounded-xl border border-white/10 bg-white/[0.04] py-2.5 text-xs font-semibold text-slate-200 hover:bg-white/[0.08] hover:border-white/20 transition-all text-center"
        >
          View Details
        </button>

        {applied ? (
          <button
            disabled
            className="flex-1.2 flex items-center justify-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/15 py-2.5 text-xs font-semibold text-emerald-400 cursor-default"
          >
            <CheckCircle2 size={14} /> Applied ({applied.status})
          </button>
        ) : (
          <button
            disabled={!isEligible}
            onClick={() => onApply(drive)}
            className={`flex-1.2 flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-semibold transition-all ${
              isEligible
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-glow hover:from-indigo-500 hover:to-purple-500 hover:scale-[1.02] cursor-pointer"
                : "border border-white/5 bg-slate-900/50 text-slate-500 cursor-not-allowed opacity-60"
            }`}
          >
            <span>Apply Now</span>
            <ChevronRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
