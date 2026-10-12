import React, { useState, useEffect, useMemo } from 'react';
import { Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import * as XLSX from 'xlsx';
import Pagination from '../../components/common/Pagination';
import { fetchReportsOverview, fetchGuards, fetchGuardPerformance, fetchContracts } from '../../api';

export default function ReportsPage({ role }: { role?: string }) {
  const [stats, setStats] = useState<any>(null);
  const [guards, setGuards] = useState<any[]>([]);

  const [searchQuery, setSearchQuery] = useState('');

  // Default date filter to Current Month start and end to prevent system lag
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
  });
  const [dateTo, setDateTo] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split('T')[0];
  });

  const [agencyFilter, setAgencyFilter] = useState('All');
  const [siteFilter, setSiteFilter] = useState('All Sites');

  const formatGuardName = (g: any) => {
    if (role === 'CLIENT') return `${g.firstName || 'Unknown'} ${g.lastName?.[0] || '?'}.`;
    return `${g.firstName || ''} ${g.lastName || ''}`.trim() || 'Unknown Guard';
  };

  const [contractSites, setContractSites] = useState<any[]>([]);

  useEffect(() => {
    fetchContracts().then(setContractSites).catch(console.error);
    fetchReportsOverview().then(setStats).catch(console.error);
  }, []);

  useEffect(() => {
    fetchGuardPerformance(dateFrom, dateTo, siteFilter).then(setGuards).catch(console.error);
  }, [dateFrom, dateTo, siteFilter]);

  const allSiteOptions = useMemo(() => {
    const siteNamesSet = new Set<string>();
    
    // 1. Add from contract sites list
    (contractSites || []).forEach((c: any) => {
      const name = c.siteName || c.locationName || c.name;
      if (name) siteNamesSet.add(name);
    });

    // 2. Add from siteAttendanceData stats
    (stats?.siteAttendanceData || []).forEach((s: any) => {
      if (s.site) siteNamesSet.add(s.site);
    });

    // 3. Add from incidentFrequency stats
    Object.keys(stats?.incidentFrequency || {}).forEach((s: string) => {
      if (s) siteNamesSet.add(s);
    });

    return Array.from(siteNamesSet).sort();
  }, [contractSites, stats]);

  const chartData = useMemo(() => {
    if (!stats?.incidentFrequency) return [];
    return Object.keys(stats.incidentFrequency).map(site => ({
      name: site,
      incidents: stats.incidentFrequency[site]
    }));
  }, [stats]);

  const filteredGuards = useMemo(() => {
    return guards.filter(g => {
      const gName = (g.firstName + ' ' + g.lastName).toLowerCase();
      const agencyName = (g.agency?.name || 'In-House').toLowerCase();
      const matchesSearch = gName.includes(searchQuery.toLowerCase()) || g.guardId.toLowerCase().includes(searchQuery.toLowerCase()) || agencyName.includes(searchQuery.toLowerCase());
      const matchesAgency = agencyFilter === 'All' || g.agency?.name === agencyFilter;
      return matchesSearch && matchesAgency;
    });
  }, [guards, searchQuery, agencyFilter]);

  const uniqueAgencies = Array.from(new Set(guards.map(g => g.agency?.name).filter(Boolean)));

  const exportReport = () => {
    // 1. Guard Performance Sheet
    const ws1 = XLSX.utils.json_to_sheet(filteredGuards.map(g => ({
      'Guard ID': role === 'CLIENT' ? 'HIDDEN' : g.guardId,
      'Guard Name': formatGuardName(g),
      'Vendor / Agency': g.agency?.name || 'In-House Personnel',
      'Shift Preference': g.shiftPreference || 'Flexible',
      'Assigned Contracts': g.assignedContracts || 0,
      'Total Assigned Hours': g.totalAssignedHours || 0,
      'Actual Worked Hours': g.workedHours || 0,
      'Attendance Rate (%)': `${g.attendanceRate || 0}%`,
      'Minor Lates (1-15m)': g.minorLateCount || 0,
      'Moderate Lates (16-45m)': g.moderateLateCount || 0,
      'Severe Lates (>45m)': g.severeLateCount || 0,
      'Total Absences': g.absenceCount || 0,
      'Guard Status': g.status || 'Active'
    })));

    ws1['!cols'] = [
      { wch: 14 },
      { wch: 24 },
      { wch: 22 },
      { wch: 18 },
      { wch: 18 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 22 },
      { wch: 20 },
      { wch: 16 },
      { wch: 14 },
    ];

    // 2. Executive Operational KPI Summary Sheet
    const kpiSummary = [
      { Metric: 'Report Date Range', Value: `${dateFrom} to ${dateTo}` },
      { Metric: 'Site Filter Scope', Value: siteFilter },
      { Metric: 'Agency Filter Scope', Value: agencyFilter },
      { Metric: 'User Role Context', Value: role || 'OPERATION_MANAGER' },
      { Metric: 'Total Guards Deployed / On Duty', Value: stats?.guardsOnDuty || 0 },
      { Metric: 'Total System Guards Count', Value: stats?.totalGuardsCount || 0 },
      { Metric: 'Active Managed Contracts', Value: stats?.activeContracts || 0 },
      { Metric: 'Pending Security Alerts', Value: stats?.pendingAlerts || 0 },
      { Metric: 'SLA Contract Fulfillment Rate', Value: `${stats?.contractFulfillment || 0}%` },
      { Metric: 'On-Time Arrival Compliance Rate', Value: `${stats?.punctualitySummary?.onTimeRate ?? 100}%` },
      { Metric: 'Overall Guard Attendance Rate', Value: `${stats?.attendanceRate || 0}%` },
    ];
    const ws2 = XLSX.utils.json_to_sheet(kpiSummary);
    ws2['!cols'] = [{ wch: 35 }, { wch: 30 }];

    // 3. Site Attendance Breakdown Sheet
    const siteBreakdown = (stats?.siteAttendanceData || []).map((s: any) => {
      const totalShifts = (s.onTime || 0) + (s.late || 0) + (s.absent || 0);
      const complianceRate = totalShifts > 0 ? Math.round(((s.onTime || 0) / totalShifts) * 100) : 100;
      return {
        'Contract Site Name': s.site,
        'On-Time Shifts': s.onTime || 0,
        'Late Arrivals': s.late || 0,
        'Uncovered Absences': s.absent || 0,
        'Total Shifts Scheduled': totalShifts,
        'Site Compliance Rate (%)': `${complianceRate}%`
      };
    });
    const ws3 = XLSX.utils.json_to_sheet(siteBreakdown.length > 0 ? siteBreakdown : [{ 'Status': 'No site attendance logs found' }]);
    ws3['!cols'] = [
      { wch: 32 },
      { wch: 16 },
      { wch: 16 },
      { wch: 20 },
      { wch: 22 },
      { wch: 24 }
    ];

    // Build Workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws1, "Guard_Performance");
    XLSX.utils.book_append_sheet(wb, ws2, "Executive_KPI_Summary");
    XLSX.utils.book_append_sheet(wb, ws3, "Site_Punctuality");

    const fileName = `SPMS_Performance_Report_${dateFrom}_to_${dateTo}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start gap-8">
        <div className="flex-shrink-0">
          <h2 className="text-[24px] font-bold text-[#1E3A5F]">Performance Analytics</h2>
          <p className="text-[14px] text-[#6B7280] mt-1">Live metrics, attendance rates, shift hours, and tiered late penalties.</p>
        </div>
        <div className="flex flex-1 gap-2 items-center flex-wrap justify-end">
          <input
            type="text"
            placeholder="Search guard or ID..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="border border-[#E2E8F0] rounded px-3 py-1.5 text-[13px] outline-none focus:border-[#1E3A5F] flex-1 max-w-[600px]"
          />
          <div className="flex gap-1 items-center bg-white border border-[#E2E8F0] rounded px-2 py-1 shadow-2xs">
            <span className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">Month:</span>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="bg-transparent border-none outline-none text-[12px] p-0.5 text-gray-700 w-[110px] font-medium"/>
            <span className="text-gray-400 text-[11px]">to</span>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="bg-transparent border-none outline-none text-[12px] p-0.5 text-gray-700 w-[110px] font-medium"/>
          </div>
          <select
            value={siteFilter}
            onChange={e => setSiteFilter(e.target.value)}
            className="border border-[#E2E8F0] rounded px-3 py-1.5 text-[13px] text-gray-600 outline-none focus:border-[#1E3A5F]"
          >
            <option value="All Sites">All Sites</option>
            {allSiteOptions.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select
            value={agencyFilter}
            onChange={e => setAgencyFilter(e.target.value)}
            className="border border-[#E2E8F0] rounded px-3 py-1.5 text-[13px] text-gray-600 outline-none"
          >
            <option value="All">All Agencies</option>
            {uniqueAgencies.map((a: any) => <option key={a} value={a}>{a}</option>)}
          </select>
          <button onClick={exportReport} className="flex items-center gap-2 bg-[#1E3A5F] px-4 py-2 text-[13px] text-white font-medium rounded hover:bg-[#162D4A] transition-colors shadow-sm">
            <Download className="w-4 h-4" /> Export XLSX
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Guards Deployed', val: stats?.guardsOnDuty || 0, desc: `Out of ${stats?.totalGuardsCount || 0} registered` },
          { label: 'Active Service Contracts', val: stats?.activeContracts || 0, desc: 'Currently managed' },
          { label: 'Pending Security Alerts', val: stats?.pendingAlerts || 0, desc: 'Unresolved incidents' },
          { label: 'SLA Fulfillment Rate', val: `${stats?.contractFulfillment || 0}%`, desc: 'Average across all sites' }
        ].map((kpi, idx) => (
          <div key={idx} className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-4">
            <h3 className="text-[13px] font-bold text-[#6B7280] mb-1">{kpi.label}</h3>
            <span className="text-[28px] font-bold text-[#0F172A] leading-tight">{kpi.val}</span>
            <p className="text-[11px] text-gray-400 mt-2">{kpi.desc}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Guard Attendance & Arrival Punctuality by Site */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-[14px] font-bold text-[#1E3A5F] uppercase tracking-wide">Guard Attendance Breakdown By Site</h3>
              <p className="text-[12px] text-[#6B7280] mt-0.5">On-time arrivals, late check-ins, and absences</p>
            </div>
            <div className="flex gap-4 text-[11px] font-medium text-[#475569]">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#1E3A5F]"></span> On-Time</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#64748B]"></span> Late</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#CBD5E1]"></span> Absent</span>
            </div>
          </div>
          {(stats?.siteAttendanceData?.length || 0) > 0 ? (
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.siteAttendanceData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="site" tick={{ fontSize: 11, fill: '#475569', fontWeight: 500 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#475569', fontWeight: 500 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip cursor={{ fill: '#F8FAFC' }} contentStyle={{ borderRadius: 6, border: '1px solid #E2E8F0', fontSize: 12, fontWeight: 500 }} />
                  <Bar dataKey="onTime" name="On-Time" fill="#1E3A5F" radius={[2, 2, 0, 0]} stackId="a" barSize={36} />
                  <Bar dataKey="late" name="Late" fill="#64748B" radius={[2, 2, 0, 0]} stackId="a" barSize={36} />
                  <Bar dataKey="absent" name="Absent" fill="#CBD5E1" radius={[4, 4, 0, 0]} stackId="a" barSize={36} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-[13px] text-gray-400 font-medium">No guard attendance logs recorded for this period.</div>
          )}
        </div>

        {/* Operational Guard Punctuality & Performance Summary */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-[14px] font-bold text-[#1E3A5F] uppercase tracking-wide">Punctuality & Arrival Compliance</h3>
            <p className="text-[12px] text-[#6B7280] mt-0.5">Overall guard arrival promptness against shift start times</p>
          </div>

          <div className="grid grid-cols-3 gap-3 my-4">
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-4 rounded-lg text-center">
              <p className="text-[11px] font-bold text-[#475569] uppercase tracking-wider">On-Time Shifts</p>
              <p className="text-[28px] font-extrabold text-[#0F172A] mt-1 leading-none">{stats?.punctualitySummary?.onTime ?? 0}</p>
            </div>
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-4 rounded-lg text-center">
              <p className="text-[11px] font-bold text-[#475569] uppercase tracking-wider">Late Arrivals</p>
              <p className="text-[28px] font-extrabold text-[#0F172A] mt-1 leading-none">{stats?.punctualitySummary?.late ?? 0}</p>
            </div>
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-4 rounded-lg text-center">
              <p className="text-[11px] font-bold text-[#475569] uppercase tracking-wider">Absences</p>
              <p className="text-[28px] font-extrabold text-[#0F172A] mt-1 leading-none">{stats?.punctualitySummary?.absent ?? 0}</p>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between text-[13px] font-medium text-[#0F172A] mb-1.5">
                <span className="font-semibold text-[#334155]">On-Time Arrival Compliance Rate</span>
                <span className="font-extrabold text-[15px] text-[#0F172A]">{stats?.punctualitySummary?.onTimeRate ?? 100}%</span>
              </div>
              <div className="w-full bg-[#E2E8F0] rounded-full h-2">
                <div className="bg-[#1E3A5F] h-2 rounded-full transition-all duration-300" style={{ width: `${stats?.punctualitySummary?.onTimeRate ?? 100}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[13px] font-medium text-[#0F172A] mb-1.5">
                <span className="font-semibold text-[#334155]">Overall Roster Attendance Rate</span>
                <span className="font-extrabold text-[15px] text-[#0F172A]">{stats?.attendanceRate ?? 0}%</span>
              </div>
              <div className="w-full bg-[#E2E8F0] rounded-full h-2">
                <div className="bg-[#475569] h-2 rounded-full transition-all duration-300" style={{ width: `${stats?.attendanceRate ?? 0}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm">
        <div className="px-6 py-4 border-b border-[#E2E8F0] bg-[#F8FAFC] flex justify-between items-center">
          <div>
            <h3 className="text-[14px] font-bold text-[#1E3A5F]">Guard Performance Log & Contract Analytics</h3>
            <p className="text-[12px] text-gray-500 mt-0.5">Current month breakdown of assigned contracts, worked hours, punctuality penalties, and attendance.</p>
          </div>
          <span className="text-[11px] bg-slate-100 text-slate-700 font-semibold px-2.5 py-1 rounded border border-slate-200">Current Month Filter Active</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-[#E2E8F0]">
                <th className="px-5 py-3.5 text-[11px] font-bold text-[#475569] uppercase">Guard Name &amp; ID</th>
                <th className="px-4 py-3.5 text-[11px] font-bold text-[#475569] uppercase">Preference</th>
                <th className="px-4 py-3.5 text-[11px] font-bold text-[#475569] uppercase text-center">Assigned Contracts</th>
                <th className="px-4 py-3.5 text-[11px] font-bold text-[#475569] uppercase text-center">Assigned vs Worked Hours</th>
                <th className="px-4 py-3.5 text-[11px] font-bold text-[#475569] uppercase text-center">Attendance %</th>
                <th className="px-4 py-3.5 text-[11px] font-bold text-[#475569] uppercase text-center">Late Penalties (Minor / Mod / Sev)</th>
                <th className="px-4 py-3.5 text-[11px] font-bold text-[#475569] uppercase text-center">Absences</th>
              </tr>
            </thead>
            <tbody>
              {filteredGuards.map(g => (
                <tr key={g.id} className="hover:bg-slate-50/70 border-b border-gray-100 last:border-0 text-[13px]">
                  <td className="px-5 py-3.5">
                    <p className="font-bold text-[#0F172A]">{formatGuardName(g)}</p>
                    <p className="text-[11px] text-slate-500">
                      ID: {role === 'CLIENT' ? 'HIDDEN' : g.guardId} {g.agency?.name ? `• ${g.agency.name}` : ''}
                    </p>
                  </td>
                  <td className="px-4 py-3.5 text-[#334155] font-medium">
                    <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[12px] font-semibold border border-slate-200">
                      {g.shiftPreference || 'Flexible'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-center font-bold text-[#1E3A5F]">
                    {g.assignedContracts || 0}
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span className="font-bold text-slate-900">{g.workedHours || 0}h</span>
                    <span className="text-[11px] text-slate-400 font-medium ml-1">/ {g.totalAssignedHours || 0}h assigned</span>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span className={`font-bold px-2.5 py-0.5 rounded-full text-[12px] ${g.attendanceRate >= 90 ? 'bg-emerald-100 text-emerald-800' : g.attendanceRate >= 75 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'}`}>
                      {g.attendanceRate || 0}%
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    {(g.minorLateCount || 0) + (g.moderateLateCount || 0) + (g.severeLateCount || 0) === 0 ? (
                      <span className="text-emerald-700 font-medium">0 (Perfect)</span>
                    ) : (
                      <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold">
                        <span className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded border border-slate-200" title="Minor (1-15m)">{g.minorLateCount || 0}m</span>
                        <span className="bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded border border-amber-300" title="Moderate (16-45m)">{g.moderateLateCount || 0}M</span>
                        <span className="bg-rose-100 text-rose-900 px-1.5 py-0.5 rounded border border-rose-300" title="Severe (>45m)">{g.severeLateCount || 0}S</span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-center font-bold">
                    {g.absenceCount > 0 ? (
                      <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded text-[12px]">
                        {g.absenceCount}
                      </span>
                    ) : (
                      <span className="text-slate-400 font-normal">0</span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredGuards.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-[13px] text-gray-400 font-medium">No matching guard performance logs found for this current month filter.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
