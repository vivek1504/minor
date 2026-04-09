import { ZONES, CATEGORIES, WARDS, categoryLabel } from "../data/complaints";
import type { Category } from "../data/complaints";

interface Filters {
  ward: string;
  zone: string;
  category: string;
  search: string;
}

interface Props {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

export default function FilterBar({ filters, onChange }: Props) {
  const set = (key: keyof Filters, value: string) =>
    onChange({ ...filters, [key]: value });

  const resetFilters = () =>
    onChange({ ward: "", zone: "", category: "", search: "" });

  const pillClass =
    "bg-white border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none cursor-pointer";

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Ward */}
      <select className={pillClass} value={filters.ward} onChange={(e) => set("ward", e.target.value)}>
        <option value="">Ward (All)</option>
        {WARDS.map((w) => (
          <option key={w} value={w}>Ward {w}</option>
        ))}
      </select>

      {/* Zone */}
      <select className={pillClass} value={filters.zone} onChange={(e) => set("zone", e.target.value)}>
        <option value="">Zone (All)</option>
        {ZONES.map((z) => (
          <option key={z} value={z}>{z}</option>
        ))}
      </select>

      {/* Category */}
      <select className={pillClass} value={filters.category} onChange={(e) => set("category", e.target.value)}>
        <option value="">Category (All)</option>
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>{categoryLabel[c as Category]}</option>
        ))}
      </select>

      <div className="flex-1" />

      {/* Search */}
      <div className="relative min-w-[220px]">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
        </svg>
        <input
          type="text"
          placeholder="Search by name or issue..."
          className="w-full bg-white border border-gray-200 rounded-full pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          value={filters.search}
          onChange={(e) => set("search", e.target.value)}
        />
      </div>

      {/* Apply Filters */}
      <button
        onClick={resetFilters}
        className="bg-primary hover:bg-primary-dark text-white text-sm font-medium px-5 py-2 rounded-full transition-colors"
      >
        Apply Filters
      </button>
    </div>
  );
}
