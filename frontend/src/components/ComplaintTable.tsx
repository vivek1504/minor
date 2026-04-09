import type { Complaint } from "../data/complaints";
import { categoryLabel } from "../data/complaints";

interface Props {
  complaints: Complaint[];
  onSelect: (complaint: Complaint) => void;
}

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const time = d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
  return { time, label: isToday ? "Today" : d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) };
}

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 1);
}

const avatarColors = [
  "bg-primary text-white",
  "bg-amber-500 text-white",
  "bg-emerald-600 text-white",
  "bg-violet-600 text-white",
  "bg-rose-500 text-white",
  "bg-sky-600 text-white",
];

const categoryBadgeColors: Record<string, string> = {
  street_light: "bg-amber-100 text-amber-800",
  water_supply: "bg-sky-100 text-sky-800",
  garbage: "bg-emerald-100 text-emerald-800",
  drainage: "bg-violet-100 text-violet-800",
  road: "bg-orange-100 text-orange-800",
};

export default function ComplaintTable({ complaints, onSelect }: Props) {
  if (complaints.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400 text-sm">
        No complaints match the current filters.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      {/* Title bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h3 className="text-base font-semibold text-gray-900">Recent Complaints</h3>
        <div className="flex items-center gap-2">
          <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100">
              <th className="px-6 py-3">Citizen Details</th>
              <th className="px-4 py-3">Ward/Zone</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Issue Description</th>
              <th className="px-4 py-3">Timestamp</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {complaints.map((c, i) => {
              const { time, label } = formatTime(c.createdAt);
              const colorClass = avatarColors[i % avatarColors.length];
              return (
                <tr
                  key={c._id}
                  className="hover:bg-gray-50/50 cursor-pointer transition-colors"
                  onClick={() => onSelect(c)}
                >
                  {/* Citizen Details */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${colorClass}`}>
                        {getInitials(c.name)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{c.name}</p>
                        <p className="text-xs text-gray-400 max-w-[160px] truncate">{c.address}</p>
                      </div>
                    </div>
                  </td>

                  {/* Ward/Zone */}
                  <td className="px-4 py-4">
                    <p className="font-medium text-gray-900 text-sm">Ward {c.ward}</p>
                    <p className="text-xs text-gray-400 uppercase">{c.zone} Zone</p>
                  </td>

                  {/* Category */}
                  <td className="px-4 py-4">
                    <span className={`inline-block px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${categoryBadgeColors[c.category] ?? "bg-gray-100 text-gray-600"}`}>
                      {categoryLabel[c.category].replace(" ", "_")}
                    </span>
                  </td>

                  {/* Issue */}
                  <td className="px-4 py-4">
                    <p className="text-sm text-gray-600 max-w-[220px] truncate">{c.issue}</p>
                  </td>

                  {/* Timestamp */}
                  <td className="px-4 py-4">
                    <p className="text-sm text-gray-900">{time}</p>
                    <p className="text-xs text-gray-400">{label}</p>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-4">
                    <button
                      className="text-primary text-sm font-medium hover:underline"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect(c);
                      }}
                    >
                      Details
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100">
        <span className="text-xs text-gray-400">
          Showing {complaints.length} of {complaints.length} complaints
        </span>
        <div className="flex items-center gap-1">
          <button className="w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:bg-gray-100 text-xs">&lt;</button>
          <button className="w-7 h-7 flex items-center justify-center rounded bg-primary text-white text-xs font-medium">1</button>
          <button className="w-7 h-7 flex items-center justify-center rounded text-gray-600 hover:bg-gray-100 text-xs border border-gray-200">2</button>
          <button className="w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:bg-gray-100 text-xs">&gt;</button>
        </div>
      </div>
    </div>
  );
}
