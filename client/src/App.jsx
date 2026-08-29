import React, { useState, useEffect } from "react";
import {
  Briefcase,
  GraduationCap,
  Building2,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  FileText,
  User,
  PlusCircle,
  ChevronRight,
  TrendingUp,
  Award,
  MapPin,
  RefreshCw,
  X,
  LogIn,
  LogOut,
} from "lucide-react";
import {
  authApi,
  drivesApi,
  applicationsApi,
  checkHealthApi,
  getStoredToken,
  getStoredUser,
} from "./services/api";
import ApplicationStepper from "./components/ApplicationStepper";
import {
  initialStudentProfile,
  initialDrives,
  initialApplications,
  initialAdminStats,
} from "./services/mockData";

// Demo Credentials for quick-switch
const DEMO_USERS = {
  STUDENT: {
    email: "alex.sharma@student.edu",
    password: "Password@123",
    role: "STUDENT",
    name: "Alex Sharma (CS)",
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
  const [currentUser, setCurrentUser] = useState(null);
  const [role, setRole] = useState("STUDENT"); // 'STUDENT' | 'RECRUITER' | 'ADMIN'
  const [activeTab, setActiveTab] = useState("drives"); // 'drives' | 'applications' | 'admin_analytics'

  const [profile, setProfile] = useState(initialStudentProfile);
  const [drives, setDrives] = useState(initialDrives);
  const [applications, setApplications] = useState(initialApplications);
  const [adminStats, setAdminStats] = useState(initialAdminStats);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("ALL");
  const [isLoading, setIsLoading] = useState(false);

  // Health check state
  const [serverHealth, setServerHealth] = useState({
    status: "CHECKING",
    latencyMs: null,
    dbStatus: "PENDING",
  });

  // Modals & Notifications
  const [selectedDriveModal, setSelectedDriveModal] = useState(null);
  const [isPostDriveOpen, setIsPostDriveOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Form State for Post Drive
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

  const showToast = (msg, type = "success") => {
    setToastMessage({ text: msg, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Health Check ping
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

  // Switch demo user with real JWT login
  const handleRoleSwitch = async (targetRole) => {
    setRole(targetRole);
    if (targetRole === "ADMIN") setActiveTab("admin_analytics");
    else setActiveTab("drives");

    const demoCreds = DEMO_USERS[targetRole];
    if (!demoCreds) return;

    try {
      setIsLoading(true);
      const authData = await authApi.login(demoCreds.email, demoCreds.password);
      setCurrentUser(authData.user);
      if (authData.user.profile) {
        setProfile(authData.user.profile);
      }
      showToast(`Switched to ${demoCreds.name} (${targetRole})`, "success");
      await loadPortalData();
    } catch (err) {
      console.warn("Backend auth unavailable, operating in demo state mode");
      showToast(`Switched role to ${targetRole} (Demo Mode)`, "info");
    } finally {
      setIsLoading(false);
    }
  };

  // Load live data from backend APIs
  const loadPortalData = async () => {
    try {
      setIsLoading(true);
      // 1. Fetch drives
      const fetchedDrives = await drivesApi.getDrives({
        search: searchQuery,
        branch: selectedBranch,
      });
      if (fetchedDrives && fetchedDrives.length > 0) {
        setDrives(fetchedDrives);
      }

      // 2. If student, fetch my applications
      if (role === "STUDENT" && getStoredToken()) {
        try {
          const myApps = await applicationsApi.getMyApplications();
          if (myApps) setApplications(myApps);
        } catch (_) {}
      }
    } catch (err) {
      console.warn("Using fallback local data:", err.message);
    } finally {
      setIsLoading(false);
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

  // Apply to drive handler (Student)
  const handleApply = async (drive) => {
    try {
      // 1. Attempt API apply
      if (getStoredToken() && role === "STUDENT") {
        const application = await applicationsApi.apply(drive.id);
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

    // Local fallback apply
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

  // Recruiter Create Drive handler
  const handleCreateDrive = async (e) => {
    e.preventDefault();
    if (!newDriveForm.title || !newDriveForm.companyName || !newDriveForm.ctc) {
      showToast("Please fill in all required fields", "error");
      return;
    }

    const drivePayload = {
      title: newDriveForm.title,
      companyName: newDriveForm.companyName,
      description: newDriveForm.description || "Exciting engineering role.",
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
        showToast(`Drive for ${drivePayload.companyName} published to live database!`, "success");
        await loadPortalData();
        setIsPostDriveOpen(false);
        return;
      }
    } catch (err) {
      showToast(err.message || "Failed to create drive", "error");
    }

    // Fallback
    const localDrive = {
      id: `drive-${Date.now()}`,
      ...drivePayload,
      applicantsCount: 0,
    };
    setDrives([localDrive, ...drives]);
    setIsPostDriveOpen(false);
    showToast(`Drive for ${drivePayload.companyName} created locally!`, "success");
  };

  // Recruiter Update Candidate Status
  const handleUpdateStatus = async (appId, newStatus) => {
    try {
      if (getStoredToken()) {
        await applicationsApi.updateStatus(appId, newStatus);
      }
    } catch (_) {}

    setApplications(
      applications.map((app) =>
        app.id === appId ? { ...app, status: newStatus } : app
      )
    );
    showToast(`Candidate stage updated to ${newStatus}`, "success");
  };

  // Client-side search & branch filter
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
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Toast Alert */}
      {toastMessage && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            zIndex: 100,
            background:
              toastMessage.type === "error"
                ? "#dc2626"
                : toastMessage.type === "warning"
                ? "#d97706"
                : "#10b981",
            color: "#fff",
            padding: "12px 20px",
            borderRadius: "10px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontWeight: 500,
            animation: "slideUp 0.2s ease-out",
          }}
        >
          {toastMessage.type === "error" ? <XCircle size={18} /> : <CheckCircle2 size={18} />}
          {toastMessage.text}
        </div>
      )}

      {/* Navigation Header */}
      <header
        style={{
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          backgroundColor: "rgba(10, 14, 26, 0.85)",
          backdropFilter: "blur(12px)",
          position: "sticky",
          top: 0,
          zIndex: 40,
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "16px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 15px rgba(99, 102, 241, 0.5)",
              }}
            >
              <Briefcase size={22} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: "1.25rem", fontWeight: 800, display: "flex", alignItems: "center", gap: "8px" }}>
                <span>NexPlacement</span>
                <span className="badge badge-emerald">JWT & RBAC ACTIVE</span>
              </div>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                Campus Recruitment & Placement Drive Portal
              </p>
            </div>
          </div>

          {/* Center: Role Switcher with Live JWT Switch */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: "rgba(17, 24, 39, 0.8)",
              padding: "4px",
              borderRadius: "12px",
              border: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            <button
              onClick={() => handleRoleSwitch("STUDENT")}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: "none",
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.2s",
                background: role === "STUDENT" ? "var(--accent-primary)" : "transparent",
                color: role === "STUDENT" ? "#fff" : "var(--text-muted)",
              }}
            >
              <GraduationCap size={16} /> Student View
            </button>
            <button
              onClick={() => handleRoleSwitch("RECRUITER")}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: "none",
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.2s",
                background: role === "RECRUITER" ? "var(--accent-primary)" : "transparent",
                color: role === "RECRUITER" ? "#fff" : "var(--text-muted)",
              }}
            >
              <Building2 size={16} /> Recruiter View
            </button>
            <button
              onClick={() => handleRoleSwitch("ADMIN")}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: "none",
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.2s",
                background: role === "ADMIN" ? "var(--accent-primary)" : "transparent",
                color: role === "ADMIN" ? "#fff" : "var(--text-muted)",
              }}
            >
              <ShieldCheck size={16} /> Admin Portal
            </button>
          </div>

          {/* Right Header Status */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              onClick={checkHealth}
              title="Click to ping Express API"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 12px",
                background: "rgba(17, 24, 39, 0.6)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "9999px",
                fontSize: "0.75rem",
                cursor: "pointer",
              }}
            >
              <div
                className="pulse-dot"
                style={{
                  backgroundColor: serverHealth.status === "ONLINE" ? "#10b981" : "#f59e0b",
                }}
              />
              <span style={{ color: "var(--text-muted)", fontWeight: 500 }}>
                API {serverHealth.status}
              </span>
              {serverHealth.latencyMs && (
                <span style={{ color: "#34d399", fontWeight: 600 }}>
                  {serverHealth.latencyMs}ms
                </span>
              )}
            </div>

            {role === "STUDENT" && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "6px 14px",
                  background: "rgba(99, 102, 241, 0.15)",
                  border: "1px solid rgba(99, 102, 241, 0.3)",
                  borderRadius: "9999px",
                  color: "#a5b4fc",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                }}
              >
                <User size={15} />
                <span>Alex Sharma (CGPA: {profile.cgpa})</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main style={{ maxWidth: "1280px", margin: "0 auto", padding: "32px 24px", flex: 1, width: "100%" }}>
        
        {/* STUDENT ROLE */}
        {role === "STUDENT" && (
          <div>
            {/* Student Stats Summary Bar */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "16px",
                marginBottom: "32px",
              }}
            >
              <div className="glass-panel" style={{ padding: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Academic Profile</span>
                  <Award size={18} color="#818cf8" />
                </div>
                <div style={{ fontSize: "1.6rem", fontWeight: 700, marginTop: "8px" }}>
                  {profile.cgpa} <span style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>CGPA</span>
                </div>
                <div style={{ fontSize: "0.75rem", color: "#34d399", marginTop: "4px" }}>
                  0 Active Backlogs • {profile.department}
                </div>
              </div>

              <div className="glass-panel" style={{ padding: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Applications Submitted</span>
                  <FileText size={18} color="#38bdf8" />
                </div>
                <div style={{ fontSize: "1.6rem", fontWeight: 700, marginTop: "8px" }}>
                  {applications.length}
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>
                  Active career opportunities
                </div>
              </div>

              <div className="glass-panel" style={{ padding: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Shortlisted / Offers</span>
                  <TrendingUp size={18} color="#34d399" />
                </div>
                <div style={{ fontSize: "1.6rem", fontWeight: 700, marginTop: "8px" }}>
                  {applications.filter((a) => a.status === "SHORTLISTED" || a.status === "OFFERED" || a.status === "INTERVIEW_SCHEDULED").length}
                </div>
                <div style={{ fontSize: "0.75rem", color: "#34d399", marginTop: "4px" }}>
                  Progression in pipeline
                </div>
              </div>

              <div className="glass-panel" style={{ padding: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Live Placement Drives</span>
                  <Building2 size={18} color="#c084fc" />
                </div>
                <div style={{ fontSize: "1.6rem", fontWeight: 700, marginTop: "8px" }}>
                  {displayedDrives.length}
                </div>
                <div style={{ fontSize: "0.75rem", color: "#c084fc", marginTop: "4px" }}>
                  Actively accepting applications
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div
              style={{
                display: "flex",
                borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                marginBottom: "24px",
                gap: "24px",
              }}
            >
              <button
                onClick={() => setActiveTab("drives")}
                style={{
                  background: "transparent",
                  border: "none",
                  padding: "12px 4px",
                  fontSize: "1rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  color: activeTab === "drives" ? "#818cf8" : "var(--text-muted)",
                  borderBottom: activeTab === "drives" ? "2px solid #818cf8" : "2px solid transparent",
                }}
              >
                Browse Placement Drives ({displayedDrives.length})
              </button>
              <button
                onClick={() => setActiveTab("applications")}
                style={{
                  background: "transparent",
                  border: "none",
                  padding: "12px 4px",
                  fontSize: "1rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  color: activeTab === "applications" ? "#818cf8" : "var(--text-muted)",
                  borderBottom: activeTab === "applications" ? "2px solid #818cf8" : "2px solid transparent",
                }}
              >
                Application Pipeline Tracker ({applications.length})
              </button>
            </div>

            {/* TAB: Drives */}
            {activeTab === "drives" && (
              <div>
                {/* Search & Filter */}
                <div style={{ display: "flex", gap: "16px", marginBottom: "24px", flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: "260px", position: "relative", display: "flex", alignItems: "center" }}>
                    <Search size={18} color="var(--text-muted)" style={{ position: "absolute", left: "14px" }} />
                    <input
                      type="text"
                      placeholder="Search company, job title..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "12px 16px 12px 42px",
                        borderRadius: "12px",
                        background: "rgba(17, 24, 39, 0.8)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        color: "#fff",
                        fontSize: "0.9rem",
                        outline: "none",
                      }}
                    />
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Filter size={18} color="var(--text-muted)" />
                    <select
                      value={selectedBranch}
                      onChange={(e) => setSelectedBranch(e.target.value)}
                      style={{
                        padding: "12px 16px",
                        borderRadius: "12px",
                        background: "rgba(17, 24, 39, 0.8)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        color: "#fff",
                        fontSize: "0.9rem",
                        outline: "none",
                        cursor: "pointer",
                      }}
                    >
                      <option value="ALL">All Departments</option>
                      <option value="Computer Science">Computer Science</option>
                      <option value="Information Technology">Information Technology</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Electrical">Electrical</option>
                    </select>
                  </div>
                </div>

                {/* Drives Cards Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "20px" }}>
                  {displayedDrives.map((drive) => {
                    const isEligible = drive.isEligible !== false;
                    const applied = applications.find(
                      (a) => a.jobDriveId === drive.id || (a.jobDrive && a.jobDrive.id === drive.id)
                    );

                    return (
                      <div
                        key={drive.id}
                        className="glass-panel glass-panel-interactive"
                        style={{ padding: "24px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}
                      >
                        <div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                            <div>
                              <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--accent-cyan)", textTransform: "uppercase" }}>
                                {drive.companyName}
                              </div>
                              <h3 style={{ fontSize: "1.15rem", fontWeight: 700, marginTop: "2px" }}>{drive.title}</h3>
                            </div>
                            <span className="badge badge-emerald" style={{ fontSize: "0.85rem" }}>
                              {drive.ctc}
                            </span>
                          </div>

                          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "16px" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                              <MapPin size={14} /> {drive.location}
                            </span>
                            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                              <Clock size={14} /> Due {new Date(drive.deadline).toLocaleDateString()}
                            </span>
                          </div>

                          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "16px" }}>
                            <span className="badge badge-indigo">Min CGPA: {drive.minCgpa}</span>
                            <span className="badge badge-indigo">Max Backlogs: {drive.maxBacklogs}</span>
                          </div>

                          {/* Dynamic Eligibility Banner */}
                          <div
                            style={{
                              padding: "8px 12px",
                              borderRadius: "8px",
                              marginBottom: "16px",
                              fontSize: "0.8rem",
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              background: isEligible ? "rgba(16, 185, 129, 0.1)" : "rgba(244, 63, 94, 0.1)",
                              border: `1px solid ${isEligible ? "rgba(16, 185, 129, 0.25)" : "rgba(244, 63, 94, 0.25)"}`,
                              color: isEligible ? "#34d399" : "#fb7185",
                            }}
                          >
                            {isEligible ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                            <span>
                              {isEligible
                                ? "You meet all eligibility criteria"
                                : drive.ineligibilityReasons?.[0] || "Eligibility criteria not met"}
                            </span>
                          </div>
                        </div>

                        <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                          <button
                            onClick={() => setSelectedDriveModal(drive)}
                            style={{
                              flex: 1,
                              padding: "10px",
                              background: "rgba(255, 255, 255, 0.05)",
                              border: "1px solid rgba(255, 255, 255, 0.1)",
                              color: "#e5e7eb",
                              borderRadius: "10px",
                              fontSize: "0.85rem",
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            View Details
                          </button>

                          {applied ? (
                            <button
                              disabled
                              style={{
                                flex: 1.2,
                                padding: "10px",
                                background: "rgba(16, 185, 129, 0.2)",
                                border: "1px solid rgba(16, 185, 129, 0.4)",
                                color: "#34d399",
                                borderRadius: "10px",
                                fontSize: "0.85rem",
                                fontWeight: 600,
                                cursor: "default",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "6px",
                              }}
                            >
                              <CheckCircle2 size={16} /> Applied ({applied.status})
                            </button>
                          ) : (
                            <button
                              disabled={!isEligible}
                              onClick={() => handleApply(drive)}
                              className="gradient-btn"
                              style={{ flex: 1.2, padding: "10px", fontSize: "0.85rem" }}
                            >
                              Apply Now <ChevronRight size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB: Application Pipeline Tracker */}
            {activeTab === "applications" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {applications.length === 0 ? (
                  <div className="glass-panel" style={{ padding: "48px", textAlign: "center" }}>
                    <Briefcase size={40} color="var(--text-muted)" style={{ margin: "0 auto 12px" }} />
                    <p style={{ color: "var(--text-muted)" }}>No applications submitted yet.</p>
                  </div>
                ) : (
                  applications.map((app) => {
                    const company = app.companyName || app.jobDrive?.companyName;
                    const title = app.title || app.jobDrive?.title;
                    const ctc = app.ctc || app.jobDrive?.ctc;
                    const location = app.location || app.jobDrive?.location;

                    return (
                      <div key={app.id} className="glass-panel" style={{ padding: "24px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
                          <div>
                            <div style={{ color: "var(--accent-cyan)", fontSize: "0.85rem", fontWeight: 700 }}>
                              {company}
                            </div>
                            <h3 style={{ fontSize: "1.2rem", fontWeight: 700 }}>{title}</h3>
                            <div style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginTop: "4px" }}>
                              Applied on {new Date(app.appliedAt).toLocaleDateString()} • {location}
                            </div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <span className="badge badge-emerald">{ctc}</span>
                            <span className="badge badge-indigo">Stage: {app.status}</span>
                          </div>
                        </div>

                        {/* Production-Grade Stepper Component */}
                        <ApplicationStepper currentStatus={app.status} />
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        )}

        {/* RECRUITER ROLE */}
        {role === "RECRUITER" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px", flexWrap: "wrap", gap: "16px" }}>
              <div>
                <h2 style={{ fontSize: "1.6rem", fontWeight: 800 }}>Recruiter Drive Manager</h2>
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                  Publish placement drives and update student candidate progression stages.
                </p>
              </div>
              <button
                onClick={() => setIsPostDriveOpen(true)}
                className="gradient-btn"
                style={{ padding: "12px 20px" }}
              >
                <PlusCircle size={18} /> Post New Drive
              </button>
            </div>

            {/* Drives Table */}
            <div className="glass-panel" style={{ overflow: "hidden", marginBottom: "32px" }}>
              <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(255, 255, 255, 0.08)", fontWeight: 700 }}>
                Active Hiring Drives ({drives.length})
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
                  <thead>
                    <tr style={{ background: "rgba(0, 0, 0, 0.2)", textAlign: "left", color: "var(--text-muted)" }}>
                      <th style={{ padding: "14px 24px" }}>Company & Title</th>
                      <th style={{ padding: "14px 24px" }}>Package (CTC)</th>
                      <th style={{ padding: "14px 24px" }}>Min CGPA</th>
                      <th style={{ padding: "14px 24px" }}>Allowed Branches</th>
                      <th style={{ padding: "14px 24px" }}>Applicants</th>
                    </tr>
                  </thead>
                  <tbody>
                    {drives.map((d) => (
                      <tr key={d.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>
                        <td style={{ padding: "16px 24px" }}>
                          <div style={{ fontWeight: 700, color: "#fff" }}>{d.companyName}</div>
                          <div style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{d.title}</div>
                        </td>
                        <td style={{ padding: "16px 24px" }}><span className="badge badge-emerald">{d.ctc}</span></td>
                        <td style={{ padding: "16px 24px" }}>{d.minCgpa}</td>
                        <td style={{ padding: "16px 24px", color: "var(--text-muted)" }}>{d.allowedBranches?.join(", ")}</td>
                        <td style={{ padding: "16px 24px" }}>
                          <span className="badge badge-indigo">{d.applicantsCount || 1} Candidate(s)</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Candidate Stage Progression Action Panel */}
            <div className="glass-panel" style={{ padding: "24px" }}>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "16px" }}>
                Applicant Action Pipeline (PATCH /api/applications/:id/status)
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {applications.map((app) => (
                  <div
                    key={app.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "16px",
                      background: "rgba(0, 0, 0, 0.25)",
                      borderRadius: "12px",
                      flexWrap: "wrap",
                      gap: "12px",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, color: "#fff" }}>
                        {profile.fullName} <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>({profile.rollNumber})</span>
                      </div>
                      <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                        Applied to {app.companyName || app.jobDrive?.companyName} • Current: <span style={{ color: "#818cf8", fontWeight: 600 }}>{app.status}</span>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                      <button
                        onClick={() => handleUpdateStatus(app.id, "SHORTLISTED")}
                        style={{ padding: "6px 10px", borderRadius: "6px", background: "rgba(59, 130, 246, 0.2)", border: "1px solid rgba(59, 130, 246, 0.4)", color: "#60a5fa", fontSize: "0.75rem", cursor: "pointer", fontWeight: 600 }}
                      >
                        Shortlist
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(app.id, "INTERVIEW_SCHEDULED")}
                        style={{ padding: "6px 10px", borderRadius: "6px", background: "rgba(168, 85, 247, 0.2)", border: "1px solid rgba(168, 85, 247, 0.4)", color: "#c084fc", fontSize: "0.75rem", cursor: "pointer", fontWeight: 600 }}
                      >
                        Schedule Interview
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(app.id, "OFFERED")}
                        style={{ padding: "6px 10px", borderRadius: "6px", background: "rgba(16, 185, 129, 0.2)", border: "1px solid rgba(16, 185, 129, 0.4)", color: "#34d399", fontSize: "0.75rem", cursor: "pointer", fontWeight: 600 }}
                      >
                        Make Offer
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(app.id, "REJECTED")}
                        style={{ padding: "6px 10px", borderRadius: "6px", background: "rgba(244, 63, 94, 0.2)", border: "1px solid rgba(244, 63, 94, 0.4)", color: "#fb7185", fontSize: "0.75rem", cursor: "pointer", fontWeight: 600 }}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ADMIN ROLE */}
        {role === "ADMIN" && (
          <div>
            <div style={{ marginBottom: "28px" }}>
              <h2 style={{ fontSize: "1.6rem", fontWeight: 800 }}>Campus Placement Executive Overview</h2>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                Campus-wide drive health, placement conversion metrics, and system diagnostics.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "32px" }}>
              <div className="glass-panel" style={{ padding: "20px" }}>
                <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Total Placement Offers</span>
                <div style={{ fontSize: "1.8rem", fontWeight: 800, marginTop: "6px" }} className="gradient-text">
                  {adminStats.totalOffers}
                </div>
                <div style={{ color: "#34d399", fontSize: "0.75rem", marginTop: "4px" }}>↑ 18% increase</div>
              </div>

              <div className="glass-panel" style={{ padding: "20px" }}>
                <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Placement Rate</span>
                <div style={{ fontSize: "1.8rem", fontWeight: 800, marginTop: "6px" }}>
                  {adminStats.placementRate}
                </div>
                <div style={{ color: "var(--text-muted)", fontSize: "0.75rem", marginTop: "4px" }}>138 students placed</div>
              </div>

              <div className="glass-panel" style={{ padding: "20px" }}>
                <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Average Package</span>
                <div style={{ fontSize: "1.8rem", fontWeight: 800, marginTop: "6px" }}>{adminStats.averagePackage}</div>
                <div style={{ color: "#818cf8", fontSize: "0.75rem", marginTop: "4px" }}>Highest: {adminStats.highestPackage}</div>
              </div>

              <div className="glass-panel" style={{ padding: "20px" }}>
                <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Active Hiring Drives</span>
                <div style={{ fontSize: "1.8rem", fontWeight: 800, marginTop: "6px" }}>{drives.length}</div>
                <div style={{ color: "var(--text-muted)", fontSize: "0.75rem", marginTop: "4px" }}>Tech & Cloud</div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL: POST DRIVE */}
      {isPostDriveOpen && (
        <div className="modal-backdrop" onClick={() => setIsPostDriveOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: "28px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "1.3rem", fontWeight: 800 }}>Create Recruitment Drive</h2>
              <button onClick={() => setIsPostDriveOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleCreateDrive} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "6px" }}>Company Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Google, Atlassian, Microsoft"
                  value={newDriveForm.companyName}
                  onChange={(e) => setNewDriveForm({ ...newDriveForm, companyName: e.target.value })}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "6px" }}>Job Role Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Software Development Engineer - I"
                  value={newDriveForm.title}
                  onChange={(e) => setNewDriveForm({ ...newDriveForm, title: e.target.value })}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "6px" }}>CTC Package *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 24 LPA"
                    value={newDriveForm.ctc}
                    onChange={(e) => setNewDriveForm({ ...newDriveForm, ctc: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "6px" }}>Minimum CGPA</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={newDriveForm.minCgpa}
                    onChange={(e) => setNewDriveForm({ ...newDriveForm, minCgpa: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "6px" }}>Allowed Branches (Comma separated)</label>
                <input
                  type="text"
                  value={newDriveForm.allowedBranches}
                  onChange={(e) => setNewDriveForm({ ...newDriveForm, allowedBranches: e.target.value })}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "6px" }}>Job Description</label>
                <textarea
                  rows={3}
                  value={newDriveForm.description}
                  onChange={(e) => setNewDriveForm({ ...newDriveForm, description: e.target.value })}
                  placeholder="Key responsibilities and qualifications..."
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", resize: "vertical" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "8px" }}>
                <button
                  type="button"
                  onClick={() => setIsPostDriveOpen(false)}
                  style={{ padding: "10px 18px", background: "rgba(255, 255, 255, 0.08)", border: "none", borderRadius: "10px", color: "#fff", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button type="submit" className="gradient-btn" style={{ padding: "10px 22px" }}>
                  Publish Drive
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DRIVE DETAILS */}
      {selectedDriveModal && (
        <div className="modal-backdrop" onClick={() => setSelectedDriveModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: "28px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <div>
                <span style={{ color: "var(--accent-cyan)", fontSize: "0.85rem", fontWeight: 700 }}>
                  {selectedDriveModal.companyName}
                </span>
                <h2 style={{ fontSize: "1.4rem", fontWeight: 800 }}>{selectedDriveModal.title}</h2>
              </div>
              <button
                onClick={() => setSelectedDriveModal(null)}
                style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
              >
                <X size={22} />
              </button>
            </div>

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "20px" }}>
              <span className="badge badge-emerald">{selectedDriveModal.ctc}</span>
              <span className="badge badge-indigo">Min CGPA: {selectedDriveModal.minCgpa}</span>
              <span className="badge badge-indigo">Max Backlogs: {selectedDriveModal.maxBacklogs}</span>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <h4 style={{ fontSize: "0.95rem", color: "var(--text-muted)", marginBottom: "8px" }}>Job Description</h4>
              <p style={{ color: "#e5e7eb", fontSize: "0.9rem", lineHeight: 1.6 }}>{selectedDriveModal.description}</p>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              <button
                onClick={() => setSelectedDriveModal(null)}
                style={{
                  padding: "10px 18px",
                  background: "rgba(255, 255, 255, 0.08)",
                  border: "none",
                  borderRadius: "10px",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                Close
              </button>
              {role === "STUDENT" && (
                <button
                  onClick={() => handleApply(selectedDriveModal)}
                  className="gradient-btn"
                  style={{ padding: "10px 22px" }}
                >
                  Confirm & Apply
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
