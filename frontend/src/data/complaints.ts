export type Category = "street_light" | "water_supply" | "garbage" | "drainage" | "road" | "other";
export type Zone = "West" | "East" | "North" | "South";
export type Status = "pending" | "in_progress" | "resolved";

export interface Complaint {
  _id: string;
  name: string;
  address: string;
  issue: string;
  category: Category;
  ward: string;
  zone?: Zone;
  status?: Status;
  createdAt: string;
  recordingUrl?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  assignedTo?: any; // ObjectId string or populated employee object
}

export const CATEGORIES: Category[] = ["street_light", "water_supply", "garbage", "drainage", "road"];
export const ZONES: Zone[] = ["West", "East", "North", "South"];
export const WARDS = Array.from({ length: 20 }, (_, i) => String(i + 1));

export const categoryLabel: Record<string, string> = {
  street_light: "Street Light",
  water_supply: "Water Supply",
  garbage: "Garbage",
  drainage: "Drainage",
  road: "Road",
  other: "Other",
};

// Fallback mock data for when backend is unavailable
export const mockComplaints: Complaint[] = [
  {
    _id: "c001",
    name: "Vivek Sharma",
    address: "Akota, near pole 23",
    ward: "12",
    zone: "West",
    category: "street_light",
    issue: "Street light not working near the main crossing since last week. Area becomes very dark after 7 PM.",
    status: "pending",
    createdAt: "2026-04-09T10:00:00Z",
  },
  {
    _id: "c002",
    name: "Priya Patel",
    address: "Alkapuri, Block C, Lane 4",
    ward: "3",
    zone: "West",
    category: "water_supply",
    issue: "No water supply for the past 2 days. Tanker has also not arrived despite multiple calls.",
    status: "in_progress",
    createdAt: "2026-04-08T14:30:00Z",
    recordingUrl: "https://example.com/audio/c002.mp3",
  },
  {
    _id: "c003",
    name: "Rajesh Kumar",
    address: "Manjalpur, Sector 7",
    ward: "8",
    zone: "South",
    category: "garbage",
    issue: "Garbage not collected for 3 days. Stray animals are spreading waste across the road.",
    status: "resolved",
    createdAt: "2026-04-07T09:15:00Z",
  },
  {
    _id: "c004",
    name: "Anjali Mehta",
    address: "Fatehgunj, near old post office",
    ward: "1",
    zone: "North",
    category: "drainage",
    issue: "Drainage water overflowing onto the main road, causing traffic and health hazard.",
    status: "pending",
    createdAt: "2026-04-09T08:45:00Z",
  },
  {
    _id: "c005",
    name: "Suresh Joshi",
    address: "Karelibaug, Ambica Nagar",
    ward: "6",
    zone: "East",
    category: "road",
    issue: "Large potholes on the main road near the school. Multiple accidents have been reported.",
    status: "in_progress",
    createdAt: "2026-04-06T16:20:00Z",
    recordingUrl: "https://example.com/audio/c005.mp3",
  },
];

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const VALID_CATEGORIES = new Set(["street_light", "water_supply", "garbage", "drainage", "road", "other"]);

function normalizeCategory(raw?: string): Category {
  if (!raw) return "other";
  const lower = raw.toLowerCase().replace(/\s+/g, "_");
  if (VALID_CATEGORIES.has(lower)) return lower as Category;
  if (lower.includes("light") || lower.includes("electric")) return "street_light";
  if (lower.includes("water")) return "water_supply";
  if (lower.includes("garbage") || lower.includes("waste") || lower.includes("trash")) return "garbage";
  if (lower.includes("drain") || lower.includes("sewer")) return "drainage";
  if (lower.includes("road") || lower.includes("pothole")) return "road";
  return "other";
}

export async function fetchComplaints(): Promise<Complaint[]> {
  for (const base of ["/api", API_URL]) {
    try {
      console.log(`📡 Trying ${base}/complaints...`);
      const res = await fetch(`${base}/complaints`);
      if (!res.ok) continue;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data: any[] = await res.json();
      console.log(`✅ Fetched ${data.length} complaints from ${base}`);

      // Normalize backend data — handle incomplete/varied documents
      return data.map((c) => ({
        _id: c._id,
        name: c.name || "Unknown Caller",
        address: c.address || "Not provided",
        issue: c.issue || c.text || "No description",
        category: normalizeCategory(c.category),
        ward: c.ward || "—",
        zone: c.zone || undefined,
        status: c.status || "pending",
        createdAt: c.createdAt,
        recordingUrl: c.recordingUrl,
        assignedTo: c.assignedTo,
      }));
    } catch {
      continue;
    }
  }
  console.warn("⚠ Backend unreachable, using mock data");
  return mockComplaints;
}

