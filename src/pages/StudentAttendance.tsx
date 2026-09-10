import React, { useState, useEffect } from "react";
import { User, StudentAttendanceSummary, AttendanceRecord } from "../types";
import { api } from "../services/api";
import { FaceRecognitionModal } from "../components/FaceRecognitionModal";
import {
  ScanFace,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Calendar,
  ShieldCheck,
  Sparkles,
  Flame,
  Search,
  Filter,
  ArrowUpRight,
  Info,
  Camera,
} from "lucide-react";

interface StudentAttendanceProps {
  currentUser: User;
  onOpenComplaint?: (id: string) => void;
}

export const StudentAttendance: React.FC<StudentAttendanceProps> = ({
  currentUser,
}) => {
  const [summary, setSummary] = useState<StudentAttendanceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");

  // Face Scanner Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"self_mark" | "enroll_face">("self_mark");

  // Load student attendance
  const loadAttendance = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getStudentAttendance(currentUser.id);
      setSummary(data);
    } catch (err: unknown) {
      console.error(err);
      setError("Failed to load attendance records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, [currentUser.id]);

  // Handle successful scan from modal
  const handleAttendanceRecorded = (record: AttendanceRecord) => {
    setSummary((prev) => {
      if (!prev) return null;
      const alreadyInList = prev.records.some((r) => r.id === record.id);
      const newRecords = alreadyInList ? prev.records : [record, ...prev.records];
      const newPresent = record.status === "Present" ? prev.presentDays + 1 : prev.presentDays;
      const newLate = record.status === "Late" ? prev.lateDays + 1 : prev.lateDays;
      const totalDays = Math.max(newRecords.length, prev.totalDays);
      const eff = newPresent + newLate * 0.85;
      const newPct = Math.min(100, Math.round((eff / totalDays) * 100));

      return {
        ...prev,
        records: newRecords,
        presentDays: newPresent,
        lateDays: newLate,
        percentage: newPct,
      };
    });
  };

  const handleFaceEnrolled = (updatedUser: User) => {
    setSummary((prev) => (prev ? { ...prev, faceEnrolled: true } : null));
  };

  // Check if today is already recorded
  const todayStr = new Date().toISOString().split("T")[0];
  const todayRecord = summary?.records.find((r) => r.date === todayStr);

  // Filter records
  const filteredRecords = (summary?.records || []).filter((r) => {
    const matchesStatus =
      selectedStatus === "All" || r.status.toLowerCase() === selectedStatus.toLowerCase();
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      r.date.includes(q) ||
      r.time.toLowerCase().includes(q) ||
      (r.session && r.session.toLowerCase().includes(q)) ||
      (r.notes && r.notes.toLowerCase().includes(q));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Biometric Attendance Portal
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              <ScanFace className="w-3.5 h-3.5 mr-1 text-indigo-600" />
              Face Recognition AI
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Check-in effortlessly using facial verification, track academic attendance criteria, and view your verified records.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {todayRecord ? (
            <div className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Today: {todayRecord.status} ({todayRecord.time})</span>
            </div>
          ) : (
            <button
              id="open-attendance-scanner-btn"
              onClick={() => {
                setModalMode("self_mark");
                setModalOpen(true);
              }}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all flex items-center space-x-2"
            >
              <ScanFace className="w-4 h-4" />
              <span>Mark Attendance (Face Scan)</span>
            </button>
          )}

          <button
            id="re-enroll-face-btn"
            onClick={() => {
              setModalMode("enroll_face");
              setModalOpen(true);
            }}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all flex items-center space-x-1.5"
            title="Update facial biometric profile"
          >
            <Camera className="w-4 h-4 text-slate-600" />
            <span className="hidden sm:inline">Face Profile</span>
          </button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Attendance Percentage Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Overall Attendance
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                (summary?.percentage || 0) >= 75
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : (summary?.percentage || 0) >= 65
                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                  : "bg-rose-50 text-rose-700 border border-rose-200"
              }`}
            >
              {(summary?.percentage || 0) >= 75 ? "Exam Eligible" : "Attendance Shortage"}
            </span>
          </div>

          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {summary?.percentage || 0}%
            </span>
            <span className="text-xs text-slate-400 font-medium">/ 75% Min. Required</span>
          </div>

          {/* Progress bar */}
          <div className="mt-3 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                (summary?.percentage || 0) >= 75
                  ? "bg-emerald-500"
                  : (summary?.percentage || 0) >= 65
                  ? "bg-amber-500"
                  : "bg-rose-500"
              }`}
              style={{ width: `${summary?.percentage || 0}%` }}
            />
          </div>
        </div>

        {/* Days Present */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Days Present
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-slate-900 tracking-tight">
            {summary?.presentDays || 0}
          </div>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Verified via Face AI & Gate Kiosks
          </p>
        </div>

        {/* Late Entries */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Late Check-ins
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-slate-900 tracking-tight">
            {summary?.lateDays || 0}
          </div>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Scanned after 09:15 AM
          </p>
        </div>

        {/* Attendance Streak */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Current Streak
            </span>
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-slate-900 tracking-tight flex items-center">
            <span>5 Days</span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Consistent on-time campus attendance
          </p>
        </div>
      </div>

      {/* Biometric Status Banner */}
      <div className="bg-linear-to-r from-indigo-900 via-indigo-850 to-slate-900 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-indigo-300 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold text-white">
                Biometric Facial Template Registered
              </h3>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                Active 98.4% Confidence
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-2xl">
              Your facial recognition feature hash is linked to Student ID{" "}
              <span className="font-mono text-white font-semibold">
                {currentUser.studentId || "CS-2024-042"}
              </span>
              . You can scan at classroom smart pads, campus gate kiosks, or right here via camera.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            id="test-face-verification-btn"
            onClick={() => {
              setModalMode("self_mark");
              setModalOpen(true);
            }}
            className="px-4 py-2 bg-white text-indigo-900 hover:bg-indigo-50 text-xs font-bold rounded-xl transition-all shadow-xs flex items-center space-x-1.5"
          >
            <ScanFace className="w-4 h-4 text-indigo-600" />
            <span>Launch Face Scanner</span>
          </button>
        </div>
      </div>

      {/* Attendance History Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Controls */}
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-50/50">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Attendance Log & Biometric Audit Trail
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Showing verified timestamps and recognition confidence ratings
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="search-attendance-input"
                type="text"
                placeholder="Search date or session..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 w-48 sm:w-56"
              />
            </div>

            {/* Status Filter */}
            <select
              id="filter-attendance-status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Statuses</option>
              <option value="Present">Present</option>
              <option value="Late">Late</option>
              <option value="Absent">Absent</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
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
              No attendance records found
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Mark your attendance today using the face recognition camera button above.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-5">Date</th>
                  <th className="py-3.5 px-5">Check-In Time</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5">Verification Method</th>
                  <th className="py-3.5 px-5">Confidence</th>
                  <th className="py-3.5 px-5">Session / Checkpoint</th>
                  <th className="py-3.5 px-5">Audit Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {filteredRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/75 transition-colors">
                    <td className="py-3.5 px-5 font-semibold text-slate-900 whitespace-nowrap">
                      {rec.date}
                    </td>
                    <td className="py-3.5 px-5 whitespace-nowrap font-mono text-slate-600">
                      {rec.time}
                    </td>
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          rec.status === "Present"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : rec.status === "Late"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
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
                      <span className="inline-flex items-center text-indigo-700 font-medium bg-indigo-50/70 px-2 py-0.5 rounded border border-indigo-100">
                        <ScanFace className="w-3.5 h-3.5 mr-1 text-indigo-600" />
                        {rec.verificationMethod}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <span className="font-mono text-emerald-600 font-semibold">
                        {rec.confidenceScore}%
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-slate-600 max-w-xs truncate">
                      {rec.session}
                    </td>
                    <td className="py-3.5 px-5 text-slate-500 text-[11px]">
                      {rec.notes || "Auto-recorded via biometric checkpoint"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Face Scanner Modal */}
      <FaceRecognitionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        currentUser={currentUser}
        mode={modalMode}
        onAttendanceRecorded={handleAttendanceRecorded}
        onFaceEnrolled={handleFaceEnrolled}
      />
    </div>
  );
};
