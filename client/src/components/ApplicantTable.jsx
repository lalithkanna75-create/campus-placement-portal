import React from "react";
import { Download, User, CheckCircle2, Clock, Calendar, Award, XCircle } from "lucide-react";

/**
 * Status color mappings
 */
const STATUS_COLORS = {
  APPLIED: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  SHORTLISTED: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  INTERVIEW_SCHEDULED: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  OFFERED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  REJECTED: "bg-rose-500/10 text-rose-400 border-rose-500/20",
};

/**
 * Modern Linear-inspired Applicant Management Table with CSV Export
 */
export default function ApplicantTable({
  applications = [],
  studentProfile,
  onUpdateStatus,
  onExportCSV,
}) {
  // Export CSV handler
  const handleExport = () => {
    if (onExportCSV) {
      onExportCSV();
      return;
    }

    const headers = "Student Name,Roll Number,Company,Role,CTC,Status,Applied Date\n";
    const rows = applications
      .map(
        (app) =>
          `"${studentProfile?.fullName || "Alex Sharma"}","${studentProfile?.rollNumber || "CS2023001"}","${
            app.companyName || app.jobDrive?.companyName
          }","${app.title || app.jobDrive?.title}","${app.ctc || app.jobDrive?.ctc}","${
            app.status
          }","${new Date(app.appliedAt).toLocaleDateString()}"`
      )
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Placement_Applicants_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return (
    <div className="glass-card overflow-hidden rounded-2xl">
      {/* Table Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] px-6 py-4">
        <div>
          <h3 className="font-heading text-base font-bold text-white">
            Applicant Pipeline Roster
          </h3>
          <p className="text-xs text-slate-400">
            Real-time candidate tracking across all company placement drives.
          </p>
        </div>

        <button
          onClick={handleExport}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-white/[0.08] hover:border-white/20 transition-all cursor-pointer"
        >
          <Download size={14} className="text-indigo-400" />
          <span>Export to CSV</span>
        </button>
      </div>

      {/* Responsive Table Grid */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900/60 text-slate-400 border-b border-white/[0.05]">
            <tr>
              <th className="px-6 py-3.5 font-semibold">Candidate</th>
              <th className="px-6 py-3.5 font-semibold">Drive / Company</th>
              <th className="px-6 py-3.5 font-semibold">Package</th>
              <th className="px-6 py-3.5 font-semibold">Current Stage</th>
              <th className="px-6 py-3.5 font-semibold text-right">Pipeline Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {applications.map((app) => {
              const company = app.companyName || app.jobDrive?.companyName || "Google";
              const title = app.title || app.jobDrive?.title || "SDE";
              const ctc = app.ctc || app.jobDrive?.ctc || "24 LPA";
              const candidateName = studentProfile?.fullName || "Alex Sharma";
              const rollNumber = studentProfile?.rollNumber || "CS2023001";

              return (
                <tr key={app.id} className="hover:bg-white/[0.02] transition-colors">
                  {/* Candidate Info */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 font-bold text-white text-xs">
                        {candidateName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-100">{candidateName}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {rollNumber} • {studentProfile?.cgpa || 8.85} CGPA
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Company & Role */}
                  <td className="px-6 py-4">
                    <div className="font-semibold text-white">{company}</div>
                    <div className="text-[11px] text-slate-400">{title}</div>
                  </td>

                  {/* Package */}
                  <td className="px-6 py-4">
                    <span className="micro-badge bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {ctc}
                    </span>
                  </td>

                  {/* Stage Badge */}
                  <td className="px-6 py-4">
                    <span
                      className={`micro-badge border ${
                        STATUS_COLORS[app.status] || "bg-slate-500/10 text-slate-300 border-slate-500/20"
                      }`}
                    >
                      {app.status}
                    </span>
                  </td>

                  {/* Inline Stage Dropdown Action */}
                  <td className="px-6 py-4 text-right">
                    <select
                      value={app.status}
                      onChange={(e) => onUpdateStatus(app.id, e.target.value)}
                      className="rounded-lg border border-white/10 bg-slate-900/90 px-2.5 py-1.5 text-xs text-slate-200 outline-none hover:border-indigo-500/50 focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="APPLIED">Applied</option>
                      <option value="SHORTLISTED">Shortlisted</option>
                      <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
                      <option value="OFFERED">Make Offer</option>
                      <option value="REJECTED">Reject</option>
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
