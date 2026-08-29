import React from "react";
import { Check, Clock, Calendar, Award, XCircle } from "lucide-react";

const STAGES = [
  { key: "APPLIED", label: "Applied", icon: Clock },
  { key: "SHORTLISTED", label: "Shortlisted", icon: Check },
  { key: "INTERVIEW_SCHEDULED", label: "Interview", sublabel: "Scheduled", icon: Calendar },
  { key: "OFFERED", label: "Offered", icon: Award },
];

/**
 * Modern Linear-Inspired Timeline Stepper
 * Fully responsive with zero text wrapping bugs and glowing progress tracks.
 */
export default function ApplicationStepper({ currentStatus }) {
  if (currentStatus === "REJECTED") {
    return (
      <div className="mt-4 flex items-center gap-3 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-rose-300 text-xs font-medium backdrop-blur-md">
        <XCircle size={16} className="text-rose-400 shrink-0" />
        <div>
          <span className="font-bold text-rose-200">Application Closed:</span> Not shortlisted for the next interview stage.
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
        <div className="absolute top-[18px] left-[6%] right-[6%] h-[2px] bg-white/[0.08] rounded-full z-0" />

        {/* Active Gradient Line */}
        <div
          className="absolute top-[18px] left-[6%] h-[2px] bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 rounded-full z-0 transition-all duration-500 ease-out shadow-glow"
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
                  className={`flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-300 ${
                    isCurrent
                      ? "border-indigo-400 bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-glow ring-4 ring-indigo-500/20 scale-105"
                      : isPassed
                      ? "border-emerald-400 bg-emerald-500 text-white shadow-glow-emerald"
                      : "border-white/10 bg-slate-900 text-slate-500"
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
                    className={`text-xs font-semibold transition-colors ${
                      isCurrent
                        ? "text-indigo-300 font-bold"
                        : isPassed
                        ? "text-emerald-300"
                        : "text-slate-500"
                    }`}
                  >
                    {stage.label}
                  </span>
                  {stage.sublabel && (
                    <span
                      className={`text-[10px] leading-tight ${
                        isCurrent
                          ? "text-indigo-400 font-medium"
                          : isPassed
                          ? "text-emerald-400"
                          : "text-slate-600"
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
