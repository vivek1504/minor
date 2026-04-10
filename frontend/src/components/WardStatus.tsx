import { useState, useEffect } from "react";
import { fetchComplaints } from "../data/complaints";
import type { Complaint } from "../data/complaints";

interface WardData {
  ward: string;
  total: number;
  pending: number;
  in_progress: number;
  resolved: number;
}

export default function WardStatus() {
  const [wards, setWards] = useState<WardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComplaints().then((data) => {
      // Group by ward
      const map: Record<string, WardData> = {};
      data.forEach((c: Complaint) => {
        const w = c.ward || "—";
        if (!map[w]) map[w] = { ward: w, total: 0, pending: 0, in_progress: 0, resolved: 0 };
        map[w].total++;
        const s = c.status || "pending";
        if (s === "pending") map[w].pending++;
        else if (s === "in_progress") map[w].in_progress++;
        else if (s === "resolved") map[w].resolved++;
      });
      setWards(Object.values(map).sort((a, b) => b.total - a.total));
      setLoading(false);
    });
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Ward Status</h2>
        <p className="text-sm text-gray-400 mt-1">Complaint distribution across wards</p>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400 text-sm">
          Loading ward data...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {wards.map((w) => {
            const resolvedPct = w.total > 0 ? Math.round((w.resolved / w.total) * 100) : 0;
            return (
              <div key={w.ward} className="bg-white rounded-xl border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-gray-900">Ward {w.ward}</h3>
                  <span className="text-2xl font-bold text-primary">{w.total}</span>
                </div>

                {/* Progress bar */}
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all"
                    style={{ width: `${resolvedPct}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span className="text-gray-500">Pending {w.pending}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-gray-500">Active {w.in_progress}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-gray-500">Done {w.resolved}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
