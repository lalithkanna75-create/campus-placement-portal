import React, { useState } from "react";
import {
  GraduationCap,
  X,
  User,
  Hash,
  Building2,
  Award,
  Phone,
  Code,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { studentsApi } from "../services/api";

const DEPARTMENTS = [
  "Computer Science",
  "Information Technology",
  "Electronics",
  "Electrical",
  "Mechanical",
  "Civil",
];

/**
 * Modern Bright Theme Student Academic Profile Onboarding Modal
 */
export default function ProfileSetupModal({
  isOpen,
  onClose,
  initialProfile,
  onProfileSaved,
  showToast,
}) {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    fullName: initialProfile?.fullName || "",
    rollNumber: initialProfile?.rollNumber || "",
    department: initialProfile?.department || "Computer Science",
    cgpa: initialProfile?.cgpa || "8.50",
    tenthPercentage: initialProfile?.tenthPercentage || "85.0",
    twelfthPercentage: initialProfile?.twelfthPercentage || "85.0",
    activeBacklogs: initialProfile?.activeBacklogs ?? 0,
    phone: initialProfile?.phone || "",
    skills: Array.isArray(initialProfile?.skills)
      ? initialProfile.skills.join(", ")
      : initialProfile?.skills || "React, Node.js, SQL, TypeScript",
  });

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.rollNumber || !formData.department || !formData.cgpa) {
      showToast?.("Please fill in all mandatory profile fields.", "error");
      return;
    }

    try {
      setSaving(true);
      const res = await studentsApi.saveProfile({
        ...formData,
        cgpa: parseFloat(formData.cgpa),
        tenthPercentage: parseFloat(formData.tenthPercentage),
        twelfthPercentage: parseFloat(formData.twelfthPercentage),
        activeBacklogs: parseInt(formData.activeBacklogs, 10),
        skills: formData.skills.split(",").map((s) => s.trim()).filter(Boolean),
      });

      const updated = res?.profile || res?.data?.profile || formData;
      if (onProfileSaved) onProfileSaved(updated);
      showToast?.("Academic profile saved successfully! 🎓", "success");
      onClose();
    } catch (err) {
      showToast?.(err.message || "Failed to save profile.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl text-xs max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-xs">
              <GraduationCap size={20} />
            </div>
            <div>
              <h3 className="font-heading text-lg font-bold text-slate-900">
                Academic Profile & Eligibility Setup
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Used to calculate dynamic drive eligibility and auto-attach to recruiter rosters.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Full Name & Roll Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Full Name *</label>
              <div className="relative">
                <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Sharma"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-slate-900 font-medium outline-none focus:border-indigo-600 shadow-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Roll / Student ID *</label>
              <div className="relative">
                <Hash size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. CS2023001"
                  value={formData.rollNumber}
                  onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-slate-900 font-medium outline-none focus:border-indigo-600 shadow-xs"
                />
              </div>
            </div>
          </div>

          {/* Department & Current CGPA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Department *</label>
              <div className="relative">
                <Building2 size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-slate-900 font-medium outline-none focus:border-indigo-600 shadow-xs cursor-pointer"
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Current CGPA (out of 10) *</label>
              <div className="relative">
                <Award size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  required
                  placeholder="e.g. 8.85"
                  value={formData.cgpa}
                  onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-slate-900 font-medium outline-none focus:border-indigo-600 shadow-xs"
                />
              </div>
            </div>
          </div>

          {/* 10th %, 12th %, and Active Backlogs */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">10th Score (%)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={formData.tenthPercentage}
                onChange={(e) => setFormData({ ...formData, tenthPercentage: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-slate-900 font-medium outline-none focus:border-indigo-600 shadow-xs"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">12th Score (%)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={formData.twelfthPercentage}
                onChange={(e) => setFormData({ ...formData, twelfthPercentage: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-slate-900 font-medium outline-none focus:border-indigo-600 shadow-xs"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Active Backlogs</label>
              <input
                type="number"
                min="0"
                value={formData.activeBacklogs}
                onChange={(e) => setFormData({ ...formData, activeBacklogs: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-slate-900 font-medium outline-none focus:border-indigo-600 shadow-xs"
              />
            </div>
          </div>

          {/* Contact Phone & Tech Skills */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">Contact Phone</label>
            <div className="relative">
              <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="tel"
                placeholder="e.g. +91 98765 43210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-slate-900 font-medium outline-none focus:border-indigo-600 shadow-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Technical Skills (Comma separated)</label>
            <div className="relative">
              <Code size={14} className="absolute left-3.5 top-3 text-slate-400" />
              <textarea
                rows={2}
                placeholder="e.g. React, Node.js, PostgreSQL, Docker, AWS, TypeScript"
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-slate-900 font-medium outline-none focus:border-indigo-600 shadow-xs"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-slate-100 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-200 cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-5 py-2 font-bold text-white shadow-md shadow-indigo-500/25 hover:from-indigo-700 hover:to-indigo-800 cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Saving Profile...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={14} />
                  <span>Save & Complete Profile</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
