import { useState, useEffect } from "react";
import { fetchEmployees, roleLabel } from "../data/employees";
import type { Employee } from "../data/employees";

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

const deptLabel: Record<string, string> = {
  street_light: "Street Light",
  water_supply: "Water Supply",
  garbage: "Garbage",
  drainage: "Drainage",
  road: "Road",
};

const roleColors: Record<string, string> = {
  engineer: "bg-blue-50 text-blue-700 border-blue-200",
  supervisor: "bg-purple-50 text-purple-700 border-purple-200",
  field_worker: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    fetchEmployees().then((data) => {
      setEmployees(data);
      setLoading(false);
    });
  }, []);

  const filtered = filter
    ? employees.filter((e) => e.role === filter || e.department === filter)
    : employees;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Employees & Staff</h2>
          <p className="text-sm text-gray-400 mt-1">{employees.length} active team members</p>
        </div>
        <select
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="">All Staff</option>
          <optgroup label="By Role">
            <option value="engineer">Engineers</option>
            <option value="supervisor">Supervisors</option>
            <option value="field_worker">Field Workers</option>
          </optgroup>
          <optgroup label="By Department">
            <option value="street_light">Street Light</option>
            <option value="water_supply">Water Supply</option>
            <option value="garbage">Garbage</option>
            <option value="drainage">Drainage</option>
            <option value="road">Road</option>
          </optgroup>
        </select>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400 text-sm">
          Loading employees...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((emp) => (
            <div key={emp._id} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-sm shrink-0">
                  {getInitials(emp.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{emp.name}</p>
                  <p className="text-xs text-gray-400 truncate">{emp.email}</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-1.5">
                <span className={`inline-block px-2 py-0.5 rounded border text-[10px] font-semibold uppercase ${roleColors[emp.role] || "bg-gray-50 text-gray-600 border-gray-200"}`}>
                  {roleLabel[emp.role] || emp.role}
                </span>
                <span className="inline-block px-2 py-0.5 rounded border border-gray-200 text-[10px] font-semibold text-gray-500 uppercase">
                  {deptLabel[emp.department] || emp.department}
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
                <div className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  <span>{emp.zone} Zone</span>
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  <span>{emp.phone}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
