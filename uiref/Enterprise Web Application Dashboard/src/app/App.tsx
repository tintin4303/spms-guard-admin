import { useState } from "react";
import {
  LayoutDashboard,
  FileText,
  Users,
  CalendarDays,
  Map,
  BookOpen,
  BarChart2,
  Settings,
  LogOut,
  Bell,
  ChevronRight,
  AlertTriangle,
  Clock,
  MapPin,
  Navigation,
  Activity,
  TrendingUp,
  ExternalLink,
} from "lucide-react";

// ── Color Palette ───────────────────────────────────────────────
// #021526  deep navy   → sidebar bg, dark surfaces, primary text
// #03346E  mid blue    → active nav, primary buttons, header bg
// #6EACDA  sky blue    → logo title, highlights, accents
// #E2E2B6  warm cream  → nav labels, secondary text on dark bg

const palette = {
  navy: "#021526",
  midBlue: "#03346E",
  sky: "#6EACDA",
  cream: "#E2E2B6",
};

const navItems = [
  { icon: LayoutDashboard, label: "Overview" },
  { icon: FileText, label: "Contracts" },
  { icon: Users, label: "Guard Management" },
  { icon: CalendarDays, label: "Assign Schedule" },
  { icon: Map, label: "Map & Path Creation" },
  { icon: BookOpen, label: "Operation Log" },
  { icon: BarChart2, label: "System Report" },
  { icon: Settings, label: "Settings" },
];

const incidents = [
  {
    id: "INC-0041",
    type: "Missed Checkpoint",
    detail: "Guard R. Martinez — Gate B, Site 3",
    time: "09:42 AM",
    severity: "high" as const,
  },
  {
    id: "INC-0040",
    type: "Suspicious Activity",
    detail: "Perimeter North — Camera 14 flagged",
    time: "08:15 AM",
    severity: "critical" as const,
  },
  {
    id: "INC-0039",
    type: "Late Check-in",
    detail: "Guard T. Williams — Site 4 Entrance",
    time: "07:58 AM",
    severity: "medium" as const,
  },
];

const severityConfig = {
  critical: { badge: "bg-red-100 text-red-700 border-red-200", icon: "text-red-500", bg: "bg-red-50 border-red-200" },
  high:     { badge: "bg-orange-100 text-orange-700 border-orange-200", icon: "text-orange-500", bg: "bg-orange-50 border-orange-200" },
  medium:   { badge: "bg-amber-100 text-amber-700 border-amber-200", icon: "text-amber-500", bg: "bg-amber-50 border-amber-200" },
};

export default function App() {
  const [activeNav, setActiveNav] = useState("Overview");

  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ fontFamily: "'Inter', system-ui, sans-serif", backgroundColor: "#f0f4f8" }}>

      {/* ── Sidebar ── */}
      <aside
        className="w-60 flex-shrink-0 flex flex-col h-full"
        style={{ backgroundColor: palette.navy }}
      >
        {/* Logo */}
        <div className="px-5 pt-6 pb-5" style={{ borderBottom: `1px solid rgba(110,172,218,0.15)` }}>
          <h1
            className="text-xl font-bold leading-tight tracking-tight"
            style={{ color: palette.sky, fontFamily: "'Outfit', sans-serif" }}
          >
            SPMS Command
          </h1>
          <p
            className="text-[10px] font-semibold tracking-[0.2em] uppercase mt-1"
            style={{ color: palette.cream, opacity: 0.65 }}
          >
            Manager Portal
          </p>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ icon: Icon, label }) => {
            const isActive = activeNav === label;
            return (
              <button
                key={label}
                onClick={() => setActiveNav(label)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-medium transition-all duration-150 text-left"
                style={
                  isActive
                    ? { backgroundColor: palette.midBlue, color: "#ffffff" }
                    : { color: palette.cream, backgroundColor: "transparent" }
                }
                onMouseEnter={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(110,172,218,0.1)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
                  }
                }}
              >
                <Icon
                  className="w-4 h-4 flex-shrink-0"
                  style={{ color: isActive ? "#ffffff" : palette.sky, opacity: isActive ? 1 : 0.75 }}
                />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Card */}
        <div className="mx-3 mb-3 rounded-xl p-3" style={{ backgroundColor: "rgba(3,52,110,0.5)", border: `1px solid rgba(110,172,218,0.15)` }}>
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[13px] font-bold flex-shrink-0"
              style={{ backgroundColor: palette.midBlue, border: `2px solid ${palette.sky}` }}
            >
              AD
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-white leading-none">Admin User</p>
              <p
                className="text-[11px] font-semibold mt-1 leading-none uppercase tracking-wide"
                style={{ color: "#4ade80" }}
              >
                ● Online
              </p>
            </div>
          </div>
        </div>

        {/* Logout */}
        <div className="px-3 pb-4">
          <button
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150"
            style={{ backgroundColor: "rgba(110,172,218,0.08)", color: palette.cream, border: `1px solid rgba(110,172,218,0.15)` }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(110,172,218,0.16)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(110,172,218,0.08)"; }}
          >
            <LogOut className="w-4 h-4" style={{ color: palette.sky }} />
            Logout
          </button>
        </div>
      </aside>

      {/* ── Main Panel ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Header */}
        <header
          className="h-14 flex items-center px-6 gap-4 flex-shrink-0"
          style={{ backgroundColor: palette.midBlue, borderBottom: `1px solid rgba(110,172,218,0.2)` }}
        >
          <div className="flex-1 min-w-0">
            <h2
              className="text-[15px] font-bold text-white leading-none tracking-tight"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              System Overview
            </h2>
            <p className="text-[11px] mt-0.5 leading-none" style={{ color: palette.sky, opacity: 0.75 }}>
              Sunday, July 13, 2026
            </p>
          </div>

          <div
            className="hidden sm:flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full"
            style={{ backgroundColor: "rgba(110,172,218,0.15)", color: palette.sky, border: `1px solid rgba(110,172,218,0.3)` }}
          >
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            All Systems Normal
          </div>

          {/* Bell */}
          <button
            className="relative w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            style={{ backgroundColor: "rgba(110,172,218,0.1)" }}
          >
            <Bell className="w-4 h-4" style={{ color: palette.cream }} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2" style={{ ringColor: palette.midBlue }} />
          </button>

          {/* Avatar */}
          <div className="flex items-center gap-2.5 pl-3" style={{ borderLeft: `1px solid rgba(110,172,218,0.25)` }}>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold"
              style={{ background: `linear-gradient(135deg, ${palette.sky}, ${palette.midBlue})` }}
            >
              AD
            </div>
            <div className="hidden md:block">
              <p className="text-[12px] font-semibold text-white leading-none">Admin</p>
              <p className="text-[10px] mt-0.5 leading-none" style={{ color: palette.cream, opacity: 0.65 }}>Super Admin</p>
            </div>
          </div>
        </header>

        {/* ── Content ── */}
        <main className="flex-1 overflow-y-auto p-5 space-y-4" style={{ backgroundColor: "#eef2f7" }}>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">

            {/* Active Guards */}
            <div
              className="rounded-xl p-4 hover:shadow-lg transition-all duration-200 cursor-default"
              style={{ backgroundColor: "#ffffff", border: `1px solid rgba(3,52,110,0.12)` }}
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: "rgba(110,172,218,0.15)" }}
                >
                  <Users className="w-4 h-4" style={{ color: palette.midBlue }} />
                </div>
                <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: palette.midBlue, opacity: 0.6 }}>On Duty</span>
              </div>
              <p
                className="text-3xl font-bold leading-none tabular-nums"
                style={{ color: palette.navy, fontFamily: "'JetBrains Mono', monospace" }}
              >
                24
              </p>
              <p className="text-[11px] font-medium mt-1 leading-none" style={{ color: "#64748b" }}>Active Guards</p>
              <div
                className="flex items-center gap-1 mt-3 pt-3"
                style={{ borderTop: `1px solid rgba(3,52,110,0.08)` }}
              >
                <TrendingUp className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                <span className="text-[11px] text-emerald-600 font-medium">+2 from yesterday</span>
              </div>
            </div>

            {/* Active Sites */}
            <div
              className="rounded-xl p-4 hover:shadow-lg transition-all duration-200 cursor-default"
              style={{ backgroundColor: "#ffffff", border: `1px solid rgba(3,52,110,0.12)` }}
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: "rgba(110,172,218,0.15)" }}
                >
                  <MapPin className="w-4 h-4" style={{ color: palette.sky }} />
                </div>
                <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: palette.midBlue, opacity: 0.6 }}>Live</span>
              </div>
              <p
                className="text-3xl font-bold leading-none tabular-nums"
                style={{ color: palette.navy, fontFamily: "'JetBrains Mono', monospace" }}
              >
                8
              </p>
              <p className="text-[11px] font-medium mt-1 leading-none" style={{ color: "#64748b" }}>Active Sites</p>
              <div
                className="flex items-center gap-1 mt-3 pt-3"
                style={{ borderTop: `1px solid rgba(3,52,110,0.08)` }}
              >
                <Activity className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                <span className="text-[11px] text-emerald-600 font-medium">All sites operational</span>
              </div>
            </div>

            {/* Pending Incidents — alert */}
            <div
              className="rounded-xl p-4 hover:shadow-lg transition-all duration-200 cursor-default relative overflow-hidden"
              style={{ backgroundColor: "#ffffff", border: `1px solid rgba(239,68,68,0.3)` }}
            >
              <div className="absolute inset-y-0 left-0 w-1 rounded-l-xl" style={{ backgroundColor: "#ef4444" }} />
              <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-red-500 bg-red-50 px-1.5 py-0.5 rounded-md border border-red-100">
                  Alert
                </span>
              </div>
              <p
                className="text-3xl font-bold text-red-600 leading-none tabular-nums"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                3
              </p>
              <p className="text-[11px] font-medium mt-1 leading-none text-red-400">Pending Incidents</p>
              <div className="flex items-center gap-1 mt-3 pt-3 border-t border-red-100">
                <AlertTriangle className="w-3 h-3 text-red-400 flex-shrink-0" />
                <span className="text-[11px] text-red-500 font-medium">Requires attention</span>
              </div>
            </div>

            {/* Patrol Routes */}
            <div
              className="rounded-xl p-4 hover:shadow-lg transition-all duration-200 cursor-default"
              style={{ backgroundColor: "#ffffff", border: `1px solid rgba(3,52,110,0.12)` }}
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: "rgba(2,21,38,0.07)" }}
                >
                  <Navigation className="w-4 h-4" style={{ color: palette.navy }} />
                </div>
                <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: palette.midBlue, opacity: 0.6 }}>Today</span>
              </div>
              <p
                className="text-3xl font-bold leading-none tabular-nums"
                style={{ color: palette.navy, fontFamily: "'JetBrains Mono', monospace" }}
              >
                112
              </p>
              <p className="text-[11px] font-medium mt-1 leading-none" style={{ color: "#64748b" }}>Patrol Routes</p>
              <div
                className="flex items-center gap-2 mt-3 pt-3"
                style={{ borderTop: `1px solid rgba(3,52,110,0.08)` }}
              >
                <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(3,52,110,0.1)" }}>
                  <div className="h-full rounded-full" style={{ width: "84%", backgroundColor: palette.midBlue }} />
                </div>
                <span className="text-[11px] font-medium flex-shrink-0" style={{ color: palette.midBlue }}>94 done</span>
              </div>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            {/* Live Route Execution */}
            <div
              className="lg:col-span-2 rounded-xl overflow-hidden flex flex-col"
              style={{ backgroundColor: "#ffffff", border: `1px solid rgba(3,52,110,0.12)` }}
            >
              <div
                className="px-5 py-3.5 flex items-center gap-3"
                style={{ borderBottom: `1px solid rgba(3,52,110,0.08)` }}
              >
                <div>
                  <h2
                    className="text-[14px] font-semibold leading-none"
                    style={{ color: palette.navy, fontFamily: "'Outfit', sans-serif" }}
                  >
                    Live Route Execution
                  </h2>
                  <p className="text-[11px] mt-1 leading-none" style={{ color: "#64748b" }}>
                    Real-time patrol path tracking — 8 active routes
                  </p>
                </div>
                <div className="ml-auto flex items-center gap-2.5">
                  <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                    Live
                  </span>
                  <button
                    className="flex items-center gap-1 text-[11px] font-medium rounded-lg px-2.5 py-1.5 transition-colors"
                    style={{ color: palette.midBlue, border: `1px solid rgba(3,52,110,0.2)`, backgroundColor: "rgba(110,172,218,0.07)" }}
                  >
                    <ExternalLink className="w-3 h-3" />
                    Expand
                  </button>
                </div>
              </div>

              {/* Map */}
              <div className="relative flex-1 overflow-hidden" style={{ minHeight: 280, backgroundColor: palette.navy }}>
                <svg
                  viewBox="0 0 640 290"
                  preserveAspectRatio="xMidYMid slice"
                  className="absolute inset-0 w-full h-full"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <pattern id="mapGrid" width="32" height="32" patternUnits="userSpaceOnUse">
                      <path d="M 32 0 L 0 0 0 32" fill="none" stroke="rgba(110,172,218,0.07)" strokeWidth="0.5" />
                    </pattern>
                    <pattern id="mapGridLg" width="128" height="128" patternUnits="userSpaceOnUse">
                      <rect width="128" height="128" fill="none" stroke="rgba(110,172,218,0.1)" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="640" height="290" fill={palette.navy} />
                  <rect width="640" height="290" fill="url(#mapGrid)" />
                  <rect width="640" height="290" fill="url(#mapGridLg)" />

                  {/* Zone A */}
                  <ellipse cx="195" cy="115" rx="85" ry="55"
                    fill="rgba(110,172,218,0.06)" stroke="rgba(110,172,218,0.2)" strokeWidth="1" strokeDasharray="5 3" />
                  <text x="195" y="72" fill="rgba(110,172,218,0.45)" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="500">ZONE A</text>

                  {/* Zone B */}
                  <ellipse cx="470" cy="185" rx="75" ry="50"
                    fill="rgba(3,52,110,0.2)" stroke="rgba(110,172,218,0.18)" strokeWidth="1" strokeDasharray="5 3" />
                  <text x="470" y="144" fill="rgba(110,172,218,0.45)" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="500">ZONE B</text>

                  {/* Inactive route */}
                  <polyline points="90,240 215,205 360,195 500,175 580,145"
                    fill="none" stroke="rgba(110,172,218,0.2)" strokeWidth="1.5" strokeDasharray="6 4" />

                  {/* Route Alpha */}
                  <polyline points="68,218 195,115 370,78 470,96 570,152"
                    fill="none" stroke={palette.sky} strokeWidth="2" strokeDasharray="10 4" opacity="0.7" />

                  {/* Route Bravo */}
                  <polyline points="55,148 160,178 300,210 430,228 545,198"
                    fill="none" stroke={palette.cream} strokeWidth="2" strokeDasharray="10 4" opacity="0.55" />

                  {/* Site markers */}
                  {([[68,218],[570,152],[545,198],[55,148]] as [number,number][]).map(([cx, cy], i) => (
                    <g key={i}>
                      <rect x={cx-6} y={cy-6} width="12" height="12" rx="2" fill={palette.midBlue} stroke={palette.sky} strokeWidth="1" opacity="0.7" />
                      <rect x={cx-3} y={cy-3} width="6" height="6" rx="1" fill={palette.sky} opacity="0.5" />
                    </g>
                  ))}

                  {/* GRD-07 */}
                  <circle cx="195" cy="115" r="5" fill={palette.sky}>
                    <animate attributeName="r" values="5;7;5" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="1;0.6;1" dur="2s" repeatCount="indefinite" />
                  </circle>
                  <circle cx="195" cy="115" r="12" fill="none" stroke={palette.sky} strokeWidth="1">
                    <animate attributeName="r" values="7;16;7" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.5;0;0.5" dur="2s" repeatCount="indefinite" />
                  </circle>
                  <text x="195" y="99" fill={palette.sky} fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="500">GRD-07</text>

                  {/* GRD-12 */}
                  <circle cx="470" cy="96" r="5" fill={palette.sky}>
                    <animate attributeName="r" values="5;7;5" dur="2.8s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="1;0.6;1" dur="2.8s" repeatCount="indefinite" />
                  </circle>
                  <circle cx="470" cy="96" r="12" fill="none" stroke={palette.sky} strokeWidth="1">
                    <animate attributeName="r" values="7;16;7" dur="2.8s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.4;0;0.4" dur="2.8s" repeatCount="indefinite" />
                  </circle>
                  <text x="470" y="80" fill={palette.sky} fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="500">GRD-12</text>

                  {/* GRD-03 */}
                  <circle cx="300" cy="210" r="5" fill={palette.cream}>
                    <animate attributeName="r" values="5;7;5" dur="3.2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="1;0.6;1" dur="3.2s" repeatCount="indefinite" />
                  </circle>
                  <circle cx="300" cy="210" r="12" fill="none" stroke={palette.cream} strokeWidth="1">
                    <animate attributeName="r" values="7;16;7" dur="3.2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.4;0;0.4" dur="3.2s" repeatCount="indefinite" />
                  </circle>
                  <text x="300" y="194" fill={palette.cream} fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="500">GRD-03</text>
                </svg>

                {/* Overlays */}
                <div className="absolute bottom-3 left-4 flex items-center gap-4">
                  <span className="flex items-center gap-1.5 text-[10px] font-mono" style={{ color: palette.sky }}>
                    <span className="w-4 h-0.5 rounded" style={{ backgroundColor: palette.sky }} />
                    Route Alpha
                  </span>
                  <span className="flex items-center gap-1.5 text-[10px] font-mono" style={{ color: palette.cream }}>
                    <span className="w-4 h-0.5 rounded" style={{ backgroundColor: palette.cream }} />
                    Route Bravo
                  </span>
                  <span className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500">
                    <span className="w-4 h-0.5 bg-slate-700 rounded" />
                    Inactive
                  </span>
                </div>
                <div
                  className="absolute top-3 right-3 rounded-lg px-2.5 py-1.5"
                  style={{ backgroundColor: "rgba(2,21,38,0.85)", border: `1px solid rgba(110,172,218,0.2)` }}
                >
                  <p className="text-[10px]" style={{ color: palette.sky, fontFamily: "'JetBrains Mono', monospace" }}>
                    14.5992°N / 121.0162°E
                  </p>
                </div>
                <div
                  className="absolute bottom-3 right-3 rounded-lg px-2.5 py-1.5 flex items-center gap-1.5"
                  style={{ backgroundColor: "rgba(2,21,38,0.85)", border: `1px solid rgba(110,172,218,0.2)` }}
                >
                  <Users className="w-3 h-3" style={{ color: palette.sky }} />
                  <p className="text-[10px]" style={{ color: palette.cream, fontFamily: "'JetBrains Mono', monospace" }}>
                    3 guards tracked
                  </p>
                </div>
              </div>
            </div>

            {/* Recent Incidents */}
            <div
              className="lg:col-span-1 rounded-xl flex flex-col overflow-hidden"
              style={{ backgroundColor: "#ffffff", border: `1px solid rgba(3,52,110,0.12)` }}
            >
              <div
                className="px-5 py-3.5 flex items-center gap-2"
                style={{ borderBottom: `1px solid rgba(3,52,110,0.08)` }}
              >
                <h2
                  className="text-[14px] font-semibold leading-none flex-1"
                  style={{ color: palette.navy, fontFamily: "'Outfit', sans-serif" }}
                >
                  Recent Incidents
                </h2>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-[11px] font-semibold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                    3 open
                  </span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto divide-y" style={{ borderColor: "rgba(3,52,110,0.06)" }}>
                {incidents.map((incident) => {
                  const s = severityConfig[incident.severity];
                  return (
                    <div
                      key={incident.id}
                      className="p-4 transition-colors cursor-pointer group"
                      style={{ borderBottomColor: "rgba(3,52,110,0.06)" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.backgroundColor = "rgba(110,172,218,0.05)"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.backgroundColor = ""; }}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-xl ${s.bg} border flex items-center justify-center flex-shrink-0 mt-0.5`}>
                          <AlertTriangle className={`w-3.5 h-3.5 ${s.icon}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <p className="text-[13px] font-semibold leading-snug transition-colors" style={{ color: palette.navy }}>
                              {incident.type}
                            </p>
                            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md border ${s.badge} flex-shrink-0 capitalize leading-none mt-0.5`}>
                              {incident.severity}
                            </span>
                          </div>
                          <p className="text-[11px] leading-snug" style={{ color: "#64748b" }}>{incident.detail}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <div className="flex items-center gap-1">
                              <Clock className="w-2.5 h-2.5 text-slate-400 flex-shrink-0" />
                              <span className="text-[10px] text-slate-400" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                                {incident.time}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                              #{incident.id}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div
                className="px-4 py-3"
                style={{ borderTop: `1px solid rgba(3,52,110,0.08)`, backgroundColor: "rgba(110,172,218,0.04)" }}
              >
                <button
                  className="w-full flex items-center justify-center gap-1.5 text-[12px] font-semibold py-0.5 transition-colors"
                  style={{ color: palette.midBlue }}
                >
                  View All Incidents
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
