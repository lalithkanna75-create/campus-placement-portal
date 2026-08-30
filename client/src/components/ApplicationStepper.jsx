import React from "react";
import { Check, Clock, Calendar, Award, XCircle, MessageSquare } from "lucide-react";

const STAGES = [
  { key: "APPLIED", label: "Applied", icon: Clock },
  { key: "SHORTLISTED", label: "Shortlisted", icon: Check },
  { key: "INTERVIEW_SCHEDULED", label: "Interview", sublabel: "Scheduled", icon: Calendar },
  { key: "OFFERED", label: "Offered", icon: Award },
];

/**
 * Modern Bright / Light Theme Application Stepper Timeline with Interview Details
 */
export default function ApplicationStepper({ currentStatus, interviewDate, feedbackNotes }) {
  if (currentStatus === "REJECTED") {
    return (
      <div className="mt-4 flex flex-col gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-800 text-xs font-semibold">
        <div className="flex items-center gap-2">
          <XCircle size={16} className="text-rose-600 shrink-0" />
          <span className="font-bold text-rose-900">Application Closed:</span>
          <span>Not shortlisted for subsequent rounds.</span>
        </div>
        {feedbackNotes && (
          <p className="text-[11px] text-rose-700 pl-6 border-l-2 border-rose-300">
            {feedbackNotes}
          </p>
        )}
      </div>
    );
  }

  const activeIdx = Math.max(
    0,
    STAGES.findIndex((s) => s.key === currentStatus)
  );
  const progressPercent = (activeIdx / (STAGES.length - 1)) * 100;

  return (
    <div className="w-full pt-4 pb-2">
      <div className="relative">
        {/* Background Track Line */}
        <div className="absolute top-[18px] left-[6%] right-[6%] h-[2px] bg-slate-200 rounded-full z-0" />

        {/* Active Gradient Line */}
        <div
          className="absolute top-[18px] left-[6%] h-[2px] bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-600 rounded-full z-0 transition-all duration-500 ease-out shadow-xs"
          style={{ width: `${progressPercent * 0.88}%` }}
        />

        {/* Stepper Nodes */}
        <div className="relative z-10 flex justify-between items-start">
          {STAGES.map((stage, idx) => {
            const isPassed = idx < activeIdx;
            const isCurrent = idx === activeIdx;
            const Icon = stage.icon;

            return (
              <div
                key={stage.key}
                className="flex flex-col items-center text-center w-24 sm:w-28 select-none"
              >
                {/* Node Circle */}
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                    isCurrent
                      ? "border-indigo-600 bg-indigo-600 text-white shadow-md shadow-indigo-500/30 scale-105 ring-4 ring-indigo-100"
                      : isPassed
                      ? "border-emerald-500 bg-emerald-500 text-white shadow-sm shadow-emerald-500/20"
                      : "border-slate-300 bg-white text-slate-400"
                  }`}
                >
                  {isPassed ? (
                    <Check size={16} strokeWidth={2.5} />
                  ) : (
                    <Icon size={15} />
                  )}
                </div>

                {/* Node Typography */}
                <div className="mt-2.5 flex flex-col items-center whitespace-nowrap">
                  <span
                    className={`text-xs font-bold transition-colors ${
                      isCurrent
                        ? "text-indigo-700"
                        : isPassed
                        ? "text-emerald-700"
                        : "text-slate-400"
                    }`}
                  >
                    {stage.label}
                  </span>
                  {stage.sublabel && (
                    <span
                      className={`text-[10px] font-semibold leading-tight ${
                        isCurrent
                          ? "text-indigo-600"
                          : isPassed
                          ? "text-emerald-600"
                          : "text-slate-400"
                      }`}
                    >
                      {stage.sublabel}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recruiter Interview Slot & Feedback Notes Box */}
      {(interviewDate || feedbackNotes) && (
        <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl border border-indigo-100 bg-indigo-50/70 p-3.5 text-xs text-indigo-900 shadow-xs">
          {interviewDate && (
            <div className="flex items-center gap-2 font-semibold">
              <Calendar size={15} className="text-indigo-600 shrink-0" />
              <span>
                Interview Scheduled:{" "}
                <strong className="font-bold text-indigo-950">
                  {new Date(interviewDate).toLocaleDateString()} at{" "}
                  {new Date(interviewDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </strong>
              </span>
            </div>
          )}

          {feedbackNotes && (
            <div className="flex items-center gap-2 text-[11px] font-medium text-indigo-800">
              <MessageSquare size={14} className="text-indigo-500 shrink-0" />
              <span>{feedbackNotes}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
