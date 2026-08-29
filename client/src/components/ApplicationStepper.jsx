import React from "react";
import { Check, Clock, Calendar, Award, XCircle } from "lucide-react";

/**
 * Standard candidate pipeline stages
 */
const STEPS = [
  { key: "APPLIED", label: "Applied", icon: Clock },
  { key: "SHORTLISTED", label: "Shortlisted", icon: Check },
  { key: "INTERVIEW_SCHEDULED", label: "Interview", sublabel: "Scheduled", icon: Calendar },
  { key: "OFFERED", label: "Offered", icon: Award },
];

/**
 * ApplicationStepper Component
 * Clean, responsive multi-stage pipeline stepper with collision-free label typography.
 *
 * @param {string} currentStatus - 'APPLIED' | 'SHORTLISTED' | 'INTERVIEW_SCHEDULED' | 'OFFERED' | 'REJECTED'
 */
export default function ApplicationStepper({ currentStatus }) {
  if (currentStatus === "REJECTED") {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "12px 16px",
          borderRadius: "10px",
          background: "rgba(244, 63, 94, 0.12)",
          border: "1px solid rgba(244, 63, 94, 0.3)",
          color: "#fb7185",
          fontSize: "0.85rem",
          marginTop: "14px",
        }}
      >
        <XCircle size={18} />
        <div>
          <span style={{ fontWeight: 700 }}>Application Closed:</span> Not shortlisted for further rounds.
        </div>
      </div>
    );
  }

  const currentIndex = STEPS.findIndex((s) => s.key === currentStatus);
  const activeIdx = currentIndex === -1 ? 0 : currentIndex;
  const progressPercent = (activeIdx / (STEPS.length - 1)) * 100;

  return (
    <div style={{ width: "100%", marginTop: "18px", padding: "8px 4px" }}>
      {/* Stepper Track Container */}
      <div style={{ position: "relative", marginBottom: "28px" }}>
        {/* Background Grey Track */}
        <div
          style={{
            position: "absolute",
            top: "16px",
            left: "5%",
            right: "5%",
            height: "3px",
            background: "rgba(255, 255, 255, 0.1)",
            zIndex: 1,
            borderRadius: "4px",
          }}
        />

        {/* Dynamic Gradient Active Progress Line */}
        <div
          style={{
            position: "absolute",
            top: "16px",
            left: "5%",
            width: `${progressPercent * 0.9}%`,
            height: "3px",
            background: "linear-gradient(90deg, #6366f1 0%, #a855f7 50%, #10b981 100%)",
            zIndex: 2,
            borderRadius: "4px",
            transition: "width 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        />

        {/* Stepper Nodes */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            position: "relative",
            zIndex: 3,
          }}
        >
          {STEPS.map((step, idx) => {
            const isCompleted = idx < activeIdx;
            const isCurrent = idx === activeIdx;
            const StepIcon = step.icon;

            return (
              <div
                key={step.key}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  width: "80px",
                  textAlign: "center",
                }}
              >
                {/* Step Circle */}
                <div
                  style={{
                    width: "34px",
                    height: "34px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: isCurrent
                      ? "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)"
                      : isCompleted
                      ? "#10b981"
                      : "rgba(17, 24, 39, 0.9)",
                    border: isCurrent
                      ? "2px solid #a5b4fc"
                      : isCompleted
                      ? "2px solid #34d399"
                      : "2px solid rgba(255, 255, 255, 0.15)",
                    boxShadow: isCurrent
                      ? "0 0 16px rgba(99, 102, 241, 0.6)"
                      : isCompleted
                      ? "0 0 10px rgba(16, 185, 129, 0.4)"
                      : "none",
                    color: isCurrent || isCompleted ? "#fff" : "var(--text-dim)",
                    transition: "all 0.3s ease",
                  }}
                >
                  {isCompleted ? (
                    <Check size={16} strokeWidth={3} />
                  ) : (
                    <StepIcon size={16} />
                  )}
                </div>

                {/* Step Typography (Collision-Proof & Non-wrapping) */}
                <div
                  style={{
                    marginTop: "8px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    whiteSpace: "nowrap",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: isCurrent ? 700 : isCompleted ? 600 : 500,
                      color: isCurrent
                        ? "#e0e7ff"
                        : isCompleted
                        ? "#d1fae5"
                        : "var(--text-dim)",
                      letterSpacing: "0.01em",
                    }}
                  >
                    {step.label}
                  </span>
                  {step.sublabel && (
                    <span
                      style={{
                        fontSize: "0.68rem",
                        color: isCurrent ? "#a5b4fc" : isCompleted ? "#6ee7b7" : "var(--text-dim)",
                        lineHeight: 1.1,
                      }}
                    >
                      {step.sublabel}
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
