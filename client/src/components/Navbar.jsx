import React from "react";
import {
  Briefcase,
  GraduationCap,
  Building2,
  ShieldCheck,
  Search,
  Command,
  Activity,
  User,
} from "lucide-react";

/**
 * Modern Linear/Raycast-Inspired Floating Glassmorphic Navbar
 */
export default function Navbar({
  role,
  onRoleChange,
  profile,
  serverHealth,
  onCheckHealth,
  searchQuery,
  onSearchChange,
  onOpenSearchModal,
}) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.06] bg-[#0B0F19]/80 backdrop-blur-2xl transition-all">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        
        {/* Brand & Logo */}
        <div className="flex items-center gap-3.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-glow">
            <Briefcase size={18} className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading text-lg font-bold tracking-tight text-white">
                NexPlacement
              </span>
              <span className="micro-badge bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                PRO
              </span>
            </div>
            <p className="hidden text-[11px] text-slate-400 sm:block font-medium">
              Campus Recruitment Portal
            </p>
          </div>
        </div>

        {/* Center: Command + K Quick Search Trigger & Role Segmented Control */}
        <div className="flex items-center gap-3">
          {/* Quick Search Button (Raycast style) */}
          <div
            onClick={onOpenSearchModal}
            className="hidden md:flex items-center gap-2.5 rounded-lg border border-white/10 bg-slate-900/60 px-3 py-1.5 text-xs text-slate-400 hover:border-white/20 hover:text-slate-200 cursor-pointer transition-all shadow-inner"
          >
            <Search size={14} className="text-slate-500" />
            <span>Search drives, companies...</span>
            <kbd className="flex items-center gap-0.5 rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold text-slate-300">
              <Command size={10} /> K
            </kbd>
          </div>

          {/* Role Segmented Pill Control */}
          <div className="flex items-center rounded-xl border border-white/[0.08] bg-slate-900/80 p-1 shadow-inner backdrop-blur-md">
            <button
              onClick={() => onRoleChange("STUDENT")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-150 ${
                role === "STUDENT"
                  ? "bg-indigo-600 text-white shadow-glow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <GraduationCap size={14} />
              <span>Student</span>
            </button>

            <button
              onClick={() => onRoleChange("RECRUITER")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-150 ${
                role === "RECRUITER"
                  ? "bg-indigo-600 text-white shadow-glow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Building2 size={14} />
              <span>Recruiter</span>
            </button>

            <button
              onClick={() => onRoleChange("ADMIN")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-150 ${
                role === "ADMIN"
                  ? "bg-indigo-600 text-white shadow-glow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <ShieldCheck size={14} />
              <span>Admin</span>
            </button>
          </div>
        </div>

        {/* Right Section: API Health Badge & Profile Pill */}
        <div className="flex items-center gap-3">
          {/* Health Status Indicator */}
          <div
            onClick={onCheckHealth}
            title="Click to ping Express + Supabase API"
            className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-slate-900/60 px-3 py-1 text-[11px] font-medium text-slate-300 hover:border-white/20 cursor-pointer transition-all"
          >
            <span className="relative flex h-2 w-2">
              {serverHealth.status === "ONLINE" && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              )}
              <span
                className={`relative inline-flex h-2 w-2 rounded-full ${
                  serverHealth.status === "ONLINE"
                    ? "bg-emerald-500"
                    : serverHealth.status === "DEGRADED"
                    ? "bg-amber-500"
                    : "bg-slate-500"
                }`}
              ></span>
            </span>
            <span className="hidden sm:inline">
              {serverHealth.status === "ONLINE" ? "Live" : serverHealth.status}
            </span>
            {serverHealth.latencyMs && (
              <span className="text-emerald-400 font-mono text-[10px]">
                {serverHealth.latencyMs}ms
              </span>
            )}
          </div>

          {/* Student Profile Pill */}
          {role === "STUDENT" && profile && (
            <div className="flex items-center gap-2.5 rounded-full border border-indigo-500/20 bg-indigo-950/30 py-1 pl-1 pr-3 shadow-inner">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-[11px] font-bold text-white">
                {profile.fullName?.charAt(0) || "A"}
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
                <span className="truncate max-w-[90px] sm:max-w-[120px]">{profile.fullName}</span>
                <span className="text-[10px] text-emerald-400 font-mono font-bold">
                  {profile.cgpa} CGPA
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
