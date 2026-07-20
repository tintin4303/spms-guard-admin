import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import DashboardLayout from './components/DashboardLayout';
import AdminLayout from './components/AdminLayout';
import ClientLayout from './components/ClientLayout';
import AgencyLayout from './components/AgencyLayout';
import MapControl from './components/MapControl';
import { fetchGuards, fetchContracts, createContract, updateContract, deleteContract, createGuard, updateGuard, deleteGuard, loginUser, fetchUsers, createUser, deleteUser } from './api';

function Login({ onLogin }: { onLogin: (u: any) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleLogin = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await loginUser(email);
      onLogin(data.user);
    } catch(err) { alert("Failed to log in"); }
    setLoading(false);
  }
  
  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#F8FAFC]">
       <div className="flex w-[800px] bg-white rounded-xl shadow-lg border border-[#E2E8F0] overflow-hidden">
           
           <div className="w-1/2 p-10 border-r border-[#E2E8F0] flex flex-col justify-center">
             <div className="mb-8">
                <h2 className="text-[26px] font-bold font-serif text-[#1E3A5F]">SPMS Portal</h2>
                <p className="text-[14px] text-gray-500 mt-1">Sign in to your operations account</p>
             </div>
             <form onSubmit={handleLogin} className="space-y-5">
                <div>
                   <label className="block text-[13px] font-medium text-[#1E3A5F] mb-1.5">Email address</label>
                   <input required value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="example@spms.com" className="w-full border border-gray-300 rounded px-3 py-2.5 text-[14px] focus:outline-none focus:border-[#1E3A5F]" />
                </div>
                <div>
                   <label className="block text-[13px] font-medium text-[#1E3A5F] mb-1.5">Password</label>
                   <input required value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="••••••••" className="w-full border border-gray-300 rounded px-3 py-2.5 text-[14px] focus:outline-none focus:border-[#1E3A5F]" />
                </div>
                <button disabled={loading} type="submit" className="w-full bg-[#1E3A5F] text-white py-2.5 rounded text-[14px] font-medium hover:bg-[#162D4A] mt-2 transition-colors">
                   {loading ? 'Authenticating...' : 'Sign In'}
                </button>
             </form>
           </div>
           
           <div className="w-1/2 bg-[#F1F5F9] p-10 flex flex-col justify-center">
              <h3 className="text-[14px] font-bold text-[#1E3A5F] mb-5 uppercase tracking-wider">Active Demo Credentials</h3>
              <ul className="space-y-4 text-[13px] text-gray-700">
                <li className="flex flex-col border-b border-gray-200 pb-3">
                   <span className="font-semibold text-[#1E3A5F]">Operation Manager</span>
                   <span className="font-mono mt-1 text-blue-600 bg-blue-50 px-2 py-1 rounded w-fit select-all">ops@spms.com</span>
                </li>
                <li className="flex flex-col border-b border-gray-200 pb-3">
                   <span className="font-semibold text-[#1E3A5F]">System Admin</span>
                   <span className="font-mono mt-1 text-blue-600 bg-blue-50 px-2 py-1 rounded w-fit select-all">admin@spms.com</span>
                </li>
                <li className="flex flex-col border-b border-gray-200 pb-3">
                   <span className="font-semibold text-[#1E3A5F]">Client</span>
                   <span className="font-mono mt-1 text-blue-600 bg-blue-50 px-2 py-1 rounded w-fit select-all">client@spms.com</span>
                </li>
                <li className="flex flex-col pb-2">
                   <span className="font-semibold text-[#1E3A5F]">Agency Manager</span>
                   <span className="font-mono mt-1 text-blue-600 bg-blue-50 px-2 py-1 rounded w-fit select-all">agency@spms.com</span>
                </li>
              </ul>
              <p className="text-[11px] text-gray-500 mt-6">(Use any dummy password. The system strictly detects the security role permissions upon handshaking.)</p>
           </div>
       </div>
    </div>
  )
}


function Overview({ role }: { role: string }) {
  if (role === 'ADMIN') {
     return (
       <div className="bg-red-50 p-6 rounded border border-red-200 mt-10 text-center max-w-lg mx-auto">
          <h2 className="text-lg font-bold text-red-700">Access Denied</h2>
          <p className="text-[13px] text-red-600 mt-2">Administrators are not permitted to view global operations. Please use the User Management tab.</p>
       </div>
     );
  }

  return (
    <div className="bg-white p-6 rounded shadow-sm border border-[#E2E8F0]">
      <h2 className="text-xl font-bold font-serif text-[#1E3A5F] mb-4">
         {role === 'CLIENT' ? 'Client Sites Overview' : role === 'AGENCY_MANAGER' ? 'Agency Roster Overview' : 'Global Operations Overview'}
      </h2>
      <p className="text-[14px] text-[#6B7280]">Welcome to your specific SPMS portal module.</p>
    </div>
  );
}

function ClientContracts() {
  const [contracts, setContracts] = useState<any[]>([]);
  useEffect(() => {
    fetchContracts().then(setContracts).catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-[24px] font-bold font-serif text-[#1E3A5F]">Active Contracts</h2>
           <p className="text-[14px] text-gray-500 mt-1">Oversight of your active service locations and guard requirements.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contracts.map(contract => (
          <div key={contract.id} className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] overflow-hidden hover:shadow-md transition">
            <div className="px-6 py-5 border-b border-gray-100 bg-gray-50 flex justify-between items-start">
               <div>
                  <div className="text-[12px] font-mono font-medium text-blue-600 tracking-wider">SECURE ID: {contract.id.substring(0,8).toUpperCase()}</div>
                  <h3 className="text-[16px] font-bold text-[#1E3A5F] mt-1">{contract.client?.name || 'My Company'}</h3>
               </div>
               <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[11px] font-bold tracking-widest uppercase">Active</span>
            </div>
            
            <div className="p-6">
               <div className="mb-4">
                  <span className="text-[11px] font-medium text-gray-400 uppercase tracking-widest block mb-1">Contract Duration</span>
                  <div className="text-[14px] font-bold text-[#0F172A]">{new Date(contract.startDate).toLocaleDateString()} — {new Date(contract.endDate).toLocaleDateString()}</div>
               </div>
               
               <div className="mb-4">
                  <span className="text-[11px] font-medium text-gray-400 uppercase tracking-widest block mb-1">Location Details</span>
                  <div className="text-[14px] text-gray-700 leading-tight">
                     {contract.sites?.[0]?.name ? contract.sites[0].name : 'Primary Facility'}
                     <br/><span className="text-gray-400 text-[12px]">{contract.sites?.[0]?.address || 'Registered Address'}</span>
                  </div>
               </div>

               <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 flex items-center justify-between">
                  <span className="text-[12px] font-medium text-gray-500">Security Requirement:</span>
                  <span className="text-[13px] font-bold text-[#1E3A5F]">Trained Personnel</span>
               </div>
            </div>
          </div>
        ))}
        {contracts.length === 0 && (
          <div className="col-span-full py-16 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
             <p className="text-gray-500 font-medium">No active contracts found for your account.</p>
          </div>
        )}
      </div>
    </div>
  )
}

function AdminUserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('CLIENT');

  const loadUsers = () => fetchUsers().then(setUsers).catch(console.error);
  useEffect(() => { loadUsers(); }, []);

  const handleCreate = async (e: any) => {
    e.preventDefault();
    await createUser({ email, name, role });
    setIsCreating(false);
    loadUsers();
  };

  const handleDelete = async (id: string) => {
    if(!confirm("Erase this system account?")) return;
    await deleteUser(id);
    loadUsers();
  };

  return (
    <>
      <div className="bg-white rounded border border-[#E2E8F0] shadow-sm">
        <div className="px-6 py-4 border-b border-[#E2E8F0] flex justify-between items-center">
          <div>
             <h2 className="text-[18px] font-semibold font-serif text-[#0F172A]">User Account Registry</h2>
             <p className="text-[13px] text-gray-500">Global identity store for all system capabilities.</p>
          </div>
          <button onClick={()=>setIsCreating(true)} className="bg-red-600 text-white px-4 py-2 rounded text-[13px] font-medium hover:bg-red-700 transition">
            + Provision Account
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] border-b text-[12px] text-gray-500 uppercase tracking-wider font-semibold">
                <th className="px-6 py-3">Account Reference</th>
                <th className="px-6 py-3">System Role</th>
                <th className="px-6 py-3">Email Address</th>
                <th className="px-6 py-3">Date Provisioned</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-6 py-4 text-[14px] font-medium text-[#0F172A]">{u.name}</td>
                  <td className="px-6 py-4">
                     <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg text-[11px] font-bold tracking-wider">{u.role}</span>
                  </td>
                  <td className="px-6 py-4 text-[14px] text-gray-500">{u.email}</td>
                  <td className="px-6 py-4 text-[14px] text-gray-400">System Genesis</td>
                  <td className="px-6 py-4">
                     <button onClick={()=>handleDelete(u.id)} className="text-[13px] text-red-500 hover:underline">Revoke Access</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {isCreating && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
           <form onSubmit={handleCreate} className="bg-white rounded shadow-xl w-[450px]">
              <div className="p-6 border-b">
                 <h3 className="text-lg font-bold text-[#0F172A]">Provision Account</h3>
              </div>
              <div className="p-6 space-y-4">
                 <div>
                    <label className="block text-[13px] font-medium mb-1">Full Name</label>
                    <input required value={name} onChange={e=>setName(e.target.value)} className="w-full border rounded px-3 py-2 text-[14px]" />
                 </div>
                 <div>
                    <label className="block text-[13px] font-medium mb-1">Email Address</label>
                    <input required type="email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full border rounded px-3 py-2 text-[14px]" />
                 </div>
                 <div>
                    <label className="block text-[13px] font-medium mb-1">Authorization Privilege (Role)</label>
                    <select value={role} onChange={e=>setRole(e.target.value)} className="w-full border rounded px-3 py-2 text-[14px]">
                       <option value="CLIENT">Client</option>
                       <option value="AGENCY_MANAGER">Agency Manager</option>
                       <option value="OPERATION_MANAGER">Operation Manager</option>
                       <option value="ADMIN">System Admin</option>
                    </select>
                 </div>
              </div>
              <div className="p-6 bg-gray-50 border-t flex justify-end gap-2">
                 <button type="button" onClick={()=>setIsCreating(false)} className="px-4 py-2 border rounded font-medium text-[13px]">Cancel</button>
                 <button type="submit" className="px-4 py-2 bg-red-600 text-white font-medium text-[13px] rounded hover:bg-red-700">Provision Resource</button>
              </div>
           </form>
        </div>
      )}
    </>
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
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const defaultFormData = {
    firstName: '',
    lastName: '',
    guardId: `GRD-`,
    certificateNumber: '',
    shiftPreference: 'Flexible',
  };
  
  const [formData, setFormData] = useState(defaultFormData);

  const loadGuards = () => {
    fetchGuards().then(setGuards).catch(console.error);
  };

  useEffect(() => { loadGuards(); }, []);

  const openCreate = () => {
    setEditingId(null);
    setFormData({...defaultFormData, guardId: `GRD-${Math.floor(Math.random() * 10000)}`});
    setIsCreating(true);
  };

  const openEdit = (g: any) => {
    setEditingId(g.id);
    setFormData({
      firstName: g.firstName || '',
      lastName: g.lastName || '',
      guardId: g.guardId || '',
      certificateNumber: g.certificateNumber || '',
      shiftPreference: g.shiftPreference || 'Flexible',
    });
    setIsCreating(true);
  };

  const handleDelete = async (id: string) => {
    if(!confirm("Offboard this guard?")) return;
    try {
      await deleteGuard(id);
      loadGuards();
    } catch(e) { console.error(e); }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingId) {
        await updateGuard(editingId, formData);
      } else {
        await createGuard(formData);
      }
      setIsCreating(false);
      loadGuards();
    } catch(err) {
      alert("Error saving guard.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded border border-[#E2E8F0] shadow-sm">
        <div className="px-6 py-4 border-b border-[#E2E8F0] flex justify-between items-center">
          <h2 className="text-[18px] font-semibold font-serif text-[#1E3A5F]">Guard Roster</h2>
          <button onClick={openCreate} className="bg-[#1E3A5F] text-white px-4 py-2 rounded text-[13px] font-medium hover:bg-[#162D4A] transition-colors">
            + Onboard Guard
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                <th className="px-6 py-3 text-[12px] font-semibold text-[#6B7280]">Guard ID</th>
                <th className="px-6 py-3 text-[12px] font-semibold text-[#6B7280]">Name</th>
                <th className="px-6 py-3 text-[12px] font-semibold text-[#6B7280]">Certification</th>
                <th className="px-6 py-3 text-[12px] font-semibold text-[#6B7280]">Shift Preference</th>
                <th className="px-6 py-3 text-[12px] font-semibold text-[#6B7280]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {guards.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-[13px] text-[#6B7280]">No guards found in roster.</td>
                </tr>
              ) : (
                guards.map((g) => (
                  <tr key={g.id} className="border-b last:border-0 hover:bg-[#F8FAFC]">
                    <td className="px-6 py-4 text-[14px] font-medium text-[#1E3A5F]">{g.guardId}</td>
                    <td className="px-6 py-4 text-[14px] text-[#0F172A]">{g.firstName} {g.lastName}</td>
                    <td className="px-6 py-4 text-[14px] text-[#475569]">{g.certificateNumber || 'N/A'}</td>
                    <td className="px-6 py-4 text-[14px] text-[#475569]"><span className="px-2 py-1 bg-gray-100 rounded-full text-[12px] border">{g.shiftPreference || 'Flexible'}</span></td>
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
      </div>

      {isCreating && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-40 z-50 flex items-center justify-center p-4">
           <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl w-[500px] overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b bg-[#F8FAFC]">
                 <h3 className="text-lg font-serif font-semibold text-[#1E3A5F]">{editingId ? 'Edit Guard Profile' : 'Onboard New Guard'}</h3>
                 <p className="text-[13px] text-gray-500 mt-1">Register their personnel data into the operations schema.</p>
              </div>
              
              <div className="p-6 overflow-y-auto flex-1 space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[13px] font-medium text-gray-700 mb-1">First Name</label>
                      <input required value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="w-full border rounded px-3 py-2 text-[14px] focus:outline-none focus:ring-1 focus:ring-[#1E3A5F]" />
                    </div>
                    <div>
                      <label className="block text-[13px] font-medium text-gray-700 mb-1">Last Name</label>
                      <input required value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="w-full border rounded px-3 py-2 text-[14px] focus:outline-none focus:ring-1 focus:ring-[#1E3A5F]" />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[13px] font-medium text-gray-700 mb-1">Generated ID</label>
                      <input disabled value={formData.guardId} className="w-full border rounded px-3 py-2 text-[14px] bg-gray-100 text-gray-500" />
                    </div>
                    <div>
                      <label className="block text-[13px] font-medium text-gray-700 mb-1">Certificate # (Optional)</label>
                      <input value={formData.certificateNumber} onChange={e => setFormData({...formData, certificateNumber: e.target.value})} className="w-full border rounded px-3 py-2 text-[14px] focus:outline-none focus:ring-1 focus:ring-[#1E3A5F]" />
                    </div>
                 </div>

                 <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-1">Shift Preferences</label>
                    <select value={formData.shiftPreference} onChange={e => setFormData({...formData, shiftPreference: e.target.value})} className="w-full border rounded px-3 py-2 text-[14px] focus:outline-none focus:ring-1 focus:ring-[#1E3A5F]">
                       <option value="Flexible">Flexible</option>
                       <option value="Day">Day Shifts Only</option>
                       <option value="Night">Night Shifts Only</option>
                    </select>
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

const ProtectedRoute = ({ children, allowed, role }: any) => {
  if (!allowed.includes(role)) return <Navigate to="/" replace />;
  return children;
};

export default function App() {
  const [user, setUser] = useState<any>(() => {
    const saved = localStorage.getItem('spms_user');
    return saved ? JSON.parse(saved) : null;
  });

  const handleLogin = (u: any) => {
    setUser(u);
    localStorage.setItem('spms_user', JSON.stringify(u));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('spms_user');
    window.location.href = '/';
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to={
            user?.role === 'ADMIN' ? "/admin" : 
            user?.role === 'CLIENT' ? "/client" :
            user?.role === 'AGENCY_MANAGER' ? "/agency" :
            "/dashboard"
        } replace />} />
        
        {/* Admin Sphere */}
        <Route path="/admin" element={<ProtectedRoute allowed={['ADMIN']} role={user?.role}><AdminLayout user={user} onLogout={handleLogout} /></ProtectedRoute>}>
           <Route index element={<AdminUserManagement />} />
           <Route path="settings" element={<div className="p-6">System Settings Under Construction</div>} />
        </Route>

        {/* Agency Sphere */}
        <Route path="/agency" element={<ProtectedRoute allowed={['AGENCY_MANAGER']} role={user?.role}><AgencyLayout user={user} onLogout={handleLogout} /></ProtectedRoute>}>
           <Route index element={<div className="text-gray-500 p-8 border-2 border-dashed border-gray-300 rounded-lg text-center">Agency Roster integration pending.</div>} />
           <Route path="schedules" element={<div className="p-6">Schedule integration pending</div>} />
        </Route>

        {/* Client Sphere */}
        <Route path="/client" element={<ProtectedRoute allowed={['CLIENT']} role={user?.role}><ClientLayout user={user} onLogout={handleLogout} /></ProtectedRoute>}>
           <Route index element={<ClientContracts />} />
           <Route path="map" element={<div className="p-6">Map View integration pending</div>} />
        </Route>

        {/* Ops Sphere */}
        <Route path="/dashboard" element={<ProtectedRoute allowed={['OPERATION_MANAGER']} role={user?.role}><DashboardLayout user={user} onLogout={handleLogout} /></ProtectedRoute>}>
          <Route index element={<Overview role={user?.role} />} />
          <Route path="contracts" element={<Contracts />} />
          <Route path="guards" element={<Guards />} />
          <Route path="*" element={<div>Page under construction</div>} />
        </Route>
        
        <Route path="/map" element={<ProtectedRoute allowed={['OPERATION_MANAGER', 'CLIENT']} role={user?.role}><DashboardLayout user={user} onLogout={handleLogout} /></ProtectedRoute>}>
            <Route index element={<MapControl />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
