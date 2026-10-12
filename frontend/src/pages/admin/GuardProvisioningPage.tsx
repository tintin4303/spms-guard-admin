import { useEffect, useState } from 'react';
import { fetchGuards, provisionGuardAccount } from '../../api';
import Pagination from '../../components/common/Pagination';

export default function GuardProvisioningPage() {
  const [guards, setGuards] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(guards.length / itemsPerPage);
  const paginatedGuards = guards.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const [isProvisioning, setIsProvisioning] = useState(false);
  const [selectedGuard, setSelectedGuard] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const loadGuards = async () => {
    try {
      const data = await fetchGuards();
      setGuards(data);
    } catch (e) { 
      console.error(e); 
    }
  };

  useEffect(() => { 
    loadGuards(); 
  }, []);

  const handleProvision = async (e: any) => {
    e.preventDefault();
    if (!selectedGuard) return;
    try {
      await provisionGuardAccount(selectedGuard.id, { email, password });
      setIsProvisioning(false);
      loadGuards();
      alert('Guard account provisioned successfully.');
    } catch (e) {
      alert('Failed to provision account. Email might be in use.');
    }
  };

  return (
    <>
      <div className="bg-white rounded border border-[#E2E8F0] shadow-sm">
        <div className="px-6 py-4 border-b border-[#E2E8F0]">
          <h2 className="text-[18px] font-semibold text-[#0F172A]">Guard Provisioning</h2>
          <p className="text-[13px] text-gray-500">Review guards added by Ops/Agencies and provision their login accounts.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC]">
                <th className="px-6 py-3 text-[12px] font-semibold text-[#6B7280]">Guard ID</th>
                <th className="px-6 py-3 text-[12px] font-semibold text-[#6B7280]">Name</th>
                <th className="px-6 py-3 text-[12px] font-semibold text-[#6B7280]">Gender</th>
                <th className="px-6 py-3 text-[12px] font-semibold text-[#6B7280]">Source</th>
                <th className="px-6 py-3 text-[12px] font-semibold text-[#6B7280]">Account Status</th>
                <th className="px-6 py-3 text-[12px] font-semibold text-[#6B7280]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedGuards.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-[13px] text-gray-500">No guards found in the system.</td>
                </tr>
              ) : paginatedGuards.map(g => (
                <tr key={g.id} className="hover:bg-gray-50 border-b last:border-0 border-gray-100">
                  <td className="px-6 py-4 text-[14px] font-medium text-[#0F172A]">{g.guardId}</td>
                  <td className="px-6 py-4 text-[14px] text-gray-600 font-medium">{g.firstName} {g.lastName}</td>
                  <td className="px-6 py-4 text-[14px]">
                    {g.gender && g.gender !== 'Not Specified' ? (
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-700 border border-gray-200">
                        {g.gender}
                      </span>
                    ) : (
                      <span className="text-[12px] text-gray-400">Not Specified</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-[14px] text-gray-500">{g.source === 'AGENCY' ? g.agency?.name : 'In-House'}</td>
                  <td className="px-6 py-4">
                    {g.user ? (
                      <span className="inline-flex items-center px-2 py-1 rounded text-[11px] font-medium bg-green-100 text-green-700">
                        Provisioned ({g.user.email})
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded text-[11px] font-medium bg-gray-100 text-gray-600">
                        No Account
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {!g.user && (
                      <button 
                        onClick={() => { setSelectedGuard(g); setEmail(''); setPassword(''); setIsProvisioning(true); }}
                        className="text-[13px] text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Provision
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>

      {isProvisioning && selectedGuard && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleProvision} className="bg-white rounded shadow-xl w-[450px]">
            <div className="p-6 border-b">
              <h3 className="text-lg font-bold text-[#0F172A]">Provision Account for {selectedGuard.guardId}</h3>
              <p className="text-[13px] text-gray-500 mt-1">{selectedGuard.firstName} {selectedGuard.lastName}</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-[13px] font-medium mb-1">Email Address (Login ID)</label>
                <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full border rounded px-3 py-2 text-[14px]" placeholder="guard@example.com" />
              </div>
              <div>
                <label className="block text-[13px] font-medium mb-1">Temporary Password</label>
                <input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full border rounded px-3 py-2 text-[14px]" placeholder="••••••••" />
              </div>
            </div>
            <div className="p-6 bg-gray-50 border-t flex justify-end gap-2">
              <button type="button" onClick={() => setIsProvisioning(false)} className="px-4 py-2 border rounded font-medium text-[13px]">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-medium text-[13px] rounded hover:bg-blue-700">Create Account</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
