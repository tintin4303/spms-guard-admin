import { useEffect, useState } from 'react';
import { fetchGuardShifts, fetchGuardMetrics } from '../../api';

export default function GuardDashboard() {
  const [nextShift, setNextShift] = useState<any>(null);
  const [completedShiftsList, setCompletedShiftsList] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const user = JSON.parse(localStorage.getItem('spms_user') || '{}');

  useEffect(() => {
    fetchGuardShifts().then((shifts: any[]) => {
      const active = shifts.find(s => s.status !== 'Completed' && !s.status.startsWith('Completed'));
      setNextShift(active || shifts[0]);
      
      const completed = shifts.filter(s => s.status.startsWith('Completed')).slice(0, 5);
      setCompletedShiftsList(completed);
    }).catch(console.error);

    fetchGuardMetrics().then(setMetrics).catch(console.error);
  }, []);

  const getNavUrl = (site: any) => {
    if (site?.latitude && site?.longitude) return `https://maps.google.com/?q=${site.latitude},${site.longitude}`;
    if (site?.address) return `https://maps.google.com/?q=${encodeURIComponent(site.address)}`;
    return null;
  };

  const navUrl = nextShift ? getNavUrl(nextShift.site) : null;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="px-4 sm:px-0">
        <h2 className="text-[20px] sm:text-[24px] font-bold text-[#1E3A5F]">
          Welcome back, {user.name || 'Guard'}
        </h2>
        <p className="text-[13px] sm:text-[14px] text-[#6B7280] mt-1">Your personal duty metrics and shift schedule overview.</p>
      </div>

      {/* Surface Guard Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 px-4 sm:px-0">
        <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-sm">
          <p className="text-[12px] font-semibold text-gray-500 uppercase">Completed Shifts</p>
          <p className="text-[24px] font-bold text-[#1E3A5F] mt-1">{metrics?.completedShifts ?? 0}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-sm">
          <p className="text-[12px] font-semibold text-gray-500 uppercase">Total Duty Hours</p>
          <p className="text-[24px] font-bold text-[#1E3A5F] mt-1">{metrics?.totalHours ?? 0} hrs</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-sm">
          <p className="text-[12px] font-semibold text-gray-500 uppercase">Incidents Reported</p>
          <p className="text-[24px] font-bold text-orange-600 mt-1">{metrics?.incidentsReported ?? 0}</p>
        </div>
      </div>

      {/* Active / Next Shift Card */}
      <div className="bg-white mx-4 sm:mx-0 rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-[#E2E8F0] bg-[#F8FAFC]">
          <h3 className="text-[15px] sm:text-[16px] font-bold text-[#1E3A5F]">Current / Next Shift</h3>
        </div>
        <div className="p-4 sm:p-6 flex flex-col items-start space-y-3">
          {nextShift ? (
            <div className="w-full">
              <p className="text-[16px] sm:text-[18px] font-semibold text-[#0F172A]">{nextShift.shiftLabel}</p>
              <p className="text-[13px] sm:text-[14px] text-gray-600 mt-1">Location: {nextShift.site?.name}</p>
              <p className="text-[13px] sm:text-[14px] text-gray-600 mt-1 mb-2">Time: {nextShift.startTime} - {nextShift.endTime}</p>
              
              {navUrl && (
                <a href={navUrl} target="_blank" rel="noreferrer" className="w-full sm:w-auto mt-2 inline-flex items-center justify-center bg-blue-600 text-white rounded text-sm px-4 py-2 font-medium hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-sm">
                  Navigate to Site
                </a>
              )}

              <div className="mt-4 block w-max px-3 py-1 bg-blue-100 text-blue-800 rounded font-medium text-[12px] sm:text-[13px]">
                Status: {nextShift.status}
              </div>
            </div>
          ) : (
            <p className="text-[14px] text-gray-500">No upcoming shifts found.</p>
          )}
        </div>
      </div>

      {/* Recent Shift History */}
      <div className="bg-white mx-4 sm:mx-0 rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-[#E2E8F0] bg-[#F8FAFC]">
          <h3 className="text-[15px] sm:text-[16px] font-bold text-[#1E3A5F]">Recent Completed Shifts</h3>
        </div>
        <div className="p-4 sm:p-6 space-y-3">
          {completedShiftsList.length > 0 ? (
            completedShiftsList.map((s) => (
              <div key={s.id} className="flex justify-between items-center border-b pb-2 last:border-0 last:pb-0">
                <div>
                  <p className="text-[13px] font-medium text-[#0F172A]">{s.site?.name || 'Site'}</p>
                  <p className="text-[11px] text-gray-500">{s.date ? new Date(s.date).toLocaleDateString() : 'Date N/A'} • {s.startTime} - {s.endTime}</p>
                </div>
                <span className="text-[11px] bg-green-100 text-green-700 px-2 py-0.5 rounded font-medium">Completed</span>
              </div>
            ))
          ) : (
            <p className="text-[13px] text-gray-400">No shift history available.</p>
          )}
        </div>
      </div>
    </div>
  );
}
