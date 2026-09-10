import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  ArrowUpDown,
  FileText,
  PlusCircle,
  Eye,
  Calendar,
  RefreshCw,
  LayoutGrid,
  Table as TableIcon,
} from "lucide-react";
import { User, Complaint } from "../types";
import { api } from "../services/api";
import { StatusBadge } from "../components/StatusBadge";
import { PriorityBadge } from "../components/PriorityBadge";
import { ComplaintCard } from "../components/ComplaintCard";

interface MyComplaintsProps {
  currentUser: User;
  navigate: (route: string) => void;
  onOpenComplaint: (id: string) => void;
}

export const MyComplaints: React.FC<MyComplaintsProps> = ({
  currentUser,
  navigate,
  onOpenComplaint,
}) => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

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

  // Filtering & Sorting
  const filteredComplaints = complaints
    .filter((c) => {
      // Status filter
      if (statusFilter === "Pending") {
        if (c.status !== "Submitted" && c.status !== "Under Review") return false;
      } else if (statusFilter !== "All") {
        if (c.status.toLowerCase() !== statusFilter.toLowerCase()) return false;
      }

      // Search filter
      if (search.trim()) {
        const q = search.toLowerCase();
        const match =
          c.id.toLowerCase().includes(q) ||
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q) ||
          c.location.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === "priority") {
        const pMap: Record<string, number> = { High: 3, Medium: 2, Low: 1 };
        return (pMap[b.priority] || 0) - (pMap[a.priority] || 0);
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const filterTabs = ["All", "Pending", "Under Review", "In Progress", "Resolved"];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            My Complaints
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review status updates, timelines, and resolution notes for all your reported tickets.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-report-new-top"
            onClick={() => navigate("/student/report")}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            Report Problem
          </button>
          <button
            id="btn-refresh-my-complaints"
            onClick={fetchComplaints}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Control Bar: Search + Filters + Sort + View Toggle */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="input-my-complaints-search"
              type="text"
              placeholder="Search by ID, title, category, or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-3">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                id="select-my-complaints-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="priority">Highest Priority</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="hidden sm:flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-50">
              <button
                onClick={() => setViewMode("cards")}
                className={`p-1.5 rounded-md ${
                  viewMode === "cards" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-400 hover:text-slate-700"
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-md ${
                  viewMode === "table" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-400 hover:text-slate-700"
                }`}
                title="Table View"
              >
                <TableIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Filter:
          </span>
          {filterTabs.map((tab) => {
            const isSelected = statusFilter === tab;
            return (
              <button
                key={tab}
                id={`filter-tab-${tab.toLowerCase().replace(/\s+/g, "-")}`}
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all shrink-0 ${
                  isSelected
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
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
      ) : filteredComplaints.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No complaints found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {search || statusFilter !== "All"
              ? "No tickets match your search or filter parameters. Try resetting filters."
              : "You haven't reported any campus problems yet."}
          </p>
          {(search || statusFilter !== "All") && (
            <button
              onClick={() => {
                setSearch("");
                setStatusFilter("All");
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-colors"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : viewMode === "cards" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredComplaints.map((complaint) => (
            <ComplaintCard
              key={complaint.id}
              complaint={complaint}
              onClick={() => onOpenComplaint(complaint.id)}
            />
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-5 py-3.5">ID</th>
                  <th className="px-5 py-3.5">Title</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Location</th>
                  <th className="px-5 py-3.5">Priority</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Submitted Date</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredComplaints.map((c) => (
                  <tr
                    key={c.id}
                    id={`table-row-${c.id}`}
                    onClick={() => onOpenComplaint(c.id)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-4 font-mono font-bold text-slate-800">
                      {c.id}
                    </td>
                    <td className="px-5 py-4 font-semibold text-slate-900 max-w-xs truncate">
                      {c.title}
                    </td>
                    <td className="px-5 py-4">{c.category}</td>
                    <td className="px-5 py-4">{c.location}</td>
                    <td className="px-5 py-4">
                      <PriorityBadge priority={c.priority} size="sm" />
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={c.status} size="sm" />
                    </td>
                    <td className="px-5 py-4 text-slate-500">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenComplaint(c.id);
                        }}
                        className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
