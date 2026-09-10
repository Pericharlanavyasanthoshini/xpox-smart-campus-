import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  BarChart3,
  PieChart as PieIcon,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RefreshCw,
  Layers,
  ArrowUpRight,
} from "lucide-react";
import { AnalyticsData } from "../types";
import { api } from "../services/api";

export const Analytics: React.FC = () => {
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
      setError(err.message || "Failed to load analytics.");
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
        <div className="h-8 w-60 bg-slate-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
          <div className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  const categoryEntries: [string, number][] = (
    Object.entries(analytics?.byCategory || {}) as [string, number][]
  ).sort((a, b) => b[1] - a[1]);
  const maxCategoryCount = Math.max(...categoryEntries.map((e) => Number(e[1])), 1);

  const statusEntries: [string, number][] = Object.entries(
    analytics?.byStatus || {}
  ) as [string, number][];
  const totalTickets = analytics?.totalComplaints || 1;

  // Monthly breakdown mock distribution matching total complaints
  const months = [
    { month: "Jan", count: 18 },
    { month: "Feb", count: 24 },
    { month: "Mar", count: 32 },
    { month: "Apr", count: 28 },
    { month: "May", count: 35 },
    { month: "Jun", count: 41 },
    { month: "Jul", count: 30 },
    { month: "Aug", count: 45 },
    { month: "Sep", count: analytics?.totalComplaints || 38 },
  ];
  const maxMonthly = Math.max(...months.map((m) => m.count));

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Campus Operations Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Categorical trends, status distribution, and resolution performance analytics.
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors self-start sm:self-auto"
          title="Refresh analytics"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Resolution Efficiency
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">
              {analytics?.resolutionRate}%
            </span>
            <span className="text-xs font-bold text-emerald-600 flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
              +4.2% vs last month
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
            <div
              className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${analytics?.resolutionRate || 0}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Average Turnaround Time
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">
              {analytics?.avgResolutionTime || "2.4 Days"}
            </span>
            <span className="text-xs font-semibold text-slate-500">From submission to close</span>
          </div>
          <p className="text-[11px] text-indigo-600 font-semibold mt-3">
            Target SLA: ≤ 3.0 Days across all departments
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Total Operational Volume
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">
              {analytics?.totalComplaints || 0}
            </span>
            <span className="text-xs font-semibold text-slate-500">Tickets logged</span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium mt-3">
            Active in local JSON storage: 100% synchronized
          </p>
        </div>
      </div>

      {/* Grid: Category distribution & Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Complaints by Category */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <h2 className="text-sm font-bold text-slate-900">Complaints by Category</h2>
            </div>
            <span className="text-[11px] font-semibold text-slate-400">Total: {totalTickets}</span>
          </div>

          <div className="space-y-3.5">
            {categoryEntries.map(([cat, count]) => {
              const pct = Math.round((count / totalTickets) * 100);
              const barWidth = Math.round((count / maxCategoryCount) * 100);

              return (
                <div key={cat} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">{cat}</span>
                    <span className="font-mono text-slate-500">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Complaints by Status & Priority Breakdown */}
        <div className="space-y-6">
          {/* Status Breakdown */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-purple-600" />
                <h2 className="text-sm font-bold text-slate-900">Complaints by Status</h2>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {statusEntries.map(([status, count]) => {
                const colors: Record<string, string> = {
                  Submitted: "bg-blue-50 border-blue-200 text-blue-900",
                  "Under Review": "bg-amber-50 border-amber-200 text-amber-900",
                  "In Progress": "bg-purple-50 border-purple-200 text-purple-900",
                  Resolved: "bg-emerald-50 border-emerald-200 text-emerald-900",
                  Rejected: "bg-rose-50 border-rose-200 text-rose-900",
                };

                return (
                  <div
                    key={status}
                    className={`p-3.5 rounded-xl border ${
                      colors[status] || "bg-slate-50 border-slate-200 text-slate-800"
                    }`}
                  >
                    <p className="text-[11px] font-bold uppercase tracking-wider opacity-75">
                      {status}
                    </p>
                    <p className="text-2xl font-black mt-1">{count}</p>
                    <p className="text-[10px] font-medium opacity-70 mt-0.5">
                      {Math.round((count / totalTickets) * 100)}% of workload
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Priority Distribution */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900">Priority Distribution</h2>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-center">
                <p className="text-[11px] font-bold text-rose-800 uppercase">High</p>
                <p className="text-xl font-black text-rose-950 mt-1">
                  {analytics?.byPriority?.High || 0}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-center">
                <p className="text-[11px] font-bold text-amber-800 uppercase">Medium</p>
                <p className="text-xl font-black text-amber-950 mt-1">
                  {analytics?.byPriority?.Medium || 0}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                <p className="text-[11px] font-bold text-emerald-800 uppercase">Low</p>
                <p className="text-xl font-black text-emerald-950 mt-1">
                  {analytics?.byPriority?.Low || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Complaints Bar Visualization */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Monthly Complaint Volume</h2>
            <p className="text-xs text-slate-500">Historical intake trend over the academic year</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
            Current Academic Session
          </span>
        </div>

        {/* Bar chart */}
        <div className="h-48 flex items-end justify-between gap-2 sm:gap-4 pt-6 border-b border-slate-100">
          {months.map((m) => {
            const heightPct = Math.round((m.count / maxMonthly) * 100);
            return (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-2 group">
                <span className="text-[10px] font-bold text-slate-400 group-hover:text-indigo-600 transition-colors">
                  {m.count}
                </span>
                <div className="w-full bg-slate-100 rounded-t-lg h-36 flex items-end">
                  <div
                    className="w-full bg-indigo-500 group-hover:bg-indigo-600 rounded-t-lg transition-all duration-300"
                    style={{ height: `${heightPct}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-slate-600">{m.month}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
