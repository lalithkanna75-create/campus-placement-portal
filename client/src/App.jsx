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
} from "lucide-react";
import Navbar from "./components/Navbar";
import StudentDashboard from "./pages/StudentDashboard";
import ApplicantTable from "./components/ApplicantTable";
import ProfileSetupModal from "./components/ProfileSetupModal";
import {
  authApi,
  drivesApi,
  applicationsApi,
  studentsApi,
  checkHealthApi,
  getStoredToken,
} from "./services/api";
import {
  initialStudentProfile,
  initialDrives,
  initialApplications,
  initialAdminStats,
} from "./services/mockData";

const DEMO_USERS = {
  STUDENT: {
    email: "alex.sharma@student.edu",
    password: "Password@123",
    role: "STUDENT",
    name: "Alex Sharma",
  },
  RECRUITER: {
    email: "recruiter.google@placement.edu",
    password: "Password@123",
    role: "RECRUITER",
    name: "Google Campus Team",
  },
  ADMIN: {
    email: "admin@placement.edu",
    password: "Password@123",
    role: "ADMIN",
    name: "Placement Director",
  },
};

export default function App() {
  const [role, setRole] = useState("STUDENT"); // 'STUDENT' | 'RECRUITER' | 'ADMIN'
  const [profile, setProfile] = useState(initialStudentProfile);
  const [drives, setDrives] = useState(initialDrives);
  const [applications, setApplications] = useState(initialApplications);
  const [adminStats, setAdminStats] = useState(initialAdminStats);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("ALL");
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

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

  const handleRoleSwitch = async (targetRole) => {
    setRole(targetRole);
    const demoCreds = DEMO_USERS[targetRole];
    if (!demoCreds) return;

    try {
      const authData = await authApi.login(demoCreds.email, demoCreds.password);
      if (authData?.user?.profile) {
        setProfile(authData.user.profile);
      }
      showToast(`Switched to ${demoCreds.name} (${targetRole})`, "success");
      await loadPortalData();
    } catch (_) {
      showToast(`Switched role to ${targetRole}`, "info");
    }
  };

  const loadPortalData = async () => {
    try {
      const fetchedDrives = await drivesApi.getDrives({
        search: searchQuery,
        branch: selectedBranch,
      });
      if (fetchedDrives && fetchedDrives.length > 0) {
        setDrives(fetchedDrives);
      }

      if (getStoredToken()) {
        const myApps = await applicationsApi.getMyApplications();
        if (myApps) setApplications(myApps);
      }
    } catch (err) {
      console.warn("Using fallback local dataset:", err.message);
    }
  };

  useEffect(() => {
    checkHealth();
    handleRoleSwitch("STUDENT");
    const interval = setInterval(checkHealth, 20000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    loadPortalData();
  }, [searchQuery, selectedBranch, role]);

  const handleApply = async (drive) => {
    try {
      if (getStoredToken() && role === "STUDENT") {
        await applicationsApi.apply(drive.id);
        showToast(`Successfully applied to ${drive.companyName}! 🎉`, "success");
        await loadPortalData();
        if (selectedDriveModal) setSelectedDriveModal(null);
        return;
      }
    } catch (err) {
      if (err.status === 403 || err.status === 409 || err.status === 400) {
        showToast(err.message, "error");
        return;
      }
    }

    const isAlreadyApplied = applications.some((a) => a.jobDriveId === drive.id);
    if (isAlreadyApplied) {
      showToast("You have already applied for this drive.", "warning");
      return;
    }

    const newApp = {
      id: `app-${Date.now()}`,
      jobDriveId: drive.id,
      companyName: drive.companyName,
      title: drive.title,
      ctc: drive.ctc,
      status: "APPLIED",
      appliedAt: new Date().toISOString(),
      location: drive.location,
    };

    setApplications([newApp, ...applications]);
    showToast(`Successfully applied to ${drive.companyName}! 🎉`, "success");
    if (selectedDriveModal) setSelectedDriveModal(null);
  };

  const handleCreateDrive = async (e) => {
    e.preventDefault();
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
      if (getStoredToken()) {
        await drivesApi.createDrive(drivePayload);
        showToast(`Drive for ${drivePayload.companyName} published!`, "success");
        await loadPortalData();
        setIsPostDriveOpen(false);
        return;
      }
    } catch (err) {
      showToast(err.message || "Failed to create drive", "error");
    }

    const localDrive = {
      id: `drive-${Date.now()}`,
      ...drivePayload,
      applicantsCount: 0,
    };
    setDrives([localDrive, ...drives]);
    setIsPostDriveOpen(false);
    showToast(`Drive for ${drivePayload.companyName} created!`, "success");
  };

  const handleUpdateStatus = async (appId, statusPayload) => {
    const payload = typeof statusPayload === "string" ? { status: statusPayload } : statusPayload;
    try {
      if (getStoredToken()) {
        await applicationsApi.updateStatus(appId, payload);
      }
    } catch (_) {}

    setApplications(
      applications.map((app) =>
        app.id === appId
          ? {
              ...app,
              status: payload.status,
              interviewDate: payload.interviewDate !== undefined ? payload.interviewDate : app.interviewDate,
              feedbackNotes: payload.feedbackNotes !== undefined ? payload.feedbackNotes : app.feedbackNotes,
            }
          : app
      )
    );
    showToast(`Candidate stage updated to ${payload.status}! 🚀`, "success");
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
              : "bg-emerald-600 border border-emerald-700"
          }`}
        >
          {toastMessage.type === "error" ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Floating Glassmorphic Navbar */}
      <Navbar
        role={role}
        onRoleChange={handleRoleSwitch}
        profile={profile}
        onEditProfile={() => setIsProfileModalOpen(true)}
        serverHealth={serverHealth}
        onCheckHealth={checkHealth}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenSearchModal={() => setIsSearchModalOpen(true)}
      />

      {/* Main View */}
      <main className="flex-1 w-full">
        {role === "STUDENT" && (
          <StudentDashboard
            profile={profile}
            drives={drives}
            applications={applications}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedBranch={selectedBranch}
            onSelectBranch={setSelectedBranch}
            onApply={handleApply}
            onSelectDriveModal={setSelectedDriveModal}
            onResumeUpdated={(newResumeUrl) => {
              setProfile((prev) => ({ ...prev, resumeUrl: newResumeUrl }));
              loadPortalData();
            }}
            showToast={showToast}
          />
        )}

        {role === "RECRUITER" && (
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="font-heading text-2xl font-extrabold text-slate-900">
                  Recruiter Drive Console
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Manage placement postings and candidate pipeline progression.
                </p>
              </div>

              <button
                onClick={() => setIsPostDriveOpen(true)}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-500/25 hover:from-indigo-700 hover:to-indigo-800 cursor-pointer"
              >
                <PlusCircle size={15} />
                <span>Post New Drive</span>
              </button>
            </div>

            <ApplicantTable
              applications={applications}
              studentProfile={profile}
              onUpdateStatus={handleUpdateStatus}
              onExportCSV={async () => {
                try {
                  const driveId = drives[0]?.id;
                  if (driveId && getStoredToken()) {
                    await drivesApi.exportApplicantsCsv(driveId, drives[0]?.title || "placement-drive");
                    showToast("Applicant CSV report downloaded! 📊", "success");
                    return;
                  }
                } catch (_) {}
                // Fallback client CSV export
                showToast("Generating applicant CSV report...", "info");
              }}
            />
          </div>
        )}

        {role === "ADMIN" && (
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h2 className="font-heading text-2xl font-extrabold text-slate-900">
                Executive Placement Analytics
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Campus-wide drive conversion, CTC benchmarks, and database health.
              </p>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              <div className="glass-card rounded-2xl p-5 border border-slate-200 bg-white">
                <span className="micro-badge bg-slate-100 text-slate-700 border border-slate-200">Total Offers</span>
                <div className="font-heading text-3xl font-extrabold text-indigo-600 mt-2">
                  {adminStats.totalOffers}
                </div>
                <span className="text-[11px] text-emerald-600 font-bold mt-1 block">
                  ↑ 18% increase
                </span>
              </div>

              <div className="glass-card rounded-2xl p-5 border border-slate-200 bg-white">
                <span className="micro-badge bg-slate-100 text-slate-700 border border-slate-200">Placement Rate</span>
                <div className="font-heading text-3xl font-extrabold text-slate-900 mt-2">
                  {adminStats.placementRate}
                </div>
                <span className="text-[11px] text-slate-500 font-medium mt-1 block">138 students placed</span>
              </div>

              <div className="glass-card rounded-2xl p-5 border border-slate-200 bg-white">
                <span className="micro-badge bg-slate-100 text-slate-700 border border-slate-200">Average Package</span>
                <div className="font-heading text-3xl font-extrabold text-slate-900 mt-2">
                  {adminStats.averagePackage}
                </div>
                <span className="text-[11px] text-indigo-600 font-bold mt-1 block">
                  Highest: {adminStats.highestPackage}
                </span>
              </div>

              <div className="glass-card rounded-2xl p-5 border border-slate-200 bg-white">
                <span className="micro-badge bg-slate-100 text-slate-700 border border-slate-200">Active Drives</span>
                <div className="font-heading text-3xl font-extrabold text-slate-900 mt-2">
                  {drives.length}
                </div>
                <span className="text-[11px] text-purple-700 font-bold mt-1 block">
                  Live in portal
                </span>
              </div>
            </div>

            <ApplicantTable
              applications={applications}
              studentProfile={profile}
              onUpdateStatus={handleUpdateStatus}
              onExportCSV={async () => {
                try {
                  const driveId = drives[0]?.id;
                  if (driveId && getStoredToken()) {
                    await drivesApi.exportApplicantsCsv(driveId, drives[0]?.title || "all-drives");
                    showToast("Applicant CSV report downloaded! 📊", "success");
                    return;
                  }
                } catch (_) {}
                showToast("Generating applicant CSV report...", "info");
              }}
            />
          </div>
        )}
      </main>

      {/* QUICK SEARCH MODAL */}
      {isSearchModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/40 backdrop-blur-sm pt-20 px-4"
          onClick={() => setIsSearchModalOpen(false)}
        >
          <div
            className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3.5 bg-slate-50/50">
              <Search size={18} className="text-slate-400" />
              <input
                type="text"
                autoFocus
                placeholder="Type to search placement drives, companies, or CTC..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none"
              />
              <kbd className="rounded border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-bold text-slate-500">
                ESC
              </kbd>
            </div>

            <div className="max-h-80 overflow-y-auto p-2 divide-y divide-slate-100">
              {drives.slice(0, 4).map((d) => (
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
          onClick={() => setIsPostDriveOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl text-xs"
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
          onClick={() => setSelectedDriveModal(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl text-xs"
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
    </div>
  );
}
