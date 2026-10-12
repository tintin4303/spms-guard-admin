import React, { useState, useEffect } from 'react';
import { MapPin, X, Check } from 'lucide-react';
import Pagination from '../../components/common/Pagination';
import SiteLocationPicker from '../../components/SiteLocationPicker';
import { fetchContracts, createContract, updateContract, deleteContract, fetchUsers } from '../../api';

export default function ContractsPage() {
  const [contracts, setContracts] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(contracts.length / itemsPerPage);
  const paginatedContracts = contracts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const [clients, setClients] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultFormData = {
    clientCompanyName: '',
    contactInfo: '',
    durationMonths: 12,
    clientId: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
    contractDate: new Date().toISOString().split('T')[0],
    scopeOfWork: '',
    liabilities: '',
    penalties: '',
    damages: '',
    terminationTerms: '',
    contractFileUrl: '',
    sites: [{ name: 'Corporate Campus', shiftCount: 2, baseStartTime: '08:00', shiftTimings: ['08:00 - 20:00', '20:00 - 08:00'], address: '', siteType: 'Warehouse', accessInstructions: '', knownHazards: '', guardsPerShift: 1, guardQualifications: '', latitude: null, longitude: null }]
  };

  const [formData, setFormData] = useState(defaultFormData);
  const [pickerSiteIndex, setPickerSiteIndex] = useState<number | null>(null);

  const loadContracts = () => {
    fetchContracts().then(setContracts).catch(console.error);
  };
  useEffect(() => {
    loadContracts();
    fetchUsers().then(users => setClients(users.filter((u: any) => u.role === 'CLIENT'))).catch(console.error);
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setFormData(defaultFormData);
    setIsCreating(true);
  };

  const openEdit = (c: any) => {
    setEditingId(c.id);
    setFormData({
      clientCompanyName: c.clientCompanyName,
      contactInfo: c.contactInfo,
      durationMonths: c.durationMonths,
      clientId: c.clientId,
      startDate: new Date(c.startDate).toISOString().split('T')[0],
      endDate: new Date(c.endDate).toISOString().split('T')[0],
      contractDate: c.contractDate ? new Date(c.contractDate).toISOString().split('T')[0] : '',
      scopeOfWork: c.scopeOfWork || '',
      liabilities: c.liabilities || '',
      penalties: c.penalties || '',
      damages: c.damages || '',
      terminationTerms: c.terminationTerms || '',
      contractFileUrl: c.contractFileUrl || '',
      sites: c.sites?.length > 0 ? c.sites.map((s: any) => ({
        name: s.name,
        shiftCount: s.shiftCount,
        baseStartTime: s.shiftTimings?.[0]?.split(' - ')[0] || '08:00',
        shiftTimings: s.shiftTimings || [],
        address: s.address || '',
        siteType: s.siteType || '',
        accessInstructions: s.accessInstructions || '',
        knownHazards: s.knownHazards || '',
        guardsPerShift: s.guardsPerShift || 1,
        guardQualifications: s.guardQualifications || '',
        latitude: s.latitude || null,
        longitude: s.longitude || null
      })) : defaultFormData.sites
    });
    setIsCreating(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this contract?")) return;
    try {
      await deleteContract(id);
      loadContracts();
    } catch (e) { console.error(e); }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingId) {
        await updateContract(editingId, formData);
      } else {
        await createContract(formData);
      }
      setIsCreating(false);
      loadContracts();
    } catch (err) {
      alert("Error saving contract.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateSiteField = (i: number, field: string, val: any) => {
    const newSites: any = [...formData.sites];
    newSites[i][field] = val;
    // Auto populate generic shift timings based on shiftCount change OR baseStartTime change
    if (field === 'shiftCount' || field === 'baseStartTime') {
      const shiftCount = newSites[i].shiftCount || 2;
      const baseStart = newSites[i].baseStartTime || '08:00';
      const hoursPerShift = 24 / shiftCount;

      let currentHour = parseInt(baseStart.split(':')[0]);
      const curMins = baseStart.split(':')[1] || '00';
      const timings = [];
      for (let s = 0; s < shiftCount; s++) {
        const sHour = currentHour % 24;
        const eHour = (currentHour + hoursPerShift) % 24;
        const sStr = `${sHour.toString().padStart(2, '0')}:${curMins}`;
        const eStr = `${eHour.toString().padStart(2, '0')}:${curMins}`;
        timings.push(`${sStr} - ${eStr}`);
        currentHour += hoursPerShift;
      }
      newSites[i].shiftTimings = timings;
    }
    setFormData({ ...formData, sites: newSites });
  };

  return (
    <>
      <div className="bg-white rounded border border-[#E2E8F0] shadow-sm relative z-0">
        <div className="px-6 py-4 border-b border-[#E2E8F0] flex justify-between items-center">
          <h2 className="text-[18px] font-semibold text-[#1E3A5F]">Active Operational Contracts</h2>
          <button
            onClick={openCreate}
            className="bg-[#1E3A5F] text-white px-4 py-2 rounded text-[13px] font-medium hover:bg-[#162D4A] transition-colors"
          >
            + New Contract Scope
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC]">
                <th className="px-6 py-3 text-[12px] font-semibold text-[#6B7280]">Client Entity</th>
                <th className="px-6 py-3 text-[12px] font-semibold text-[#6B7280]">Contact</th>
                <th className="px-6 py-3 text-[12px] font-semibold text-[#6B7280]">Duration</th>
                <th className="px-6 py-3 text-[12px] font-semibold text-[#6B7280]">Linked Sites</th>
                <th className="px-6 py-3 text-[12px] font-semibold text-[#6B7280]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {contracts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-[13px] text-[#6B7280]">No contracts provisioned.</td>
                </tr>
              ) : (
                paginatedContracts.map((c) => (
                  <tr key={c.id} className="hover:bg-[#F8FAFC]">
                    <td className="px-6 py-4 text-[14px] font-medium text-[#0F172A]">{c.clientCompanyName}</td>
                    <td className="px-6 py-4 text-[14px] text-[#475569]">{c.contactInfo}</td>
                    <td className="px-6 py-4 text-[14px] text-[#475569]">{c.durationMonths} Months</td>
                    <td className="px-6 py-4 text-[14px] text-[#1E3A5F] font-semibold">{c.sites?.length || 0}</td>
                    <td className="px-6 py-4 flex gap-2">
                      <button onClick={() => openEdit(c)} className="text-[13px] text-blue-600 hover:underline">Edit</button>
                      <button onClick={() => handleDelete(c.id)} className="text-[13px] text-red-600 hover:underline">Delete</button>
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
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl w-[600px] flex flex-col overflow-hidden max-h-[85vh]">
            <div className="px-6 py-4 border-b bg-[#F8FAFC] shrink-0">
              <h3 className="text-lg font-semibold text-[#1E3A5F]">{editingId ? 'Edit Contract' : 'Provision New Contract'}</h3>
              <p className="text-[13px] text-gray-500 mt-1">Configure client scope, geographical sites, and shift structures.</p>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-5">
              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1">Client Entity</label>
                <select
                  required
                  value={formData.clientId}
                  onChange={e => {
                    const selected = clients.find(c => c.id === e.target.value);
                    if (selected) {
                      setFormData({ ...formData, clientId: selected.id, clientCompanyName: selected.name || '', contactInfo: selected.email || '' });
                    } else {
                      setFormData({ ...formData, clientId: '', clientCompanyName: '', contactInfo: '' });
                    }
                  }}
                  className="w-full border rounded px-3 py-2 text-[14px] focus:outline-none focus:ring-1 focus:ring-[#1E3A5F]"
                >
                  <option value="">-- Select Existing Client --</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name || c.email}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-medium text-gray-700 mb-1">Contact Email/Phone (Auto)</label>
                  <input readOnly value={formData.contactInfo} className="w-full border rounded px-3 py-2 text-[14px] bg-gray-50 text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#1E3A5F]" />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-gray-700 mb-1">Duration (Months)</label>
                  <input required type="number" value={formData.durationMonths} onChange={e => setFormData({ ...formData, durationMonths: parseInt(e.target.value) })} className="w-full border rounded px-3 py-2 text-[14px] focus:outline-none focus:ring-1 focus:ring-[#1E3A5F]" />
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="text-[14px] font-semibold text-[#1E3A5F] mb-3">Service Scope & Terms</h4>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-1">Contract Execution Date</label>
                    <input type="date" value={formData.contractDate} onChange={e => setFormData({ ...formData, contractDate: e.target.value })} className="w-full border rounded px-3 py-2 text-[14px]" />
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-1">Scope of Work</label>
                    <input value={formData.scopeOfWork} onChange={e => setFormData({ ...formData, scopeOfWork: e.target.value })} className="w-full border rounded px-3 py-2 text-[14px]" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-1">Liabilities</label>
                    <input value={formData.liabilities} onChange={e => setFormData({ ...formData, liabilities: e.target.value })} placeholder="Responsibilities..." className="w-full border rounded px-3 py-2 text-[14px]" />
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-1">Penalties (Default fines)</label>
                    <input value={formData.penalties} onChange={e => setFormData({ ...formData, penalties: e.target.value })} className="w-full border rounded px-3 py-2 text-[14px]" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-1">Damages & Compensation</label>
                    <input value={formData.damages} onChange={e => setFormData({ ...formData, damages: e.target.value })} className="w-full border rounded px-3 py-2 text-[14px]" />
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-1">Termination Conditions</label>
                    <input value={formData.terminationTerms} onChange={e => setFormData({ ...formData, terminationTerms: e.target.value })} className="w-full border rounded px-3 py-2 text-[14px]" />
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t">
                <label className="block text-[15px] font-semibold text-[#1E3A5F] mb-1">Nested Patrol Sites & Shifts</label>

                {formData.sites.map((site: any, i: number) => (
                  <div key={i} className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50 relative">
                    {formData.sites.length > 1 && (
                      <button type="button" onClick={() => setFormData({ ...formData, sites: formData.sites.filter((_, idx) => idx !== i) })} className="absolute top-3 right-3 text-[11px] px-2 py-1 border border-red-200 text-red-500 rounded bg-white hover:bg-red-50">Remove Site</button>
                    )}

                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="block text-[12px] font-medium text-gray-700 mb-1">Site Name/Nickname</label>
                        <input required value={site.name} onChange={e => updateSiteField(i, 'name', e.target.value)} placeholder="e.g. Headquarters" className="w-full border rounded px-3 py-1.5 text-[14px]" />
                      </div>
                      <div>
                        <label className="block text-[12px] font-medium text-gray-700 mb-1">Site Type</label>
                        <select value={site.siteType} onChange={e => updateSiteField(i, 'siteType', e.target.value)} className="w-full border rounded px-3 py-1.5 text-[14px]">
                          <option value="Hospital">Hospital &amp; Healthcare</option>
                          <option value="University">University &amp; Campus</option>
                          <option value="School">School &amp; Educational Institute</option>
                          <option value="Government">Government &amp; Public Facility</option>
                          <option value="Hotel">Hotel &amp; Hospitality</option>
                          <option value="Industrial">Industrial &amp; Factory / Plant</option>
                          <option value="Bank">Bank &amp; Financial Branch</option>
                          <option value="Venue">Event Venue &amp; Stadium</option>
                          <option value="Residential">Residential / Condo / Housing</option>
                          <option value="Warehouse">Warehouse &amp; Logistics</option>
                          <option value="Retail">Retail &amp; Commercial Mall</option>
                          <option value="Construction">Construction Site</option>
                          <option value="Corporate">Corporate Office / Headquarters</option>
                        </select>
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="block text-[12px] font-medium text-gray-700 mb-1">Full Address & Geolocation</label>
                      <div className="flex gap-2">
                        <input value={site.address} onChange={e => updateSiteField(i, 'address', e.target.value)} placeholder="Physical address..." className="flex-1 border rounded px-3 py-1.5 text-[14px] bg-white" />
                        <button
                          type="button"
                          onClick={() => setPickerSiteIndex(i)}
                          className="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 rounded text-[12px] font-semibold flex items-center gap-1 shadow-sm shrink-0"
                        >
                          <MapPin className="w-3.5 h-3.5" />
                          {site.latitude && site.longitude ? `${site.latitude.toFixed(4)}, ${site.longitude.toFixed(4)}` : 'Pick Pin'}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <div>
                        <label className="block text-[12px] font-medium text-gray-700 mb-1">Guards Per Shift</label>
                        <input type="number" min={1} value={site.guardsPerShift} onChange={e => updateSiteField(i, 'guardsPerShift', parseInt(e.target.value) || 1)} className="w-full border rounded px-3 py-1.5 text-[14px]" />
                      </div>
                      <div>
                        <label className="block text-[12px] font-medium text-gray-700 mb-1">Gender Policy</label>
                        <select
                          value={site.guardQualifications?.toLowerCase().includes('female only') ? 'Female Only' : site.guardQualifications?.toLowerCase().includes('male only') ? 'Male Only' : 'Any'}
                          onChange={e => {
                            const val = e.target.value;
                            let current = (site.guardQualifications || '').replace(/Female Only|Male Only/gi, '').trim().replace(/^,\s*|,\s*$/g, '');
                            if (val !== 'Any') {
                              current = current ? `${val}, ${current}` : val;
                            }
                            updateSiteField(i, 'guardQualifications', current);
                          }}
                          className="w-full border rounded px-3 py-1.5 text-[14px] bg-white"
                        >
                          <option value="Any">Any Gender</option>
                          <option value="Female Only">Female Only</option>
                          <option value="Male Only">Male Only</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[12px] font-medium text-gray-700 mb-1">Required Qualifications</label>
                        <input value={site.guardQualifications} onChange={e => updateSiteField(i, 'guardQualifications', e.target.value)} placeholder="Armed, First-aid, etc." className="w-full border rounded px-3 py-1.5 text-[14px]" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="block text-[12px] font-medium text-gray-700 mb-1">Access Instructions</label>
                        <input value={site.accessInstructions} onChange={e => updateSiteField(i, 'accessInstructions', e.target.value)} placeholder="Gate codes, key pickup..." className="w-full border rounded px-3 py-1.5 text-[14px]" />
                      </div>
                      <div>
                        <label className="block text-[12px] font-medium text-gray-700 mb-1">Known Hazards</label>
                        <input value={site.knownHazards} onChange={e => updateSiteField(i, 'knownHazards', e.target.value)} placeholder="Blind spots, stray dogs..." className="w-full border rounded px-3 py-1.5 text-[14px]" />
                      </div>
                    </div>
                    <div className="mb-3 flex gap-4">
                      <div className="flex-1">
                        <label className="block text-[12px] font-medium text-gray-700 mb-1">Shift Cycle</label>
                        <select value={site.shiftCount} onChange={e => updateSiteField(i, 'shiftCount', parseInt(e.target.value))} className="w-full border rounded px-3 py-1.5 text-[14px]">
                          <option value={2}>2 Shifts (12 Hours)</option>
                          <option value={3}>3 Shifts (8 Hours)</option>
                        </select>
                      </div>
                      <div className="flex-1">
                        <label className="block text-[12px] font-medium text-gray-700 mb-1">Base Start Time</label>
                        <input
                          type="time"
                          value={site.baseStartTime || '08:00'}
                          onChange={e => updateSiteField(i, 'baseStartTime', e.target.value)}
                          className="w-full border rounded px-3 py-1.5 text-[14px]"
                        />
                      </div>
                    </div>

                    <div className="bg-[#EBF1FA] border border-[#CBD5E1] p-3 rounded text-[12px] text-[#1E3A5F]">
                      <strong className="font-semibold mb-1 block">Calculated Auto-Schedule:</strong>
                      <div className="grid grid-cols-2 gap-2">
                        {site.shiftTimings.map((t: string, idx: number) => (
                          <div key={idx} className="bg-white px-2 py-1 rounded shadow-sm">Shift {idx + 1}: <span className="font-medium">{t}</span></div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
                <button type="button" onClick={() => setFormData({ ...formData, sites: [...formData.sites, { name: '', shiftCount: 2, baseStartTime: '08:00', shiftTimings: ['08:00 - 20:00', '20:00 - 08:00'], address: '', siteType: 'Corporate', accessInstructions: '', knownHazards: '', guardsPerShift: 1, guardQualifications: '', latitude: null, longitude: null }] })} className="text-[13px] text-[#1E3A5F] hover:underline font-medium">+ Add another physical site scope</button>
              </div>
            </div>

            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-2 shrink-0">
              <button type="button" onClick={() => setIsCreating(false)} className="px-4 py-2 border rounded text-[13px] font-medium text-gray-600 hover:bg-gray-100 bg-white">Cancel</button>
              <button type="submit" disabled={isSubmitting} className="bg-[#1E3A5F] px-4 py-2 text-white text-[13px] font-medium rounded hover:bg-[#162D4A] disabled:opacity-50">
                {isSubmitting ? 'Processing...' : (editingId ? 'Save Edits' : 'Confirm Provisioning')}
              </button>
            </div>
          </form>
        </div>
      )}

      {pickerSiteIndex !== null && (
        <SiteLocationPicker
          initialLat={formData.sites[pickerSiteIndex]?.latitude}
          initialLng={formData.sites[pickerSiteIndex]?.longitude}
          onSelectLocation={(lat, lng) => {
            updateSiteField(pickerSiteIndex, 'latitude', lat);
            updateSiteField(pickerSiteIndex, 'longitude', lng);
          }}
          onClose={() => setPickerSiteIndex(null)}
        />
      )}
    </>
  );
}
