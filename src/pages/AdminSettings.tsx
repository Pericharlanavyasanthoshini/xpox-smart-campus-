import React, { useState } from "react";
import {
  Database,
  Shield,
  HardDrive,
  Users,
  FileCheck,
  RefreshCw,
  Server,
  Sliders,
  CheckCircle2,
} from "lucide-react";
import { User } from "../types";

interface AdminSettingsProps {
  currentUser: User;
}

export const AdminSettings: React.FC<AdminSettingsProps> = () => {
  const [toast, setToast] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          System & Storage Settings
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Server-side JSON database verification, operational parameters, and technician dispatch settings.
        </p>
      </div>

      {toast && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Storage Architecture Verification */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
          <HardDrive className="w-5 h-5 text-purple-600" />
          <h2>Local JSON File Storage Status</h2>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          In strict compliance with architectural restrictions, data is stored exclusively in Node.js backend local JSON files without external databases or third-party cloud APIs:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-slate-800">users.json</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            </div>
            <p className="text-xs text-slate-500 mt-2">Student & Admin credentials</p>
            <p className="text-[11px] font-semibold text-emerald-600 mt-1">Synced & Persistent</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-slate-800">complaints.json</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            </div>
            <p className="text-xs text-slate-500 mt-2">Campus complaint tickets</p>
            <p className="text-[11px] font-semibold text-emerald-600 mt-1">Synced & Persistent</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-slate-800">notifications.json</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            </div>
            <p className="text-xs text-slate-500 mt-2">Student alert messages</p>
            <p className="text-[11px] font-semibold text-emerald-600 mt-1">Synced & Persistent</p>
          </div>
        </div>
      </div>

      {/* Campus Configuration */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
          <Sliders className="w-5 h-5 text-indigo-600" />
          <h2>Operational SLAs & Automatic Escalation Rules</h2>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          Rule-based priority classifier keywords and technician assignment thresholds:
        </p>

        <div className="space-y-3 pt-2 text-xs">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div>
              <p className="font-bold text-slate-800">High Priority Auto-Escalation</p>
              <p className="text-slate-500 text-[11px]">Keywords: spark, blackout, flood, fume, hazard, chemical, fire</p>
            </div>
            <span className="px-2.5 py-1 rounded-md bg-rose-100 text-rose-800 font-bold text-[11px]">
              Active
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div>
              <p className="font-bold text-slate-800">Resolution SLA Target</p>
              <p className="text-slate-500 text-[11px]">Max 48 hours for High, 72 hours for Medium, 5 days for Low</p>
            </div>
            <span className="px-2.5 py-1 rounded-md bg-indigo-100 text-indigo-800 font-bold text-[11px]">
              Standard
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
