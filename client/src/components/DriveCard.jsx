import React from "react";
import {
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronRight,
} from "lucide-react";

/**
 * Company Color palette generator for logo monograms
 */
const getCompanyBadgeColor = (name = "") => {
  const char = name.charAt(0).toUpperCase();
  if (["G", "A", "M"].includes(char)) return "from-indigo-600 to-blue-600";
  if (["M", "N", "O"].includes(char)) return "from-purple-600 to-pink-600";
  return "from-emerald-600 to-teal-600";
};

/**
 * Modern Bright / Light Theme Placement Drive Card
 */
export default function DriveCard({ drive, applied, onSelectDetails, onApply }) {
  const isEligible = drive.isEligible !== false;
  const ineligibilityReason = drive.ineligibilityReasons?.[0] || "Requirements not met";

  return (
    <div className="glass-card-interactive group relative flex flex-col justify-between rounded-2xl p-6 border border-slate-200/80 bg-white">
      <div>
        {/* Card Header: Company Monogram + Title + CTC Badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${getCompanyBadgeColor(
                drive.companyName
              )} text-sm font-bold text-white shadow-sm`}
            >
              {drive.companyName ? drive.companyName.substring(0, 2).toUpperCase() : "CO"}
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
                {drive.companyName}
              </span>
              <h3 className="font-heading text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                {drive.title}
              </h3>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <span className="inline-flex items-center rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-200 shadow-xs">
              {drive.ctc}
            </span>
          </div>
        </div>

        {/* Location and Deadline meta */}
        <div className="mt-4 flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs text-slate-500 font-medium">
          <span className="flex items-center gap-1.5">
            <MapPin size={13} className="text-slate-400" />
            <span className="truncate max-w-[150px]">{drive.location}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Clock size={13} className="text-slate-400" />
            <span>Due {new Date(drive.deadline).toLocaleDateString()}</span>
          </span>
        </div>

        {/* Requirements Pills */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          <span className="micro-badge bg-slate-100 text-slate-700 border border-slate-200">
            Min CGPA {drive.minCgpa}
          </span>
          <span className="micro-badge bg-slate-100 text-slate-700 border border-slate-200">
            Max {drive.maxBacklogs} Backlog
          </span>
          {drive.allowedBranches?.slice(0, 2).map((b) => (
            <span key={b} className="micro-badge bg-indigo-50 text-indigo-700 border border-indigo-200">
              {b}
            </span>
          ))}
        </div>

        {/* Eligibility State Banner */}
        <div
          className={`mt-4 flex items-center gap-2 rounded-xl p-2.5 text-xs font-semibold border ${
            isEligible
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          {isEligible ? (
            <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
          ) : (
            <XCircle size={15} className="text-rose-600 shrink-0" />
          )}
          <span className="truncate">
            {isEligible ? "ELIGIBILITY MET: You qualify for this drive" : ineligibilityReason}
          </span>
        </div>
      </div>

      {/* Action CTA Buttons */}
      <div className="mt-6 flex items-center gap-2.5 pt-2">
        <button
          onClick={() => onSelectDetails(drive)}
          className="flex-1 rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-all text-center cursor-pointer shadow-xs"
        >
          View Details
        </button>

        {applied ? (
          <button
            disabled
            className="flex-1.2 flex items-center justify-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 py-2.5 text-xs font-bold text-emerald-700 cursor-default shadow-xs"
          >
            <CheckCircle2 size={14} /> Applied ({applied.status})
          </button>
        ) : (
          <button
            disabled={!isEligible}
            onClick={() => onApply(drive)}
            className={`flex-1.2 flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold transition-all ${
              isEligible
                ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-500/25 hover:from-indigo-700 hover:to-indigo-800 hover:scale-[1.02] cursor-pointer"
                : "border border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed opacity-70"
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
