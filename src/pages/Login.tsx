import React, { useState } from "react";
import { Lock, Mail, ArrowRight, ShieldCheck, GraduationCap, AlertCircle } from "lucide-react";
import { User } from "../types";
import { api } from "../services/api";

interface LoginProps {
  navigate: (route: string) => void;
  onLoginSuccess: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ navigate, onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState<"student" | "admin">("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const setDemoCredentials = (role: "student" | "admin") => {
    setActiveTab(role);
    if (role === "admin") {
      setEmail("admin@smartcampus.com");
      setPassword("admin123");
    } else {
      setEmail("student@example.com");
      setPassword("student123");
    }
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.login({ email: email.trim(), password });
      onLoginSuccess(res.user);
    } catch (err: any) {
      setError(err.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl border border-slate-200 shadow-lg">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-extrabold text-xl shadow-md">
            SC
          </div>
          <h2 className="mt-4 text-2xl font-black text-slate-900 tracking-tight">
            Sign in to SMART CAMPUS
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            College Complaint Management & Tracking System
          </p>
        </div>

        {/* Role Tabs */}
        <div className="flex p-1 bg-slate-100 rounded-xl">
          <button
            id="tab-login-student"
            type="button"
            onClick={() => {
              setActiveTab("student");
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${
              activeTab === "student"
                ? "bg-white text-indigo-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            Student Login
          </button>

          <button
            id="tab-login-admin"
            type="button"
            onClick={() => {
              setActiveTab("admin");
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${
              activeTab === "admin"
                ? "bg-white text-purple-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Admin Login
          </button>
        </div>

        {/* Quick Demo Autofill Banner */}
        <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl flex items-center justify-between text-xs">
          <span className="text-slate-600 font-medium">Use demo credentials:</span>
          <button
            type="button"
            id="btn-autofill-creds"
            onClick={() => setDemoCredentials(activeTab)}
            className="font-bold text-indigo-600 hover:text-indigo-800 underline transition-colors"
          >
            Fill {activeTab === "admin" ? "Admin" : "Student"} Credentials
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            id="login-error-alert"
            className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5 animate-shake"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="login-email-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={activeTab === "admin" ? "admin@smartcampus.com" : "student@example.com"}
                className="w-full pl-9.5 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="login-password-input"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9.5 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          <button
            id="btn-login-submit"
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl font-bold text-xs text-white shadow-md transition-all flex items-center justify-center gap-2 ${
              activeTab === "admin"
                ? "bg-purple-600 hover:bg-purple-700 shadow-purple-600/20"
                : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20"
            } ${loading ? "opacity-75 cursor-not-allowed" : "hover:-translate-y-0.5"}`}
          >
            {loading ? "Authenticating..." : `Sign in as ${activeTab === "admin" ? "Administrator" : "Student"}`}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer */}
        <div className="text-center pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            Don't have a student account?{" "}
            <button
              id="link-go-to-register"
              type="button"
              onClick={() => navigate("/register")}
              className="font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              Register here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
