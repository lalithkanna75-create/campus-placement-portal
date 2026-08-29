import React from "react";
import { Download } from "lucide-react";

/**
 * Status badge colors in bright theme
 */
const STATUS_COLORS = {
  APPLIED: "bg-amber-50 text-amber-800 border-amber-200",
  SHORTLISTED: "bg-blue-50 text-blue-800 border-blue-200",
  INTERVIEW_SCHEDULED: "bg-purple-50 text-purple-800 border-purple-200",
  OFFERED: "bg-emerald-50 text-emerald-800 border-emerald-200",
  REJECTED: "bg-rose-50 text-rose-800 border-rose-200",
};

/**
 * Modern Bright Theme Applicant Table with CSV Export
 */
export default function ApplicantTable({
  applications = [],
  studentProfile,
  onUpdateStatus,
  onExportCSV,
}) {
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
    <div className="glass-card overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft">
      {/* Table Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-6 py-4 bg-slate-50/50">
        <div>
          <h3 className="font-heading text-base font-bold text-slate-900">
            Applicant Pipeline Roster
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Real-time candidate tracking across all company placement drives.
          </p>
        </div>

        <button
          onClick={handleExport}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer shadow-xs"
        >
          <Download size={14} className="text-indigo-600" />
          <span>Export to CSV</span>
        </button>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3.5 font-bold">Candidate</th>
              <th className="px-6 py-3.5 font-bold">Drive / Company</th>
              <th className="px-6 py-3.5 font-bold">Package</th>
              <th className="px-6 py-3.5 font-bold">Current Stage</th>
              <th className="px-6 py-3.5 font-bold text-right">Pipeline Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {applications.map((app) => {
              const company = app.companyName || app.jobDrive?.companyName || "Google";
              const title = app.title || app.jobDrive?.title || "SDE";
              const ctc = app.ctc || app.jobDrive?.ctc || "24 LPA";
              const candidateName = studentProfile?.fullName || "Alex Sharma";
              const rollNumber = studentProfile?.rollNumber || "CS2023001";

              return (
                <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                  {/* Candidate Info */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-indigo-700 font-bold text-white text-xs shadow-xs">
                        {candidateName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{candidateName}</div>
                        <div className="text-[11px] text-slate-500 font-mono font-medium">
                          {rollNumber} • {studentProfile?.cgpa || 8.85} CGPA
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Company & Role */}
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{company}</div>
                    <div className="text-[11px] text-slate-500 font-medium">{title}</div>
                  </td>

                  {/* Package */}
                  <td className="px-6 py-4">
                    <span className="micro-badge bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                      {ctc}
                    </span>
                  </td>

                  {/* Stage Badge */}
                  <td className="px-6 py-4">
                    <span
                      className={`micro-badge border font-bold ${
                        STATUS_COLORS[app.status] || "bg-slate-100 text-slate-700 border-slate-200"
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
                      className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800 outline-none hover:border-indigo-400 focus:border-indigo-600 cursor-pointer shadow-xs"
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
