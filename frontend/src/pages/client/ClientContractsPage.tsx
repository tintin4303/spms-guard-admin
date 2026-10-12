import { useEffect, useState } from 'react';
import { fetchContracts } from '../../api';
import Pagination from '../../components/common/Pagination';

interface ClientContractsProps {
  user?: any;
}

export default function ClientContractsPage({ user }: ClientContractsProps) {
  const [contracts, setContracts] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(contracts.length / itemsPerPage);
  const paginatedContracts = contracts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    fetchContracts(user?.id).then(setContracts).catch(console.error);
  }, [user]);

  return (
    <div className="bg-white rounded border border-[#E2E8F0] shadow-sm relative z-0">
      <div className="px-6 py-4 border-b border-[#E2E8F0] flex justify-between items-center bg-[#F8FAFC]">
        <div>
          <h2 className="text-[18px] font-semibold text-[#1E3A5F]">Active Contracts</h2>
          <p className="text-[13px] text-gray-500 mt-1">Oversight of your active service locations and guard requirements.</p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F8FAFC]">
              <th className="px-6 py-3 text-[12px] font-semibold text-[#6B7280]">Contract ID</th>
              <th className="px-6 py-3 text-[12px] font-semibold text-[#6B7280]">Client Entity</th>
              <th className="px-6 py-3 text-[12px] font-semibold text-[#6B7280]">Duration</th>
              <th className="px-6 py-3 text-[12px] font-semibold text-[#6B7280]">Location Details</th>
              <th className="px-6 py-3 text-[12px] font-semibold text-[#6B7280]">Status</th>
            </tr>
          </thead>
          <tbody>
            {contracts.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-[13px] text-[#6B7280]">No active contracts found.</td>
              </tr>
            ) : (
              paginatedContracts.map((c) => (
                <tr key={c.id} className="hover:bg-[#F8FAFC] border-b border-gray-100 last:border-0">
                  <td className="px-6 py-4 text-[12px] font-medium text-blue-600">{c.id.substring(0, 8).toUpperCase()}</td>
                  <td className="px-6 py-4 text-[14px] font-medium text-[#0F172A]">{c.client?.name || 'My Company'}</td>
                  <td className="px-6 py-4 text-[14px] text-[#475569]">{new Date(c.startDate).toLocaleDateString()} — {new Date(c.endDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-[14px] text-[#475569]">{c.sites?.[0]?.name ? c.sites[0].name : 'Primary Facility'} <span className="text-gray-400 text-[12px]">({c.sites?.[0]?.address || 'Registered Address'})</span></td>
                  <td className="px-6 py-4 text-[14px] font-medium text-green-700">Active</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
    </div>
  );
}
