import React, { useState } from "react";
import { Building2 } from "lucide-react";

/**
 * Normalizes company names to SimpleIcons slug & official brand hex color
 */
const BRAND_MAP = {
  amazon: { slug: "amazon", color: "FF9900", name: "Amazon" },
  google: { slug: "google", color: "4285F4", name: "Google" },
  microsoft: { slug: "microsoft", color: "00A4EF", name: "Microsoft" },
  atlassian: { slug: "atlassian", color: "0052CC", name: "Atlassian" },
  "goldman sachs": { slug: "goldmansachs", color: "002F6C", name: "Goldman Sachs" },
  goldman: { slug: "goldmansachs", color: "002F6C", name: "Goldman Sachs" },
  meta: { slug: "meta", color: "0081FB", name: "Meta" },
  apple: { slug: "apple", color: "000000", name: "Apple" },
  netflix: { slug: "netflix", color: "E50914", name: "Netflix" },
  uber: { slug: "uber", color: "000000", name: "Uber" },
  oracle: { slug: "oracle", color: "F80000", name: "Oracle" },
  adobe: { slug: "adobe", color: "FF0000", name: "Adobe" },
  tcs: { slug: "tata", color: "005699", name: "TCS" },
  "tata consultancy services": { slug: "tata", color: "005699", name: "TCS" },
  infosys: { slug: "infosys", color: "007CC3", name: "Infosys" },
  wipro: { slug: "wipro", color: "000000", name: "Wipro" },
  accenture: { slug: "accenture", color: "A100FF", name: "Accenture" },
  cognizant: { slug: "cognizant", color: "0033A0", name: "Cognizant" },
  salesforce: { slug: "salesforce", color: "00A1E0", name: "Salesforce" },
  cisco: { slug: "cisco", color: "1BA0D7", name: "Cisco" },
  intel: { slug: "intel", color: "0071C5", name: "Intel" },
  ibm: { slug: "ibm", color: "052FAD", name: "IBM" },
  nvidia: { slug: "nvidia", color: "76B900", name: "Nvidia" },
};

/**
 * Fallback gradient palettes for unlisted companies
 */
const getFallbackGradient = (name = "") => {
  const char = name.charAt(0).toUpperCase();
  if (["A", "B", "C", "D"].includes(char)) return "from-indigo-600 to-blue-600";
  if (["E", "F", "G", "H"].includes(char)) return "from-blue-600 to-cyan-600";
  if (["I", "J", "K", "L"].includes(char)) return "from-emerald-600 to-teal-600";
  if (["M", "N", "O", "P"].includes(char)) return "from-purple-600 to-pink-600";
  return "from-amber-500 to-orange-600";
};

/**
 * CompanyLogo Component
 * Renders crisp official SVGs with graceful fallback to monogram squircle.
 */
export default function CompanyLogo({ companyName = "", size = "md", className = "" }) {
  const [imgError, setImgError] = useState(false);

  const cleanName = companyName.trim().toLowerCase();
  const brand = BRAND_MAP[cleanName] || Object.entries(BRAND_MAP).find(([key]) => cleanName.includes(key))?.[1];

  const sizeClasses = {
    sm: "w-9 h-9 p-1.5",
    md: "w-12 h-12 p-2.5",
    lg: "w-14 h-14 p-3",
  }[size] || "w-12 h-12 p-2.5";

  const imgSizeClasses = {
    sm: "w-5 h-5",
    md: "w-7 h-7",
    lg: "w-8 h-8",
  }[size] || "w-7 h-7";

  const initials = companyName
    ? companyName
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "CO";

  // If brand is matched and image has not failed
  if (brand && !imgError) {
    const iconUrl = `https://cdn.simpleicons.org/${brand.slug}/${brand.color}`;

    return (
      <div
        className={`bg-white rounded-xl shadow-xs border border-slate-200/90 flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 ${sizeClasses} ${className}`}
        title={companyName}
      >
        <img
          src={iconUrl}
          alt={`${companyName} logo`}
          className={`${imgSizeClasses} object-contain transition-opacity duration-150`}
          loading="lazy"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  // Fallback: Gradient Monogram Squircle
  return (
    <div
      className={`rounded-xl bg-gradient-to-br ${getFallbackGradient(
        companyName
      )} flex items-center justify-center shrink-0 text-white font-bold font-heading shadow-xs border border-white/20 transition-transform duration-200 group-hover:scale-105 ${sizeClasses} ${className}`}
      title={companyName}
    >
      <span className={size === "sm" ? "text-xs" : "text-sm"}>{initials}</span>
    </div>
  );
}
