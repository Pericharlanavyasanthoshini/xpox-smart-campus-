import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Tag,
  User as UserIcon,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  ShieldCheck,
  Save,
  Trash2,
  Share2,
} from "lucide-react";
import { User, Complaint, ComplaintStatus, ComplaintPriority } from "../types";
import { api } from "../services/api";
import { StatusBadge } from "../components/StatusBadge";
import { PriorityBadge } from "../components/PriorityBadge";

interface ComplaintDetailsProps {
  complaintId: string;
  currentUser: User;
  onBack: () => void;
  onComplaintUpdated?: () => void;
}

export const ComplaintDetails: React.FC<ComplaintDetailsProps> = ({
  complaintId,
  currentUser,
  onBack,
  onComplaintUpdated,
}) => {
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Admin edit fields
  const [adminStatus, setAdminStatus] = useState<ComplaintStatus>("Submitted");
  const [adminPriority, setAdminPriority] = useState<ComplaintPriority>("Medium");
  const [adminRemarks, setAdminRemarks] = useState("");
  const [updating, setUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);

  const isAdmin = currentUser.role === "admin";

  const fetchDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getComplaint(complaintId);
      setComplaint(data);
      setAdminStatus(data.status);
      setAdminPriority(data.priority);
      setAdminRemarks(data.adminRemarks || "");
    } catch (err: any) {
      setError(err.message || "Failed to load complaint details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [complaintId]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint) return;

    setUpdating(true);
    setUpdateSuccess(null);
    try {
      const res = await api.updateComplaint(complaint.id, {
        status: adminStatus,
        priority: adminPriority,
        adminRemarks: adminRemarks.trim(),
      });
      setComplaint(res.complaint);
      setUpdateSuccess("Complaint updated successfully! Student has been notified.");
      if (onComplaintUpdated) onComplaintUpdated();
      setTimeout(() => setUpdateSuccess(null), 4000);
    } catch (err: any) {
      setError(err.message || "Failed to update complaint.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-8 space-y-6">
        <div className="h-8 w-48 bg-slate-200 rounded-lg animate-pulse" />
        <div className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="max-w-2xl mx-auto p-8 bg-white rounded-2xl border border-slate-200 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-800">Complaint Not Found</h2>
        <p className="text-xs text-slate-500">{error || "Unable to retrieve this ticket."}</p>
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
        >
          Return to Complaints
        </button>
      </div>
    );
  }

  // Timeline steps definition
  const standardStages = ["Submitted", "Under Review", "In Progress", "Resolved"];
  const currentStageIndex = standardStages.indexOf(complaint.status);
  const isRejected = complaint.status === "Rejected";

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Top back & actions bar */}
      <div className="flex items-center justify-between">
        <button
          id="btn-back-from-details"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to List
        </button>

        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold px-3 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200">
            {complaint.id}
          </span>
          <StatusBadge status={complaint.status} size="md" />
        </div>
      </div>

      {/* Main Complaint Overview Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 sm:p-8 space-y-6">
          {/* Header */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 flex-wrap">
              <PriorityBadge priority={complaint.priority} size="md" />
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                <Tag className="w-3.5 h-3.5 text-indigo-500" />
                {complaint.category}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                {complaint.location}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {complaint.title}
            </h1>

            <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Reported on {new Date(complaint.createdAt).toLocaleString()}
              </span>
              <span className="flex items-center gap-1.5 font-medium text-slate-700">
                <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                {complaint.studentName} ({complaint.department})
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="p-4.5 rounded-xl bg-slate-50 border border-slate-100">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Problem Description
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {complaint.description}
            </p>
          </div>

          {/* Admin Remarks callout */}
          {complaint.adminRemarks ? (
            <div className="p-4.5 rounded-xl bg-indigo-50/60 border border-indigo-100">
              <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs mb-1.5">
                <MessageSquare className="w-4 h-4 text-indigo-600" />
                Official Admin Remark
              </div>
              <p className="text-xs sm:text-sm text-indigo-950 font-medium leading-relaxed">
                "{complaint.adminRemarks}"
              </p>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-500 italic">
              No administrative remarks posted yet.
            </div>
          )}

          {/* Visual Progress Timeline */}
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-6">
              Resolution Progress Timeline
            </h3>

            {isRejected ? (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                <div>
                  <p className="font-bold">Complaint Rejected</p>
                  <p className="text-[11px] text-rose-700 mt-0.5">
                    This ticket was reviewed and declined based on campus regulations or duplicate filing.
                  </p>
                </div>
              </div>
            ) : (
              <div className="relative">
                {/* Horizontal Progress bar on sm+ screens */}
                <div className="grid grid-cols-4 gap-2 sm:gap-4 relative">
                  {standardStages.map((stage, idx) => {
                    const isPassed = currentStageIndex >= idx;
                    const isCurrent = complaint.status === stage;

                    return (
                      <div key={stage} className="text-center relative">
                        {/* Connecting Line between steps */}
                        {idx < standardStages.length - 1 && (
                          <div
                            className={`hidden sm:block absolute top-4 left-1/2 w-full h-1 -z-0 transition-colors ${
                              currentStageIndex > idx ? "bg-emerald-500" : "bg-slate-200"
                            }`}
                          />
                        )}

                        {/* Step Icon Indicator */}
                        <div
                          className={`relative z-10 w-8 h-8 mx-auto rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs ${
                            isCurrent
                              ? "bg-indigo-600 text-white ring-4 ring-indigo-100 animate-pulse"
                              : isPassed
                              ? "bg-emerald-500 text-white"
                              : "bg-slate-200 text-slate-500"
                          }`}
                        >
                          {isPassed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                        </div>

                        {/* Label */}
                        <p
                          className={`mt-2 text-xs font-bold ${
                            isCurrent
                              ? "text-indigo-600"
                              : isPassed
                              ? "text-slate-800"
                              : "text-slate-400"
                          }`}
                        >
                          {stage}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Audit log notes */}
            {complaint.timeline && complaint.timeline.length > 0 && (
              <div className="mt-6 space-y-2 border-t border-slate-100 pt-4">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Timeline History
                </p>
                {complaint.timeline.map((step, i) => (
                  <div key={i} className="text-xs flex items-start gap-2.5 text-slate-600 py-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                    <div className="flex-1">
                      <span className="font-semibold text-slate-800">{step.status}:</span>{" "}
                      <span>{step.note}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap">
                      {new Date(step.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Admin Action Panel (Only visible for Administrator role) */}
      {isAdmin && (
        <div className="bg-white rounded-2xl border-2 border-purple-200 shadow-sm overflow-hidden p-6 sm:p-8 space-y-5">
          <div className="flex items-center justify-between border-b border-purple-100 pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-purple-600" />
              <h2 className="text-base font-bold text-slate-900">
                Administrative Control Panel
              </h2>
            </div>
            <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
              Admin Action Mode
            </span>
          </div>

          {updateSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{updateSuccess}</span>
            </div>
          )}

          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Change Status */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Change Status
                </label>
                <select
                  id="select-admin-status"
                  value={adminStatus}
                  onChange={(e) => setAdminStatus(e.target.value as ComplaintStatus)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                >
                  <option value="Submitted">Submitted</option>
                  <option value="Under Review">Under Review</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              {/* Change Priority */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Change Priority
                </label>
                <select
                  id="select-admin-priority"
                  value={adminPriority}
                  onChange={(e) => setAdminPriority(e.target.value as ComplaintPriority)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                >
                  <option value="Low">Low Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="High">High Priority</option>
                </select>
              </div>
            </div>

            {/* Admin Remarks */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Admin Remarks (Sent to student via notification)
              </label>
              <textarea
                id="textarea-admin-remarks"
                rows={3}
                placeholder="Add technician assignment details, scheduled inspection time, or resolution explanation..."
                value={adminRemarks}
                onChange={(e) => setAdminRemarks(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                id="btn-update-complaint-admin"
                type="submit"
                disabled={updating}
                className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {updating ? "Saving to Local JSON..." : "Update Complaint & Notify Student"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
