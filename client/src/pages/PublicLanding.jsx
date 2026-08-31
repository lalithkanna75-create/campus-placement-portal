import React from "react";
import {
  Search,
  Filter,
  Briefcase,
  Building2,
  GraduationCap,
  LogIn,
  UserPlus,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import DriveCard from "../components/DriveCard";

export default function PublicLanding({
  drives = [],
  searchQuery = "",
  onSearchChange,
  selectedBranch = "ALL",
  onSelectBranch,
  onOpenDriveModal,
  onOpenAuthModal,
  onApplyClick,
}) {
  const displayedDrives = drives.filter((drive) => {
    const matchesSearch =
      drive.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      drive.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBranch =
      selectedBranch === "ALL" ||
      (drive.allowedBranches && drive.allowedBranches.includes(selectedBranch));
    return matchesSearch && matchesBranch;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Hero / Public Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 text-white p-8 sm:p-10 shadow-xl mb-10">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-bold text-indigo-300 backdrop-blur-md mb-4 shadow-xs">
            <GraduationCap size={14} className="text-indigo-400" />
            <span>University Placement Season 2025–26</span>
          </div>

          <h1 className="font-heading text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl text-white leading-tight">
            Campus Recruitment & Placement Drive Portal
          </h1>

          <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            Explore verified enterprise placement postings, hiring eligibility criteria, and interview timelines.
            Sign in to submit applications, track your interview pipeline, and stream verified PDF resumes.
          </p>

          {/* Call to Actions */}
          <div className="mt-8 flex flex-wrap items-center gap-3.5">
            <button
              onClick={() => onOpenAuthModal("LOGIN")}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition-all cursor-pointer"
            >
              <LogIn size={15} />
              <span>Sign In to Apply</span>
            </button>

            <button
              onClick={() => onOpenAuthModal("REGISTER")}
              className="flex items-center gap-2 rounded-xl border border-slate-700 bg-white/10 px-5 py-2.5 text-xs font-bold text-white hover:bg-white/20 backdrop-blur-md transition-all cursor-pointer"
            >
              <UserPlus size={15} />
              <span>Register Student Account</span>
            </button>
          </div>
        </div>

        {/* Decorative Grid Lines */}
        <div className="absolute right-0 top-0 -mt-12 -mr-12 h-96 w-96 rounded-full bg-indigo-600/15 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 -mb-12 h-64 w-64 rounded-full bg-purple-600/15 blur-3xl pointer-events-none"></div>
      </div>

      {/* Public Drives Section */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4 mb-6">
          <div>
            <h2 className="font-heading text-xl font-bold text-slate-900">
              Active Placement Drives ({displayedDrives.length})
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Browse campus recruitment drives currently accepting student applications.
            </p>
          </div>

          {/* Quick Filter Info */}
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Live Campus Drives</span>
          </div>
        </div>

        {/* Search & Department Filter Bar */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="relative flex-1 min-w-[280px]">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search company, job title, CTC..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-500 shadow-xs transition-all"
            />
          </div>

          {/* Department Filter */}
          <div className="flex items-center gap-2">
            <Filter size={15} className="text-slate-400" />
            <select
              value={selectedBranch}
              onChange={(e) => onSelectBranch(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-500 shadow-xs cursor-pointer"
            >
              <option value="ALL">All Departments</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Electronics">Electronics</option>
              <option value="Mechanical">Mechanical</option>
            </select>
          </div>
        </div>

        {/* Drives Grid */}
        {displayedDrives.length === 0 ? (
          <div className="glass-card flex flex-col items-center justify-center rounded-2xl p-12 text-center border border-slate-200 bg-white shadow-soft">
            <Briefcase size={36} className="text-slate-400 mb-3" />
            <p className="text-sm font-bold text-slate-700">No matching drives found</p>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Try adjusting your search keywords or branch filter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {displayedDrives.map((drive) => (
              <DriveCard
                key={drive.id}
                drive={drive}
                applied={null}
                onSelectDetails={onOpenDriveModal}
                onApply={onApplyClick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
