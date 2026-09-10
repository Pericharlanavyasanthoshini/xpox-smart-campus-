import React, { useState, useEffect } from "react";
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  Bell,
  ArrowRight,
  RefreshCw,
  Sparkles,
  ScanFace,
} from "lucide-react";
import { User, Complaint } from "../types";
import { api } from "../services/api";
import { StatCard } from "../components/StatCard";
import { ComplaintCard } from "../components/ComplaintCard";

interface StudentDashboardProps {
  currentUser: User;
  navigate: (route: string) => void;
  onOpenComplaint: (id: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  currentUser,
  navigate,
  onOpenComplaint,
}) => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComplaints = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getStudentComplaints(currentUser.id);
      setComplaints(data);
    } catch (err: any) {
      setError(err.message || "Failed to load complaints.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [currentUser.id]);

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const total = complaints.length;
  const pending = complaints.filter(
    (c) => c.status === "Submitted" || c.status === "Under Review"
  ).length;
  const inProgress = complaints.filter((c) => c.status === "In Progress").length;
  const resolved = complaints.filter((c) => c.status === "Resolved").length;

  const recent = complaints.slice(0, 4);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-blue-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-md">
        <div className="absolute right-0 top-0 w-80 h-80 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-semibold mb-3 border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
              <span>Student Portal</span>
              <span className="text-white/40">•</span>
              <span>{currentUser.department || "Engineering"}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {getTimeGreeting()}, {currentUser.name}
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-indigo-100/80 max-w-xl leading-relaxed">
              Track your reported campus issues, review administrative updates, or submit a new maintenance request directly to campus facilities.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              id="btn-dash-attendance-quick"
              onClick={() => navigate("/student/attendance")}
              className="px-4 py-3 rounded-xl bg-indigo-700/80 hover:bg-indigo-600 text-white font-bold text-xs border border-indigo-500/50 shadow-md transition-all flex items-center gap-2 transform hover:-translate-y-0.5"
            >
              <ScanFace className="w-4 h-4 text-indigo-200" />
              Face Attendance
            </button>
            <button
              id="btn-dash-report-quick"
              onClick={() => navigate("/student/report")}
              className="px-5 py-3 rounded-xl bg-white text-indigo-900 hover:bg-indigo-50 font-bold text-xs shadow-md transition-all flex items-center gap-2 transform hover:-translate-y-0.5"
            >
              <PlusCircle className="w-4 h-4 text-indigo-600" />
              Report a Problem
            </button>
          </div>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          id="stat-student-total"
          title="Total Complaints"
          value={total}
          subtitle="Lifetime submitted"
          icon={<FileText className="w-5 h-5" />}
          color="indigo"
          onClick={() => navigate("/student/complaints")}
        />
        <StatCard
          id="stat-student-pending"
          title="Pending"
          value={pending}
          subtitle="Submitted & under review"
          icon={<Clock className="w-5 h-5" />}
          color="amber"
          onClick={() => navigate("/student/complaints?status=Pending")}
        />
        <StatCard
          id="stat-student-in-progress"
          title="In Progress"
          value={inProgress}
          subtitle="Technicians dispatched"
          icon={<AlertCircle className="w-5 h-5" />}
          color="blue"
          onClick={() => navigate("/student/complaints?status=In Progress")}
        />
        <StatCard
          id="stat-student-resolved"
          title="Resolved"
          value={resolved}
          subtitle="Closed successfully"
          icon={<CheckCircle2 className="w-5 h-5" />}
          color="emerald"
          onClick={() => navigate("/student/complaints?status=Resolved")}
        />
      </div>

      {/* Quick Actions Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            id="quick-action-report"
            onClick={() => navigate("/student/report")}
            className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/50 hover:bg-indigo-50 text-left transition-all group flex items-start justify-between"
          >
            <div>
              <p className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                <PlusCircle className="w-4 h-4 text-indigo-600" />
                Report a Problem
              </p>
              <p className="mt-1 text-[11px] text-slate-500">
                Log a new issue in hostel, lab, classroom or canteen
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-indigo-600 group-hover:translate-x-1 transition-transform shrink-0" />
          </button>

          <button
            id="quick-action-my-complaints"
            onClick={() => navigate("/student/complaints")}
            className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-100/70 text-left transition-all group flex items-start justify-between"
          >
            <div>
              <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-slate-700" />
                My Complaints
              </p>
              <p className="mt-1 text-[11px] text-slate-500">
                View all filed complaints and detailed timelines
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 transition-transform shrink-0" />
          </button>

          <button
            id="quick-action-notifications"
            onClick={() => navigate("/student/notifications")}
            className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-100/70 text-left transition-all group flex items-start justify-between"
          >
            <div>
              <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Bell className="w-4 h-4 text-slate-700" />
                Notifications
              </p>
              <p className="mt-1 text-[11px] text-slate-500">
                Check administrative remarks and updates
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 transition-transform shrink-0" />
          </button>
        </div>
      </div>

      {/* Recent Complaints Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Complaints</h2>
            <p className="text-xs text-slate-500">Latest issues submitted from your student account</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-refresh-recent"
              onClick={fetchComplaints}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button
              id="btn-view-all-complaints"
              onClick={() => navigate("/student/complaints")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-indigo-600 hover:bg-indigo-50 border border-indigo-100 transition-colors"
            >
              View All Complaints
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-40 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-rose-200 text-rose-600 text-xs">
            {error}
          </div>
        ) : recent.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800">No complaints found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              You haven't submitted any complaints yet. If there's an issue around campus, let facility administration know.
            </p>
            <button
              onClick={() => navigate("/student/report")}
              className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-xs hover:bg-indigo-700 transition-colors"
            >
              Report Your First Problem
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recent.map((complaint) => (
              <ComplaintCard
                key={complaint.id}
                complaint={complaint}
                onClick={() => onOpenComplaint(complaint.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
