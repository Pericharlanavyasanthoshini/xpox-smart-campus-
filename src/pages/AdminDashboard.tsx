import React, { useState, useEffect } from "react";
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Timer,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Users,
  ShieldCheck,
  ScanFace,
} from "lucide-react";
import { User, AnalyticsData, Complaint } from "../types";
import { api } from "../services/api";
import { StatCard } from "../components/StatCard";
import { StatusBadge } from "../components/StatusBadge";
import { PriorityBadge } from "../components/PriorityBadge";

interface AdminDashboardProps {
  currentUser: User;
  navigate: (route: string) => void;
  onOpenComplaint: (id: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  navigate,
  onOpenComplaint,
}) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getAnalytics();
      setAnalytics(data);
    } catch (err: any) {
      setError(err.message || "Failed to load admin analytics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading && !analytics) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-64 bg-slate-200 rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const highPriorityTickets = (analytics?.recentComplaints || []).filter(
    (c) => c.priority === "High" && c.status !== "Resolved" && c.status !== "Rejected"
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-purple-100 text-purple-700">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Campus Operations Command
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time complaint telemetry, facility workloads, and resolution performance across all academic blocks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-admin-refresh-analytics"
            onClick={fetchAnalytics}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
            title="Refresh telemetry"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            id="btn-admin-face-attendance"
            onClick={() => navigate("/admin/attendance")}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5"
          >
            <ScanFace className="w-4 h-4" />
            Face Attendance
          </button>
          <button
            id="btn-admin-view-all-complaints"
            onClick={() => navigate("/admin/complaints")}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5"
          >
            Manage All Tickets
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Primary Statistics Cards (TOTAL COMPLAINTS, PENDING, IN PROGRESS, RESOLVED) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          id="admin-stat-total"
          title="TOTAL COMPLAINTS"
          value={analytics?.totalComplaints || 0}
          subtitle="Cumulative tickets logged"
          icon={<FileText className="w-5 h-5" />}
          color="purple"
          onClick={() => navigate("/admin/complaints")}
        />
        <StatCard
          id="admin-stat-pending"
          title="PENDING"
          value={analytics?.pending || 0}
          subtitle="Submitted & under review"
          icon={<Clock className="w-5 h-5" />}
          color="amber"
          onClick={() => navigate("/admin/complaints?status=Pending")}
        />
        <StatCard
          id="admin-stat-in-progress"
          title="IN PROGRESS"
          value={analytics?.inProgress || 0}
          subtitle="Assigned to field teams"
          icon={<AlertCircle className="w-5 h-5" />}
          color="blue"
          onClick={() => navigate("/admin/complaints?status=In Progress")}
        />
        <StatCard
          id="admin-stat-resolved"
          title="RESOLVED"
          value={analytics?.resolved || 0}
          subtitle="Completed and verified"
          icon={<CheckCircle2 className="w-5 h-5" />}
          color="emerald"
          onClick={() => navigate("/admin/complaints?status=Resolved")}
        />
      </div>

      {/* Resolution Rate & Average Resolution Time Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Resolution Rate Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Resolution Rate
            </p>
            <p className="mt-1.5 text-3xl font-black text-slate-900 tracking-tight">
              {analytics?.resolutionRate || 0}%
            </p>
            <p className="mt-0.5 text-xs text-emerald-600 font-medium">
              High campus satisfaction
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <TrendingUp className="w-7 h-7" />
          </div>
        </div>

        {/* Average Resolution Time Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Average Resolution Time
            </p>
            <p className="mt-1.5 text-3xl font-black text-slate-900 tracking-tight">
              {analytics?.avgResolutionTime || "2.4 Days"}
            </p>
            <p className="mt-0.5 text-xs text-indigo-600 font-medium">
              Calculated from resolved tickets
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Timer className="w-7 h-7" />
          </div>
        </div>

        {/* Registered Students Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Registered Students
            </p>
            <p className="mt-1.5 text-3xl font-black text-slate-900 tracking-tight">
              {analytics?.totalStudents || 0}
            </p>
            <p className="mt-0.5 text-xs text-slate-500 font-medium">
              Active across 8 engineering depts
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Users className="w-7 h-7" />
          </div>
        </div>
      </div>

      {/* Urgent Unresolved High-Priority Issues Alert */}
      {highPriorityTickets.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
              <AlertTriangle className="w-4.5 h-4.5 text-rose-600" />
              <span>Urgent Attention Required: {highPriorityTickets.length} Unresolved High Priority Issues</span>
            </div>
            <span className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider">
              Priority Escalation
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {highPriorityTickets.map((t) => (
              <div
                key={t.id}
                onClick={() => onOpenComplaint(t.id)}
                className="p-3.5 bg-white rounded-xl border border-rose-100 hover:border-rose-300 transition-all cursor-pointer flex items-center justify-between shadow-2xs"
              >
                <div className="min-w-0 flex-1 mr-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-[11px] font-bold text-slate-700">{t.id}</span>
                    <span className="text-[11px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                      {t.location}
                    </span>
                    <StatusBadge status={t.status} size="sm" />
                  </div>
                  <p className="text-xs font-bold text-slate-900 truncate">{t.title}</p>
                  <p className="text-[11px] text-slate-500 truncate">By {t.studentName} ({t.department})</p>
                </div>
                <ArrowRight className="w-4 h-4 text-rose-600 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recently Submitted Complaints Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recently Submitted Complaints</h2>
            <p className="text-xs text-slate-500">Live feed of reported campus tickets</p>
          </div>
          <button
            id="btn-admin-dash-see-all"
            onClick={() => navigate("/admin/complaints")}
            className="text-xs font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1 transition-colors"
          >
            View Full Table
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-3">ID</th>
                <th className="px-5 py-3">Student</th>
                <th className="px-5 py-3">Complaint</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Location</th>
                <th className="px-5 py-3">Priority</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {(analytics?.recentComplaints || []).map((c) => (
                <tr
                  key={c.id}
                  onClick={() => onOpenComplaint(c.id)}
                  className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                >
                  <td className="px-5 py-3.5 font-mono font-bold text-slate-800">{c.id}</td>
                  <td className="px-5 py-3.5">
                    <span className="font-semibold text-slate-900 block">{c.studentName}</span>
                    <span className="text-[11px] text-slate-400 block">{c.department}</span>
                  </td>
                  <td className="px-5 py-3.5 font-semibold text-slate-800 max-w-xs truncate">{c.title}</td>
                  <td className="px-5 py-3.5">{c.category}</td>
                  <td className="px-5 py-3.5">{c.location}</td>
                  <td className="px-5 py-3.5">
                    <PriorityBadge priority={c.priority} size="sm" />
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={c.status} size="sm" />
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenComplaint(c.id);
                      }}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold text-purple-600 hover:bg-purple-50 transition-colors"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
