import React, { useState } from "react";
import {
  Search,
  Filter,
  Briefcase,
  Sparkles,
  Command,
  X,
  PlusCircle,
  Clock,
  MapPin,
  CheckCircle2,
} from "lucide-react";
import MetricsRibbon from "../components/MetricsRibbon";
import DriveCard from "../components/DriveCard";
import ApplicationStepper from "../components/ApplicationStepper";

/**
 * Modern Linear/Raycast-Inspired Student Placement Portal Dashboard
 */
export default function StudentDashboard({
  profile,
  drives,
  applications,
  searchQuery,
  onSearchChange,
  selectedBranch,
  onSelectBranch,
  onApply,
  onSelectDriveModal,
}) {
  const [activeTab, setActiveTab] = useState("drives"); // 'drives' | 'applications'

  // Filter drives
  const displayedDrives = drives.filter((drive) => {
    const matchesSearch =
      drive.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      drive.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBranch =
      selectedBranch === "ALL" ||
      (drive.allowedBranches && drive.allowedBranches.includes(selectedBranch));
    return matchesSearch && matchesBranch;
  });

  const shortlistsCount = applications.filter(
    (a) =>
      a.status === "SHORTLISTED" ||
      a.status === "INTERVIEW_SCHEDULED" ||
      a.status === "OFFERED"
  ).length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      
      {/* 4-Card Top Stat Metrics Ribbon */}
      <MetricsRibbon
        profile={profile}
        applicationsCount={applications.length}
        shortlistsCount={shortlistsCount}
        drivesCount={drives.length}
      />

      {/* Main Tab Segmented Control */}
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-4 mb-6">
        <div className="flex items-center gap-6">
          <button
            onClick={() => setActiveTab("drives")}
            className={`font-heading text-sm font-bold pb-2 transition-all relative ${
              activeTab === "drives"
                ? "text-indigo-400 after:absolute after:bottom-[-17px] after:left-0 after:right-0 after:h-[2px] after:bg-indigo-500 after:shadow-glow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Placement Drives ({displayedDrives.length})
          </button>

          <button
            onClick={() => setActiveTab("applications")}
            className={`font-heading text-sm font-bold pb-2 transition-all relative ${
              activeTab === "applications"
                ? "text-indigo-400 after:absolute after:bottom-[-17px] after:left-0 after:right-0 after:h-[2px] after:bg-indigo-500 after:shadow-glow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            My Application Pipeline ({applications.length})
          </button>
        </div>

        {/* Live Filter Counter */}
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Matching Eligibility: CSE, IT, ECE</span>
        </div>
      </div>

      {/* TAB 1: BROWSE PLACEMENT DRIVES */}
      {activeTab === "drives" && (
        <div>
          {/* Quick Filter & Search Bar */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <div className="relative flex-1 min-w-[280px]">
              <Search
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search company, job role, CTC..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-900/70 py-2.5 pl-10 pr-4 text-xs text-white placeholder:text-slate-500 outline-none focus:border-indigo-500 transition-all shadow-inner"
              />
            </div>

            {/* Department Quick Filter */}
            <div className="flex items-center gap-2">
              <Filter size={15} className="text-slate-400" />
              <select
                value={selectedBranch}
                onChange={(e) => onSelectBranch(e.target.value)}
                className="rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2.5 text-xs text-slate-200 outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="ALL">All Departments</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Electronics">Electronics</option>
                <option value="Electrical">Electrical</option>
              </select>
            </div>
          </div>

          {/* Drive Cards Grid */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {displayedDrives.map((drive) => {
              const applied = applications.find(
                (a) => a.jobDriveId === drive.id || (a.jobDrive && a.jobDrive.id === drive.id)
              );

              return (
                <DriveCard
                  key={drive.id}
                  drive={drive}
                  applied={applied}
                  onSelectDetails={onSelectDriveModal}
                  onApply={onApply}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: MY APPLICATIONS TRACKER */}
      {activeTab === "applications" && (
        <div className="flex flex-col gap-4">
          {applications.length === 0 ? (
            <div className="glass-card flex flex-col items-center justify-center rounded-2xl p-12 text-center">
              <Briefcase size={36} className="text-slate-500 mb-3" />
              <p className="text-sm font-semibold text-slate-300">No applications yet</p>
              <p className="text-xs text-slate-500 mt-1">
                Browse active drives and apply with 1-click.
              </p>
            </div>
          ) : (
            applications.map((app) => {
              const company = app.companyName || app.jobDrive?.companyName || "Google";
              const title = app.title || app.jobDrive?.title || "SDE";
              const ctc = app.ctc || app.jobDrive?.ctc || "24 LPA";
              const location = app.location || app.jobDrive?.location || "Bangalore, India";

              return (
                <div key={app.id} className="glass-card rounded-2xl p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
                        {company}
                      </span>
                      <h3 className="font-heading text-lg font-bold text-white mt-0.5">
                        {title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Applied on {new Date(app.appliedAt).toLocaleDateString()} • {location}
                      </p>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <span className="micro-badge bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-glow-emerald">
                        {ctc}
                      </span>
                      <span className="micro-badge bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                        Stage: {app.status}
                      </span>
                    </div>
                  </div>

                  {/* Modern Stepper Timeline */}
                  <ApplicationStepper currentStatus={app.status} />
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
