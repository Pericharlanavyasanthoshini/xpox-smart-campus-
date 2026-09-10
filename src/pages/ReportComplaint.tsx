import React, { useState } from "react";
import {
  Send,
  Sparkles,
  UploadCloud,
  FileImage,
  X,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Info,
} from "lucide-react";
import { User, ComplaintCategory, ComplaintLocation, ComplaintPriority } from "../types";
import { api } from "../services/api";

interface ReportComplaintProps {
  currentUser: User;
  navigate: (route: string) => void;
  onComplaintCreated: (complaintId: string) => void;
}

export const ReportComplaint: React.FC<ReportComplaintProps> = ({
  currentUser,
  navigate,
  onComplaintCreated,
}) => {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<ComplaintCategory>("Electricity");
  const [location, setLocation] = useState<ComplaintLocation>("Block A");
  const [priority, setPriority] = useState<ComplaintPriority>("Medium");
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const categories: ComplaintCategory[] = [
    "Electricity",
    "Water",
    "Wi-Fi",
    "Classroom",
    "Laboratory",
    "Hostel",
    "Cleanliness",
    "Furniture",
    "Canteen",
    "Other",
  ];

  const locations: ComplaintLocation[] = [
    "Block A",
    "Block B",
    "Block C",
    "Hostel",
    "Library",
    "Laboratory",
    "Canteen",
    "Playground",
    "Parking",
    "Other",
  ];

  // Rule-based priority suggestion preview
  const getSuggestedPriority = (): "High" | "Medium" | "Low" => {
    const text = `${title} ${description}`.toLowerCase();
    if (
      (category === "Electricity" && (text.includes("shock") || text.includes("spark") || text.includes("fire") || text.includes("blackout"))) ||
      (category === "Water" && (text.includes("flood") || text.includes("outage") || text.includes("burst"))) ||
      (category === "Laboratory" && (text.includes("fume") || text.includes("chemical") || text.includes("hazard"))) ||
      text.includes("emergency") || text.includes("hazard") || text.includes("danger")
    ) {
      return "High";
    }
    if (["Classroom", "Laboratory", "Wi-Fi"].includes(category) || text.includes("broken") || text.includes("leak")) {
      return "Medium";
    }
    return "Low";
  };

  const suggested = getSuggestedPriority();

  const handleApplySuggested = () => {
    setPriority(suggested);
  };

  const handleMockFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file.name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError("Please provide a complaint title.");
      return;
    }
    if (!description.trim()) {
      setError("Please provide a detailed description of the problem.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.createComplaint({
        title: title.trim(),
        category,
        location,
        priority,
        description: description.trim(),
        studentId: currentUser.id,
        studentName: currentUser.name,
        studentEmail: currentUser.email,
        department: currentUser.department || "General",
      });

      setSubmittedId(res.complaint.id);
    } catch (err: any) {
      setError(err.message || "Failed to submit complaint. Please check connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetForm = () => {
    setTitle("");
    setDescription("");
    setSelectedFile(null);
    setSubmittedId(null);
    setError(null);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Page Title */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Report a Campus Problem
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Submit details about maintenance, equipment, or utility issues on campus. Tickets are assigned to facility officers.
        </p>
      </div>

      {/* Success View */}
      {submittedId ? (
        <div
          id="complaint-success-card"
          className="bg-white p-8 rounded-2xl border border-emerald-200 shadow-md text-center space-y-5 animate-in zoom-in-95 duration-200"
        >
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Complaint submitted successfully!
            </span>
            <h2 className="text-2xl font-black text-slate-900 mt-3">
              Ticket Generated:{" "}
              <span className="text-indigo-600 font-mono tracking-tight">
                {submittedId}
              </span>
            </h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-2 leading-relaxed">
              Your issue has been logged into the campus operations ledger and queued for technical inspection. You will receive real-time notifications on status changes.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              id="btn-view-submitted-complaint"
              onClick={() => onComplaintCreated(submittedId)}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2"
            >
              View Complaint Details
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              id="btn-report-another"
              onClick={handleResetForm}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all"
            >
              Submit Another Problem
            </button>
            <button
              id="btn-back-to-my-complaints"
              onClick={() => navigate("/student/complaints")}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs transition-all"
            >
              My Complaints List
            </button>
          </div>
        </div>
      ) : (
        /* Form View */
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6"
        >
          {error && (
            <div
              id="report-error-alert"
              className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Complaint Title *
            </label>
            <input
              id="input-complaint-title"
              type="text"
              required
              placeholder="e.g. Classroom 304 ceiling fan not working"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium placeholder:text-slate-400"
            />
          </div>

          {/* Category & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Category *
              </label>
              <select
                id="select-complaint-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as ComplaintCategory)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Location *
              </label>
              <select
                id="select-complaint-location"
                value={location}
                onChange={(e) => setLocation(e.target.value as ComplaintLocation)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
              >
                {locations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Priority Selection + Rule-based helper */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-800">
                Priority Level *
              </label>
              {suggested !== priority && (
                <button
                  type="button"
                  id="btn-apply-suggested-priority"
                  onClick={handleApplySuggested}
                  className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
                >
                  <Sparkles className="w-3 h-3 text-indigo-500" />
                  Rule-based suggestion: Set to {suggested}
                </button>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              {(["Low", "Medium", "High"] as ComplaintPriority[]).map((p) => {
                const isSelected = priority === p;
                const colors = {
                  Low: isSelected ? "border-emerald-500 bg-emerald-50/70 text-emerald-800" : "hover:border-emerald-200",
                  Medium: isSelected ? "border-amber-500 bg-amber-50/70 text-amber-800" : "hover:border-amber-200",
                  High: isSelected ? "border-rose-500 bg-rose-50/70 text-rose-800" : "hover:border-rose-200",
                }[p];

                return (
                  <button
                    type="button"
                    key={p}
                    id={`btn-priority-${p.toLowerCase()}`}
                    onClick={() => setPriority(p)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      isSelected ? `${colors} ring-2 ring-indigo-500/20 shadow-xs` : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span>{p} Priority</span>
                  </button>
                );
              })}
            </div>
            <p className="mt-1.5 text-[11px] text-slate-500 flex items-center gap-1">
              <Info className="w-3 h-3 text-slate-400" />
              High: Electrical hazards, water leaks, severe outages. Medium: Equipment failure. Low: Routine maintenance.
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Detailed Description *
            </label>
            <textarea
              id="textarea-complaint-description"
              required
              rows={4}
              placeholder="Describe the issue in detail, including specific room numbers, when it started, and any safety hazards..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-normal placeholder:text-slate-400"
            />
          </div>

          {/* Visual Image / File Attachment UI */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Photo or Document Attachment (Optional)
            </label>
            <div className="border-2 border-dashed border-slate-200 hover:border-indigo-300 rounded-2xl p-4 text-center bg-slate-50/50 transition-colors relative">
              <input
                id="file-attachment-input"
                type="file"
                accept="image/*,.pdf"
                onChange={handleMockFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <UploadCloud className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700">
                Click or drag an image/receipt here to attach
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Supports PNG, JPG, or PDF (Stored locally in complaint record)
              </p>
            </div>

            {selectedFile && (
              <div className="mt-2 flex items-center justify-between p-2 rounded-lg bg-indigo-50 border border-indigo-100 text-xs text-indigo-900">
                <span className="flex items-center gap-1.5 font-medium truncate">
                  <FileImage className="w-4 h-4 text-indigo-600 shrink-0" />
                  {selectedFile}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="p-1 text-slate-400 hover:text-rose-600 rounded"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              id="btn-submit-complaint"
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 ${
                loading ? "opacity-75 cursor-not-allowed" : "hover:-translate-y-0.5"
              }`}
            >
              <Send className="w-4 h-4" />
              {loading ? "Registering Complaint..." : "Submit Complaint"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
