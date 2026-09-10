import React from "react";
import { AlertCircle, AlertTriangle, ArrowDown } from "lucide-react";
import { ComplaintPriority } from "../types";

interface PriorityBadgeProps {
  priority: ComplaintPriority | string;
  showIcon?: boolean;
  size?: "sm" | "md";
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  priority,
  showIcon = true,
  size = "md",
}) => {
  const getStyles = () => {
    switch (priority) {
      case "High":
        return {
          bg: "bg-red-50 text-red-700 border-red-200",
          icon: <AlertCircle className="w-3.5 h-3.5 text-red-600" />,
        };
      case "Medium":
        return {
          bg: "bg-amber-50 text-amber-700 border-amber-200",
          icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />,
        };
      case "Low":
      default:
        return {
          bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
          icon: <ArrowDown className="w-3.5 h-3.5 text-emerald-600" />,
        };
    }
  };

  const styles = getStyles();
  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs";

  return (
    <span
      id={`badge-priority-${priority.toLowerCase()}`}
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${styles.bg} ${sizeClasses} whitespace-nowrap`}
    >
      {showIcon && styles.icon}
      <span>{priority}</span>
    </span>
  );
};
