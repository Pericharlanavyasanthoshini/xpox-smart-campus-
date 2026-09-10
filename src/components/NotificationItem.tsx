import React from "react";
import { CheckCircle2, Clock, MessageSquare, AlertCircle, Info, ExternalLink } from "lucide-react";
import { AppNotification } from "../types";

interface NotificationItemProps {
  notification: AppNotification;
  onMarkRead: (id: string) => void;
  onOpenComplaint?: (complaintId: string) => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkRead,
  onOpenComplaint,
}) => {
  const getIcon = () => {
    switch (notification.type) {
      case "resolved":
        return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      case "status_change":
        return <Clock className="w-5 h-5 text-indigo-600" />;
      case "remark":
        return <MessageSquare className="w-5 h-5 text-amber-600" />;
      case "submission":
        return <Info className="w-5 h-5 text-blue-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-slate-600" />;
    }
  };

  const getBg = () => {
    if (!notification.read) {
      return "bg-indigo-50/40 border-indigo-100";
    }
    return "bg-white border-slate-200/80";
  };

  const formattedTime = new Date(notification.createdAt).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div
      id={`notification-item-${notification.id}`}
      className={`p-4 rounded-xl border ${getBg()} transition-all duration-150 flex items-start gap-3.5 shadow-xs`}
    >
      <div className="p-2 rounded-lg bg-white border border-slate-100 shadow-xs shrink-0 mt-0.5">
        {getIcon()}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-slate-900 truncate">
              {notification.title}
            </h4>
            {!notification.read && (
              <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" title="Unread" />
            )}
          </div>
          <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap">
            {formattedTime}
          </span>
        </div>

        <p className="mt-1 text-xs text-slate-600 leading-relaxed">
          {notification.message}
        </p>

        <div className="mt-2.5 flex items-center gap-3">
          {notification.complaintId && onOpenComplaint && (
            <button
              id={`btn-notif-view-${notification.id}`}
              onClick={() => onOpenComplaint(notification.complaintId!)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              View Complaint ({notification.complaintId})
            </button>
          )}

          {!notification.read && (
            <button
              id={`btn-notif-mark-${notification.id}`}
              onClick={() => onMarkRead(notification.id)}
              className="text-xs text-slate-500 hover:text-slate-800 font-medium transition-colors ml-auto"
            >
              Mark as read
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
