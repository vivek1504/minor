export interface Employee {
  _id: string;
  name: string;
  role: "engineer" | "supervisor" | "field_worker";
  department: string;
  zone: string;
  phone: string;
  email: string;
}

export const roleLabel: Record<string, string> = {
  engineer: "Engineer",
  supervisor: "Supervisor",
  field_worker: "Field Worker",
};

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export async function fetchEmployees(): Promise<Employee[]> {
  // Try proxy first, then direct backend
  for (const base of ["/api", API_URL]) {
    try {
      const res = await fetch(`${base}/employees`);
      if (!res.ok) continue;
      const data = await res.json();
      console.log(`✅ Fetched ${data.length} employees from ${base}`);
      return data;
    } catch {
      continue;
    }
  }
  console.warn("⚠ Could not fetch employees from any source");
  return [];
}

export async function assignComplaint(
  complaintId: string,
  data: { status?: string; assignedTo?: string | null; notes?: string }
) {
  for (const base of ["/api", "http://localhost:3000"]) {
    try {
      const res = await fetch(`${base}/complaints/${complaintId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) continue;
      return await res.json();
    } catch {
      continue;
    }
  }
  throw new Error("Could not reach backend");
}
