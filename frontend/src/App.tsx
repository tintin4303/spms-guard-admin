import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import DashboardLayout from './components/DashboardLayout';
import MapControl from './components/MapControl';
import { fetchGuards, fetchContracts, createContract, updateContract, deleteContract } from './api';

function Overview() {
  return (
    <div className="bg-white p-6 rounded shadow-sm border border-[#E2E8F0]">
      <h2 className="text-xl font-bold font-serif text-[#1E3A5F] mb-4">Overview</h2>
      <p className="text-[14px] text-[#6B7280]">Welcome to the SPMS Operations portal.</p>
    </div>
  );
}

function Contracts() {
  const [contracts, setContracts] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const defaultFormData = {
    clientCompanyName: '',
    contactInfo: '',
    durationMonths: 12,
    clientId: 1,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
    sites: [{ name: 'Corporate Campus', shiftCount: 2, baseStartTime: '08:00', shiftTimings: ['08:00 - 20:00', '20:00 - 08:00'] }]
  };
  
  const [formData, setFormData] = useState(defaultFormData);

  const loadContracts = () => {
    fetchContracts().then(setContracts).catch(console.error);
  };
  useEffect(() => { loadContracts() }, []);

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
      sites: c.sites?.length > 0 ? c.sites.map((s:any)=>({ 
        name: s.name, 
        shiftCount: s.shiftCount, 
        baseStartTime: s.shiftTimings?.[0]?.split(' - ')[0] || '08:00',
        shiftTimings: s.shiftTimings || [] 
      })) : defaultFormData.sites
    });
    setIsCreating(true);
  };

  const handleDelete = async (id: string) => {
    if(!confirm("Delete this contract?")) return;
    try {
      await deleteContract(id);
      loadContracts();
    } catch(e) { console.error(e); }
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
    } catch(err) {
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
       for(let s=0; s<shiftCount; s++) {
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
          <h2 className="text-[18px] font-semibold font-serif text-[#1E3A5F]">Active Operational Contracts</h2>
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
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
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
                contracts.map((c) => (
                  <tr key={c.id} className="border-b last:border-0 hover:bg-[#F8FAFC]">
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
      </div>

      {isCreating && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-40 z-50 flex items-center justify-center p-4">
           <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl w-[600px] overflow-hidden flex flex-col max-h-[90vh]">
              <div className="px-6 py-4 border-b bg-[#F8FAFC]">
                 <h3 className="text-lg font-serif font-semibold text-[#1E3A5F]">{editingId ? 'Edit Contract' : 'Provision New Contract'}</h3>
                 <p className="text-[13px] text-gray-500 mt-1">Configure client scope, geographical sites, and shift structures.</p>
              </div>
              
              <div className="p-6 overflow-y-auto flex-1 space-y-5">
                 <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-1">Client Entity Name</label>
                    <input required value={formData.clientCompanyName} onChange={e => setFormData({...formData, clientCompanyName: e.target.value})} className="w-full border rounded px-3 py-2 text-[14px] focus:outline-none focus:ring-1 focus:ring-[#1E3A5F]" />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[13px] font-medium text-gray-700 mb-1">Contact Email/Phone</label>
                      <input required value={formData.contactInfo} onChange={e => setFormData({...formData, contactInfo: e.target.value})} className="w-full border rounded px-3 py-2 text-[14px] focus:outline-none focus:ring-1 focus:ring-[#1E3A5F]" />
                    </div>
                    <div>
                      <label className="block text-[13px] font-medium text-gray-700 mb-1">Duration (Months)</label>
                      <input required type="number" value={formData.durationMonths} onChange={e => setFormData({...formData, durationMonths: parseInt(e.target.value)})} className="w-full border rounded px-3 py-2 text-[14px] focus:outline-none focus:ring-1 focus:ring-[#1E3A5F]" />
                    </div>
                 </div>

                 <div className="pt-2 border-t">
                    <label className="block text-[15px] font-semibold text-[#1E3A5F] mb-1">Nested Patrol Sites & Shifts</label>
                    
                    {formData.sites.map((site: any, i: number) => (
                       <div key={i} className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50 relative">
                         {formData.sites.length > 1 && (
                            <button type="button" onClick={() => setFormData({...formData, sites: formData.sites.filter((_, idx)=>idx!==i)})} className="absolute top-3 right-3 text-[11px] px-2 py-1 border border-red-200 text-red-500 rounded bg-white hover:bg-red-50">Remove Site</button>
                         )}
                         <div className="mb-3">
                            <label className="block text-[12px] font-medium text-gray-700 mb-1">Site Name</label>
                            <input required value={site.name} onChange={e => updateSiteField(i, 'name', e.target.value)} placeholder="e.g. Headquarters" className="w-full border rounded px-3 py-1.5 text-[14px]" />
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
                                <div key={idx} className="bg-white px-2 py-1 rounded shadow-sm">Shift {idx+1}: <span className="font-medium">{t}</span></div>
                              ))}
                            </div>
                         </div>
                       </div>
                    ))}
                    <button type="button" onClick={() => setFormData({...formData, sites: [...formData.sites, { name: '', shiftCount: 2, baseStartTime: '08:00', shiftTimings: ['08:00 - 20:00', '20:00 - 08:00'] }]})} className="text-[13px] text-[#1E3A5F] hover:underline font-medium">+ Add another physical site scope</button>
                 </div>
              </div>
              
              <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-2">
                 <button type="button" onClick={() => setIsCreating(false)} className="px-4 py-2 border rounded text-[13px] font-medium text-gray-600 hover:bg-gray-100 bg-white">Cancel</button>
                 <button type="submit" disabled={isSubmitting} className="bg-[#1E3A5F] px-4 py-2 text-white text-[13px] font-medium rounded hover:bg-[#162D4A] disabled:opacity-50">
                    {isSubmitting ? 'Processing...' : (editingId ? 'Save Edits' : 'Confirm Provisioning')}
                 </button>
              </div>
           </form>
        </div>
      )}
    </>
  );
}

function Guards() {
  const [guards, setGuards] = useState<any[]>([]);

  useEffect(() => {
    fetchGuards().then(setGuards).catch(console.error);
  }, []);

  return (
    <div className="bg-white rounded border border-[#E2E8F0] shadow-sm">
      <div className="px-6 py-4 border-b border-[#E2E8F0] flex justify-between items-center">
        <h2 className="text-[18px] font-semibold font-serif text-[#1E3A5F]">Guard Roster</h2>
        <button className="bg-[#1E3A5F] text-white px-4 py-2 rounded text-[13px] font-medium hover:bg-[#162D4A] transition-colors">
          + Onboard Guard
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
              <th className="px-6 py-3 text-[12px] font-semibold text-[#6B7280]">Guard ID</th>
              <th className="px-6 py-3 text-[12px] font-semibold text-[#6B7280]">Name</th>
              <th className="px-6 py-3 text-[12px] font-semibold text-[#6B7280]">Shift Preference</th>
            </tr>
          </thead>
          <tbody>
            {guards.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-[13px] text-[#6B7280]">No guards found in roster.</td>
              </tr>
            ) : (
              guards.map((g) => (
                <tr key={g.id} className="border-b last:border-0 hover:bg-[#F8FAFC]">
                  <td className="px-6 py-4 text-[14px] font-medium text-[#1E3A5F]">{g.guardId}</td>
                  <td className="px-6 py-4 text-[14px] text-[#0F172A]">{g.firstName} {g.lastName}</td>
                  <td className="px-6 py-4 text-[14px] text-[#475569]">{g.shiftPreference || 'Flexible'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Overview />} />
          <Route path="contracts" element={<Contracts />} />
          <Route path="guards" element={<Guards />} />
          <Route path="*" element={<div>Page under construction</div>} />
        </Route>
        
        <Route path="/map" element={<DashboardLayout />}>
            <Route index element={<MapControl />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
