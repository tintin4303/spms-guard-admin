import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle2, X, MapPin } from 'lucide-react';
import Pagination from '../../components/common/Pagination';
import { fetchLogs, fetchAttendanceLogs, resolveIncident } from '../../api';

export default function LogsPage({ role }: { role?: string }) {
  const [activeTab, setActiveTab] = useState<'attendance' | 'incidents'>('attendance');
  const [logs, setLogs] = useState<any[]>([]);
  const [attendanceLogs, setAttendanceLogs] = useState<any[]>([]);
  const [siteFilter, setSiteFilter] = useState('All Sites');
  const [searchQuery, setSearchQuery] = useState('');

  const [isResolving, setIsResolving] = useState<any>(null);
  const [resolutionNote, setResolutionNote] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const loadLogs = () => {
    fetchLogs().then(data => setLogs(Array.isArray(data) ? data : [])).catch(console.error);
    fetchAttendanceLogs().then(data => setAttendanceLogs(Array.isArray(data) ? data : [])).catch(console.error);
  };

  useEffect(() => {
    loadLogs();
    const interval = setInterval(loadLogs, 15000); // Polling every 15s for live updates
    return () => clearInterval(interval);
  }, []);

  const handleResolveSubmit = async (e: any) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      await resolveIncident(isResolving.id, resolutionNote);
      setIsResolving(null);
      setResolutionNote('');
      loadLogs();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to resolve incident.');
    }
  };

  const isOps = role === 'OPERATION_MANAGER' || !role;

  const safeLogs = Array.isArray(logs) ? logs : [];
  const safeAttendance = Array.isArray(attendanceLogs) ? attendanceLogs : [];

  const uniqueSites = Array.from(new Set([
    ...safeLogs.map(log => log.mapPin?.patrolPath?.site?.name),
    ...safeAttendance.map(a => a.roster?.site?.name)
  ].filter(Boolean)));

  const filteredAttendance = safeAttendance.filter(a => {
    const matchesSite = siteFilter === 'All Sites' || a.roster?.site?.name === siteFilter;
    const guardName = a.guard ? `${a.guard.firstName} ${a.guard.lastName}`.toLowerCase() : '';
    const siteName = (a.roster?.site?.name || '').toLowerCase();
    const matchesSearch = guardName.includes(searchQuery.toLowerCase()) || siteName.includes(searchQuery.toLowerCase());
    return matchesSite && matchesSearch;
  });

  const filteredLogs = safeLogs.filter(l => {
    if (role === 'CLIENT' && l.description?.includes('DEBUG')) return false;
    const matchesSite = siteFilter === 'All Sites' || l.mapPin?.patrolPath?.site?.name === siteFilter;
    const guardName = l.guard ? `${l.guard.firstName} ${l.guard.lastName}`.toLowerCase() : 'system';
    const desc = (l.description || '').toLowerCase();
    const pinLoc = (l.mapPin?.name || '').toLowerCase();
    const matchesSearch = guardName.includes(searchQuery.toLowerCase()) || desc.includes(searchQuery.toLowerCase()) || pinLoc.includes(searchQuery.toLowerCase());
    return matchesSite && matchesSearch;
  });

  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm">
      <div className="px-6 py-4 border-b border-[#E2E8F0] flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-[#F8FAFC]">
        <div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('attendance')}
              className={`text-[15px] font-bold pb-0.5 border-b-2 transition-colors ${activeTab === 'attendance' ? 'text-[#1E3A5F] border-[#1E3A5F]' : 'text-gray-400 border-transparent hover:text-gray-600'}`}
            >
              Live Guard Attendance
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={() => setActiveTab('incidents')}
              className={`text-[15px] font-bold pb-0.5 border-b-2 transition-colors ${activeTab === 'incidents' ? 'text-[#1E3A5F] border-[#1E3A5F]' : 'text-gray-400 border-transparent hover:text-gray-600'}`}
            >
              Patrol & Incident Logs
            </button>
          </div>
          <p className="text-[12px] text-gray-500 mt-1">
            {activeTab === 'attendance' ? 'Real-time guard check-ins and arrival punctuality stream.' : 'Real-time audit trail of field activities and security alerts.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <input
            type="text"
            placeholder="Search guard or site..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="border border-[#E2E8F0] rounded px-3 py-1.5 text-[13px] text-[#0F172A] outline-none focus:border-[#1E3A5F] w-[200px]"
          />
          <select
            value={siteFilter}
            onChange={e => setSiteFilter(e.target.value)}
            className="border border-[#E2E8F0] rounded px-3 py-1.5 text-[13px] text-gray-600 outline-none focus:border-[#1E3A5F]"
          >
            <option value="All Sites">All Sites</option>
            {uniqueSites.map((s: any) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        {activeTab === 'attendance' ? (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                <th className="px-6 py-3 text-[11px] font-bold text-[#475569] uppercase tracking-wider">Arrival Time</th>
                <th className="px-6 py-3 text-[11px] font-bold text-[#475569] uppercase tracking-wider">Guard</th>
                <th className="px-6 py-3 text-[11px] font-bold text-[#475569] uppercase tracking-wider">Site & Shift</th>
                <th className="px-6 py-3 text-[11px] font-bold text-[#475569] uppercase tracking-wider">Arrival Status</th>
                <th className="px-6 py-3 text-[11px] font-bold text-[#475569] uppercase tracking-wider">Check-In Location (GPS)</th>
              </tr>
            </thead>
            <tbody>
              {filteredAttendance.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-[13px] text-gray-400 font-medium">No real-time guard check-ins recorded yet.</td>
                </tr>
              ) : (
                filteredAttendance.map(item => (
                  <tr key={item.id} className="hover:bg-[#F8FAFC] border-b border-gray-100">
                    <td className="px-6 py-4 text-[13px] text-[#0F172A] font-medium">
                      {item.timestamp ? new Date(item.timestamp).toLocaleString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-[13px] text-[#0F172A]">
                        {item.guard ? `${item.guard.firstName || ''} ${item.guard.lastName || ''}`.trim() || 'Unknown Guard' : 'Unknown Guard'}
                      </div>
                      <div className="text-[11px] text-gray-400 font-mono">
                        {item.guard?.guardId || 'N/A'} {item.guard?.agency ? `• ${item.guard.agency.name}` : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-[13px] text-[#1E3A5F]">{item.roster?.site?.name || 'Unassigned Site'}</div>
                      <div className="text-[12px] text-gray-500">{item.roster?.shiftLabel || 'Shift'} ({item.roster?.startTime || ''} - {item.roster?.endTime || ''})</div>
                    </td>
                    <td className="px-6 py-4">
                      {(() => {
                        const s = (item.status || 'On Time').toLowerCase();
                        const isOnTime = s.includes('on') || s.includes('time');
                        return (
                          <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${isOnTime ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-800 border border-amber-300'}`}>
                            {item.status || 'On Time'}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-4 text-[12px] text-gray-500 font-mono">
                      {typeof item.latitude === 'number' && typeof item.longitude === 'number' ? (
                        <a href={`https://maps.google.com/?q=${item.latitude},${item.longitude}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 font-mono">
                          <MapPin className="w-3.5 h-3.5 text-blue-600" />
                          {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
                        </a>
                      ) : (
                        <span className="text-gray-400">Site Mobile Check-in</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC]">
                <th className="px-6 py-3 text-[12px] font-semibold text-[#6B7280]">Timestamp</th>
                <th className="px-6 py-3 text-[12px] font-semibold text-[#6B7280]">Type</th>
                <th className="px-6 py-3 text-[12px] font-semibold text-[#6B7280]">Description</th>
                <th className="px-6 py-3 text-[12px] font-semibold text-[#6B7280]">Personnel</th>
                <th className="px-6 py-3 text-[12px] font-semibold text-[#6B7280]">Status / Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-[13px] text-gray-500">No logs match your filters.</td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-[#F8FAFC] border-b border-gray-100">
                    <td className="px-6 py-4 text-[13px] text-gray-600">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      {log.isIncident ? (
                        <span className="text-[14px] font-medium text-[#C53030]">Incident</span>
                      ) : (
                        <span className="text-[14px] text-green-700">Routine</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-[14px] text-[#0F172A]">
                      {log.description || 'No description provided.'}
                      <span className="ml-1 text-[13px] text-gray-400">
                        {log.mapPin ? `(@ ${log.mapPin.name}${log.mapPin.patrolPath?.site ? `, ${log.mapPin.patrolPath.site.name}` : ''})` : ''}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[13px] text-gray-700 font-medium">{log.guard ? `${log.guard.firstName} ${log.guard.lastName}` : 'System'}</td>
                    <td className="px-6 py-4">
                      {log.resolved ? (
                        <div>
                          <span className="text-[13px] text-green-700 font-medium flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Resolved</span>
                          {log.resolutionNote && <p className="text-[11px] text-gray-500 mt-1 max-w-[200px] truncate" title={log.resolutionNote}>Note: {log.resolutionNote}</p>}
                        </div>
                      ) : (
                        log.isIncident ? (
                          isOps ? <button onClick={() => setIsResolving(log)} className="text-[12px] bg-blue-50 text-blue-600 px-3 py-1 rounded font-medium hover:bg-blue-100 border border-blue-200">Resolve</button> : <span className="text-[13px] text-orange-600 font-medium">Unresolved</span>
                        ) : (
                          <span className="text-[13px] text-gray-400">N/A</span>
                        )
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {isResolving && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-40 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleResolveSubmit} className="bg-white rounded-lg shadow-xl w-[500px] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b bg-[#F8FAFC]">
              <h3 className="text-lg font-semibold text-[#1E3A5F]">Resolve Incident</h3>
              <p className="text-[13px] text-gray-500 mt-1">Log resolution details for incident reported at {new Date(isResolving.timestamp).toLocaleString()}</p>
            </div>
            <div className="p-6 space-y-4">
              {errorMsg && <div className="text-red-600 text-sm font-medium">{errorMsg}</div>}
              <div className="p-3 bg-red-50 border border-red-100 rounded">
                <p className="text-[13px] text-gray-800"><span className="font-semibold">Guard:</span> {isResolving.guard ? `${isResolving.guard.firstName} ${isResolving.guard.lastName}` : 'System'}</p>
                <p className="text-[13px] text-gray-800 mt-1"><span className="font-semibold">Description:</span> {isResolving.description || 'None'}</p>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-2">Resolution Note & Actions Taken</label>
                <textarea
                  required
                  value={resolutionNote}
                  onChange={e => setResolutionNote(e.target.value)}
                  rows={4}
                  className="w-full border rounded px-3 py-2 text-[14px] focus:outline-none focus:border-blue-500 resize-none"
                  placeholder="Detail how this incident was resolved or why it is being dismissed..."
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-2">
              <button type="button" onClick={() => { setIsResolving(null); setResolutionNote(''); }} className="px-4 py-2 border rounded text-[13px] font-medium text-gray-600 bg-white hover:bg-gray-100">Cancel</button>
              <button type="submit" className="bg-blue-600 px-4 py-2 text-white text-[13px] font-medium rounded hover:bg-blue-700">Mark as Resolved</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
