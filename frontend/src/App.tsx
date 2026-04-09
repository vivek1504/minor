import { useState, useMemo, useEffect, useCallback } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import StatsCards from "./components/StatsCards";
import FilterBar from "./components/FilterBar";
import ComplaintTable from "./components/ComplaintTable";
import ComplaintDetail from "./components/ComplaintDetail";
import { fetchComplaints } from "./data/complaints";
import type { Complaint } from "./data/complaints";
import "./index.css";

interface Filters {
  ward: string;
  zone: string;
  category: string;
  search: string;
}

const defaultFilters: Filters = { ward: "", zone: "", category: "", search: "" };

export default function App() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [selected, setSelected] = useState<Complaint | null>(null);

  const loadComplaints = useCallback(() => {
    fetchComplaints()
      .then(setComplaints)
      .finally(() => setLoading(false));
  }, []);

  // Fetch complaints from backend on mount
  useEffect(() => {
    loadComplaints();
  }, [loadComplaints]);

  const handleUpdate = () => {
    loadComplaints();
    setSelected(null);
  };

  const filtered = useMemo(() => {
    const q = filters.search.toLowerCase();
    return complaints.filter((c) => {
      if (filters.ward && c.ward !== filters.ward) return false;
      if (filters.zone && c.zone !== filters.zone) return false;
      if (filters.category && c.category !== filters.category) return false;
      if (
        q &&
        !c.name.toLowerCase().includes(q) &&
        !c.address.toLowerCase().includes(q) &&
        !c.issue.toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [filters, complaints]);

  return (
    <div className="min-h-screen bg-surface">
      {/* Sidebar */}
      <Sidebar />

      {/* Main area */}
      <div className="ml-56">
        <Header />

        <main className="px-8 py-6 space-y-6">
          {/* Page heading */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Automated Call Center Complaints</h2>
            <p className="text-sm text-gray-400 mt-1">Real-time civic issue tracking across Vadodara Wards</p>
          </div>

          {/* Stats */}
          <StatsCards complaints={complaints} />

          {/* Filters */}
          <FilterBar filters={filters} onChange={setFilters} />

          {/* Table */}
          {loading ? (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400 text-sm">
              Loading complaints...
            </div>
          ) : (
            <ComplaintTable complaints={filtered} onSelect={setSelected} />
          )}
        </main>
      </div>

      {/* Detail side panel */}
      {selected && (
        <ComplaintDetail complaint={selected} onClose={() => setSelected(null)} onUpdate={handleUpdate} />
      )}
    </div>
  );
}
