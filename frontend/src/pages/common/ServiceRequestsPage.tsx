import { useState } from 'react';

export default function ServiceRequestsPage() {
  const [requests] = useState([
    { id: 1042, type: 'Maintenance', description: 'North Gate lock malfunctioning. Needs immediate repair.', status: 'Pending', date: '2026-08-18' },
    { id: 1038, type: 'Coverage Request', description: 'Need 2 extra guards for the upcoming weekend event.', status: 'Approved', date: '2026-08-15' },
    { id: 1011, type: 'Feedback', description: 'Night shift guards are doing an excellent job with the perimeter checks.', status: 'Closed', date: '2026-08-10' }
  ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-[24px] font-bold font-serif text-[#1E3A5F]">Service Requests</h2>
          <p className="text-[14px] text-gray-500 mt-1">Submit tickets for additional coverage or report site issues directly to Ops.</p>
        </div>
        <button className="bg-[#2563EB] text-white px-5 py-2.5 rounded text-[13px] font-medium hover:bg-blue-700 transition-colors shadow-sm">
          + New Request
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-[#F8FAFC]">
              <th className="px-6 py-4 text-[12px] font-semibold text-[#6B7280]">TICKET ID</th>
              <th className="px-6 py-4 text-[12px] font-semibold text-[#6B7280]">CATEGORY</th>
              <th className="px-6 py-4 text-[12px] font-semibold text-[#6B7280]">DESCRIPTION</th>
              <th className="px-6 py-4 text-[12px] font-semibold text-[#6B7280]">SUBMITTED</th>
              <th className="px-6 py-4 text-[12px] font-semibold text-[#6B7280] text-center">STATUS</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(r => (
              <tr key={r.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-[13px] font-mono font-medium text-blue-600">REQ-{r.id}</td>
                <td className="px-6 py-4 text-[14px] text-gray-900 font-medium">{r.type}</td>
                <td className="px-6 py-4 text-[14px] text-gray-600 max-w-[300px] truncate">{r.description}</td>
                <td className="px-6 py-4 text-[13px] text-gray-500">{r.date}</td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${r.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                    r.status === 'Approved' ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
