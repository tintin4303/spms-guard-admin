"use client";

import {
  Users,
  MapPin,
  Activity,
  TrendingUp,
  ExternalLink,
  AlertTriangle,
  Navigation,
  ChevronRight,
  Clock
} from "lucide-react";

const palette = {
  navy: "#021526",
  midBlue: "#03346E",
  sky: "#6EACDA",
  cream: "#E2E2B6",
};

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
  high: { badge: "bg-orange-100 text-orange-700 border-orange-200", icon: "text-orange-500", bg: "bg-orange-50 border-orange-200" },
  medium: { badge: "bg-amber-100 text-amber-700 border-amber-200", icon: "text-amber-500", bg: "bg-amber-50 border-amber-200" },
};

export default function DashboardOverview() {
  return (
    <>
      {/* Minimalist Top Bar KPIs */}
      <div className="flex flex-wrap items-center justify-between gap-6 px-7 py-5 bg-white rounded-xl shadow-sm border border-slate-200/60 mb-2">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Active Guards</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-800 leading-none">24</span>
              <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">+2</span>
            </div>
          </div>
        </div>

        <div className="hidden lg:block w-px h-10 bg-slate-200"></div>

        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-sky-50 text-sky-600 rounded-lg">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Active Sites</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-800 leading-none">8</span>
              <span className="text-[10px] font-medium text-slate-500">All Ops Normal</span>
            </div>
          </div>
        </div>

        <div className="hidden lg:block w-px h-10 bg-slate-200"></div>

        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-red-50 text-red-600 rounded-lg">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Pending Incidents</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-red-600 leading-none">3</span>
              <span className="text-[10px] font-medium text-red-500 bg-red-50 border border-red-100 px-1.5 py-0.5 rounded">Action Req</span>
            </div>
          </div>
        </div>

        <div className="hidden lg:block w-px h-10 bg-slate-200"></div>

        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-slate-50 text-slate-500 rounded-lg">
            <Navigation className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Patrol Progress</p>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-slate-800 leading-none">94<span className="text-[13px] font-semibold text-slate-400 ml-1">/112</span></span>
              <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden hidden sm:block">
                <div className="h-full bg-blue-600 w-[84%]"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Guard Shift Timeline */}
        <div className="lg:col-span-2 rounded-xl overflow-hidden flex flex-col" style={{ backgroundColor: "#ffffff", border: `1px solid rgba(3,52,110,0.12)` }}>
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: `1px solid rgba(3,52,110,0.08)` }}>
            <div>
              <h2 className="text-[14px] font-semibold leading-none" style={{ color: palette.navy, fontFamily: "'Outfit', sans-serif" }}>Guard Shift Timeline</h2>
              <p className="text-[11px] mt-1 leading-none" style={{ color: "#64748b" }}>Current workforce deployment (06:00 - 18:00)</p>
            </div>
            <button className="flex items-center gap-1 text-[11px] font-medium rounded-lg px-2.5 py-1.5 transition-colors" style={{ color: palette.midBlue, border: `1px solid rgba(3,52,110,0.2)`, backgroundColor: "rgba(110,172,218,0.07)" }}>
              <ExternalLink className="w-3 h-3" />
              Full Schedule
            </button>
          </div>

          <div className="flex-1 p-5 overflow-x-auto custom-scrollbar">
            <div className="min-w-[600px] h-full flex flex-col">
              {/* Timeline Header */}
              <div className="flex items-center mb-4 pl-[120px] relative">
                {['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00'].map((time, i) => (
                  <div key={time} className="absolute text-[10px] font-semibold text-slate-400" style={{ left: `calc(120px + ${(i / 6) * 100}%)`, transform: 'translateX(-50%)' }}>
                    {time}
                  </div>
                ))}
              </div>

              {/* Grid Lines Overlay */}
              <div className="relative border-l border-slate-100 pl-[120px] pb-4 flex-1">
                <div className="absolute inset-0 left-[120px]">
                  {[0, 1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="absolute top-0 bottom-0 border-l border-slate-100 border-dashed" style={{ left: `${(i / 6) * 100}%` }} />
                  ))}
                </div>

                {/* Shift Rows */}
                <div className="space-y-4 relative z-10 pt-2">
                  {/* Guard 1 */}
                  <div className="flex items-center relative h-10 group">
                    <div className="w-[120px] flex-shrink-0 pr-4 absolute left-0 top-0 h-full flex flex-col justify-center bg-white z-20">
                      <p className="text-[12px] font-bold text-slate-800">R. Martinez</p>
                      <p className="text-[10px] text-slate-500">East Gate</p>
                    </div>
                    {/* Shift: 06:00 to 14:00 (0% to 66.6%) */}
                    <div className="absolute h-8 top-1 rounded-md shadow-sm border" style={{ left: '0%', width: '66.66%', backgroundColor: 'rgba(110,172,218,0.1)', borderColor: palette.sky }}>
                      <div className="w-full h-full rounded-md border-l-4 overflow-hidden flex items-center px-3 gap-2" style={{ borderLeftColor: palette.sky, backgroundColor: 'rgba(255,255,255,0.7)' }}>
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="text-[10px] font-bold" style={{ color: palette.navy }}>On Duty (06:00 - 14:00)</span>
                      </div>
                    </div>
                  </div>

                  {/* Guard 2 */}
                  <div className="flex items-center relative h-10 group">
                    <div className="w-[120px] flex-shrink-0 pr-4 absolute left-0 top-0 h-full flex flex-col justify-center bg-white z-20">
                      <p className="text-[12px] font-bold text-slate-800">T. Williams</p>
                      <p className="text-[10px] text-slate-500">Perimeter N.</p>
                    </div>
                    {/* Shift: 08:00 to 16:00 (16.6% to 83.3%) */}
                    <div className="absolute h-8 top-1 rounded-md shadow-sm border" style={{ left: '16.66%', width: '66.66%', backgroundColor: 'rgba(110,172,218,0.1)', borderColor: palette.sky }}>
                      <div className="w-full h-full rounded-md border-l-4 overflow-hidden flex items-center px-3 gap-2" style={{ borderLeftColor: palette.sky, backgroundColor: 'rgba(255,255,255,0.7)' }}>
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="text-[10px] font-bold" style={{ color: palette.navy }}>On Duty (08:00 - 16:00)</span>
                      </div>
                    </div>
                  </div>

                  {/* Guard 3 */}
                  <div className="flex items-center relative h-10 group">
                    <div className="w-[120px] flex-shrink-0 pr-4 absolute left-0 top-0 h-full flex flex-col justify-center bg-white z-20">
                      <p className="text-[12px] font-bold text-slate-800">J. Doe</p>
                      <p className="text-[10px] text-slate-500">Main Bldg</p>
                    </div>
                    {/* Shift: 10:00 to 18:00 (33.3% to 100%) */}
                    <div className="absolute h-8 top-1 rounded-md shadow-sm border border-slate-200 bg-slate-50" style={{ left: '33.33%', width: '66.66%' }}>
                      <div className="w-full h-full rounded-md border-l-4 border-slate-300 overflow-hidden flex items-center px-3 gap-2 bg-white/70">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span className="text-[10px] font-semibold text-slate-600">Upcoming (10:00 - 18:00)</span>
                      </div>
                    </div>
                  </div>

                  {/* Guard 4 */}
                  <div className="flex items-center relative h-10 group">
                    <div className="w-[120px] flex-shrink-0 pr-4 absolute left-0 top-0 h-full flex flex-col justify-center bg-white z-20">
                      <p className="text-[12px] font-bold text-slate-800">A. Smith</p>
                      <p className="text-[10px] text-slate-500">Parking A</p>
                    </div>
                    {/* Shift: 04:00 to 12:00 -> Since view starts at 06:00, Left: 0%, Width: 50% */}
                    <div className="absolute h-8 top-1 rounded-md shadow-sm border border-emerald-200 bg-emerald-50" style={{ left: '0%', width: '50%' }}>
                      <div className="w-full h-full rounded-md border-l-4 border-emerald-400 overflow-hidden flex items-center px-3 gap-2 bg-white/70 opacity-80">
                        <span className="text-[10px] font-semibold text-emerald-700">Finished (04:00 - 12:00)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Incidents */}
        <div className="lg:col-span-1 rounded-xl flex flex-col overflow-hidden" style={{ backgroundColor: "#ffffff", border: `1px solid rgba(3,52,110,0.12)` }}>
          <div className="px-5 py-3.5 flex items-center gap-2" style={{ borderBottom: `1px solid rgba(3,52,110,0.08)` }}>
            <h2 className="text-[14px] font-semibold leading-none flex-1" style={{ color: palette.navy, fontFamily: "'Outfit', sans-serif" }}>Recent Incidents</h2>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
              <span className="text-[11px] font-semibold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">3 open</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y" style={{ borderColor: "rgba(3,52,110,0.06)" }}>
            {incidents.map((incident) => {
              const s = severityConfig[incident.severity];
              return (
                <div key={incident.id} className="p-4 transition-colors cursor-pointer group hover:bg-sky-50/50" style={{ borderBottomColor: "rgba(3,52,110,0.06)" }}>
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-xl ${s.bg} border flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      <AlertTriangle className={`w-3.5 h-3.5 ${s.icon}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="text-[13px] font-semibold leading-snug transition-colors" style={{ color: palette.navy }}>{incident.type}</p>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md border ${s.badge} flex-shrink-0 capitalize leading-none mt-0.5`}>
                          {incident.severity}
                        </span>
                      </div>
                      <p className="text-[11px] leading-snug" style={{ color: "#64748b" }}>{incident.detail}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5 text-slate-400 flex-shrink-0" />
                          <span className="text-[10px] text-slate-400" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{incident.time}</span>
                        </div>
                        <span className="text-[10px] text-slate-400" style={{ fontFamily: "'JetBrains Mono', monospace" }}>#{incident.id}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="px-4 py-3" style={{ borderTop: `1px solid rgba(3,52,110,0.08)`, backgroundColor: "rgba(110,172,218,0.04)" }}>
            <button className="w-full flex items-center justify-center gap-1.5 text-[12px] font-semibold py-0.5 transition-colors" style={{ color: palette.midBlue }}>
              View All Incidents
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}