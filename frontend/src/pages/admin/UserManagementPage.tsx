import { useEffect, useState } from 'react';
import { fetchUsers, createUser, deleteUser } from '../../api';
import Pagination from '../../components/common/Pagination';

export default function UserManagementPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(users.length / itemsPerPage);
  const paginatedUsers = users.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const [isCreating, setIsCreating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('CLIENT');

  // Client Specific Fields
  const [clientType, setClientType] = useState('นิติบุคคล');
  const [taxId, setTaxId] = useState('');
  const [registeredNameTh, setRegisteredNameTh] = useState('');
  const [registeredNameEn, setRegisteredNameEn] = useState('');
  const [address, setAddress] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [lineId, setLineId] = useState('');

  const loadUsers = () => fetchUsers().then(setUsers).catch(console.error);
  useEffect(() => { loadUsers(); }, []);

  const handleCreate = async (e: any) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const data: any = { email, name, role, password };
      if (role === 'CLIENT') {
        data.clientType = clientType;
        data.taxId = taxId;
        data.registeredNameTh = registeredNameTh;
        data.registeredNameEn = registeredNameEn;
        data.address = address;
        data.contactPerson = contactPerson;
        data.phone = phone;
        data.lineId = lineId;
      }
      await createUser(data);

      // Reset form on success
      setEmail('');
      setName('');
      setPassword('');
      setRole('CLIENT');
      setClientType('นิติบุคคล');
      setTaxId('');
      setRegisteredNameTh('');
      setRegisteredNameEn('');
      setAddress('');
      setContactPerson('');
      setPhone('');
      setLineId('');

      setIsCreating(false);
      loadUsers();
    } catch (err: any) {
      alert("Failed to provision account (potentially duplicate email)");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Erase this system account?")) return;
    await deleteUser(id);
    loadUsers();
  };

  return (
    <>
      <div className="bg-white rounded border border-[#E2E8F0] shadow-sm">
        <div className="px-6 py-4 border-b border-[#E2E8F0] flex justify-between items-center">
          <div>
            <h2 className="text-[18px] font-semibold text-[#0F172A]">User Account Registry</h2>
            <p className="text-[13px] text-gray-500">Global identity store for all system capabilities.</p>
          </div>
          <button onClick={() => setIsCreating(true)} className="bg-red-600 text-white px-4 py-2 rounded text-[13px] font-medium hover:bg-red-700 transition">
            + Provision Account
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC]">
                <th className="px-6 py-3 text-[12px] font-semibold text-[#6B7280]">Account Reference</th>
                <th className="px-6 py-3 text-[12px] font-semibold text-[#6B7280]">System Role</th>
                <th className="px-6 py-3 text-[12px] font-semibold text-[#6B7280]">Email Address</th>
                <th className="px-6 py-3 text-[12px] font-semibold text-[#6B7280]">Date Provisioned</th>
                <th className="px-6 py-3 text-[12px] font-semibold text-[#6B7280]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map(u => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-[14px] font-medium text-[#0F172A]">{u.name}</td>
                  <td className="px-6 py-4 text-[14px] text-gray-600">{u.role}</td>
                  <td className="px-6 py-4 text-[14px] text-gray-500">{u.email}</td>
                  <td className="px-6 py-4 text-[14px] text-gray-400">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'System Genesis'} 
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => handleDelete(u.id)} className="text-[13px] text-red-500 hover:underline">Revoke Access</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>

      {isCreating && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreate} className="bg-white rounded-lg shadow-xl w-[500px] flex flex-col overflow-hidden max-h-[85vh]">
            <div className="p-6 border-b shrink-0">
              <h3 className="text-lg font-bold text-[#0F172A]">Provision Account</h3>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
              <div>
                <label className="block text-[13px] font-medium mb-1">Full Name</label>
                <input required value={name} onChange={e => setName(e.target.value)} className="w-full border rounded px-3 py-2 text-[14px]" />
              </div>
              <div>
                <label className="block text-[13px] font-medium mb-1">Email Address</label>
                <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full border rounded px-3 py-2 text-[14px]" />
              </div>
              <div>
                <label className="block text-[13px] font-medium mb-1">Password</label>
                <input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full border rounded px-3 py-2 text-[14px]" />
              </div>
              <div>
                <label className="block text-[13px] font-medium mb-1">Authorization Privilege (Role)</label>
                <select value={role} onChange={e => setRole(e.target.value)} className="w-full border rounded px-3 py-2 text-[14px]">
                  <option value="CLIENT">Client</option>
                  <option value="AGENCY_MANAGER">Agency Manager</option>
                  <option value="OPERATION_MANAGER">Operation Manager</option>
                  <option value="ADMIN">System Admin</option>
                </select>
              </div>

              {role === 'CLIENT' && (
                <div className="pt-4 border-t mt-4">
                  <h4 className="text-[14px] font-semibold text-[#1E3A5F] mb-3">Client & Company Identity</h4>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[13px] font-medium mb-1">Client Type</label>
                        <select value={clientType} onChange={e => setClientType(e.target.value)} className="w-full border rounded px-3 py-2 text-[14px]">
                          <option value="นิติบุคคล">นิติบุคคล (Corporate)</option>
                          <option value="บุคคลธรรมดา">บุคคลธรรมดา (Individual)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[13px] font-medium mb-1">Tax ID (13 หลัก)</label>
                        <input value={taxId} onChange={e => setTaxId(e.target.value)} className="w-full border rounded px-3 py-2 text-[14px]" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[13px] font-medium mb-1">Registered Name (Thai)</label>
                        <input value={registeredNameTh} onChange={e => setRegisteredNameTh(e.target.value)} className="w-full border rounded px-3 py-2 text-[14px]" />
                      </div>
                      <div>
                        <label className="block text-[13px] font-medium mb-1">Registered Name (English)</label>
                        <input value={registeredNameEn} onChange={e => setRegisteredNameEn(e.target.value)} className="w-full border rounded px-3 py-2 text-[14px]" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[13px] font-medium mb-1">Full Address</label>
                      <input value={address} onChange={e => setAddress(e.target.value)} placeholder="เลขที่/หมู่/ซอย/ถนน, ตำบล, อำเภอ, จังหวัด, รหัสไปรษณีย์" className="w-full border rounded px-3 py-2 text-[14px]" />
                    </div>

                    <h4 className="text-[14px] font-semibold text-[#1E3A5F] mb-3 mt-4 pt-4 border-t">Contact Info</h4>
                    <div>
                      <label className="block text-[13px] font-medium mb-1">Primary Contact Person & Role</label>
                      <input value={contactPerson} onChange={e => setContactPerson(e.target.value)} className="w-full border rounded px-3 py-2 text-[14px]" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[13px] font-medium mb-1">Phone Number</label>
                        <input value={phone} onChange={e => setPhone(e.target.value)} className="w-full border rounded px-3 py-2 text-[14px]" />
                      </div>
                      <div>
                        <label className="block text-[13px] font-medium mb-1">LINE ID</label>
                        <input value={lineId} onChange={e => setLineId(e.target.value)} className="w-full border rounded px-3 py-2 text-[14px]" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="p-6 bg-gray-50 border-t flex justify-end gap-2 shrink-0">
              <button type="button" onClick={() => setIsCreating(false)} className="px-4 py-2 border rounded font-medium text-[13px]">Cancel</button>
              <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-red-600 text-white font-medium text-[13px] rounded hover:bg-red-700 disabled:opacity-50">
                {isSubmitting ? 'Provisioning...' : 'Provision Resource'}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
