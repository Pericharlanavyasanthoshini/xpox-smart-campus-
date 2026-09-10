import React from "react";
import { MapPin, Tag, Calendar, ArrowRight, User as UserIcon } from "lucide-react";
import { Complaint } from "../types";
import { StatusBadge } from "./StatusBadge";
import { PriorityBadge } from "./PriorityBadge";

interface ComplaintCardProps {
  complaint: Complaint;
  onClick: () => void;
  showStudent?: boolean;
}

export const ComplaintCard: React.FC<ComplaintCardProps> = ({
  complaint,
  onClick,
  showStudent = false,
}) => {
  const formattedDate = new Date(complaint.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div
      id={`complaint-card-${complaint.id}`}
      onClick={onClick}
      className="group bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all duration-200 cursor-pointer flex flex-col justify-between"
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
              {complaint.id}
            </span>
            <PriorityBadge priority={complaint.priority} size="sm" />
          </div>
          <StatusBadge status={complaint.status} size="sm" />
        </div>

        <h3 className="text-base font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
          {complaint.title}
        </h3>

        <p className="mt-1.5 text-xs text-slate-600 line-clamp-2 leading-relaxed">
          {complaint.description}
        </p>

        {showStudent && (
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-600 font-medium">
            <UserIcon className="w-3.5 h-3.5 text-slate-400" />
            <span>{complaint.studentName}</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500 text-[11px]">{complaint.department}</span>
          </div>
        )}
      </div>

      <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1">
            <Tag className="w-3 h-3 text-indigo-500" />
            {complaint.category}
          </span>
          <span className="inline-flex items-center gap-1">
            <MapPin className="w-3 h-3 text-rose-500" />
            {complaint.location}
          </span>
          <span className="hidden sm:inline-flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-400" />
            {formattedDate}
          </span>
        </div>

        <span className="inline-flex items-center gap-1 font-medium text-indigo-600 group-hover:translate-x-0.5 transition-transform">
          Details
          <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  );
};
