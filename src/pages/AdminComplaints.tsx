import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  ArrowUpDown,
  FileText,
  Eye,
  Edit3,
  Trash2,
  RefreshCw,
  Save,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";
import { Complaint, ComplaintStatus, ComplaintPriority } from "../types";
import { api } from "../services/api";
import { StatusBadge } from "../components/StatusBadge";
import { PriorityBadge } from "../components/PriorityBadge";
import { Modal } from "../components/Modal";

interface AdminComplaintsProps {
  onOpenComplaint: (id: string) => void;
}

export const AdminComplaints: React.FC<AdminComplaintsProps> = ({ onOpenComplaint }) => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest");

  // Quick edit modal
  const [editingComplaint, setEditingComplaint] = useState<Complaint | null>(null);
  const [editStatus, setEditStatus] = useState<ComplaintStatus>("Submitted");
  const [editPriority, setEditPriority] = useState<ComplaintPriority>("Medium");
  const [editRemarks, setEditRemarks] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchComplaints = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getComplaints();
      setComplaints(data);
    } catch (err: any) {
      setError(err.message || "Failed to load complaints list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const openQuickEdit = (complaint: Complaint) => {
    setEditingComplaint(complaint);
    setEditStatus(complaint.status);
    setEditPriority(complaint.priority);
    setEditRemarks(complaint.adminRemarks || "");
  };

  const handleSaveQuickEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingComplaint) return;

    setSavingEdit(true);
    try {
      const res = await api.updateComplaint(editingComplaint.id, {
        status: editStatus,
        priority: editPriority,
        adminRemarks: editRemarks.trim(),
      });

      setComplaints((prev) =>
        prev.map((c) => (c.id === editingComplaint.id ? res.complaint : c))
      );
      setEditingComplaint(null);
      setToastMessage(`Complaint ${res.complaint.id} updated! Student notified.`);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err: any) {
      alert("Failed to update complaint: " + err.message);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(`Are you sure you want to delete ticket ${id}?`)) return;

    try {
      await api.deleteComplaint(id);
      setComplaints((prev) => prev.filter((c) => c.id !== id));
      setToastMessage(`Complaint ${id} deleted.`);
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err: any) {
      alert("Failed to delete complaint: " + err.message);
    }
  };

  // Filter & Search logic
  const filtered = complaints
    .filter((c) => {
      if (statusFilter !== "All" && c.status.toLowerCase() !== statusFilter.toLowerCase()) return false;
      if (categoryFilter !== "All" && c.category.toLowerCase() !== categoryFilter.toLowerCase()) return false;
      if (priorityFilter !== "All" && c.priority.toLowerCase() !== priorityFilter.toLowerCase()) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const match =
          c.id.toLowerCase().includes(q) ||
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.studentName.toLowerCase().includes(q) ||
          c.location.toLowerCase().includes(q) ||
          c.department.toLowerCase().includes(q);
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

  const categories = [
    "All", "Electricity", "Water", "Wi-Fi", "Classroom", 
    "Laboratory", "Hostel", "Cleanliness", "Furniture", "Canteen", "Other"
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Campus Complaint Registry
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Master database of all reported student and departmental maintenance requests.
          </p>
        </div>

        <button
          id="btn-admin-refresh-complaints"
          onClick={fetchComplaints}
          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors self-start sm:self-auto"
          title="Refresh table"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between shadow-xs">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            {toastMessage}
          </span>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter and Search Controls */}
      <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="admin-search-input"
              type="text"
              placeholder="Search by student, ID, description, room..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              id="admin-filter-category"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-purple-500/20"
            >
              <option value="All">All Categories</option>
              {categories.slice(1).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              id="admin-sort-by"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-purple-500/20"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="priority">Highest Priority</option>
            </select>
          </div>
        </div>

        {/* Status Pill Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0">
            Status:
          </span>
          {["All", "Submitted", "Under Review", "In Progress", "Resolved", "Rejected"].map((st) => (
            <button
              key={st}
              id={`btn-admin-status-${st.toLowerCase().replace(/\s+/g, "-")}`}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all shrink-0 ${
                statusFilter === st
                  ? "bg-purple-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-slate-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="p-8 text-center text-rose-600 text-xs">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            No complaints found matching current filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-5 py-3.5">ID</th>
                  <th className="px-5 py-3.5">Student</th>
                  <th className="px-5 py-3.5">Complaint</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Location</th>
                  <th className="px-5 py-3.5">Priority</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filtered.map((c) => (
                  <tr
                    key={c.id}
                    id={`admin-row-${c.id}`}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td
                      onClick={() => onOpenComplaint(c.id)}
                      className="px-5 py-4 font-mono font-bold text-slate-900 cursor-pointer hover:underline text-purple-700"
                    >
                      {c.id}
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-semibold text-slate-900 block">{c.studentName}</span>
                      <span className="text-[11px] text-slate-400 block">{c.department}</span>
                    </td>
                    <td
                      onClick={() => onOpenComplaint(c.id)}
                      className="px-5 py-4 font-semibold text-slate-800 max-w-xs truncate cursor-pointer hover:text-purple-600"
                    >
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
                    <td className="px-5 py-4 text-slate-500 whitespace-nowrap">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          id={`btn-view-${c.id}`}
                          onClick={() => onOpenComplaint(c.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                          title="View Full Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          id={`btn-quick-edit-${c.id}`}
                          onClick={() => openQuickEdit(c)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          title="Change Status & Remarks"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          id={`btn-delete-${c.id}`}
                          onClick={() => handleDelete(c.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete Ticket"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Edit Modal */}
      {editingComplaint && (
        <Modal
          isOpen={true}
          onClose={() => setEditingComplaint(null)}
          title={`Update Complaint ${editingComplaint.id}`}
          subtitle={`Reported by ${editingComplaint.studentName} (${editingComplaint.location})`}
        >
          <form onSubmit={handleSaveQuickEdit} className="space-y-4">
            <div>
              <p className="text-xs font-bold text-slate-700 mb-1">Title</p>
              <p className="text-xs text-slate-900 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                {editingComplaint.title}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Change Status *
                </label>
                <select
                  id="modal-select-status"
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as ComplaintStatus)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-500/20"
                >
                  <option value="Submitted">Submitted</option>
                  <option value="Under Review">Under Review</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Change Priority *
                </label>
                <select
                  id="modal-select-priority"
                  value={editPriority}
                  onChange={(e) => setEditPriority(e.target.value as ComplaintPriority)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-500/20"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Admin Remarks
              </label>
              <textarea
                id="modal-textarea-remarks"
                rows={3}
                placeholder="Technician details, inspection note, or resolution justification..."
                value={editRemarks}
                onChange={(e) => setEditRemarks(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-500/20"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingComplaint(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                id="modal-btn-save-update"
                type="submit"
                disabled={savingEdit}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
              >
                <Save className="w-4 h-4" />
                {savingEdit ? "Updating..." : "Update Complaint"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
