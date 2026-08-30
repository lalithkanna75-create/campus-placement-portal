import React, { useState } from "react";
import {
  Download,
  FileText,
  ExternalLink,
  Loader2,
  Calendar,
  MessageSquare,
  X,
  CheckCircle2,
  Edit3,
  Send,
} from "lucide-react";
import { BACKEND_URL } from "../services/api";

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
 * Modern Bright Theme Applicant Table with 1-Click CSV Export, Resume Viewing & Recruiter Status Update Modal
 */
export default function ApplicantTable({
  applications = [],
  studentProfile,
  onUpdateStatus,
  onExportCSV,
}) {
  const [exporting, setExporting] = useState(false);
  const [selectedAppModal, setSelectedAppModal] = useState(null);
  const [modalForm, setModalForm] = useState({
    status: "INTERVIEW_SCHEDULED",
    interviewDate: "",
    feedbackNotes: "",
  });

  const handleExport = async () => {
    if (onExportCSV) {
      setExporting(true);
      try {
        await onExportCSV();
      } finally {
        setExporting(false);
      }
      return;
    }

    // Default fallback CSV generator
    const headers = "Student Name,Roll Number,Email,Department,CGPA,Company,Role,CTC,Status,Applied Date,Resume URL\n";
    const rows = applications
      .map((app) => {
        const p = app.student?.profile || studentProfile;
        const candidateName = p?.fullName || "Alex Sharma";
        const rollNumber = p?.rollNumber || "CS2023001";
        const email = app.student?.email || "alex.sharma@student.edu";
        const dept = p?.department || "Computer Science";
        const cgpa = p?.cgpa || 8.85;
        const company = app.companyName || app.jobDrive?.companyName || "N/A";
        const title = app.title || app.jobDrive?.title || "N/A";
        const ctc = app.ctc || app.jobDrive?.ctc || "N/A";
        const status = app.status || "APPLIED";
        const date = new Date(app.appliedAt).toISOString().split("T")[0];
        const resume = p?.resumeUrl ? `${BACKEND_URL}${p.resumeUrl}` : "Not Uploaded";

        return `"${candidateName}","${rollNumber}","${email}","${dept}","${cgpa}","${company}","${title}","${ctc}","${status}","${date}","${resume}"`;
      })
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Placement_Applicants_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  const getResumeLink = (app) => {
    const resumeUrl = app.student?.profile?.resumeUrl || studentProfile?.resumeUrl;
    if (!resumeUrl) return null;
    return resumeUrl.startsWith("http") ? resumeUrl : `${BACKEND_URL}${resumeUrl}`;
  };

  const openStatusModal = (app, initialStatus) => {
    const targetStatus = initialStatus || app.status || "INTERVIEW_SCHEDULED";
    let defaultDate = "";
    if (app.interviewDate) {
      defaultDate = new Date(app.interviewDate).toISOString().slice(0, 16);
    } else if (targetStatus === "INTERVIEW_SCHEDULED") {
      const tomorrow = new Date(Date.now() + 86400000);
      tomorrow.setHours(10, 0, 0, 0);
      defaultDate = tomorrow.toISOString().slice(0, 16);
    }

    setModalForm({
      status: targetStatus,
      interviewDate: defaultDate,
      feedbackNotes: app.feedbackNotes || "",
    });
    setSelectedAppModal(app);
  };

  const handleDropdownChange = (app, newStatus) => {
    if (newStatus === "INTERVIEW_SCHEDULED" || newStatus === "OFFERED") {
      openStatusModal(app, newStatus);
    } else {
      onUpdateStatus(app.id, newStatus);
    }
  };

  const handleModalSubmit = (e) => {
    e.preventDefault();
    if (!selectedAppModal) return;

    onUpdateStatus(selectedAppModal.id, {
      status: modalForm.status,
      interviewDate: modalForm.interviewDate ? new Date(modalForm.interviewDate).toISOString() : null,
      feedbackNotes: modalForm.feedbackNotes || null,
    });

    setSelectedAppModal(null);
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
            Real-time candidate tracking, interview scheduling, and 1-click CSV reports.
          </p>
        </div>

        {/* 1-Click CSV Export */}
        <button
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer shadow-xs disabled:opacity-50"
        >
          {exporting ? (
            <Loader2 size={14} className="text-indigo-600 animate-spin" />
          ) : (
            <Download size={14} className="text-indigo-600" />
          )}
          <span>{exporting ? "Generating CSV..." : "Export to CSV"}</span>
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
              <th className="px-6 py-3.5 font-bold">Resume</th>
              <th className="px-6 py-3.5 font-bold">Current Stage</th>
              <th className="px-6 py-3.5 font-bold text-right">Pipeline Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {applications.map((app) => {
              const p = app.student?.profile || studentProfile;
              const company = app.companyName || app.jobDrive?.companyName || "Google";
              const title = app.title || app.jobDrive?.title || "SDE";
              const ctc = app.ctc || app.jobDrive?.ctc || "24 LPA";
              const candidateName = p?.fullName || "Alex Sharma";
              const rollNumber = p?.rollNumber || "CS2023001";
              const resumeLink = getResumeLink(app);

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
                          {rollNumber} • {p?.cgpa || 8.85} CGPA
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

                  {/* Resume View Action */}
                  <td className="px-6 py-4">
                    {resumeLink ? (
                      <a
                        href={resumeLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50/80 px-2.5 py-1 text-[11px] font-bold text-indigo-700 hover:bg-indigo-100 transition-all shadow-xs"
                      >
                        <FileText size={12} />
                        <span>View PDF</span>
                        <ExternalLink size={10} />
                      </a>
                    ) : (
                      <span className="text-[11px] text-slate-400 font-medium italic">
                        Not uploaded
                      </span>
                    )}
                  </td>

                  {/* Stage Badge & Notes Tooltip */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col items-start gap-1">
                      <span
                        className={`micro-badge border font-bold ${
                          STATUS_COLORS[app.status] || "bg-slate-100 text-slate-700 border-slate-200"
                        }`}
                      >
                        {app.status}
                      </span>
                      {app.interviewDate && (
                        <span className="text-[10px] text-indigo-700 font-semibold">
                          📅 {new Date(app.interviewDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Inline Stage Dropdown Action & Detail Modal Launcher */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <select
                        value={app.status}
                        onChange={(e) => handleDropdownChange(app, e.target.value)}
                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800 outline-none hover:border-indigo-400 focus:border-indigo-600 cursor-pointer shadow-xs"
                      >
                        <option value="APPLIED">Applied</option>
                        <option value="SHORTLISTED">Shortlisted</option>
                        <option value="INTERVIEW_SCHEDULED">Interview Scheduled 📅</option>
                        <option value="OFFERED">Make Offer 🎉</option>
                        <option value="REJECTED">Reject</option>
                      </select>

                      <button
                        onClick={() => openStatusModal(app, app.status)}
                        title="Edit Stage, Interview Slot & Feedback Notes"
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-indigo-600 shadow-xs cursor-pointer transition-all"
                      >
                        <Edit3 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* RECRUITER STAGE & INTERVIEW NOTES MODAL */}
      {selectedAppModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
          onClick={() => setSelectedAppModal(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-200 pb-4 mb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
                  Update Candidate Pipeline Stage
                </span>
                <h3 className="font-heading text-lg font-bold text-slate-900 mt-0.5">
                  {selectedAppModal.student?.profile?.fullName || studentProfile?.fullName || "Candidate"}
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Drive: {selectedAppModal.companyName || selectedAppModal.jobDrive?.companyName} (
                  {selectedAppModal.title || selectedAppModal.jobDrive?.title})
                </p>
              </div>
              <button
                onClick={() => setSelectedAppModal(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleModalSubmit} className="flex flex-col gap-4">
              {/* Target Stage Selector */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">Pipeline Stage *</label>
                <select
                  value={modalForm.status}
                  onChange={(e) => setModalForm({ ...modalForm, status: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-slate-900 font-semibold outline-none focus:border-indigo-600 shadow-xs cursor-pointer"
                >
                  <option value="APPLIED">Applied</option>
                  <option value="SHORTLISTED">Shortlisted</option>
                  <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
                  <option value="OFFERED">Make Offer (Selected)</option>
                  <option value="REJECTED">Reject Application</option>
                </select>
              </div>

              {/* Interview Date/Time Picker */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Interview Date & Time{" "}
                  {modalForm.status === "INTERVIEW_SCHEDULED" && <span className="text-indigo-600">*</span>}
                </label>
                <div className="relative">
                  <Calendar size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="datetime-local"
                    value={modalForm.interviewDate}
                    onChange={(e) => setModalForm({ ...modalForm, interviewDate: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-slate-900 font-medium outline-none focus:border-indigo-600 shadow-xs"
                  />
                </div>
                <p className="text-[10px] text-slate-400 font-medium mt-1">
                  Specifies when the candidate should attend the technical/HR interview.
                </p>
              </div>

              {/* Recruiter Feedback & Next Steps Textarea */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Recruiter Notes & Instructions
                </label>
                <div className="relative">
                  <MessageSquare size={14} className="absolute left-3.5 top-3 text-slate-400" />
                  <textarea
                    rows={3}
                    placeholder="e.g. Round 1 Technical scheduled on Google Meet: meet.google.com/xyz. Please prepare DSA and System Design topics."
                    value={modalForm.feedbackNotes}
                    onChange={(e) => setModalForm({ ...modalForm, feedbackNotes: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-slate-900 font-medium outline-none focus:border-indigo-600 shadow-xs"
                  />
                </div>
                <p className="text-[10px] text-slate-400 font-medium mt-1">
                  These instructions will be visible on the student's timeline stepper and included in their email alert.
                </p>
              </div>

              {/* Automated Email Notice */}
              <div className="flex items-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50/70 p-2.5 text-[11px] font-semibold text-indigo-900">
                <Send size={13} className="text-indigo-600 shrink-0" />
                <span>An automated email notification with these notes will be sent to the candidate.</span>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedAppModal(null)}
                  className="rounded-xl border border-slate-200 bg-slate-100 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-5 py-2 font-bold text-white shadow-md shadow-indigo-500/25 hover:from-indigo-700 hover:to-indigo-800 cursor-pointer"
                >
                  <CheckCircle2 size={14} />
                  <span>Update Stage & Notify</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
