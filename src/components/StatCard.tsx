import React from "react";

interface StatCardProps {
  id?: string;
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color?: "blue" | "indigo" | "amber" | "emerald" | "rose" | "purple";
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  id,
  title,
  value,
  subtitle,
  icon,
  color = "indigo",
  onClick,
}) => {
  const colorMap = {
    blue: {
      bg: "bg-blue-50/70",
      text: "text-blue-600",
      border: "border-blue-100",
      ring: "hover:border-blue-300",
    },
    indigo: {
      bg: "bg-indigo-50/70",
      text: "text-indigo-600",
      border: "border-indigo-100",
      ring: "hover:border-indigo-300",
    },
    amber: {
      bg: "bg-amber-50/70",
      text: "text-amber-600",
      border: "border-amber-100",
      ring: "hover:border-amber-300",
    },
    emerald: {
      bg: "bg-emerald-50/70",
      text: "text-emerald-600",
      border: "border-emerald-100",
      ring: "hover:border-emerald-300",
    },
    rose: {
      bg: "bg-rose-50/70",
      text: "text-rose-600",
      border: "border-rose-100",
      ring: "hover:border-rose-300",
    },
    purple: {
      bg: "bg-purple-50/70",
      text: "text-purple-600",
      border: "border-purple-100",
      ring: "hover:border-purple-300",
    },
  }[color];

  return (
    <div
      id={id || `stat-card-${title.toLowerCase().replace(/\s+/g, "-")}`}
      onClick={onClick}
      className={`bg-white p-5 rounded-2xl border ${colorMap.border} shadow-xs transition-all duration-200 ${
        onClick ? `cursor-pointer hover:shadow-md ${colorMap.ring} transform hover:-translate-y-0.5` : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">{title}</p>
          <p className="mt-2 text-3xl font-bold text-slate-900 tracking-tight">{value}</p>
          {subtitle && <p className="mt-1 text-xs text-slate-500 font-medium">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl ${colorMap.bg} ${colorMap.text} shadow-xs`}>
          {icon}
        </div>
      </div>
    </div>
  );
};
