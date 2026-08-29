import React, { useState } from "react";

/**
 * Robust mapping of company names to high-definition vector SVG URLs
 */
const COMPANY_LOGO_MAP = {
  // Amazon / AWS
  amazon: "https://cdn.simpleicons.org/amazon/232F3E",
  aws: "https://cdn.simpleicons.org/amazonwebservices/232F3E",

  // Microsoft
  microsoft: "https://cdn.simpleicons.org/microsoft/0078D4",

  // Google
  google: "https://cdn.simpleicons.org/google/4285F4",

  // Tata / TCS
  tcs: "https://cdn.simpleicons.org/tata/005699",
  tata: "https://cdn.simpleicons.org/tata/005699",
  "tata consultancy services": "https://cdn.simpleicons.org/tata/005699",

  // Infosys
  infosys: "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/infosys.svg",

  // Accenture
  accenture: "https://cdn.simpleicons.org/accenture/A100FF",

  // Meta / Facebook
  meta: "https://cdn.simpleicons.org/meta/0668E1",
  facebook: "https://cdn.simpleicons.org/meta/0668E1",

  // Apple
  apple: "https://cdn.simpleicons.org/apple/000000",

  // Atlassian
  atlassian: "https://cdn.simpleicons.org/atlassian/0052CC",

  // Goldman Sachs
  "goldman sachs": "https://cdn.simpleicons.org/goldmansachs/002F6C",
  goldman: "https://cdn.simpleicons.org/goldmansachs/002F6C",

  // Netflix
  netflix: "https://cdn.simpleicons.org/netflix/E50914",

  // Uber
  uber: "https://cdn.simpleicons.org/uber/000000",

  // Oracle
  oracle: "https://cdn.simpleicons.org/oracle/F80000",

  // Adobe
  adobe: "https://cdn.simpleicons.org/adobe/FF0000",

  // Salesforce
  salesforce: "https://cdn.simpleicons.org/salesforce/00A1E0",

  // Nvidia
  nvidia: "https://cdn.simpleicons.org/nvidia/76B900",

  // IBM
  ibm: "https://cdn.simpleicons.org/ibm/052FAD",

  // Intel
  intel: "https://cdn.simpleicons.org/intel/0071C5",

  // Cisco
  cisco: "https://cdn.simpleicons.org/cisco/1BA0D7",

  // Wipro
  wipro: "https://cdn.simpleicons.org/wipro/000000",

  // Cognizant
  cognizant: "https://cdn.simpleicons.org/cognizant/0033A0",
};

/**
 * Gradient colors for unlisted or fallback monograms
 */
const getFallbackGradient = (name = "") => {
  const char = name.trim().charAt(0).toUpperCase();
  if (["A", "B", "C", "D"].includes(char)) return "from-indigo-600 to-blue-600";
  if (["E", "F", "G", "H"].includes(char)) return "from-blue-600 to-cyan-600";
  if (["I", "J", "K", "L"].includes(char)) return "from-emerald-600 to-teal-600";
  if (["M", "N", "O", "P"].includes(char)) return "from-purple-600 to-pink-600";
  return "from-amber-500 to-orange-600";
};

/**
 * Returns first two initials of company name
 */
const getCompanyInitials = (name = "") => {
  if (!name) return "CO";
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

/**
 * CompanyLogo Component
 * Renders verified vector SVGs in a standardized white rounded container with smooth error fallback.
 */
export default function CompanyLogo({ companyName = "", className = "" }) {
  const [imgError, setImgError] = useState(false);

  const cleanName = companyName.trim().toLowerCase();

  // Exact match or substring match from dictionary
  const logoUrl =
    COMPANY_LOGO_MAP[cleanName] ||
    Object.entries(COMPANY_LOGO_MAP).find(([key]) => cleanName.includes(key))?.[1];

  const initials = getCompanyInitials(companyName);

  // If logo URL is found and has not errored
  if (logoUrl && !imgError) {
    return (
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-200/80 bg-white p-2 shadow-sm transition-transform duration-200 group-hover:scale-105 ${className}`}
        title={companyName}
      >
        <img
          src={logoUrl}
          alt={companyName}
          className="h-full w-full object-contain"
          loading="lazy"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  // Graceful Monogram Fallback
  return (
    <div
      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${getFallbackGradient(
        companyName
      )} font-heading text-sm font-bold text-white shadow-sm border border-white/20 transition-transform duration-200 group-hover:scale-105 ${className}`}
      title={companyName}
    >
      <span>{initials}</span>
    </div>
  );
}
