import type { ReactNode } from "react";
import type { Complaint } from "../data/complaints";

interface Props {
  complaints: Complaint[];
}

const icons: Record<string, ReactNode> = {
  total: (
    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
      <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    </div>
  ),
  street_light: (
    <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
      <div className="w-5 h-5 rounded-full bg-amber-400" />
    </div>
  ),
  water_supply: (
    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
      <div className="w-5 h-5 rounded-full bg-blue-600" />
    </div>
  ),
  garbage: (
    <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
      <svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V4a1 1 0 011-1h6a1 1 0 011 1v3" />
      </svg>
    </div>
  ),
};

export default function StatsCards({ complaints }: Props) {
  const total = complaints.length;
  const streetLight = complaints.filter((c) => c.category === "street_light").length;
  const water = complaints.filter((c) => c.category === "water_supply").length;
  const garbage = complaints.filter((c) => c.category === "garbage").length;
  const resolved = complaints.filter((c) => c.status === "resolved").length;

  const cards = [
    {
      label: "Total Complaints",
      count: total,
      icon: icons.total,
      accent: <span className="text-green-600 text-xs font-medium flex items-center gap-1 mt-1">↗ +12% from last week</span>,
      border: "border-l-4 border-l-primary",
    },
    {
      label: "Street Light",
      count: streetLight,
      icon: icons.street_light,
      accent: <span className="text-xs text-gray-400 mt-1">Active in all zones</span>,
      border: "",
    },
    {
      label: "Water Supply",
      count: water,
      icon: icons.water_supply,
      accent: <span className="text-xs text-red-500 font-medium flex items-center gap-1 mt-1">⊘ Critical: South Zone</span>,
      border: "",
    },
    {
      label: "Garbage",
      count: garbage,
      icon: icons.garbage,
      accent: <span className="text-xs text-gray-400 mt-1">{resolved} resolved today</span>,
      border: "",
    },
  ];

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div key={card.label} className={`bg-white rounded-xl border border-gray-100 p-5 ${card.border}`}>
          {card.icon}
          <p className="text-xs text-gray-400 mt-3">{card.label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-0.5">{card.count}</p>
          {card.accent}
        </div>
      ))}
    </div>
  );
}
