import React, { useState, useEffect } from "react";
import { Search, Filter, GraduationCap, Mail, Phone, BookOpen, RefreshCw, FileText } from "lucide-react";
import { User, Complaint } from "../types";
import { api } from "../services/api";

interface AdminStudentsProps {
  navigate: (route: string) => void;
}

export const AdminStudents: React.FC<AdminStudentsProps> = ({ navigate }) => {
  const [students, setStudents] = useState<User[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [usersData, complaintsData] = await Promise.all([
        api.getUsers(),
        api.getComplaints(),
      ]);
      const studentList = usersData.filter((u) => u.role === "student");
      setStudents(studentList);
      setComplaints(complaintsData);
    } catch (err: any) {
      setError(err.message || "Failed to load students directory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getStudentStats = (studentId: string) => {
    const studentComplaints = complaints.filter((c) => c.studentId === studentId);
    const resolved = studentComplaints.filter((c) => c.status === "Resolved").length;
    return {
      total: studentComplaints.length,
      resolved,
    };
  };

  const departments = [
    "All",
    "Computer Science & Engineering",
    "Artificial Intelligence & Data Science",
    "Information Technology",
    "Electrical & Electronics Engineering",
    "Electronics & Communication",
    "Mechanical Engineering",
    "Civil Engineering",
  ];

  const filtered = students.filter((s) => {
    if (deptFilter !== "All" && s.department !== deptFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        s.name.toLowerCase().includes(q) ||
        (s.studentId && s.studentId.toLowerCase().includes(q)) ||
        s.email.toLowerCase().includes(q) ||
        (s.department && s.department.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Registered Students Directory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse campus student accounts, affiliated academic departments, and individual ticket filing history.
          </p>
        </div>

        <button
          onClick={fetchData}
          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors self-start sm:self-auto"
          title="Refresh directory"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="admin-search-students"
            type="text"
            placeholder="Search by student name, ID, or campus email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 font-medium"
          />
        </div>

        <div className="sm:w-64">
          <select
            id="admin-filter-dept"
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-purple-500/20"
          >
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept === "All" ? "All Departments" : dept}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 bg-slate-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="p-8 text-center text-rose-600 text-xs">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            No students found matching current filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-5 py-3.5">Student ID</th>
                  <th className="px-5 py-3.5">Full Name</th>
                  <th className="px-5 py-3.5">Department</th>
                  <th className="px-5 py-3.5">Year</th>
                  <th className="px-5 py-3.5">Email</th>
                  <th className="px-5 py-3.5">Phone</th>
                  <th className="px-5 py-3.5 text-center">Total Complaints</th>
                  <th className="px-5 py-3.5 text-center">Resolved</th>
                  <th className="px-5 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filtered.map((s) => {
                  const stats = getStudentStats(s.id);
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-4 font-mono font-bold text-slate-900">
                        {s.studentId || "N/A"}
                      </td>
                      <td className="px-5 py-4 font-semibold text-slate-900 flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center shrink-0">
                          {s.name[0]}
                        </div>
                        {s.name}
                      </td>
                      <td className="px-5 py-4">{s.department || "General"}</td>
                      <td className="px-5 py-4">{s.year || "2nd Year"}</td>
                      <td className="px-5 py-4 text-slate-500">{s.email}</td>
                      <td className="px-5 py-4 text-slate-500">{s.phone || "—"}</td>
                      <td className="px-5 py-4 text-center font-bold text-slate-800">
                        {stats.total}
                      </td>
                      <td className="px-5 py-4 text-center font-bold text-emerald-600">
                        {stats.resolved}
                      </td>
                      <td className="px-5 py-4">
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Active
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
