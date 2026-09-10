import React, { useState, useEffect } from "react";
import { Bell, CheckCheck, RefreshCw, Sparkles, Inbox } from "lucide-react";
import { User, AppNotification } from "../types";
import { api } from "../services/api";
import { NotificationItem } from "../components/NotificationItem";

interface NotificationsPageProps {
  currentUser: User;
  onOpenComplaint: (id: string) => void;
  onNotificationsUpdated?: () => void;
}

export const Notifications: React.FC<NotificationsPageProps> = ({
  currentUser,
  onOpenComplaint,
  onNotificationsUpdated,
}) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getNotifications(currentUser.id);
      setNotifications(data);
    } catch (err: any) {
      setError(err.message || "Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, [currentUser.id]);

  const handleMarkRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      if (onNotificationsUpdated) onNotificationsUpdated();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead(currentUser.id);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      if (onNotificationsUpdated) onNotificationsUpdated();
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Notifications
            </h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700">
                {unreadCount} new
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Stay updated on ticket review statuses, inspection scheduling, and facility remarks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              id="btn-mark-all-read"
              onClick={handleMarkAllRead}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-xs transition-colors"
            >
              <CheckCheck className="w-4 h-4 text-indigo-600" />
              Mark all as read
            </button>
          )}

          <button
            id="btn-refresh-notifs"
            onClick={fetchNotifs}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
            title="Refresh notifications"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-rose-200 text-rose-600 text-xs">
          {error}
        </div>
      ) : notifications.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Inbox className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">You're all caught up!</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            There are no new notifications. You'll receive updates as administrators inspect and update your tickets.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <NotificationItem
              key={n.id}
              notification={n}
              onMarkRead={handleMarkRead}
              onOpenComplaint={onOpenComplaint}
            />
          ))}
        </div>
      )}
    </div>
  );
};
