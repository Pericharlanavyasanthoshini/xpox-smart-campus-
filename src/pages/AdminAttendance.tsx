import React, { useState, useEffect } from "react";
import { User, AttendanceRecord, AttendanceStats } from "../types";
import { api } from "../services/api";
import { FaceRecognitionModal } from "../components/FaceRecognitionModal";
import {
  ScanFace,
  CheckCircle2,
  AlertCircle,
  Clock,
  Calendar,
  Users,
  Search,
  Filter,
  Download,
  ShieldCheck,
  Building,
  Edit2,
  RefreshCw,
  Zap,
} from "lucide-react";

export const AdminAttendance: React.FC = () => {
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [allStudents, setAllStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const todayStr = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Kiosk / Scanner Modal
  const [kioskOpen, setKioskOpen] = useState(false);
  const [selectedStudentForScan, setSelectedStudentForScan] = useState<User | null>(null);

  // Override status modal
  const [overrideTarget, setOverrideTarget] = useState<AttendanceRecord | null>(null);
  const [overrideStatus, setOverrideStatus] = useState<string>("Present");
  const [overrideNotes, setOverrideNotes] = useState<string>("");
  const [overrideLoading, setOverrideLoading] = useState(false);

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsData, recordsData, studentsData] = await Promise.all([
        api.getAttendanceStats(),
        api.getAttendance({
          date: selectedDate === "All" ? undefined : selectedDate,
          department: selectedDepartment === "All" ? undefined : selectedDepartment,
          status: selectedStatus === "All" ? undefined : selectedStatus,
        }),
        api.getUsers(),
      ]);
      setStats(statsData);
      setRecords(recordsData);
      setAllStudents(studentsData.filter((u) => u.role === "student"));
    } catch (err) {
      console.error("Failed to load attendance data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDate, selectedDepartment, selectedStatus]);

  // Handle recorded attendance from kiosk
  const handleAttendanceRecorded = (newRecord: AttendanceRecord) => {
    setRecords((prev) => {
      const exists = prev.some((r) => r.id === newRecord.id);
      return exists ? prev.map((r) => (r.id === newRecord.id ? newRecord : r)) : [newRecord, ...prev];
    });
    // refresh stats
    api.getAttendanceStats().then(setStats).catch(console.error);
  };

  // Status Override handler
  const handleSaveOverride = async () => {
    if (!overrideTarget) return;
    try {
      setOverrideLoading(true);
      const res = await api.updateAttendanceStatus(overrideTarget.id, overrideStatus, overrideNotes);
      setRecords((prev) =>
        prev.map((r) => (r.id === overrideTarget.id ? res.record : r))
      );
      setOverrideTarget(null);
      api.getAttendanceStats().then(setStats).catch(console.error);
    } catch (err) {
      console.error(err);
      alert("Failed to update attendance status.");
    } finally {
      setOverrideLoading(false);
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    if (records.length === 0) {
      alert("No attendance records to export.");
      return;
    }
    const headers = [
      "Record ID",
      "Student Roll",
      "Student Name",
      "Department",
      "Date",
      "Time",
      "Status",
      "Verification Method",
      "Confidence Score",
      "Session",
    ];

    const rows = records.map((r) => [
      r.id,
      r.studentRoll,
      `"${r.studentName}"`,
      `"${r.department}"`,
      r.date,
      r.time,
      r.status,
      r.verificationMethod,
      `${r.confidenceScore}%`,
      `"${r.session}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Campus_Attendance_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter records by search
  const filteredRecords = records.filter((r) => {
    const q = searchQuery.toLowerCase();
    return (
      r.studentName.toLowerCase().includes(q) ||
      r.studentRoll.toLowerCase().includes(q) ||
      r.department.toLowerCase().includes(q) ||
      r.status.toLowerCase().includes(q)
    );
  });

  const departmentList = [
    "Computer Science & Engineering",
    "Artificial Intelligence & Data Science",
    "Electrical & Electronics Engineering",
    "Mechanical Engineering",
    "Information Technology",
    "Civil Engineering",
    "Electronics & Communication",
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Campus Attendance Command Center
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              <ScanFace className="w-3.5 h-3.5 mr-1 text-indigo-600" />
              Biometric Kiosk
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Real-time biometric facial recognition attendance monitoring, student registry verification, and automated audits.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            id="launch-kiosk-btn"
            onClick={() => {
              setSelectedStudentForScan(allStudents[0] || null);
              setKioskOpen(true);
            }}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all flex items-center space-x-2"
          >
            <ScanFace className="w-4 h-4" />
            <span>Launch Campus Face Kiosk</span>
          </button>

          <button
            id="export-attendance-btn"
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all flex items-center space-x-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={fetchData}
            className="p-2.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all"
            title="Refresh Attendance Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Attendance Rate */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Today's Rate
            </span>
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <Zap className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-slate-900 tracking-tight">
            {stats?.attendanceRateToday || 0}%
          </div>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Campus Check-in Ratio
          </p>
        </div>

        {/* Present Today */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Present Today
            </span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-emerald-600 tracking-tight">
            {stats?.presentToday || 0}
          </div>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Verified via Face AI
          </p>
        </div>

        {/* Late Today */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Late Check-ins
            </span>
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-amber-600 tracking-tight">
            {stats?.lateToday || 0}
          </div>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            After 09:15 AM
          </p>
        </div>

        {/* Absent Today */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Unrecorded / Absent
            </span>
            <span className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
              <AlertCircle className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-rose-600 tracking-tight">
            {stats?.absentToday || 0}
          </div>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Pending scan
          </p>
        </div>

        {/* Total Registered Students */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Enrolled
            </span>
            <span className="p-1.5 rounded-lg bg-slate-100 text-slate-600">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-slate-900 tracking-tight">
            {stats?.totalStudents || allStudents.length}
          </div>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Active Student Roster
          </p>
        </div>
      </div>

      {/* Department Breakdown Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Building className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Department Attendance Distribution
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">Date: {selectedDate}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(stats?.byDepartment || {}).map(
            ([dept, dStats]: [string, { total: number; present: number; rate: number }]) => (
              <div
                key={dept}
                className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors"
              >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-800 truncate max-w-[180px]">
                  {dept}
                </span>
                <span
                  className={`text-xs font-bold font-mono ${
                    dStats.rate >= 80
                      ? "text-emerald-600"
                      : dStats.rate >= 60
                      ? "text-amber-600"
                      : "text-rose-600"
                  }`}
                >
                  {dStats.rate}%
                </span>
              </div>
              <div className="mt-2 w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    dStats.rate >= 80
                      ? "bg-emerald-500"
                      : dStats.rate >= 60
                      ? "bg-amber-500"
                      : "bg-rose-500"
                  }`}
                  style={{ width: `${dStats.rate}%` }}
                />
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                <span>Present: {dStats.present}</span>
                <span>Total: {dStats.total}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Attendance Register & Audit Records Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Filters Bar */}
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-slate-50/50">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Campus Daily Attendance Register
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified face match logs, check-in timestamps, and administrative audit status
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Date Input */}
            <div className="flex items-center space-x-1.5 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <input
                id="attendance-date-picker"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="focus:outline-none bg-transparent font-medium"
              />
            </div>

            {/* Department Dropdown */}
            <select
              id="filter-admin-dept"
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Departments</option>
              {departmentList.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            {/* Status Dropdown */}
            <select
              id="filter-admin-status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Statuses</option>
              <option value="Present">Present</option>
              <option value="Late">Late</option>
              <option value="Absent">Absent</option>
              <option value="Excused">Excused</option>
            </select>

            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="search-admin-attendance"
                type="text"
                placeholder="Search student or roll..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 w-44 sm:w-52"
              />
            </div>
          </div>
        </div>

        {/* Table Body */}
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            Loading attendance records...
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-700">
              No records found for the selected date or filters
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Click "Launch Campus Face Kiosk" to scan students or select a different date.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-5">Student</th>
                  <th className="py-3.5 px-5">Department</th>
                  <th className="py-3.5 px-5">Check-In Time</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5">Biometric Verification</th>
                  <th className="py-3.5 px-5">Confidence</th>
                  <th className="py-3.5 px-5">Session / Checkpoint</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {filteredRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/75 transition-colors">
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 font-bold flex items-center justify-center text-xs">
                          {rec.studentName
                            .split(" ")
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join("")}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">
                            {rec.studentName}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {rec.studentRoll}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-5 text-slate-600 whitespace-nowrap">
                      {rec.department}
                    </td>

                    <td className="py-3.5 px-5 whitespace-nowrap font-mono text-slate-700">
                      {rec.time}
                    </td>

                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          rec.status === "Present"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : rec.status === "Late"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : rec.status === "Excused"
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {rec.status === "Present" && (
                          <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-500" />
                        )}
                        {rec.status === "Late" && (
                          <Clock className="w-3 h-3 mr-1 text-amber-500" />
                        )}
                        {rec.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <span className="inline-flex items-center text-indigo-700 font-medium bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                        <ScanFace className="w-3.5 h-3.5 mr-1 text-indigo-600" />
                        {rec.verificationMethod}
                      </span>
                    </td>

                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <span className="font-mono text-emerald-600 font-semibold">
                        {rec.confidenceScore}%
                      </span>
                    </td>

                    <td className="py-3.5 px-5 text-slate-500 text-[11px] max-w-xs truncate">
                      {rec.session}
                    </td>

                    <td className="py-3.5 px-5 text-right whitespace-nowrap">
                      <button
                        onClick={() => {
                          setOverrideTarget(rec);
                          setOverrideStatus(rec.status);
                          setOverrideNotes(rec.notes || "");
                        }}
                        className="px-2.5 py-1 text-xs text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg font-medium border border-slate-200 transition-colors inline-flex items-center space-x-1"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Override</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Kiosk Face Recognition Scanner Modal */}
      <FaceRecognitionModal
        isOpen={kioskOpen}
        onClose={() => setKioskOpen(false)}
        currentUser={allStudents[0] || ({} as User)}
        allStudents={allStudents}
        mode="kiosk_scanner"
        targetStudent={selectedStudentForScan}
        onAttendanceRecorded={handleAttendanceRecorded}
      />

      {/* Manual Status Override Modal */}
      {overrideTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Administrative Attendance Override
              </h3>
              <button
                onClick={() => setOverrideTarget(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl">
              <span className="font-semibold text-slate-800">
                {overrideTarget.studentName}
              </span>{" "}
              ({overrideTarget.studentRoll}) — {overrideTarget.date}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                New Status
              </label>
              <select
                value={overrideStatus}
                onChange={(e) => setOverrideStatus(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Present">Present</option>
                <option value="Late">Late</option>
                <option value="Excused">Excused (Medical / Approved Duty)</option>
                <option value="Absent">Absent</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Administrative Reason / Remarks
              </label>
              <textarea
                rows={3}
                placeholder="Reason for manual override..."
                value={overrideNotes}
                onChange={(e) => setOverrideNotes(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-xl p-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setOverrideTarget(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={overrideLoading}
                onClick={handleSaveOverride}
                className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
              >
                {overrideLoading ? "Saving..." : "Save Override"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
