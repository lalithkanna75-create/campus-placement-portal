import React from "react";
import { Check, Clock, Calendar, Award, XCircle } from "lucide-react";

const STAGES = [
  { key: "APPLIED", label: "Applied", icon: Clock },
  { key: "SHORTLISTED", label: "Shortlisted", icon: Check },
  { key: "INTERVIEW_SCHEDULED", label: "Interview", sublabel: "Scheduled", icon: Calendar },
  { key: "OFFERED", label: "Offered", icon: Award },
];

/**
 * Modern Bright / Light Theme Application Stepper Timeline
 */
export default function ApplicationStepper({ currentStatus }) {
  if (currentStatus === "REJECTED") {
    return (
      <div className="mt-4 flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-800 text-xs font-semibold">
        <XCircle size={16} className="text-rose-600 shrink-0" />
        <div>
          <span className="font-bold text-rose-900">Application Closed:</span> Not shortlisted for the next interview stage.
        </div>
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
    </div>
  );
}
