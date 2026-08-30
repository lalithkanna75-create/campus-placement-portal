import React, { useState, useRef } from "react";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  ExternalLink,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { studentsApi, BACKEND_URL } from "../services/api";

/**
 * Modern Bright Theme Resume PDF Upload Card
 */
export default function ResumeUploadCard({ profile, onResumeUpdated, showToast }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [currentResumeUrl, setCurrentResumeUrl] = useState(profile?.resumeUrl || null);
  const fileInputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      showToast?.("Invalid file format. Please upload a PDF document (.pdf).", "error");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast?.("File too large. Maximum file size allowed is 5MB.", "error");
      return;
    }

    try {
      setUploading(true);
      const res = await studentsApi.uploadResume(file);
      const newUrl = res?.resumeUrl || res?.profile?.resumeUrl;
      setCurrentResumeUrl(newUrl);
      if (onResumeUpdated) onResumeUpdated(newUrl);
      showToast?.("Resume uploaded & linked successfully! 📄", "success");
    } catch (err) {
      showToast?.(err.message || "Failed to upload resume.", "error");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const getFullResumeUrl = (url) => {
    if (!url) return null;
    return url.startsWith("http") ? url : `${BACKEND_URL}${url}`;
  };

  return (
    <div className="glass-card rounded-2xl p-6 border border-slate-200/80 bg-white shadow-soft mb-8">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-xs">
            <FileText size={20} />
          </div>
          <div>
            <h3 className="font-heading text-base font-bold text-slate-900">
              Placement Resume (PDF)
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Uploaded resumes are automatically attached to all your drive applications.
            </p>
          </div>
        </div>

        {currentResumeUrl && (
          <a
            href={getFullResumeUrl(currentResumeUrl)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition-all shadow-xs"
          >
            <CheckCircle2 size={14} />
            <span>View Current Resume</span>
            <ExternalLink size={12} />
          </a>
        )}
      </div>

      {/* Drag and Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-7 text-center cursor-pointer transition-all ${
          isDragging
            ? "border-indigo-600 bg-indigo-50/60 scale-[1.01]"
            : "border-slate-300 hover:border-indigo-400 bg-slate-50/50 hover:bg-slate-50"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-2.5 py-2">
            <Loader2 size={32} className="text-indigo-600 animate-spin" />
            <span className="text-xs font-bold text-slate-800">
              Uploading & validating PDF resume...
            </span>
          </div>
        ) : (
          <>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 mb-3 shadow-xs">
              <UploadCloud size={24} />
            </div>
            <div className="text-xs font-bold text-slate-900">
              <span className="text-indigo-600 underline">Click to upload</span> or drag and drop your resume
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-1">
              Strictly PDF format only (Max 5MB)
            </p>
          </>
        )}
      </div>
    </div>
  );
}
