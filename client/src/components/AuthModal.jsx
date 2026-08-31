import React, { useState } from "react";
import {
  LogIn,
  UserPlus,
  X,
  Mail,
  Lock,
  User,
  GraduationCap,
  Building2,
  ShieldCheck,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { authApi } from "../services/api";

const SEEDED_ACCOUNTS = [
  {
    role: "STUDENT",
    name: "Alex Sharma",
    email: "alex.sharma@student.edu",
    password: "Password@123",
    desc: "9.2 CGPA • CSE • Top-Tier Student",
    icon: GraduationCap,
  },
  {
    role: "RECRUITER",
    name: "Amazon Recruiter",
    email: "recruiter.amazon@nexplacement.dev",
    password: "Password@123",
    desc: "AWS Systems Engineer Drive Owner",
    icon: Building2,
  },
  {
    role: "ADMIN",
    name: "Placement Admin",
    email: "admin@nexplacement.dev",
    password: "Admin@123",
    desc: "University Placement Director",
    icon: ShieldCheck,
  },
];

export default function AuthModal({ isOpen, onClose, onAuthSuccess, showToast, initialMode = "LOGIN" }) {
  if (!isOpen) return null;

  const [mode, setMode] = useState(initialMode); // 'LOGIN' | 'REGISTER'
  const [loading, setLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [registerForm, setRegisterForm] = useState({
    email: "",
    password: "",
    fullName: "",
    rollNumber: "",
    department: "Computer Science",
    cgpa: "8.50",
  });

  const handleLogin = async (e, directEmail, directPassword) => {
    if (e) e.preventDefault();
    const email = directEmail || loginEmail;
    const password = directPassword || loginPassword;

    if (!email || !password) {
      showToast?.("Please enter email and password.", "error");
      return;
    }

    try {
      setLoading(true);
      const res = await authApi.login(email, password);
      const user = res.user;
      showToast?.(`Welcome back, ${user.profile?.fullName || user.email}! 👋`, "success");
      onAuthSuccess?.(user);
      onClose();
    } catch (err) {
      showToast?.(err.message || "Invalid credentials. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!registerForm.email || !registerForm.password || !registerForm.fullName) {
      showToast?.("Please fill in required fields.", "error");
      return;
    }

    try {
      setLoading(true);
      const res = await authApi.register({
        email: registerForm.email,
        password: registerForm.password,
        fullName: registerForm.fullName,
        rollNumber: registerForm.rollNumber || `CS${Date.now().toString().slice(-4)}`,
        department: registerForm.department,
        cgpa: parseFloat(registerForm.cgpa) || 8.0,
      });
      const user = res.user;
      showToast?.(`Account registered successfully as Student! 🎓`, "success");
      onAuthSuccess?.(user);
      onClose();
    } catch (err) {
      showToast?.(err.message || "Registration failed. Try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl text-xs max-h-[90vh] overflow-y-auto my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
          <div>
            <h3 className="font-heading text-lg font-bold text-slate-900">
              {mode === "LOGIN" ? "Sign In to NexPlacement" : "Create Student Account"}
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {mode === "LOGIN"
                ? "Authenticate to access role-authorized portal features."
                : "Public registration creates verified Student accounts."}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="flex rounded-xl bg-slate-100 p-1 mb-4">
          <button
            type="button"
            onClick={() => setMode("LOGIN")}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              mode === "LOGIN" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode("REGISTER")}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              mode === "REGISTER" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Register Student
          </button>
        </div>

        {mode === "LOGIN" ? (
          <div>
            {/* Quick Demo Logins */}
            <div className="mb-4">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                1-Click Demo Login
              </label>
              <div className="flex flex-col gap-2">
                {SEEDED_ACCOUNTS.map((acc) => {
                  const Icon = acc.icon;
                  return (
                    <button
                      key={acc.email}
                      type="button"
                      disabled={loading}
                      onClick={() => handleLogin(null, acc.email, acc.password)}
                      className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 hover:bg-indigo-50/70 hover:border-indigo-200 transition-all text-left cursor-pointer disabled:opacity-50"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-slate-200 text-indigo-600 shadow-xs">
                          <Icon size={16} />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-xs">{acc.name}</div>
                          <div className="text-[10px] text-slate-500 font-medium">{acc.desc}</div>
                        </div>
                      </div>
                      <span className="micro-badge bg-white border border-slate-200 text-slate-700 font-bold">
                        {acc.role}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="relative my-4 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <span className="relative bg-white px-3 text-[11px] font-bold text-slate-400 uppercase">
                Or custom credentials
              </span>
            </div>

            {/* Custom Login Form */}
            <form onSubmit={handleLogin} className="flex flex-col gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Email Address</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="user@placement.edu"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-slate-900 font-medium outline-none focus:border-indigo-600 shadow-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Password</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-slate-900 font-medium outline-none focus:border-indigo-600 shadow-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 py-2.5 font-bold text-white shadow-md shadow-indigo-500/25 hover:from-indigo-700 hover:to-indigo-800 cursor-pointer disabled:opacity-50"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <LogIn size={14} />}
                <span>Sign In</span>
              </button>
            </form>
          </div>
        ) : (
          /* Student Registration Form */
          <form onSubmit={handleRegister} className="flex flex-col gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Full Name *</label>
              <div className="relative">
                <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Sharma"
                  value={registerForm.fullName}
                  onChange={(e) => setRegisterForm({ ...registerForm, fullName: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-slate-900 font-medium outline-none focus:border-indigo-600 shadow-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Student Email *</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="student@college.edu"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-slate-900 font-medium outline-none focus:border-indigo-600 shadow-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Password *</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="Min 6 characters"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-slate-900 font-medium outline-none focus:border-indigo-600 shadow-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Department</label>
                <select
                  value={registerForm.department}
                  onChange={(e) => setRegisterForm({ ...registerForm, department: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-slate-900 font-medium outline-none focus:border-indigo-600 shadow-xs cursor-pointer"
                >
                  <option value="Computer Science">Computer Science</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Mechanical">Mechanical</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">CGPA</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  value={registerForm.cgpa}
                  onChange={(e) => setRegisterForm({ ...registerForm, cgpa: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-slate-900 font-medium outline-none focus:border-indigo-600 shadow-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 py-2.5 font-bold text-white shadow-md shadow-indigo-500/25 hover:from-indigo-700 hover:to-indigo-800 cursor-pointer disabled:opacity-50"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
              <span>Register Student Account</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
