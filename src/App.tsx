import React, { useState, useEffect } from "react";
import { User, AppNotification } from "./types";
import { api } from "./services/api";

// Components
import { Navbar } from "./components/Navbar";
import { Sidebar } from "./components/Sidebar";

// Pages
import { Landing } from "./pages/Landing";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { StudentDashboard } from "./pages/StudentDashboard";
import { ReportComplaint } from "./pages/ReportComplaint";
import { MyComplaints } from "./pages/MyComplaints";
import { ComplaintDetails } from "./pages/ComplaintDetails";
import { Notifications } from "./pages/Notifications";
import { Profile } from "./pages/Profile";
import { StudentAttendance } from "./pages/StudentAttendance";

import { AdminDashboard } from "./pages/AdminDashboard";
import { AdminComplaints } from "./pages/AdminComplaints";
import { AdminStudents } from "./pages/AdminStudents";
import { Analytics } from "./pages/Analytics";
import { AdminSettings } from "./pages/AdminSettings";
import { AdminAttendance } from "./pages/AdminAttendance";

export default function App() {
  // Current logged in user
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem("smart_campus_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Current Route
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    const path = window.location.pathname;
    return path && path !== "/" ? path : "/";
  });

  // Selected complaint for details view
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);

  // Notifications
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Mobile sidebar open state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Global search
  const [searchQuery, setSearchQuery] = useState("");

  // Sync route with browser history
  const navigate = (path: string) => {
    setSelectedComplaintId(null);
    setCurrentRoute(path);
    window.history.pushState({}, "", path);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(window.location.pathname || "/");
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Sync user changes to localStorage
  const handleSetUser = (user: User | null) => {
    setCurrentUser(user);
    if (user) {
      localStorage.setItem("smart_campus_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("smart_campus_user");
    }
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!currentUser) {
      setNotifications([]);
      return;
    }
    try {
      const data = await api.getNotifications(currentUser.id);
      setNotifications(data);
    } catch (err) {
      console.error("Failed to load notifications", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 12000);
    return () => clearInterval(interval);
  }, [currentUser?.id]);

  // Auth Handlers
  const handleLoginSuccess = (user: User) => {
    handleSetUser(user);
    if (user.role === "admin") {
      navigate("/admin/dashboard");
    } else {
      navigate("/student/dashboard");
    }
  };

  const handleLogout = () => {
    handleSetUser(null);
    setSelectedComplaintId(null);
    navigate("/");
  };

  // Quick Demo Autofill Switcher
  const handleOpenQuickDemo = async (role: "student" | "admin") => {
    try {
      const email = role === "admin" ? "admin@smartcampus.com" : "student@example.com";
      const password = role === "admin" ? "admin123" : "student123";
      const res = await api.login({ email, password });
      handleLoginSuccess(res.user);
    } catch (err) {
      console.error(err);
      navigate("/login");
    }
  };

  // Route guarding
  useEffect(() => {
    if (!currentUser) {
      if (
        currentRoute.startsWith("/student") ||
        currentRoute.startsWith("/admin")
      ) {
        navigate("/login");
      }
    } else if (currentUser.role === "student" && currentRoute.startsWith("/admin")) {
      navigate("/student/dashboard");
    } else if (currentUser.role === "admin" && currentRoute.startsWith("/student")) {
      navigate("/admin/dashboard");
    }
  }, [currentUser, currentRoute]);

  // Handle open complaint details
  const handleOpenComplaint = (id: string) => {
    setSelectedComplaintId(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle back from complaint details
  const handleBackFromComplaint = () => {
    setSelectedComplaintId(null);
  };

  // Render main content based on route & selected complaint
  const renderContent = () => {
    // If a complaint detail is selected
    if (selectedComplaintId && currentUser) {
      return (
        <ComplaintDetails
          complaintId={selectedComplaintId}
          currentUser={currentUser}
          onBack={handleBackFromComplaint}
          onComplaintUpdated={fetchNotifications}
        />
      );
    }

    // Public / Auth routes
    if (currentRoute === "/" && !currentUser) {
      return (
        <Landing
          navigate={navigate}
          onOpenQuickDemo={handleOpenQuickDemo}
        />
      );
    }

    if (currentRoute === "/login") {
      return (
        <Login
          navigate={navigate}
          onLoginSuccess={handleLoginSuccess}
        />
      );
    }

    if (currentRoute === "/register") {
      return (
        <Register
          navigate={navigate}
          onRegisterSuccess={handleLoginSuccess}
        />
      );
    }

    // Student Routes
    if (currentUser?.role === "student") {
      switch (currentRoute) {
        case "/student/dashboard":
          return (
            <StudentDashboard
              currentUser={currentUser}
              navigate={navigate}
              onOpenComplaint={handleOpenComplaint}
            />
          );
        case "/student/attendance":
          return (
            <StudentAttendance
              currentUser={currentUser}
              onOpenComplaint={handleOpenComplaint}
            />
          );
        case "/student/report":
          return (
            <ReportComplaint
              currentUser={currentUser}
              navigate={navigate}
              onComplaintCreated={handleOpenComplaint}
            />
          );
        case "/student/complaints":
          return (
            <MyComplaints
              currentUser={currentUser}
              navigate={navigate}
              onOpenComplaint={handleOpenComplaint}
            />
          );
        case "/student/notifications":
          return (
            <Notifications
              currentUser={currentUser}
              onOpenComplaint={handleOpenComplaint}
              onNotificationsUpdated={fetchNotifications}
            />
          );
        case "/student/profile":
          return (
            <Profile
              currentUser={currentUser}
              onUserUpdated={handleSetUser}
            />
          );
        default:
          return (
            <StudentDashboard
              currentUser={currentUser}
              navigate={navigate}
              onOpenComplaint={handleOpenComplaint}
            />
          );
      }
    }

    // Admin Routes
    if (currentUser?.role === "admin") {
      switch (currentRoute) {
        case "/admin/dashboard":
          return (
            <AdminDashboard
              currentUser={currentUser}
              navigate={navigate}
              onOpenComplaint={handleOpenComplaint}
            />
          );
        case "/admin/attendance":
          return <AdminAttendance />;
        case "/admin/complaints":
          return (
            <AdminComplaints
              onOpenComplaint={handleOpenComplaint}
            />
          );
        case "/admin/students":
          return (
            <AdminStudents
              navigate={navigate}
            />
          );
        case "/admin/analytics":
          return <Analytics />;
        case "/admin/notifications":
          return (
            <Notifications
              currentUser={currentUser}
              onOpenComplaint={handleOpenComplaint}
              onNotificationsUpdated={fetchNotifications}
            />
          );
        case "/admin/settings":
          return <AdminSettings currentUser={currentUser} />;
        default:
          return (
            <AdminDashboard
              currentUser={currentUser}
              navigate={navigate}
              onOpenComplaint={handleOpenComplaint}
            />
          );
      }
    }

    // Fallback
    return (
      <Landing
        navigate={navigate}
        onOpenQuickDemo={handleOpenQuickDemo}
      />
    );
  };

  const isFullWidthPage = !currentUser || currentRoute === "/" || currentRoute === "/login" || currentRoute === "/register";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col antialiased selection:bg-indigo-500 selection:text-white font-sans">
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        currentRoute={currentRoute}
        navigate={navigate}
        onLogout={handleLogout}
        notifications={notifications}
        onOpenQuickDemo={handleOpenQuickDemo}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Layout */}
      <div className="flex-1 flex w-full">
        {/* Sidebar for authenticated user */}
        {currentUser && !isFullWidthPage && (
          <Sidebar
            currentUser={currentUser}
            currentRoute={currentRoute}
            navigate={navigate}
            onLogout={handleLogout}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            notifications={notifications}
          />
        )}

        {/* Content Area */}
        <main
          className={`flex-1 transition-all duration-200 ${
            isFullWidthPage
              ? "w-full"
              : "p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full"
          }`}
        >
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
