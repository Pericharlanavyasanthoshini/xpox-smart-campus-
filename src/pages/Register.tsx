import React, { useState } from "react";
import { User as UserIcon, Mail, Lock, Phone, BookOpen, Calendar, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { User } from "../types";
import { api } from "../services/api";

interface RegisterProps {
  navigate: (route: string) => void;
  onRegisterSuccess: (user: User) => void;
}

export const Register: React.FC<RegisterProps> = ({ navigate, onRegisterSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    studentId: "",
    email: "",
    phone: "",
    department: "Computer Science & Engineering",
    year: "2nd Year",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
  ];

  const years = ["1st Year", "2nd Year", "3rd Year", "4th Year", "Post-Graduate"];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) return setError("Full Name is required.");
    if (!formData.studentId.trim()) return setError("Student ID is required.");
    if (!formData.email.trim()) return setError("Email address is required.");
    if (!formData.phone.trim()) return setError("Phone number is required.");
    if (formData.password.length < 6) return setError("Password must be at least 6 characters long.");
    if (formData.password !== formData.confirmPassword) return setError("Passwords do not match.");

    setLoading(true);
    setError(null);

    try {
      const res = await api.register({
        name: formData.name,
        studentId: formData.studentId,
        email: formData.email,
        phone: formData.phone,
        department: formData.department,
        year: formData.year,
        password: formData.password,
      });

      setSuccess("Account created successfully! Redirecting...");
      setTimeout(() => {
        onRegisterSuccess(res.user);
      }, 1000);
    } catch (err: any) {
      setError(err.message || "Registration failed. Please check your details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-lg w-full space-y-6 bg-white p-8 rounded-2xl border border-slate-200 shadow-lg">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-extrabold text-xl shadow-md">
            SC
          </div>
          <h2 className="mt-4 text-2xl font-black text-slate-900 tracking-tight">
            Student Registration
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Create your SMART CAMPUS student account to report and track issues
          </p>
        </div>

        {error && (
          <div
            id="register-error-alert"
            className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div
            id="register-success-alert"
            className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2.5"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Name *
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="reg-name"
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Alex Morgan"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-9.5 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Student ID */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Student ID *
              </label>
              <input
                id="reg-studentid"
                type="text"
                name="studentId"
                required
                placeholder="e.g. CS-2024-088"
                value={formData.studentId}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Campus Email *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="reg-email"
                  type="email"
                  name="email"
                  required
                  placeholder="alex.m@campus.edu"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-9.5 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Phone Number *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="reg-phone"
                  type="tel"
                  name="phone"
                  required
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full pl-9.5 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Department */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Department
              </label>
              <div className="relative">
                <BookOpen className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  id="reg-department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full pl-9.5 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Year */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Academic Year
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  id="reg-year"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className="w-full pl-9.5 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  {years.map((yr) => (
                    <option key={yr} value={yr}>
                      {yr}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="reg-password"
                  type="password"
                  name="password"
                  required
                  placeholder="Min. 6 chars"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-9.5 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="reg-confirm-password"
                  type="password"
                  name="confirmPassword"
                  required
                  placeholder="Re-type password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-9.5 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          <button
            id="btn-register-submit"
            type="submit"
            disabled={loading}
            className={`w-full mt-2 py-3 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 ${
              loading ? "opacity-75 cursor-not-allowed" : "hover:-translate-y-0.5"
            }`}
          >
            {loading ? "Creating Account..." : "Complete Student Registration"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            Already registered?{" "}
            <button
              id="link-go-to-login"
              type="button"
              onClick={() => navigate("/login")}
              className="font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
