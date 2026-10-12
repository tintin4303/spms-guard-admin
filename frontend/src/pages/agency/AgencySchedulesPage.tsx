import { useEffect, useState } from 'react';
import { fetchSchedules } from '../../api';

export default function AgencySchedulesPage() {
  const [schedules, setSchedules] = useState<any[]>([]);
  useEffect(() => {
    fetchSchedules().then(setSchedules).catch(console.error);
  }, []);

  return (
    <div className="bg-white rounded border border-[#E2E8F0] shadow-sm">
      <div className="px-6 py-4 border-b border-[#E2E8F0] flex justify-between items-center bg-[#F8FAFC]">
        <div>
          <h2 className="text-[18px] font-semibold text-[#1E3A5F]">Guard Schedules</h2>
          <p className="text-[13px] text-gray-500">Monitor upcoming shifts assigned to your agency's guards.</p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F8FAFC]">
              <th className="px-6 py-3 text-[12px] font-semibold text-[#6B7280]">Date &amp; Time</th>
              <th className="px-6 py-3 text-[12px] font-semibold text-[#6B7280]">Contract Site</th>
              <th className="px-6 py-3 text-[12px] font-semibold text-[#6B7280]">Assigned Guard</th>
              <th className="px-6 py-3 text-[12px] font-semibold text-[#6B7280]">Status</th>
            </tr>
          </thead>
          <tbody>
            {schedules.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-[13px] text-gray-500">No shift schedules found.</td>
              </tr>
            ) : (
              schedules.map(sched => (
                <tr key={sched.id} className="hover:bg-[#F8FAFC] border-b border-gray-100">
                  <td className="px-6 py-4">
                    <p className="text-[14px] font-medium text-[#0F172A]">{sched.shiftLabel}</p>
                  </td>
                  <td className="px-6 py-4 text-[14px] text-[#475569]">{sched.site?.name} ({sched.site?.contract?.clientCompanyName})</td>
                  <td className="px-6 py-4 text-[14px] text-[#475569]">{sched.guard?.guardId} ({sched.guard?.firstName} {sched.guard?.lastName})</td>
                  <td className="px-6 py-4">
                    <span className={`text-[14px] ${sched.status === 'Pending Reassignment' ? 'text-orange-600' : 'text-green-700'}`}>
                      {sched.status || 'Active'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
