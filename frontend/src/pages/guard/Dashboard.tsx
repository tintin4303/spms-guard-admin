import { useEffect, useState } from 'react';
import { fetchGuardShifts } from '../../api';

export default function GuardDashboard() {
  const [nextShift, setNextShift] = useState<any>(null);

  useEffect(() => {
    fetchGuardShifts().then((shifts: any[]) => {
      // Find the next scheduled or in-progress shift
      const active = shifts.find(s => s.status !== 'Completed' && !s.status.startsWith('Completed'));
      setNextShift(active || shifts[0]);
    }).catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[24px] font-bold text-[#1E3A5F]">Guard Dashboard</h2>
        <p className="text-[14px] text-[#6B7280] mt-1">Your upcoming schedule.</p>
      </div>

      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E2E8F0] bg-[#F8FAFC]">
          <h3 className="text-[16px] font-bold text-[#1E3A5F]">Current / Next Shift</h3>
        </div>
        <div className="p-6">
          {nextShift ? (
            <div>
              <p className="text-[18px] font-semibold text-[#0F172A]">{nextShift.shiftLabel}</p>
              <p className="text-[14px] text-gray-600 mt-1">Location: {nextShift.site?.name}</p>
              <p className="text-[14px] text-gray-600">Time: {nextShift.startTime} - {nextShift.endTime}</p>
              <div className="mt-4 inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded font-medium text-[13px]">
                Status: {nextShift.status}
              </div>
            </div>
          ) : (
            <p className="text-[14px] text-gray-500">No upcoming shifts found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
