import React, { useState } from "react";

const BRAND_LOGOS = {
  amazon: "https://cdn.simpleicons.org/amazon/232F3E",
  microsoft: "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/microsoft.svg",
  google: "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/google.svg",
  tcs: "https://cdn.simpleicons.org/tata/005699",
  tata: "https://cdn.simpleicons.org/tata/005699",
  infosys: "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/infosys.svg",
  accenture: "https://cdn.simpleicons.org/accenture/A100FF",
  meta: "https://cdn.simpleicons.org/meta/0668E1",
  apple: "https://cdn.simpleicons.org/apple/000000",
  atlassian: "https://cdn.simpleicons.org/atlassian/0052CC",
  goldman: "https://cdn.simpleicons.org/goldmansachs/002F6C",
  netflix: "https://cdn.simpleicons.org/netflix/E50914",
  uber: "https://cdn.simpleicons.org/uber/000000",
  oracle: "https://cdn.simpleicons.org/oracle/F80000",
  adobe: "https://cdn.simpleicons.org/adobe/FF0000",
  salesforce: "https://cdn.simpleicons.org/salesforce/00A1E0",
  nvidia: "https://cdn.simpleicons.org/nvidia/76B900",
};

export default function CompanyLogo({ companyName, className = "" }) {
  const [hasError, setHasError] = useState(false);
  const normalized = (companyName || "").toLowerCase().trim();

  const matchedKey = Object.keys(BRAND_LOGOS).find((key) =>
    normalized.includes(key)
  );
  const logoUrl = matchedKey ? BRAND_LOGOS[matchedKey] : null;

  return (
    <div
      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-200/80 bg-white p-2.5 shadow-sm transition-all group-hover:scale-105 ${className}`}
    >
      {logoUrl && !hasError ? (
        <img
          src={logoUrl}
          alt={`${companyName} logo`}
          className="h-full w-full object-contain"
          onError={() => setHasError(true)}
          loading="lazy"
        />
      ) : (
        <span className="font-bold text-xs text-indigo-600 uppercase tracking-tight">
          {companyName ? companyName.slice(0, 2) : "CO"}
        </span>
      )}
    </div>
  );
}
