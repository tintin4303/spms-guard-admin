import { useEffect, useState } from 'react';
import { fetchGuards } from '../../api';

export default function ClientGuardsPage() {
  const [guards, setGuards] = useState<any[]>([]);
  useEffect(() => { 
    fetchGuards().then(setGuards).catch(console.error); 
  }, []);

  return (
    <div className="bg-white rounded border border-[#E2E8F0] shadow-sm">
      <div className="px-6 py-4 border-b border-[#E2E8F0]">
        <h2 className="text-[18px] font-semibold font-serif text-[#1E3A5F]">Assigned Guard Personnel</h2>
        <p className="text-[13px] text-gray-500">View the certified personnel assigned to your properties.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F8FAFC]">
              <th className="px-6 py-3 text-[12px] font-semibold text-[#6B7280]">Guard ID</th>
              <th className="px-6 py-3 text-[12px] font-semibold text-[#6B7280]">Name</th>
              <th className="px-6 py-3 text-[12px] font-semibold text-[#6B7280]">Gender</th>
              <th className="px-6 py-3 text-[12px] font-semibold text-[#6B7280]">Status</th>
            </tr>
          </thead>
          <tbody>
            {guards.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500 text-[13px]">
                  No guards assigned to your properties.
                </td>
              </tr>
            ) : (
              guards.map(g => (
                <tr key={g.id} className="hover:bg-[#F8FAFC] border-t border-gray-100">
                  <td className="px-6 py-4 text-[14px] text-gray-500 font-medium italic">ID HIDDEN</td>
                  <td className="px-6 py-4 text-[14px]">{g.firstName} {g.lastName?.[0] || '?'}.</td>
                  <td className="px-6 py-4 text-[14px]">
                    {g.gender && g.gender !== 'Not Specified' ? (
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-700 border border-gray-200">
                        {g.gender}
                      </span>
                    ) : (
                      <span className="text-[12px] text-gray-400">Not Specified</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-[14px] text-green-700">{g.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
