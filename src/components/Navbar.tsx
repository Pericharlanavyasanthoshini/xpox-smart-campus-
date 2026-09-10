import React, { useState } from "react";
import {
  Bell,
  Search,
  Menu,
  X,
  LogOut,
  User as UserIcon,
  Shield,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import { User, AppNotification } from "../types";

interface NavbarProps {
  currentUser: User | null;
  currentRoute: string;
  navigate: (route: string) => void;
  onLogout: () => void;
  notifications: AppNotification[];
  onOpenQuickDemo?: (role: "student" | "admin") => void;
  onToggleSidebar?: () => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  currentRoute,
  navigate,
  onLogout,
  notifications,
  onOpenQuickDemo,
  onToggleSidebar,
  searchQuery,
  onSearchChange,
}) => {
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
      {/* Left: Mobile toggle + Brand or Search */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        {currentUser && (
          <button
            id="btn-sidebar-toggle"
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            title="Toggle Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Brand logo for non-dashboard or mobile */}
        <div
          onClick={() => navigate(currentUser?.role === "admin" ? "/admin/dashboard" : currentUser?.role === "student" ? "/student/dashboard" : "/")}
          className="flex items-center gap-2 cursor-pointer select-none"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white font-black text-base shadow-sm">
            SC
          </div>
          <div className="hidden sm:block">
            <span className="font-extrabold text-slate-900 tracking-tight text-base block leading-tight">
              SMART CAMPUS
            </span>
            <span className="text-[10px] font-semibold text-indigo-600 tracking-wider uppercase block">
              Complaint & Attendance System
            </span>
          </div>
        </div>

        {/* Global Search input if logged in */}
        {currentUser && onSearchChange !== undefined && (
          <div className="relative hidden md:block w-full max-w-xs ml-4">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="navbar-search-input"
              type="text"
              placeholder="Search complaints, IDs, blocks..."
              value={searchQuery || ""}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
            />
          </div>
        )}
      </div>

      {/* Right Action Bar */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Demo Switcher helper */}
        {onOpenQuickDemo && (
          <div className="hidden lg:flex items-center gap-1.5 px-2 py-1 rounded-lg bg-indigo-50 border border-indigo-100 text-xs font-semibold text-indigo-700">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
            <span className="text-[11px] text-indigo-600">Switch Demo:</span>
            <button
              id="btn-quick-switch-student"
              onClick={() => onOpenQuickDemo("student")}
              className={`px-2 py-0.5 rounded text-[11px] transition-all ${
                currentUser?.role === "student"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "hover:bg-indigo-100 text-indigo-700"
              }`}
            >
              Student
            </button>
            <button
              id="btn-quick-switch-admin"
              onClick={() => onOpenQuickDemo("admin")}
              className={`px-2 py-0.5 rounded text-[11px] transition-all ${
                currentUser?.role === "admin"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "hover:bg-indigo-100 text-indigo-700"
              }`}
            >
              Admin
            </button>
          </div>
        )}

        {currentUser ? (
          <>
            {/* Notification Bell */}
            <div className="relative">
              <button
                id="btn-navbar-notifications"
                onClick={() => {
                  if (currentUser.role === "admin") {
                    navigate("/admin/notifications");
                  } else {
                    navigate("/student/notifications");
                  }
                }}
                className="relative p-2 rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white animate-pulse">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
            </div>

            {/* User Profile Capsule */}
            <div
              onClick={() => {
                if (currentUser.role === "student") {
                  navigate("/student/profile");
                } else {
                  navigate("/admin/settings");
                }
              }}
              className="flex items-center gap-2.5 pl-2 pr-3 py-1 rounded-xl hover:bg-slate-100 cursor-pointer border border-slate-200/70 transition-all select-none"
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs ${
                  currentUser.role === "admin"
                    ? "bg-gradient-to-tr from-purple-600 to-indigo-600"
                    : "bg-gradient-to-tr from-blue-600 to-teal-500"
                }`}
              >
                {currentUser.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-slate-800 leading-tight">
                  {currentUser.name}
                </p>
                <p className="text-[10px] font-medium text-slate-500 flex items-center gap-1">
                  {currentUser.role === "admin" ? (
                    <>
                      <Shield className="w-3 h-3 text-purple-600" />
                      Administrator
                    </>
                  ) : (
                    <>
                      <GraduationCap className="w-3 h-3 text-blue-600" />
                      {currentUser.studentId || "Student"}
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Logout button */}
            <button
              id="btn-navbar-logout"
              onClick={onLogout}
              className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4.5 h-4.5" />
            </button>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <button
              id="btn-nav-login"
              onClick={() => navigate("/login")}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-all"
            >
              Login
            </button>
            <button
              id="btn-nav-register"
              onClick={() => navigate("/register")}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-all"
            >
              Register
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
