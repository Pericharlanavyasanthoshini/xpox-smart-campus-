import React from "react";
import { ComplaintStatus } from "../types";

interface StatusBadgeProps {
  status: ComplaintStatus | string;
  size?: "sm" | "md" | "lg";
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = "md" }) => {
  const getStyles = () => {
    switch (status) {
      case "Submitted":
        return {
          bg: "bg-blue-50 text-blue-700 border-blue-200",
          dot: "bg-blue-500",
        };
      case "Under Review":
        return {
          bg: "bg-amber-50 text-amber-700 border-amber-200",
          dot: "bg-amber-500 animate-pulse",
        };
      case "In Progress":
        return {
          bg: "bg-indigo-50 text-indigo-700 border-indigo-200",
          dot: "bg-indigo-500 animate-ping",
        };
      case "Resolved":
        return {
          bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
          dot: "bg-emerald-500",
        };
      case "Rejected":
        return {
          bg: "bg-rose-50 text-rose-700 border-rose-200",
          dot: "bg-rose-500",
        };
      default:
        return {
          bg: "bg-slate-50 text-slate-700 border-slate-200",
          dot: "bg-slate-400",
        };
    }
  };

  const styles = getStyles();
  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-xs",
    lg: "px-3 py-1.5 text-sm",
  }[size];

  return (
    <span
      id={`badge-status-${status.toLowerCase().replace(/\s+/g, "-")}`}
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${styles.bg} ${sizeClasses} whitespace-nowrap shadow-xs transition-colors`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
      <span>{status}</span>
    </span>
  );
};
