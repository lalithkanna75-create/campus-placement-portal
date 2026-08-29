import React from "react";

/**
 * Direct Inline Vector SVGs for reliable, zero-latency rendering
 */
const LOGO_SVGS = {
  amazon: (
    <svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M15.42 16.48c-2.48 1.83-6.08 2.79-9.2 1.34-1.1-.51-2.08-1.28-2.9-2.22-.19-.22-.03-.51.24-.39 3.25 1.51 7.21 1.09 10.37-.89.47-.29.93.31.49.66l1 .5z" fill="#FF9900"/>
      <path d="M16.57 15.17c-.31-.4-.68-.81-.68-1.35 0-.75.64-1.29 1.35-1.29.35 0 .69.13.97.35.45.35.79.88 1.07 1.41.13.25-.06.51-.31.42-.77-.28-1.63-.38-2.4-.54z" fill="#FF9900"/>
      <path d="M13.84 9.17c0-2.31-1.27-3.67-3.37-3.67-1.95 0-3.32 1.36-3.32 3.49 0 2.22 1.4 3.51 3.46 3.51 1.88 0 3.23-1.2 3.23-3.33zm-4.73.06c0-1.27.75-2.08 1.83-2.08 1.05 0 1.77.81 1.77 2.08 0 1.33-.72 2.12-1.77 2.12-1.08 0-1.83-.8-1.83-2.12z" fill="#232F3E"/>
      <path d="M17.15 13.06c-.18-.21-.49-.24-.72-.08-1.04.74-2.35 1.13-3.71 1.13-2.82 0-4.9-1.97-4.9-4.94 0-2.94 2.13-4.92 4.96-4.92 1.25 0 2.45.37 3.47 1.07.23.16.54.12.72-.1l.88-1.07c.17-.21.13-.52-.09-.7-1.39-.98-3.07-1.5-4.85-1.5C8.36 2 5 5.36 5 9.87s3.36 7.87 7.91 7.87c1.78 0 3.46-.53 4.85-1.52.22-.16.27-.47.1-.68l-.71-.48z" fill="#232F3E"/>
    </svg>
  ),
  microsoft: (
    <svg viewBox="0 0 24 24" className="w-6 h-6" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="10.5" height="10.5" fill="#F25022" />
      <rect x="12.5" y="1" width="10.5" height="10.5" fill="#7FBA00" />
      <rect x="1" y="12.5" width="10.5" height="10.5" fill="#00A4EF" />
      <rect x="12.5" y="12.5" width="10.5" height="10.5" fill="#FFB900" />
    </svg>
  ),
  google: (
    <svg viewBox="0 0 24 24" className="w-6 h-6" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        fill="#EA4335"
      />
    </svg>
  ),
  tcs: (
    <span className="font-extrabold text-[#005699] text-xs tracking-tighter">TATA</span>
  ),
  tata: (
    <span className="font-extrabold text-[#005699] text-xs tracking-tighter">TATA</span>
  ),
  infosys: (
    <span className="font-bold text-[#007CC3] text-xs">Infosys</span>
  ),
  accenture: (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="#A100FF" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L2 19.5h5.5L12 11.8l4.5 7.7H22L12 2z" />
    </svg>
  ),
  meta: (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="#0668E1" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14.93V13h2.15l.32-2.5H13V8.9c0-.72.2-1.22 1.24-1.22H15.5V5.44c-.4-.05-1.4-.14-2.45-.14-2.43 0-4.09 1.48-4.09 4.2V10.5H6.77V13h2.19v3.93c-3.04-.6-5.46-3.28-5.46-6.43 0-3.87 3.13-7 7-7s7 3.13 7 7c0 3.15-2.42 5.83-5.5 6.43z" />
    </svg>
  ),
  apple: (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="#000000" xmlns="http://www.w3.org/2000/svg">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.93-2.85-.9.04-1.99.6-2.64 1.35-.58.65-1.09 1.72-.95 2.74 1 .08 2.04-.49 2.66-1.24z" />
    </svg>
  ),
  atlassian: (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="#0052CC" xmlns="http://www.w3.org/2000/svg">
      <path d="M11.53 2c0 .35-.14.7-.42.98L4.32 9.77a1.39 1.39 0 0 1-1.98 0L.42 7.85A1.39 1.39 0 0 1 0 6.87c0-.36.14-.7.42-.98L7.21.42A1.39 1.39 0 0 1 9.19.42l1.92 1.92c.28.28.42.62.42.98zM24 17.13c0 .36-.14.7-.42.98l-6.79 6.79a1.39 1.39 0 0 1-1.98 0l-1.92-1.92a1.39 1.39 0 0 1-.42-.98c0-.36.14-.7.42-.98l6.79-6.79a1.39 1.39 0 0 1 1.98 0l1.92 1.92c.28.28.42.62.42.98z" />
    </svg>
  ),
};

/**
 * CompanyLogo Component with Zero-Latency Inline SVGs
 */
export default function CompanyLogo({ companyName, className = "" }) {
  const normalized = (companyName || "").toLowerCase().trim();

  const matchedKey = Object.keys(LOGO_SVGS).find((key) =>
    normalized.includes(key)
  );

  return (
    <div
      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-200/80 bg-white p-2 shadow-sm transition-all group-hover:scale-105 ${className}`}
    >
      {matchedKey ? (
        LOGO_SVGS[matchedKey]
      ) : (
        <span className="font-bold text-xs text-indigo-600 uppercase">
          {companyName ? companyName.slice(0, 2) : "CO"}
        </span>
      )}
    </div>
  );
}
