import React, { useState, useEffect, useMemo } from 'react';
import Pagination from '../../components/common/Pagination';
import { fetchGuards, createGuard, updateGuard, deleteGuard } from '../../api';

export default function GuardsPage() {
  const [guards, setGuards] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [shiftFilter, setShiftFilter] = useState('All');
  const [genderFilter, setGenderFilter] = useState('All');

  const filteredGuards = useMemo(() => {
    return guards.filter(g => {
      const gName = (g.firstName + ' ' + g.lastName).toLowerCase();
      const agencyName = (g.agency?.name || 'In-House').toLowerCase();
      const matchesSearch = gName.includes(searchQuery.toLowerCase()) || 
                            g.guardId.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            agencyName.includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || g.status === statusFilter;
      const matchesShift = shiftFilter === 'All' || g.shiftPreference === shiftFilter;
      const matchesGender = genderFilter === 'All' || g.gender === genderFilter;
      return matchesSearch && matchesStatus && matchesShift && matchesGender;
    });
  }, [guards, searchQuery, statusFilter, shiftFilter, genderFilter]);

  const itemsPerPage = 10;
  const totalPages = Math.max(1, Math.ceil(filteredGuards.length / itemsPerPage));
  const paginatedGuards = filteredGuards.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultFormData = {
    firstName: '',
    lastName: '',
    guardId: `GRD-`,
    certificateNumber: '',
    gender: 'Not Specified',
    shiftPreference: 'Flexible',
    status: 'Active',
    contactNumber: '',
    certificationExpiry: '',
    skills: [] as string[]
  };

  const [formData, setFormData] = useState(defaultFormData);

  const loadGuards = () => {
    fetchGuards().then(setGuards).catch(console.error);
  };

  useEffect(() => { loadGuards(); }, []);

  const openCreate = () => {
    setEditingId(null);
    setFormData({ ...defaultFormData, guardId: `GRD-${Math.floor(Math.random() * 10000)}` });
    setIsCreating(true);
  };

  const openEdit = (g: any) => {
    setEditingId(g.id);
    setFormData({
      firstName: g.firstName || '',
      lastName: g.lastName || '',
      guardId: g.guardId || '',
      certificateNumber: g.certificateNumber || '',
      gender: g.gender || 'Not Specified',
      shiftPreference: g.shiftPreference || 'Flexible',
      status: g.status || 'Active',
      contactNumber: g.contactNumber || '',
      certificationExpiry: g.certificationExpiry ? g.certificationExpiry.split('T')[0] : '',
      skills: g.skills ? (Array.isArray(g.skills) ? g.skills : []) : [],
    });
    setIsCreating(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Offboard this guard?")) return;
    try {
      await deleteGuard(id);
      loadGuards();
    } catch (e) { console.error(e); }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsSubmitting(true);
    const dataToSend = {
      ...formData,
      skills: formData.skills && formData.skills.length > 0 ? formData.skills : null,
      certificationExpiry: formData.certificationExpiry ? new Date(formData.certificationExpiry).toISOString() : null
    };
    try {
      if (editingId) {
        await updateGuard(editingId, dataToSend);
      } else {
        await createGuard(dataToSend);
      }
      setIsCreating(false);
      loadGuards();
    } catch (err) {
      alert("Error saving guard.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded border border-[#E2E8F0] shadow-sm">
        <div className="px-6 py-4 border-b border-[#E2E8F0] flex justify-between items-center bg-[#F8FAFC] gap-6">
          <div className="flex-shrink-0">
            <h2 className="text-[18px] font-semibold text-[#1E3A5F]">Guard Roster</h2>
            <p className="text-[13px] text-gray-500">Manage all registered guards.</p>
          </div>
          <div className="flex flex-1 items-center gap-2 justify-end">
            <input
              type="text"
              placeholder="Search ID, Name, Agency..."
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="border border-[#E2E8F0] rounded px-3 py-1.5 text-[13px] outline-none focus:border-[#1E3A5F] flex-1 max-w-[800px]"
            />
            <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }} className="border border-[#E2E8F0] rounded px-3 py-1.5 text-[13px] outline-none">
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
              <option value="Suspended">Suspended</option>
            </select>
            <select value={shiftFilter} onChange={e => { setShiftFilter(e.target.value); setCurrentPage(1); }} className="border border-[#E2E8F0] rounded px-3 py-1.5 text-[13px] outline-none">
              <option value="All">All Shifts</option>
              <option value="Flexible">Flexible</option>
              <option value="Day">Day</option>
              <option value="Night">Night</option>
            </select>
            <select value={genderFilter} onChange={e => { setGenderFilter(e.target.value); setCurrentPage(1); }} className="border border-[#E2E8F0] rounded px-3 py-1.5 text-[13px] outline-none">
              <option value="All">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
            <button onClick={openCreate} className="bg-[#1E3A5F] text-white px-4 py-2 rounded text-[13px] font-medium hover:bg-[#162D4A] transition-colors ml-2">
              + Onboard Guard
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC]">
                <th className="px-6 py-3 text-[12px] font-semibold text-[#6B7280]">Guard ID</th>
                <th className="px-6 py-3 text-[12px] font-semibold text-[#6B7280]">Name</th>
                <th className="px-6 py-3 text-[12px] font-semibold text-[#6B7280]">Gender</th>
                <th className="px-6 py-3 text-[12px] font-semibold text-[#6B7280]">Agency</th>
                <th className="px-6 py-3 text-[12px] font-semibold text-[#6B7280]">Certification</th>
                <th className="px-6 py-3 text-[12px] font-semibold text-[#6B7280]">Status</th>
                <th className="px-6 py-3 text-[12px] font-semibold text-[#6B7280]">Shift Preference</th>
                <th className="px-6 py-3 text-[12px] font-semibold text-[#6B7280]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredGuards.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-[13px] text-[#6B7280]">No guards match your search filters.</td>
                </tr>
              ) : (
                paginatedGuards.map((g) => (
                  <tr key={g.id} className="hover:bg-[#F8FAFC]">
                    <td className="px-6 py-4 text-[14px] font-medium text-[#1E3A5F]">{g.guardId}</td>
                    <td className="px-6 py-4 text-[14px] text-[#0F172A] font-medium">
                      {g.firstName} {g.lastName}
                    </td>
                    <td className="px-6 py-4 text-[14px]">
                      {g.gender && g.gender !== 'Not Specified' ? (
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-700 border border-gray-200">
                          {g.gender}
                        </span>
                      ) : (
                        <span className="text-[12px] text-gray-400">Not Specified</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {g.source === 'AGENCY' ? (
                        <span className="text-[12px] font-medium text-purple-700 bg-purple-100 px-2 py-1 rounded">{g.agency?.name || 'Agency'}</span>
                      ) : (
                        <span className="text-[12px] font-medium text-blue-700 bg-blue-100 px-2 py-1 rounded">In-House</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-[14px] text-[#475569]">
                      <div>{g.certificateNumber || 'N/A'}</div>
                      {g.certificationExpiry && new Date(g.certificationExpiry) < new Date() && (
                        <div className="text-[12px] text-red-600 font-medium">Expired</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-[14px] text-[#475569]">{g.status}</td>
                    <td className="px-6 py-4 text-[14px] text-[#475569] font-medium">{g.shiftPreference || 'Flexible'}</td>
                    <td className="px-6 py-4 flex gap-2">
                      <button onClick={() => openEdit(g)} className="text-[13px] text-blue-600 hover:underline">Edit</button>
                      <button onClick={() => handleDelete(g.id)} className="text-[13px] text-red-600 hover:underline">Offboard</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>

      {isCreating && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-40 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl w-[500px] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b bg-[#F8FAFC]">
              <h3 className="text-lg font-semibold text-[#1E3A5F]">{editingId ? 'Edit Guard Profile' : 'Onboard New Guard'}</h3>
              <p className="text-[13px] text-gray-500 mt-1">Register their personnel data into the operations schema.</p>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-medium text-gray-700 mb-1">First Name</label>
                  <input required value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} className="w-full border rounded px-3 py-2 text-[14px] focus:outline-none focus:ring-1 focus:ring-[#1E3A5F]" />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-gray-700 mb-1">Last Name</label>
                  <input required value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} className="w-full border rounded px-3 py-2 text-[14px] focus:outline-none focus:ring-1 focus:ring-[#1E3A5F]" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-medium text-gray-700 mb-1">Generated ID</label>
                  <input disabled value={formData.guardId} className="w-full border rounded px-3 py-2 text-[14px] bg-gray-100 text-gray-500" />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-gray-700 mb-1">Certificate # (Optional)</label>
                  <input value={formData.certificateNumber} onChange={e => setFormData({ ...formData, certificateNumber: e.target.value })} className="w-full border rounded px-3 py-2 text-[14px] focus:outline-none focus:ring-1 focus:ring-[#1E3A5F]" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-medium text-gray-700 mb-1">Gender</label>
                  <select value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })} className="w-full border rounded px-3 py-2 text-[14px] focus:outline-none focus:ring-1 focus:ring-[#1E3A5F]">
                    <option value="Not Specified">Not Specified</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-gray-700 mb-1">Shift Preferences</label>
                  <select value={formData.shiftPreference} onChange={e => setFormData({ ...formData, shiftPreference: e.target.value })} className="w-full border rounded px-3 py-2 text-[14px] focus:outline-none focus:ring-1 focus:ring-[#1E3A5F]">
                    <option value="Flexible">Flexible</option>
                    <option value="Day">Day Shifts Only</option>
                    <option value="Night">Night Shifts Only</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-medium text-gray-700 mb-1">Status</label>
                  <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full border rounded px-3 py-2 text-[14px] focus:outline-none focus:ring-1 focus:ring-[#1E3A5F]">
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-gray-700 mb-1">Contact Number</label>
                  <input value={formData.contactNumber} onChange={e => setFormData({ ...formData, contactNumber: e.target.value })} className="w-full border rounded px-3 py-2 text-[14px] focus:outline-none focus:ring-1 focus:ring-[#1E3A5F]" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-medium text-gray-700 mb-1">Cert Expiry Date</label>
                  <input type="date" value={formData.certificationExpiry} onChange={e => setFormData({ ...formData, certificationExpiry: e.target.value })} className="w-full border rounded px-3 py-2 text-[14px] focus:outline-none focus:ring-1 focus:ring-[#1E3A5F]" />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-gray-700 mb-1">Skills (Press Enter to add)</label>
                  <div className="w-full border rounded px-2 py-1.5 focus-within:ring-1 focus-within:ring-[#1E3A5F] flex flex-wrap gap-1.5 items-center bg-white text-[14px]">
                    {formData.skills.map((s: string) => (
                      <span key={s} className="bg-blue-100 text-[#1E3A5F] font-medium text-[12px] px-2 py-0.5 rounded flex items-center gap-1 leading-none shadow-sm">
                        {s}
                        <button type="button" onClick={() => setFormData({ ...formData, skills: formData.skills.filter((sk: string) => sk !== s) })} className="text-blue-500 hover:text-red-500 outline-none leading-none pt-0.5">&times;</button>
                      </span>
                    ))}
                    <input
                      type="text"
                      placeholder={formData.skills.length === 0 ? "e.g. First Aid, Armed" : ""}
                      className="flex-1 min-w-[100px] outline-none border-none p-0 focus:ring-0 text-[13px] h-[24px]"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const val = e.currentTarget.value.trim();
                          if (val && !formData.skills.includes(val)) {
                            setFormData({ ...formData, skills: [...formData.skills, val] });
                          }
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-2">
              <button type="button" onClick={() => setIsCreating(false)} className="px-4 py-2 border rounded text-[13px] font-medium text-gray-600 hover:bg-gray-100 bg-white">Cancel</button>
              <button type="submit" disabled={isSubmitting} className="bg-[#1E3A5F] px-4 py-2 text-white text-[13px] font-medium rounded hover:bg-[#162D4A] disabled:opacity-50">
                {isSubmitting ? 'Syncing...' : (editingId ? 'Save Changes' : 'Confirm Onboarding')}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

