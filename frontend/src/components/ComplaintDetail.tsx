import { useState, useEffect } from "react";
import type { Complaint } from "../data/complaints";
import { categoryLabel } from "../data/complaints";
import { fetchEmployees, assignComplaint, roleLabel } from "../data/employees";
import type { Employee } from "../data/employees";

interface Props {
  complaint: Complaint;
  onClose: () => void;
  onUpdate?: () => void;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const categoryColors: Record<string, string> = {
  street_light: "bg-yellow-50 text-yellow-700 border border-yellow-200",
  water_supply: "bg-sky-50 text-sky-700 border border-sky-200",
  garbage: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  drainage: "bg-violet-50 text-violet-700 border border-violet-200",
  road: "bg-orange-50 text-orange-700 border border-orange-200",
  other: "bg-gray-100 text-gray-600 border border-gray-200",
};

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: "Pending", color: "text-amber-600 bg-amber-50 border-amber-200" },
  in_progress: { label: "In Progress", color: "text-blue-600 bg-blue-50 border-blue-200" },
  resolved: { label: "Resolved", color: "text-green-600 bg-green-50 border-green-200" },
};

export default function ComplaintDetail({ complaint: c, onClose, onUpdate }: Props) {
  const [assignedTo, setAssignedTo] = useState<string>(
    typeof c.assignedTo === "object" && c.assignedTo?._id ? c.assignedTo._id : c.assignedTo || ""
  );
  const [notes, setNotes] = useState("");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const caseId = `#VMC-2026-${c._id.slice(-4)}`;

  // Auto-derive status: assigned → in_progress, unassigned → pending
  const derivedStatus = assignedTo ? "in_progress" : "pending";
  const currentStatus = c.status || "pending";
  // If already resolved, keep it unless user unassigns
  const effectiveStatus = currentStatus === "resolved" && assignedTo ? "resolved" : derivedStatus;

  const statusInfo = statusConfig[effectiveStatus] || statusConfig.pending;

  useEffect(() => {
    fetchEmployees().then(setEmployees);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await assignComplaint(c._id, {
        status: effectiveStatus,
        assignedTo: assignedTo || null,
        notes: notes || undefined,
      });
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        onUpdate?.();
      }, 1200);
    } catch (err) {
      console.error("Failed to save:", err);
    } finally {
      setSaving(false);
    }
  };

  // Get the currently assigned employee info
  const assignedEmployee =
    typeof c.assignedTo === "object" && c.assignedTo?.name ? c.assignedTo : null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />

      {/* Side panel */}
      <aside className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col animate-slide-in">
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-gray-900">Complaint Details</h2>
              <span className={`inline-block px-2 py-0.5 rounded border text-[10px] font-semibold uppercase ${statusInfo.color}`}>
                {statusInfo.label}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">Case ID: {caseId}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Profile Section */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-sm shrink-0">
              {getInitials(c.name)}
            </div>
            <div>
              <p className="text-base font-semibold text-gray-900">{c.name}</p>
              <p className="text-xs text-gray-400">Ward {c.ward} Resident</p>
            </div>
          </div>

          {/* Ward & Zone / Category */}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Ward & Zone</p>
              <div className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium text-gray-900">Ward {c.ward}, {c.zone || "—"} Zone</span>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Category</p>
              <span className={`inline-block px-2.5 py-0.5 rounded text-xs font-medium ${categoryColors[c.category] ?? categoryColors.other}`}>
                {categoryLabel[c.category] || c.category}
              </span>
            </div>
          </div>

          {/* Full Address */}
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Full Address</p>
            <p className="text-sm text-gray-700 leading-relaxed">{c.address}</p>
          </div>

          {/* Issue Description */}
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Issue Description</p>
            <div className="bg-gray-50 border border-gray-100 rounded-lg p-4">
              <p className="text-sm text-gray-700 italic leading-relaxed">"{c.issue}"</p>
            </div>
          </div>

          {/* Created Timestamp */}
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <circle cx="10" cy="10" r="4" />
            </svg>
            <span>Created: {formatDate(c.createdAt)}</span>
          </div>

          {/* Assigned Employee / Assign To */}
          {assignedEmployee ? (
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Assigned To</p>
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-semibold">
                  {getInitials(assignedEmployee.name)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{assignedEmployee.name}</p>
                  <p className="text-xs text-gray-500">
                    {roleLabel[assignedEmployee.role] || assignedEmployee.role} · {assignedEmployee.department} · {assignedEmployee.zone}
                  </p>
                </div>
                <svg className="w-4 h-4 text-green-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Assign To {employees.length === 0 && <span className="text-red-400 normal-case">(loading...)</span>}
              </p>
              <select
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
              >
                <option value="">— Select Employee —</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.name} — {roleLabel[emp.role] || emp.role} ({emp.department}, {emp.zone})
                  </option>
                ))}
              </select>
              {assignedTo && (
                <p className="text-xs text-blue-600 mt-1.5">
                  ↳ Status will auto-update to <strong>In Progress</strong>
                </p>
              )}
            </div>
          )}

          {/* Call Recording */}
          {c.recordingUrl && (
            <div className="bg-primary/5 border border-primary/10 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-semibold text-primary">Call Recording</span>
                </div>
                <span className="text-xs font-medium text-primary/70">02:45</span>
              </div>
              <div className="flex items-center gap-3">
                <button className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white shrink-0 hover:bg-primary-dark transition-colors">
                  <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                </button>
                <div className="flex-1 h-1.5 bg-primary/15 rounded-full overflow-hidden">
                  <div className="h-full w-1/3 bg-primary rounded-full" />
                </div>
              </div>
            </div>
          )}

          {/* Internal Notes */}
          <textarea
            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
            rows={2}
            placeholder="Add internal notes for field staff..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-white transition-colors flex items-center justify-center gap-2 ${
              saved ? "bg-green-600" : "bg-primary hover:bg-primary-dark"
            } ${saving ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            {saved ? (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Saved!
              </>
            ) : saving ? "Saving..." : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                Save Changes
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
