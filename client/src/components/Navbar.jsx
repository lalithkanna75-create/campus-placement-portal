import React from "react";
import {
  GraduationCap,
  Building2,
  ShieldCheck,
  Search,
  Command,
  LogIn,
  LogOut,
  User,
} from "lucide-react";

/**
 * Custom Stylized Brand Logo Icon for NexPlacement
 */
function BrandLogoMark() {
  return (
    <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-purple-600 shadow-md shadow-indigo-500/25 ring-1 ring-white/20">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-5 h-5 text-white"
      >
        <path
          d="M4 18L10 6L14 13L20 6"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="20" cy="6" r="2.5" fill="#38BDF8" />
        <path
          d="M4 18H8"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

/**
 * Modern Bright / Light Theme Navbar with Authenticated Role Session
 */
export default function Navbar({
  currentUser,
  profile,
  onOpenAuthModal,
  onLogout,
  onEditProfile,
  serverHealth,
  onCheckHealth,
  searchQuery,
  onSearchChange,
  onOpenSearchModal,
}) {
  const role = currentUser?.role || "GUEST";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/85 backdrop-blur-xl shadow-xs transition-all">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        
        {/* Custom Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <BrandLogoMark />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading text-lg font-extrabold tracking-tight text-slate-900">
                NexPlacement
              </span>
              <span className="micro-badge bg-indigo-50 text-indigo-700 border border-indigo-200/80 font-bold">
                PRO
              </span>
            </div>
            <p className="hidden text-[11px] font-medium text-slate-500 sm:block">
              Campus Recruitment Portal
            </p>
          </div>
        </div>

        {/* Center: Search Trigger & Active Authenticated Session Badge */}
        <div className="flex items-center gap-3">
          {/* Quick Search Button (Command + K) */}
          <div
            onClick={onOpenSearchModal}
            className="hidden md:flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-1.5 text-xs text-slate-500 hover:border-slate-300 hover:text-slate-800 hover:bg-white cursor-pointer transition-all shadow-xs"
          >
            <Search size={14} className="text-slate-400" />
            <span>Search drives, companies...</span>
            <kbd className="flex items-center gap-0.5 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 shadow-xs">
              <Command size={10} /> K
            </kbd>
          </div>

          {/* Authenticated Role Indicator */}
          {currentUser ? (
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs shadow-xs">
              <div className="flex items-center gap-1.5">
                {role === "STUDENT" && <GraduationCap size={14} className="text-indigo-600" />}
                {role === "RECRUITER" && <Building2 size={14} className="text-purple-600" />}
                {role === "ADMIN" && <ShieldCheck size={14} className="text-emerald-600" />}
                <span className="font-bold text-slate-900">{role}</span>
              </div>
              <span className="text-slate-300">|</span>
              <span className="text-slate-500 font-medium truncate max-w-[120px] sm:max-w-[160px]">
                {currentUser.profile?.fullName || currentUser.email}
              </span>
            </div>
          ) : (
            <div className="text-xs text-slate-500 font-medium hidden sm:block">
              Public Viewer Mode
            </div>
          )}
        </div>

        {/* Right Section: API Health & Auth Buttons */}
        <div className="flex items-center gap-2.5">
          {/* Health Status */}
          <div
            onClick={onCheckHealth}
            title="Click to ping Express + Supabase API"
            className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-700 shadow-xs hover:border-slate-300 cursor-pointer transition-all"
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
                    : "bg-slate-400"
                }`}
              ></span>
            </span>
            <span className="hidden sm:inline">
              {serverHealth.status === "ONLINE" ? "ONLINE" : serverHealth.status}
            </span>
            {serverHealth.latencyMs && (
              <span className="text-emerald-600 font-mono text-[10px] font-bold">
                {serverHealth.latencyMs}ms
              </span>
            )}
          </div>

          {/* Student Profile Pill (Click to Edit) */}
          {currentUser && role === "STUDENT" && profile && (
            <div
              onClick={onEditProfile}
              title="Click to edit academic profile & eligibility criteria"
              className="flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1 pl-1.5 pr-3 shadow-xs hover:border-indigo-300 hover:shadow-sm cursor-pointer transition-all"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-indigo-700 text-[11px] font-bold text-white shadow-xs">
                {profile.fullName?.charAt(0) || "A"}
              </div>
              <div className="hidden sm:flex flex-col text-left leading-tight">
                <span className="text-xs font-bold text-slate-900 truncate max-w-[100px]">
                  {profile.fullName}
                </span>
                <span className="text-[10px] font-semibold text-emerald-600">
                  {profile.cgpa} CGPA
                </span>
              </div>
            </div>
          )}

          {/* Login / Switch Account Button */}
          {currentUser ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={onOpenAuthModal}
                title="Switch Authenticated Account"
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer shadow-xs"
              >
                <User size={13} />
                <span className="hidden sm:inline">Switch</span>
              </button>
              <button
                onClick={onLogout}
                title="Log out of session"
                className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 cursor-pointer shadow-xs"
              >
                <LogOut size={13} />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-4 py-1.5 text-xs font-bold text-white shadow-md shadow-indigo-500/25 hover:from-indigo-700 hover:to-indigo-800 cursor-pointer"
            >
              <LogIn size={13} />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
