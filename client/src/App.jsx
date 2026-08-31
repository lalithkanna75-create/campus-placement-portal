import React, { useState, useEffect } from "react";
import {
  Briefcase,
  PlusCircle,
  X,
  Search,
  Building2,
  TrendingUp,
  Award,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  LogIn,
  AlertCircle,
  Loader2,
} from "lucide-react";
import Navbar from "./components/Navbar";
import StudentDashboard from "./pages/StudentDashboard";
import ApplicantTable from "./components/ApplicantTable";
import ProfileSetupModal from "./components/ProfileSetupModal";
import AuthModal from "./components/AuthModal";
import {
  authApi,
  drivesApi,
  applicationsApi,
  studentsApi,
  checkHealthApi,
  getStoredToken,
  clearStoredAuth,
} from "./services/api";

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [drives, setDrives] = useState([]);
  const [applications, setApplications] = useState([]);
  const [adminStats, setAdminStats] = useState({
    totalDrives: 0,
    totalOffers: 0,
    activeCandidates: 0,
    averageCTC: "14.8 LPA",
    placementPercentage: 92,
  });

  // Loading & Error states
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("ALL");
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Health check state
  const [serverHealth, setServerHealth] = useState({
    status: "CHECKING",
    latencyMs: null,
    dbStatus: "PENDING",
  });

  // Modal States
  const [selectedDriveModal, setSelectedDriveModal] = useState(null);
  const [isPostDriveOpen, setIsPostDriveOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // New Drive Form
  const [newDriveForm, setNewDriveForm] = useState({
    title: "",
    companyName: "",
    ctc: "",
    location: "",
    minCgpa: 7.0,
    allowedBranches: "Computer Science, Information Technology",
    maxBacklogs: 0,
    deadlineDays: 14,
    description: "",
  });

  const showToast = (text, type = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const role = currentUser?.role || "GUEST";

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchModalOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const checkHealth = async () => {
    try {
      const startTime = Date.now();
      const data = await checkHealthApi();
      const latency = Date.now() - startTime;
      setServerHealth({
        status: data.status === "UP" ? "ONLINE" : "DEGRADED",
        latencyMs: latency,
        dbStatus: data.database?.status || "UNKNOWN",
      });
    } catch (_) {
      setServerHealth({
        status: "OFFLINE",
        latencyMs: null,
        dbStatus: "UNREACHABLE",
      });
    }
  };

  // Initialize authenticated user session from API
  const initUserSession = async () => {
    const token = getStoredToken();
    if (!token) {
      setCurrentUser(null);
      setProfile(null);
      return;
    }

    try {
      const user = await authApi.getMe();
      if (user) {
        setCurrentUser(user);
        setProfile(user.profile || null);
      } else {
        clearStoredAuth();
        setCurrentUser(null);
        setProfile(null);
      }
    } catch (err) {
      console.warn("Session verification failed:", err.message);
      clearStoredAuth();
      setCurrentUser(null);
      setProfile(null);
    }
  };

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    setProfile(user.profile || null);
    loadPortalData();
  };

  const handleLogout = async () => {
    await authApi.logout();
    setCurrentUser(null);
    setProfile(null);
    setApplications([]);
    showToast("Logged out successfully.", "info");
    loadPortalData();
  };

  const loadPortalData = async () => {
    try {
      setIsLoading(true);
      setApiError(null);

      // 1. Fetch Drives
      const fetchedDrives = await drivesApi.getDrives({
        search: searchQuery,
        branch: selectedBranch,
      });
      setDrives(fetchedDrives || []);

      // 2. Fetch User-Authorized Applications
      if (getStoredToken()) {
        const userRole = currentUser?.role;
        if (userRole === "STUDENT") {
          const myApps = await applicationsApi.getMyApplications();
          setApplications(myApps || []);
        } else if (userRole === "RECRUITER" || userRole === "ADMIN") {
          // If recruiter or admin, aggregate drive applications
          if (fetchedDrives && fetchedDrives.length > 0) {
            try {
              const allDriveApps = await Promise.all(
                fetchedDrives.map(async (d) => {
                  try {
                    return await applicationsApi.getDriveApplications(d.id);
                  } catch (_) {
                    return [];
                  }
                })
              );
              setApplications(allDriveApps.flat());
            } catch (_) {
              setApplications([]);
            }
          } else {
            setApplications([]);
          }
        }
      } else {
        setApplications([]);
      }
    } catch (err) {
      setApiError(err.message || "Failed to load placement drives from API.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
    initUserSession();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    loadPortalData();
  }, [searchQuery, selectedBranch, currentUser]);

  const handleApply = async (drive) => {
    if (!currentUser || role !== "STUDENT") {
      showToast("Please sign in as a Student to apply.", "warning");
      setIsAuthModalOpen(true);
      return;
    }

    try {
      await applicationsApi.apply(drive.id);
      showToast(`Successfully applied to ${drive.companyName}! 🎉`, "success");
      await loadPortalData();
      if (selectedDriveModal) setSelectedDriveModal(null);
    } catch (err) {
      if (err.details && Array.isArray(err.details)) {
        showToast(err.details.join(" | "), "error");
      } else {
        showToast(err.message || "Failed to apply for drive.", "error");
      }
    }
  };

  const handleCreateDrive = async (e) => {
    e.preventDefault();
    if (!currentUser || (role !== "RECRUITER" && role !== "ADMIN")) {
      showToast("Unauthorized: Please sign in as Recruiter or Admin.", "error");
      setIsAuthModalOpen(true);
      return;
    }

    if (!newDriveForm.title || !newDriveForm.companyName || !newDriveForm.ctc) {
      showToast("Please fill in all required fields", "error");
      return;
    }

    const drivePayload = {
      title: newDriveForm.title,
      companyName: newDriveForm.companyName,
      description: newDriveForm.description || "Engineering role.",
      ctc: newDriveForm.ctc,
      location: newDriveForm.location || "Bangalore, India",
      minCgpa: parseFloat(newDriveForm.minCgpa) || 0,
      allowedBranches: newDriveForm.allowedBranches.split(",").map((b) => b.trim()),
      maxBacklogs: parseInt(newDriveForm.maxBacklogs, 10) || 0,
      deadline: new Date(Date.now() + (parseInt(newDriveForm.deadlineDays, 10) || 14) * 86400000).toISOString(),
    };

    try {
      await drivesApi.createDrive(drivePayload);
      showToast(`Drive for ${drivePayload.companyName} published! 🚀`, "success");
      await loadPortalData();
      setIsPostDriveOpen(false);
    } catch (err) {
      showToast(err.message || "Failed to create drive", "error");
    }
  };

  const handleUpdateStatus = async (appId, statusPayload) => {
    const payload = typeof statusPayload === "string" ? { status: statusPayload } : statusPayload;
    try {
      await applicationsApi.updateStatus(appId, payload);
      showToast(`Candidate stage updated to ${payload.status}! 🚀`, "success");
      await loadPortalData();
    } catch (err) {
      showToast(err.message || "Failed to update candidate status.", "error");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-xl px-4 py-3 text-xs font-bold text-white shadow-xl transition-all animate-bounce ${
            toastMessage.type === "error"
              ? "bg-rose-600 border border-rose-700"
              : toastMessage.type === "warning"
              ? "bg-amber-600 border border-amber-700"
              : toastMessage.type === "info"
              ? "bg-indigo-600 border border-indigo-700"
              : "bg-emerald-600 border border-emerald-700"
          }`}
        >
          {toastMessage.type === "error" ? (
            <XCircle size={16} />
          ) : toastMessage.type === "warning" ? (
            <AlertCircle size={16} />
          ) : (
            <CheckCircle2 size={16} />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Navbar with Authenticated Session State */}
      <Navbar
        currentUser={currentUser}
        profile={profile}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        onEditProfile={() => setIsProfileModalOpen(true)}
        serverHealth={serverHealth}
        onCheckHealth={checkHealth}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenSearchModal={() => setIsSearchModalOpen(true)}
      />

      {/* Main View */}
      <main className="flex-1 w-full">
        {/* API Error Alert Banner */}
        {apiError && (
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4">
            <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-800">
              <AlertCircle size={18} className="text-rose-600 shrink-0" />
              <div className="flex-1">
                <span className="font-bold">API Connection Notice: </span>
                <span>{apiError}</span>
              </div>
              <button
                onClick={loadPortalData}
                className="rounded-lg bg-rose-600 px-3 py-1 text-white hover:bg-rose-700 cursor-pointer font-bold"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Dynamic Authenticated Role Views */}
        {role === "STUDENT" || role === "GUEST" ? (
          <StudentDashboard
            profile={profile}
            drives={drives}
            applications={applications}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedBranch={selectedBranch}
            onSelectBranch={setSelectedBranch}
            onApply={handleApply}
            onOpenDriveModal={setSelectedDriveModal}
            onUploadSuccess={(newProfile) => setProfile(newProfile)}
            showToast={showToast}
          />
        ) : role === "RECRUITER" ? (
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-6 mb-8">
              <div>
                <h1 className="font-heading text-2xl font-extrabold text-slate-900">
                  Recruiter Drive Console
                </h1>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Manage your authored placement postings and candidate pipeline progression.
                </p>
              </div>
              <button
                onClick={() => setIsPostDriveOpen(true)}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-500/25 hover:from-indigo-700 hover:to-indigo-800 cursor-pointer"
              >
                <PlusCircle size={15} />
                <span>Post New Drive</span>
              </button>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center p-12 text-slate-400">
                <Loader2 size={24} className="animate-spin text-indigo-600" />
                <span className="ml-2 font-semibold text-xs">Loading candidate roster...</span>
              </div>
            ) : applications.length === 0 ? (
              <div className="glass-card rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-soft">
                <Briefcase size={36} className="mx-auto text-slate-300 mb-3" />
                <h3 className="text-sm font-bold text-slate-800">No applicants yet</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Candidates who apply to your authored placement drives will appear here in real time.
                </p>
              </div>
            ) : (
              <ApplicantTable
                applications={applications}
                studentProfile={profile}
                onUpdateStatus={handleUpdateStatus}
                onExportCSV={() => {
                  if (drives.length > 0) {
                    drivesApi.exportApplicantsCsv(drives[0].id, drives[0].title);
                  }
                }}
              />
            )}
          </div>
        ) : (
          /* ADMIN SUITE */
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-6 mb-8">
              <div>
                <h1 className="font-heading text-2xl font-extrabold text-slate-900">
                  Placement Director Executive Suite
                </h1>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  University-wide placement analytics, audit controls, and applicant tracking.
                </p>
              </div>
              <button
                onClick={() => setIsPostDriveOpen(true)}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-500/25 hover:from-indigo-700 hover:to-indigo-800 cursor-pointer"
              >
                <PlusCircle size={15} />
                <span>Create Drive</span>
              </button>
            </div>

            {/* Metrics Ribbon */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-8">
              <div className="glass-card rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Total Active Drives
                  </span>
                  <Briefcase size={18} className="text-indigo-600" />
                </div>
                <div className="font-heading text-2xl font-extrabold text-slate-900 mt-2">
                  {drives.length}
                </div>
                <p className="text-[11px] font-medium text-emerald-600 mt-1">Live recruitment drives</p>
              </div>

              <div className="glass-card rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Total Applications
                  </span>
                  <TrendingUp size={18} className="text-emerald-600" />
                </div>
                <div className="font-heading text-2xl font-extrabold text-slate-900 mt-2">
                  {applications.length}
                </div>
                <p className="text-[11px] font-medium text-slate-500 mt-1">Across all branches</p>
              </div>

              <div className="glass-card rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Placement Rate
                  </span>
                  <Award size={18} className="text-purple-600" />
                </div>
                <div className="font-heading text-2xl font-extrabold text-slate-900 mt-2">92%</div>
                <p className="text-[11px] font-medium text-emerald-600 mt-1">Average CTC 14.8 LPA</p>
              </div>
            </div>

            <ApplicantTable
              applications={applications}
              studentProfile={profile}
              onUpdateStatus={handleUpdateStatus}
              onExportCSV={() => {
                if (drives.length > 0) {
                  drivesApi.exportApplicantsCsv(drives[0].id, drives[0].title);
                }
              }}
            />
          </div>
        )}
      </main>

      {/* QUICK SEARCH MODAL */}
      {isSearchModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-slate-900/40 backdrop-blur-sm p-4"
          onClick={() => setIsSearchModalOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3.5 bg-slate-50/50">
              <Search size={16} className="text-slate-400" />
              <input
                type="text"
                autoFocus
                placeholder="Type company, role, or skill..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none"
              />
              <kbd className="rounded border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-bold text-slate-500">
                ESC
              </kbd>
            </div>

            <div className="max-h-80 overflow-y-auto p-2 divide-y divide-slate-100">
              {drives.slice(0, 5).map((d) => (
                <div
                  key={d.id}
                  onClick={() => {
                    setSelectedDriveModal(d);
                    setIsSearchModalOpen(false);
                  }}
                  className="flex items-center justify-between rounded-xl px-3.5 py-3 text-xs hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <div>
                    <div className="font-bold text-slate-900">{d.companyName}</div>
                    <div className="text-slate-500 font-medium text-[11px]">{d.title}</div>
                  </div>
                  <span className="micro-badge bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                    {d.ctc}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* POST DRIVE MODAL */}
      {isPostDriveOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto"
          onClick={() => setIsPostDriveOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl text-xs max-h-[90vh] overflow-y-auto my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
              <h3 className="font-heading text-lg font-bold text-slate-900">Create Recruitment Drive</h3>
              <button onClick={() => setIsPostDriveOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateDrive} className="flex flex-col gap-4">
              <div>
                <label className="block text-slate-700 mb-1 font-bold">Company Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Google, Atlassian"
                  value={newDriveForm.companyName}
                  onChange={(e) => setNewDriveForm({ ...newDriveForm, companyName: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-slate-900 outline-none focus:border-indigo-600 shadow-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-bold">Job Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Software Development Engineer - I"
                  value={newDriveForm.title}
                  onChange={(e) => setNewDriveForm({ ...newDriveForm, title: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-slate-900 outline-none focus:border-indigo-600 shadow-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">CTC Package *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 28 LPA"
                    value={newDriveForm.ctc}
                    onChange={(e) => setNewDriveForm({ ...newDriveForm, ctc: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-slate-900 outline-none focus:border-indigo-600 shadow-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Minimum CGPA</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newDriveForm.minCgpa}
                    onChange={(e) => setNewDriveForm({ ...newDriveForm, minCgpa: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-slate-900 outline-none focus:border-indigo-600 shadow-xs font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-bold">Allowed Branches (Comma separated)</label>
                <input
                  type="text"
                  value={newDriveForm.allowedBranches}
                  onChange={(e) => setNewDriveForm({ ...newDriveForm, allowedBranches: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-slate-900 outline-none focus:border-indigo-600 shadow-xs font-medium"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPostDriveOpen(false)}
                  className="rounded-xl border border-slate-200 bg-slate-100 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-5 py-2 font-bold text-white shadow-md shadow-indigo-500/25 hover:from-indigo-700 hover:to-indigo-800 cursor-pointer"
                >
                  Publish Drive
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DRIVE DETAILS MODAL */}
      {selectedDriveModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto"
          onClick={() => setSelectedDriveModal(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl text-xs max-h-[90vh] overflow-y-auto my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-slate-200 pb-4 mb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
                  {selectedDriveModal.companyName}
                </span>
                <h3 className="font-heading text-lg font-bold text-slate-900 mt-0.5">
                  {selectedDriveModal.title}
                </h3>
              </div>
              <button onClick={() => setSelectedDriveModal(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              <span className="micro-badge bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                {selectedDriveModal.ctc}
              </span>
              <span className="micro-badge bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold">
                Min CGPA: {selectedDriveModal.minCgpa}
              </span>
              <span className="micro-badge bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold">
                Max Backlogs: {selectedDriveModal.maxBacklogs}
              </span>
            </div>

            <div className="mb-4">
              <span className="text-slate-700 font-bold block mb-1">Description</span>
              <p className="text-slate-600 leading-relaxed font-medium">{selectedDriveModal.description}</p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedDriveModal(null)}
                className="rounded-xl border border-slate-200 bg-slate-100 px-4 py-2 font-bold text-slate-700 hover:bg-slate-200 cursor-pointer"
              >
                Close
              </button>
              {role === "STUDENT" && (
                <button
                  onClick={() => handleApply(selectedDriveModal)}
                  className="rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-5 py-2 font-bold text-white shadow-md shadow-indigo-500/25 hover:from-indigo-700 hover:to-indigo-800 cursor-pointer"
                >
                  Confirm & Apply
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* STUDENT PROFILE SETUP MODAL */}
      <ProfileSetupModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        initialProfile={profile}
        onProfileSaved={(updatedProfile) => {
          setProfile(updatedProfile);
          loadPortalData();
        }}
        showToast={showToast}
      />

      {/* AUTH MODAL */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        showToast={showToast}
      />
    </div>
  );
}
