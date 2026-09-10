import React from "react";
import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  Bell,
  User as UserIcon,
  Users,
  BarChart3,
  Settings,
  LogOut,
  X,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ScanFace,
} from "lucide-react";
import { User, AppNotification } from "../types";

interface SidebarProps {
  currentUser: User;
  currentRoute: string;
  navigate: (route: string) => void;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
}

interface NavLinkItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  badge?: number | null;
  highlight?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentUser,
  currentRoute,
  navigate,
  onLogout,
  isOpen,
  onClose,
  notifications,
}) => {
  const unreadNotifs = notifications.filter((n) => !n.read).length;
  const isAdmin = currentUser.role === "admin";

  const studentLinks: NavLinkItem[] = [
    {
      name: "Dashboard",
      path: "/student/dashboard",
      icon: <LayoutDashboard className="w-4.5 h-4.5" />,
    },
    {
      name: "Attendance (Face AI)",
      path: "/student/attendance",
      icon: <ScanFace className="w-4.5 h-4.5" />,
    },
    {
      name: "Report a Problem",
      path: "/student/report",
      icon: <PlusCircle className="w-4.5 h-4.5" />,
      highlight: true,
    },
    {
      name: "My Complaints",
      path: "/student/complaints",
      icon: <FileText className="w-4.5 h-4.5" />,
    },
    {
      name: "Notifications",
      path: "/student/notifications",
      icon: <Bell className="w-4.5 h-4.5" />,
      badge: unreadNotifs > 0 ? unreadNotifs : null,
    },
    {
      name: "Profile",
      path: "/student/profile",
      icon: <UserIcon className="w-4.5 h-4.5" />,
    },
  ];

  const adminLinks: NavLinkItem[] = [
    {
      name: "Dashboard",
      path: "/admin/dashboard",
      icon: <LayoutDashboard className="w-4.5 h-4.5" />,
    },
    {
      name: "Attendance (Face AI)",
      path: "/admin/attendance",
      icon: <ScanFace className="w-4.5 h-4.5" />,
    },
    {
      name: "Complaints",
      path: "/admin/complaints",
      icon: <FileText className="w-4.5 h-4.5" />,
    },
    {
      name: "Students",
      path: "/admin/students",
      icon: <Users className="w-4.5 h-4.5" />,
    },
    {
      name: "Analytics",
      path: "/admin/analytics",
      icon: <BarChart3 className="w-4.5 h-4.5" />,
    },
    {
      name: "Notifications",
      path: "/admin/notifications",
      icon: <Bell className="w-4.5 h-4.5" />,
      badge: unreadNotifs > 0 ? unreadNotifs : null,
    },
    {
      name: "Settings",
      path: "/admin/settings",
      icon: <Settings className="w-4.5 h-4.5" />,
    },
  ];

  const links = isAdmin ? adminLinks : studentLinks;

  const handleNav = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        id="app-sidebar"
        className={`fixed md:sticky top-0 left-0 z-40 h-screen w-64 bg-slate-900 text-slate-300 flex flex-col justify-between shrink-0 transition-transform duration-300 ease-in-out border-r border-slate-800 ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div>
          {/* Top Brand Header */}
          <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800/80">
            <div
              onClick={() => handleNav(isAdmin ? "/admin/dashboard" : "/student/dashboard")}
              className="flex items-center gap-2.5 cursor-pointer select-none"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-sm">
                SC
              </div>
              <div>
                <span className="font-bold text-white text-sm tracking-tight block">
                  SMART CAMPUS
                </span>
                <span className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider block">
                  {isAdmin ? "Admin Portal" : "Student Portal"}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="md:hidden text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Current Role Banner */}
          <div className="mx-4 my-4 p-3 rounded-xl bg-slate-800/70 border border-slate-700/60">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs text-white ${
                  isAdmin ? "bg-purple-600" : "bg-indigo-600"
                }`}
              >
                {isAdmin ? <ShieldCheck className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
                <p className="text-[11px] text-slate-400 truncate">
                  {isAdmin ? "Administrator" : currentUser.studentId || currentUser.department || "Student"}
                </p>
              </div>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="px-3 space-y-1">
            <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Menu
            </div>
            {links.map((link) => {
              const isActive = currentRoute === link.path || currentRoute.startsWith(`${link.path}/`);
              return (
                <button
                  key={link.path}
                  id={`nav-link-${link.name.toLowerCase().replace(/\s+/g, "-")}`}
                  onClick={() => handleNav(link.path)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30 font-bold"
                      : link.highlight
                      ? "bg-indigo-950/60 text-indigo-300 hover:bg-indigo-900/60 hover:text-white border border-indigo-800/40"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? "text-white" : "text-slate-400 group-hover:text-white"}>
                      {link.icon}
                    </span>
                    <span>{link.name}</span>
                  </div>

                  {link.badge && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white animate-pulse">
                      {link.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-800/80 space-y-2">
          <button
            id="sidebar-logout-btn"
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-950/30 hover:text-rose-300 transition-colors"
          >
            <LogOut className="w-4.5 h-4.5" />
            <span>Sign Out</span>
          </button>

          <div className="px-3 pt-2 text-[10px] text-slate-400 border-t border-slate-800 flex items-center justify-between">
            <span>SMART CAMPUS v1.0</span>
            <span className="flex items-center gap-1 text-emerald-400">
              <CheckCircle2 className="w-3 h-3" /> Online
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
