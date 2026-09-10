import React, { useState } from "react";
import {
  User as UserIcon,
  Mail,
  Phone,
  BookOpen,
  Calendar,
  Save,
  CheckCircle2,
  AlertCircle,
  Edit2,
  GraduationCap,
  Shield,
} from "lucide-react";
import { User } from "../types";
import { api } from "../services/api";

interface ProfileProps {
  currentUser: User;
  onUserUpdated: (user: User) => void;
}

export const Profile: React.FC<ProfileProps> = ({ currentUser, onUserUpdated }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: currentUser.name || "",
    phone: currentUser.phone || "",
    department: currentUser.department || "",
    year: currentUser.year || "2nd Year",
    email: currentUser.email || "",
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const departments = [
    "Computer Science & Engineering",
    "Artificial Intelligence & Data Science",
    "Information Technology",
    "Electrical & Electronics Engineering",
    "Electronics & Communication",
    "Mechanical Engineering",
    "Civil Engineering",
    "Biotechnology",
    "Chemical Engineering",
    "Campus Operations & Administration",
  ];

  const years = ["1st Year", "2nd Year", "3rd Year", "4th Year", "Post-Graduate"];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await api.updateUser(currentUser.id, formData);
      onUserUpdated(res.user);
      setSuccess("Profile updated and persisted successfully!");
      setIsEditing(false);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          User Profile
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your personal details, campus contacts, and academic department records.
        </p>
      </div>

      {success && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Avatar Placeholder */}
            <div className="w-18 h-18 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white font-black text-2xl flex items-center justify-center shadow-md">
              {currentUser.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900">{currentUser.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center gap-1">
                  {currentUser.role === "admin" ? (
                    <>
                      <Shield className="w-3 h-3" /> Campus Administrator
                    </>
                  ) : (
                    <>
                      <GraduationCap className="w-3 h-3" /> Student
                    </>
                  )}
                </span>
                {currentUser.studentId && (
                  <span className="font-mono text-xs font-semibold text-slate-500">
                    {currentUser.studentId}
                  </span>
                )}
              </div>
            </div>
          </div>

          {!isEditing && (
            <button
              id="btn-edit-profile-toggle"
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
              Edit Profile
            </button>
          )}
        </div>

        {isEditing ? (
          /* Edit Form */
          <form onSubmit={handleSave} className="space-y-4 pt-4 border-t border-slate-100">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Department
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              {currentUser.role === "student" && (
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Academic Year
                  </label>
                  <select
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    {years.map((yr) => (
                      <option key={yr} value={yr}>
                        {yr}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                id="btn-save-profile"
                type="submit"
                disabled={saving}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        ) : (
          /* Read-Only View */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Email Address
              </p>
              <p className="mt-1 font-semibold text-slate-800 flex items-center gap-2">
                <Mail className="w-4 h-4 text-indigo-500" />
                {currentUser.email}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Phone Number
              </p>
              <p className="mt-1 font-semibold text-slate-800 flex items-center gap-2">
                <Phone className="w-4 h-4 text-indigo-500" />
                {currentUser.phone || "Not provided"}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Department
              </p>
              <p className="mt-1 font-semibold text-slate-800 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-500" />
                {currentUser.department || "General Engineering"}
              </p>
            </div>

            {currentUser.role === "student" && (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Academic Year
                </p>
                <p className="mt-1 font-semibold text-slate-800 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-500" />
                  {currentUser.year || "2nd Year"}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
