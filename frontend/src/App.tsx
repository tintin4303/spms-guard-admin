import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ShieldAlert, Users, FileText, CheckCircle2, AlertTriangle, Clock, BarChart, Calendar, Search } from 'lucide-react';
import DashboardLayout from './components/DashboardLayout';
import AdminLayout from './components/AdminLayout';
import ClientLayout from './components/ClientLayout';
import AgencyLayout from './components/AgencyLayout';
import MapControl from './components/MapControl';
import { fetchGuards, fetchContracts, createContract, updateContract, deleteContract, createGuard, updateGuard, deleteGuard, loginUser, fetchUsers, createUser, deleteUser, fetchSchedules, fetchLogs, fetchAnalytics, createRoster, deleteRoster, createException } from './api';

function Login({ onLogin }: { onLogin: (u: any) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleLogin = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await loginUser(email, password);
      if (data.token) localStorage.setItem('spms_token', data.token);
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

  if (role === 'OPERATION_MANAGER') {
     const [stats, setStats] = useState<any>(null);
     const [recentLogs, setRecentLogs] = useState<any[]>([]);
     useEffect(() => {
        fetchAnalytics().then(setStats).catch(console.error);
        fetchLogs().then((res: any) => setRecentLogs(res.slice(0, 3))).catch(console.error);
     }, []);

     return (
       <div className="space-y-6">
         <div>
            <h2 className="text-[24px] font-bold font-serif text-[#1E3A5F]">Operations Command Center</h2>
            <p className="text-[14px] text-[#6B7280] mt-1">Real-time oversight of global security operations.</p>
         </div>
         
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <Link to="/dashboard/contracts" className="bg-white p-6 rounded-xl border border-[#E2E8F0] shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer hover:border-blue-300">
              <div className="w-12 h-12 bg-[#F1F5F9] rounded-lg flex items-center justify-center border border-[#E2E8F0] text-[#1E3A5F]">
                 <FileText className="w-6 h-6" />
              </div>
              <div>
                 <p className="text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider">Active Contracts</p>
                 <p className="text-[28px] font-bold text-[#0F172A] leading-none mt-1">{stats?.activeContracts ?? '-'}</p>
              </div>
           </Link>
           
           <Link to="/dashboard/guards" className="bg-white p-6 rounded-xl border border-[#E2E8F0] shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer hover:border-blue-300">
              <div className="w-12 h-12 bg-[#F1F5F9] rounded-lg flex items-center justify-center border border-[#E2E8F0] text-[#1E3A5F]">
                 <Users className="w-6 h-6" />
              </div>
              <div>
                 <p className="text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider">Guards on Duty</p>
                 <p className="text-[28px] font-bold text-[#0F172A] leading-none mt-1">{stats?.guardsOnDuty ?? '-'}</p>
              </div>
           </Link>
           
           <Link to="/dashboard/logs" className="bg-white p-6 rounded-xl border border-[#E2E8F0] shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer hover:border-blue-300">
              <div className="w-12 h-12 bg-[#F1F5F9] rounded-lg flex items-center justify-center border border-[#E2E8F0] text-[#1E3A5F]">
                 <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                 <p className="text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider">Pending Alerts</p>
                 <p className="text-[28px] font-bold text-[#0F172A] leading-none mt-1">{stats?.pendingAlerts ?? '-'}</p>
              </div>
           </Link>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden flex flex-col">
               <div className="px-6 py-4 border-b border-[#E2E8F0] bg-[#F8FAFC]">
                 <h3 className="text-[16px] font-bold text-[#1E3A5F]">Recent Activity</h3>
               </div>
               <div className="flex-1 flex flex-col">
                  {recentLogs.length > 0 ? recentLogs.map((log: any) => (
                    <div key={log.id} className="flex items-center gap-4 px-6 py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                       {log.isIncident ? (
                         <AlertTriangle className="w-5 h-5 text-red-500" />
                       ) : (
                         <CheckCircle2 className="w-5 h-5 text-green-500" />
                       )}
                       <div className="flex-1">
                          <p className="text-[14px] font-medium text-[#0F172A]">
                             {log.isIncident ? 'Incident Reported' : 'Routine Update'} 
                             <span className="text-gray-400 font-normal text-[12px] ml-2">{new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                          </p>
                          <p className="text-[12px] text-[#6B7280] truncate w-full max-w-[250px]">{log.description || 'No description provided'}</p>
                       </div>
                    </div>
                  )) : (
                    <div className="px-6 py-8 text-center text-[13px] text-gray-500 m-auto">
                      No recent activity in the system.
                    </div>
                  )}
               </div>
            </div>

            <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
               <div className="px-6 py-4 border-b border-[#E2E8F0] bg-[#F8FAFC]">
                 <h3 className="text-[16px] font-bold text-[#1E3A5F]">Quick Actions</h3>
               </div>
               <div className="p-6 grid grid-cols-2 gap-4">
                  <Link to="/dashboard/contracts" className="p-4 border border-[#E2E8F0] rounded-lg text-center hover:bg-[#F8FAFC] transition-colors flex flex-col items-center justify-center gap-2">
                     <FileText className="w-6 h-6 text-[#1E3A5F]" />
                     <span className="text-[13px] font-medium text-[#1E3A5F]">Manage Contracts</span>
                  </Link>
                  <Link to="/dashboard/schedules" className="p-4 border border-[#E2E8F0] rounded-lg text-center hover:bg-[#F8FAFC] transition-colors flex flex-col items-center justify-center gap-2">
                     <Calendar className="w-6 h-6 text-[#1E3A5F]" />
                     <span className="text-[13px] font-medium text-[#1E3A5F]">Shift Schedules</span>
                  </Link>
                  <Link to="/dashboard/logs" className="p-4 border border-[#E2E8F0] rounded-lg text-center hover:bg-[#F8FAFC] transition-colors flex flex-col items-center justify-center gap-2">
                     <ShieldAlert className="w-6 h-6 text-[#1E3A5F]" />
                     <span className="text-[13px] font-medium text-[#1E3A5F]">Incident Logs</span>
                  </Link>
                  <Link to="/dashboard/reports" className="p-4 border border-[#E2E8F0] rounded-lg text-center hover:bg-[#F8FAFC] transition-colors flex flex-col items-center justify-center gap-2">
                     <BarChart className="w-6 h-6 text-[#1E3A5F]" />
                     <span className="text-[13px] font-medium text-[#1E3A5F]">View Reports</span>
                  </Link>
               </div>
            </div>
         </div>
       </div>
     )
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
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('CLIENT');

  const loadUsers = () => fetchUsers().then(setUsers).catch(console.error);
  useEffect(() => { loadUsers(); }, []);

  const handleCreate = async (e: any) => {
    e.preventDefault();
    await createUser({ email, name, role, password });
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
              <tr className="bg-[#F8FAFC] text-[12px] text-gray-500 uppercase tracking-wider font-semibold">
                <th className="px-6 py-3">Account Reference</th>
                <th className="px-6 py-3">System Role</th>
                <th className="px-6 py-3">Email Address</th>
                <th className="px-6 py-3">Date Provisioned</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="hover:bg-gray-50">
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
                    <label className="block text-[13px] font-medium mb-1">Password</label>
                    <input required type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full border rounded px-3 py-2 text-[14px]" />
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
                contracts.map((c) => (
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
      status: g.status || 'Active',
      contactNumber: g.contactNumber || '',
      certificationExpiry: g.certificationExpiry ? g.certificationExpiry.split('T')[0] : '',
      skills: g.skills ? (Array.isArray(g.skills) ? g.skills : []) : [],
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
              <tr className="bg-[#F8FAFC]">
                <th className="px-6 py-3 text-[12px] font-semibold text-[#6B7280]">Guard ID</th>
                <th className="px-6 py-3 text-[12px] font-semibold text-[#6B7280]">Name</th>
                <th className="px-6 py-3 text-[12px] font-semibold text-[#6B7280]">Certification</th>
                <th className="px-6 py-3 text-[12px] font-semibold text-[#6B7280]">Status</th>
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
                  <tr key={g.id} className="hover:bg-[#F8FAFC]">
                    <td className="px-6 py-4 text-[14px] font-medium text-[#1E3A5F]">{g.guardId}</td>
                    <td className="px-6 py-4 text-[14px] text-[#0F172A]">{g.firstName} {g.lastName}</td>
                    <td className="px-6 py-4 text-[14px] text-[#475569]">
                      <div>{g.certificateNumber || 'N/A'}</div>
                      {g.certificationExpiry && new Date(g.certificationExpiry) < new Date() && (
                        <div className="text-[12px] text-red-600 font-medium">Expired</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-[14px] text-[#475569]">{g.status}</td>
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
                 
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[13px] font-medium text-gray-700 mb-1">Status</label>
                      <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full border rounded px-3 py-2 text-[14px] focus:outline-none focus:ring-1 focus:ring-[#1E3A5F]">
                         <option value="Active">Active</option>
                         <option value="On Leave">On Leave</option>
                         <option value="Suspended">Suspended</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[13px] font-medium text-gray-700 mb-1">Contact Number</label>
                      <input value={formData.contactNumber} onChange={e => setFormData({...formData, contactNumber: e.target.value})} className="w-full border rounded px-3 py-2 text-[14px] focus:outline-none focus:ring-1 focus:ring-[#1E3A5F]" />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[13px] font-medium text-gray-700 mb-1">Cert Expiry Date</label>
                      <input type="date" value={formData.certificationExpiry} onChange={e => setFormData({...formData, certificationExpiry: e.target.value})} className="w-full border rounded px-3 py-2 text-[14px] focus:outline-none focus:ring-1 focus:ring-[#1E3A5F]" />
                    </div>
                    <div>
                      <label className="block text-[13px] font-medium text-gray-700 mb-1">Skills (Press Enter to add)</label>
                      <div className="w-full border rounded px-2 py-1.5 focus-within:ring-1 focus-within:ring-[#1E3A5F] flex flex-wrap gap-1.5 items-center bg-white text-[14px]">
                        {formData.skills.map((s: string) => (
                           <span key={s} className="bg-blue-100 text-[#1E3A5F] font-medium text-[12px] px-2 py-0.5 rounded flex items-center gap-1 leading-none shadow-sm">
                              {s} 
                              <button type="button" onClick={() => setFormData({...formData, skills: formData.skills.filter((sk: string) => sk !== s)})} className="text-blue-500 hover:text-red-500 outline-none leading-none pt-0.5">&times;</button>
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
                                 setFormData({...formData, skills: [...formData.skills, val]});
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

function Schedules() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [guards, setGuards] = useState<any[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('calendar');
  const [isCreatingRoster, setIsCreatingRoster] = useState(false);
  const [isCreatingException, setIsCreatingException] = useState(false);
  
  const defaultFormData = {
    date: new Date().toISOString().split('T')[0],
    startTime: '08:00',
    endTime: '20:00',
    guardId: '',
    siteId: '',
    type: 'Absent',
    replacementGuardId: '',
    rosterId: ''
  };
  const [formData, setFormData] = useState(defaultFormData);
  const [errorMsg, setErrorMsg] = useState('');
  const [warningMsg, setWarningMsg] = useState('');

  const loadSchedules = () => {
    fetchSchedules().then(setSchedules).catch(console.error);
  };

  useEffect(() => {
    loadSchedules();
    fetchGuards().then(setGuards).catch(console.error);
  }, []);

  // Extract unique sites from existing schedules for the dropdown
  const uniqueSites = schedules.reduce((acc: any[], curr) => {
    if (curr.site && !acc.find((s:any) => s.id === curr.site.id)) {
      acc.push({ id: curr.site.id, name: curr.site.name });
    }
    return acc;
  }, []);

  const openCreateRoster = () => {
    setEditingId(null);
    setFormData(defaultFormData);
    setIsCreatingRoster(true);
  };

  const openCreateException = (sched: any) => {
    setFormData({
      ...defaultFormData,
      date: sched.date?.split('T')[0],
      rosterId: sched.rosterId,
      startTime: sched.startTime,
      endTime: sched.endTime,
      type: 'Absent'
    });
    setEditingId(sched.id);
    setIsCreatingException(true);
  };

  const handleDeleteRoster = async (rosterId: string) => {
    if (!confirm('Are you sure you want to delete this Permanent Post? This affects all upcoming days indefinitely.')) return;
    try {
      await deleteRoster(rosterId);
      loadSchedules();
    } catch(err) {
      alert("Failed to delete permanent post.");
    }
  };

  const getNext7Days = () => {
    const days = [];
    let d = new Date();
    for (let i = 0; i < 7; i++) {
      days.push(new Date(d));
      d.setDate(d.getDate() + 1);
    }
    return days;
  };
  const weekDays = getNext7Days();

  const handleRosterSubmit = async (e: any) => {
    e.preventDefault();
    setErrorMsg('');
    setWarningMsg('');
    if (!formData.guardId || !formData.siteId) return setErrorMsg('Guard and Site are required.');
    try {
      await createRoster({ startTime: formData.startTime, endTime: formData.endTime, guardId: formData.guardId, siteId: formData.siteId });
      setIsCreatingRoster(false);
      loadSchedules();
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred.');
    }
  };

  const handleExceptionSubmit = async (e: any) => {
    e.preventDefault();
    setErrorMsg('');
    if (formData.type === 'Swap' && !formData.replacementGuardId) return setErrorMsg('Replacement guard is required for a Swap.');
    try {
      await createException({ date: formData.date, type: formData.type, rosterId: formData.rosterId, replacementGuardId: formData.replacementGuardId });
      setIsCreatingException(false);
      loadSchedules();
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred.');
    }
  };

  return (
    <div className="bg-white rounded border border-[#E2E8F0] shadow-sm">
        <div className="px-6 py-4 border-b border-[#E2E8F0] flex justify-between items-center bg-[#F8FAFC]">
          <div>
            <h2 className="text-[18px] font-semibold font-serif text-[#1E3A5F]">Shift Schedules</h2>
            <p className="text-[13px] text-gray-500">Assign and monitor daily patrol rotations.</p>
          </div>
          <div className="flex gap-4 items-center">
            <div className="flex bg-gray-200 p-1 rounded">
              <button 
                onClick={() => setViewMode('calendar')} 
                className={`px-3 py-1 text-[13px] font-medium rounded ${viewMode === 'calendar' ? 'bg-white shadow-sm text-[#1E3A5F]' : 'text-gray-500'}`}
              >
                Calendar
              </button>
              <button 
                onClick={() => setViewMode('list')} 
                className={`px-3 py-1 text-[13px] font-medium rounded ${viewMode === 'list' ? 'bg-white shadow-sm text-[#1E3A5F]' : 'text-gray-500'}`}
              >
                List
              </button>
            </div>
            <button onClick={openCreateRoster} className="bg-[#1E3A5F] text-white px-4 py-2 rounded text-[13px] font-medium hover:bg-[#162D4A] transition-colors">
              + Assign Permanent Post
            </button>
          </div>
        </div>
        
        {viewMode === 'list' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-[#E2E8F0]">
                  <th className="px-6 py-4 text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider">Date &amp; Time</th>
                  <th className="px-6 py-4 text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider">Contract Site</th>
                  <th className="px-6 py-4 text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider">Assigned Guard</th>
                  <th className="px-6 py-4 text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {schedules.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-[13px] text-gray-500">No shift schedules found.</td>
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
                          {sched.status || 'Scheduled'}
                        </span>
                      </td>
                      <td className="px-6 py-4 flex gap-2">
                         {sched.status?.includes('Permanent') && (
                            <button onClick={() => handleDeleteRoster(sched.rosterId)} className="text-[13px] text-red-600 hover:underline">Delete Post</button>
                         )}<button onClick={() => openCreateException(sched)} className="text-[13px] text-blue-600 hover:underline">Override</button>
                         <button onClick={() => handleDeleteRoster(sched.id)} className="text-[13px] text-red-600 hover:underline">Delete</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 overflow-x-auto bg-[#F8FAFC]">
             <div className="grid grid-cols-7 gap-4 min-w-[1000px]">
                {weekDays.map(day => {
                  const dayStr = day.toISOString().split('T')[0];
                  // Make sure we match on the scheduled date segment properly
                  const daySchedules = schedules.filter(s => s.date?.startsWith(dayStr));
                  const isToday = dayStr === new Date().toISOString().split('T')[0];
                  
                  return (
                    <div key={dayStr} className={`relative bg-white border text-[13px] rounded shadow-sm min-h-[300px] mt-2 ${isToday ? 'border-blue-200 shadow-md' : 'border-[#E2E8F0]'}`}>
                       {isToday && (
                          <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-10">
                            <span className="text-[9px] font-bold bg-blue-500 text-white px-2 py-0.5 rounded-full shadow-sm tracking-widest uppercase">Today</span>
                          </div>
                       )}
                       <div className="bg-[#1E3A5F] text-white p-2 text-center font-semibold rounded-t">
                          {day.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                       </div>
                       <div className={`p-2 flex flex-col gap-2 ${isToday ? 'bg-slate-50 min-h-[calc(100%-36px)]' : ''}`}>
                          {daySchedules.length === 0 ? <div className="text-gray-400 text-center mt-4 text-[12px]">No Shifts</div> : daySchedules.map(sched => (
                             <div key={sched.id} className={`border p-2 rounded group cursor-pointer transition-colors ${sched.status?.includes('Absent') ? 'bg-red-50 border-red-200 hover:bg-red-100' : (sched.status?.includes('Swap') ? 'bg-orange-50 border-orange-200 hover:bg-orange-100' : 'bg-blue-50 border-blue-100 hover:bg-blue-100')}`} onClick={() => openCreateException(sched)}>
                                 <div className="flex justify-between items-start">
                                    <p className="font-bold text-[#1E3A5F] text-[12px]">
                                      {sched.startTime} - {sched.endTime}
                                    </p>
                                    {sched.status?.includes('Swap') && <span className="text-[9px] bg-orange-200 text-orange-800 px-1 rounded">SWAP</span>}
                                    {sched.status?.includes('Absent') && <span className="text-[9px] bg-red-200 text-red-800 px-1 rounded">ABSENT</span>}
                                 </div>
                                 <p className="text-gray-600 truncate text-[11px] mt-1">{sched.guard?.firstName} {sched.guard?.lastName}</p>
                                 <p className="text-gray-500 truncate text-[11px]">{sched.site?.name}</p>
                             </div>
                          ))}
                       </div>
                    </div>
                  );
                })}
             </div>
          </div>
        )}

        {isCreatingRoster && (
          <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-40 z-50 flex items-center justify-center p-4">
            <form onSubmit={handleRosterSubmit} className="bg-white rounded-lg shadow-xl w-[500px] overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b bg-[#F8FAFC]">
                <h3 className="text-lg font-serif font-semibold text-[#1E3A5F]">Assign Permanent Post</h3>
                <p className="text-[13px] text-gray-500 mt-1">This guard will be permanently assigned to this schedule until deleted.</p>
              </div>
              <div className="p-6 space-y-4">
                {errorMsg && <div className="text-red-600 text-sm font-medium">{errorMsg}</div>}
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-1">Start Time</label>
                    <input type="time" required value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} className="w-full border rounded px-3 py-2 text-[14px] focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-1">End Time</label>
                    <input type="time" required value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} className="w-full border rounded px-3 py-2 text-[14px] focus:outline-none" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-[13px] font-medium text-gray-700 mb-1">Site</label>
                  <select value={formData.siteId} onChange={e => setFormData({...formData, siteId: e.target.value})} className="w-full border rounded px-3 py-2 text-[14px] focus:outline-none" required>
                    <option value="">Select a Site</option>
                    {uniqueSites.map((s: any) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-gray-700 mb-1">Guard</label>
                  <select value={formData.guardId} onChange={e => setFormData({...formData, guardId: e.target.value})} className="w-full border rounded px-3 py-2 text-[14px] focus:outline-none" required>
                    <option value="">Select a Guard</option>
                    {guards.map((g: any) => (
                      <option key={g.id} value={g.id}>{g.firstName} {g.lastName} ({g.guardId}) - {g.shiftPreference}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-2">
                <button type="button" onClick={() => setIsCreatingRoster(false)} className="px-4 py-2 border rounded text-[13px] font-medium text-gray-600 bg-white hover:bg-gray-100">Cancel</button>
                <button type="submit" className="bg-[#1E3A5F] px-4 py-2 text-white text-[13px] font-medium rounded hover:bg-[#162D4A]">Create Permanent Post</button>
              </div>
            </form>
          </div>
        )}

        {isCreatingException && (
          <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-40 z-50 flex items-center justify-center p-4">
            <form onSubmit={handleExceptionSubmit} className="bg-white rounded-lg shadow-xl w-[500px] overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b bg-orange-50">
                <h3 className="text-lg font-serif font-semibold text-orange-900">Log Emergency Override</h3>
                <p className="text-[13px] text-orange-700 mt-1">Override the permanent schedule for {formData.date}</p>
              </div>
              <div className="p-6 space-y-4">
                {errorMsg && <div className="text-red-600 text-sm font-medium">{errorMsg}</div>}
                
                <div>
                  <label className="block text-[13px] font-medium text-gray-700 mb-1">Exception Type</label>
                  <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full border rounded px-3 py-2 text-[14px] focus:outline-none">
                    <option value="Absent">Mark Guard as Absent (Uncovered)</option>
                    <option value="Swap">Temporary Guard Swap</option>
                  </select>
                </div>

                {formData.type === 'Swap' && (
                  <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-1">Select Replacement Guard</label>
                    <select value={formData.replacementGuardId} onChange={e => setFormData({...formData, replacementGuardId: e.target.value})} className="w-full border rounded px-3 py-2 text-[14px] focus:outline-none" required={formData.type === 'Swap'}>
                      <option value="">Select a Replacement Guard</option>
                      {guards.map((g: any) => (
                        <option key={g.id} value={g.id}>{g.firstName} {g.lastName} ({g.guardId})</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-2">
                <button type="button" onClick={() => setIsCreatingException(false)} className="px-4 py-2 border rounded text-[13px] font-medium text-gray-600 bg-white hover:bg-gray-100">Cancel</button>
                <button type="submit" className="bg-orange-600 px-4 py-2 text-white text-[13px] font-medium rounded hover:bg-orange-700">Confirm Override</button>
              </div>
            </form>
          </div>
        )}
    </div>
  );
}

function Logs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [siteFilter, setSiteFilter] = useState('All Sites');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchLogs().then(setLogs).catch(console.error);
  }, []);

  const uniqueSites = Array.from(new Set(logs.map(log => log.mapPin?.patrolPath?.site?.name).filter(Boolean)));
  
  const filteredLogs = logs.filter(l => {
     const matchesSite = siteFilter === 'All Sites' || l.mapPin?.patrolPath?.site?.name === siteFilter;
     const guardName = l.guard ? `${l.guard.firstName} ${l.guard.lastName}`.toLowerCase() : 'system';
     const desc = (l.description || '').toLowerCase();
     const pinLoc = (l.mapPin?.name || '').toLowerCase();
     const matchesSearch = guardName.includes(searchQuery.toLowerCase()) || desc.includes(searchQuery.toLowerCase()) || pinLoc.includes(searchQuery.toLowerCase());
     return matchesSite && matchesSearch;
  });

  return (
    <div className="bg-white rounded border border-[#E2E8F0] shadow-sm">
        <div className="px-6 py-4 border-b border-[#E2E8F0] flex justify-between items-center bg-[#F8FAFC]">
          <div>
            <h2 className="text-[18px] font-semibold font-serif text-[#1E3A5F]">Incident Logs</h2>
            <p className="text-[13px] text-gray-500">Real-time audit trail of field activities.</p>
          </div>
          <div className="flex gap-2 relative">
            <input 
              type="text" 
              placeholder="Search guard, location, text..." 
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)}
              className="border border-[#E2E8F0] rounded pl-8 pr-3 py-1.5 text-[13px] text-[#0F172A] outline-none focus:border-[#1E3A5F] w-[200px]"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-2.5 top-2" />
            <select 
              value={siteFilter} 
              onChange={e => setSiteFilter(e.target.value)} 
              className="border border-[#E2E8F0] rounded px-3 py-1.5 text-[13px] text-gray-600 outline-none focus:border-[#1E3A5F]"
            >
              <option value="All Sites">All Sites</option>
              {uniqueSites.map((s: any) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-[#E2E8F0]">
                <th className="px-6 py-4 text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider">Timestamp</th>
                <th className="px-6 py-4 text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider">Description</th>
                <th className="px-6 py-4 text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider">Personnel</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-[13px] text-gray-500">No logs match your filters.</td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-[#F8FAFC] border-b border-gray-100">
                    <td className="px-6 py-4 text-[13px] text-gray-600">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      {log.isIncident ? (
                        <span className="text-[14px] font-medium text-[#C53030]">Incident</span>
                      ) : (
                        <span className="text-[14px] text-green-700">Routine</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-[14px] text-[#0F172A]">
                       {log.description || 'No description provided.'} 
                       <span className="ml-1 text-[13px] text-gray-400">
                          {log.mapPin ? `(@ ${log.mapPin.name}${log.mapPin.patrolPath?.site ? `, ${log.mapPin.patrolPath.site.name}` : ''})` : ''}
                       </span>
                    </td>
                    <td className="px-6 py-4 text-[13px] text-gray-700 font-medium">{log.guard ? `${log.guard.firstName} ${log.guard.lastName}` : 'System'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
    </div>
  );
}

function Reports() {
  const [stats, setStats] = useState<any>(null);
  useEffect(() => {
    fetchAnalytics().then(setStats).catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      <div>
         <h2 className="text-[24px] font-bold font-serif text-[#1E3A5F]">Performance Reports</h2>
         <p className="text-[14px] text-[#6B7280] mt-1">Key operational metrics and SLA compliance.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6">
           <h3 className="text-[14px] font-bold text-[#1E3A5F] mb-4">Guard Attendance Rate</h3>
           <div className="flex items-end gap-2 mb-2">
              <span className="text-[32px] font-bold text-[#0F172A] leading-none">{stats?.attendanceRate || 0}%</span>
              <span className="text-[13px] text-gray-600 font-medium mb-1">↑ 1.2%</span>
           </div>
           <p className="text-[13px] text-gray-500 mb-6">Across all active contracts this month.</p>
           
           <div className="w-full bg-gray-100 rounded-full h-2">
              <div className="bg-[#1E3A5F] h-2 rounded-full" style={{ width: `${stats?.attendanceRate || 0}%` }}></div>
           </div>
        </div>

        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6">
           <h3 className="text-[14px] font-bold text-[#1E3A5F] mb-4">Contract Fulfillment</h3>
           <div className="flex items-end gap-2 mb-2">
              <span className="text-[32px] font-bold text-[#0F172A] leading-none">{stats?.contractFulfillment || 0}%</span>
              <span className="text-[13px] text-gray-400 font-medium mb-1">-</span>
           </div>
           <p className="text-[13px] text-gray-500 mb-6">All requested shifts have been fully staffed.</p>
           
           <div className="w-full bg-gray-100 rounded-full h-2">
              <div className="bg-[#1E3A5F] h-2 rounded-full" style={{ width: `${stats?.contractFulfillment || 0}%` }}></div>
           </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6">
         <h3 className="text-[14px] font-bold text-[#1E3A5F] mb-4">Incident Resolution Time</h3>
         <div className="flex flex-col gap-4">
            <div>
               <div className="flex justify-between text-[13px] font-medium text-gray-600 mb-1">
                  <span>Critical Incidents</span>
                  <span><span className="font-bold text-[#0F172A]">{stats?.resolutionTimes?.critical || 0}</span> mins</span>
               </div>
               <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div className="bg-[#1E3A5F] h-1.5 rounded-full" style={{ width: `${Math.min(((stats?.resolutionTimes?.critical || 0) / 60) * 100, 100)}%` }}></div>
               </div>
            </div>
            <div>
               <div className="flex justify-between text-[13px] font-medium text-gray-600 mb-1">
                  <span>Warning / Elevated</span>
                  <span><span className="font-bold text-[#0F172A]">{stats?.resolutionTimes?.warning || 0}</span> mins</span>
               </div>
               <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div className="bg-[#475569] h-1.5 rounded-full" style={{ width: `${Math.min(((stats?.resolutionTimes?.warning || 0) / 60) * 100, 100)}%` }}></div>
               </div>
            </div>
            <div>
               <div className="flex justify-between text-[13px] font-medium text-gray-600 mb-1">
                  <span>Routine / Info</span>
                  <span><span className="font-bold text-[#0F172A]">{stats?.resolutionTimes?.routine || 0}</span> mins</span>
               </div>
               <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div className="bg-[#94A3B8] h-1.5 rounded-full" style={{ width: `${Math.min(((stats?.resolutionTimes?.routine || 0) / 120) * 100, 100)}%` }}></div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

function SettingsOps() {
  const [geofence, setGeofence] = useState(() => parseInt(localStorage.getItem('ops_geofence') || '50'));
  const [mapStyle, setMapStyle] = useState(() => localStorage.getItem('ops_mapStyle') || 'street');
  const [alerts, setAlerts] = useState(() => JSON.parse(localStorage.getItem('ops_alerts') || '{"missedPatrol":true,"sos":true,"geofence":false}'));

  const handleSave = () => {
     localStorage.setItem('ops_geofence', geofence.toString());
     localStorage.setItem('ops_mapStyle', mapStyle);
     localStorage.setItem('ops_alerts', JSON.stringify(alerts));
     
     alert('Global Configurations saved successfully.');
  };
  
  return (
    <div className="bg-white rounded border border-[#E2E8F0] shadow-sm max-w-4xl">
        <div className="px-6 py-4 border-b border-[#E2E8F0] bg-[#F8FAFC]">
          <h2 className="text-[18px] font-semibold font-serif text-[#1E3A5F]">Operations Settings</h2>
          <p className="text-[13px] text-gray-500">Configure global mechanics, map interfaces, and alert sensitivities.</p>
        </div>
        
        <div className="p-6 space-y-8">
           {/* Section 1: Map Mechanics */}
           <section>
              <h3 className="text-[14px] font-bold text-[#0F172A] mb-3 pb-2 border-b border-gray-100">Map & Tracking Mechanics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div>
                    <label className="block text-[13px] font-medium text-[#1E3A5F] mb-1.5">Default Map Render Style</label>
                    <select value={mapStyle} onChange={(e) => setMapStyle(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 text-[13px] focus:outline-none focus:border-blue-500 bg-white">
                       <option value="street">Standard Street Navigation</option>
                       <option value="satellite">High-Res Satellite View</option>
                       <option value="dark">Tactical Dark Mode (Night)</option>
                    </select>
                 </div>
                 <div>
                    <label className="flex justify-between items-center text-[13px] font-medium text-[#1E3A5F] mb-1.5">
                       <span>Checkpoint Scan Radius (m)</span>
                       <span className="text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded">{geofence}m</span>
                    </label>
                    <input 
                      type="range" 
                      min="10" max="200" step="10" 
                      value={geofence} 
                      onChange={(e) => setGeofence(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 mt-2" 
                    />
                    <p className="text-[11px] text-gray-500 mt-2 leading-relaxed">Allowable GPS drift displacement when a guard physically scans an NFC checkpoint tag on site.</p>
                 </div>
              </div>
           </section>

           {/* Section 2: Alert Escalation */}
           <section>
              <h3 className="text-[14px] font-bold text-[#0F172A] mb-4 pb-2 border-b border-gray-100">Critical Alert Dispatching</h3>
              <div className="space-y-4">
                 <label className="flex items-start gap-3 cursor-pointer group">
                    <input type="checkbox" checked={alerts.sos} onChange={e=>setAlerts({...alerts, sos: e.target.checked})} className="mt-0.5 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                    <div>
                       <p className="text-[13px] font-semibold text-[#1E3A5F] leading-none mb-1 group-hover:text-blue-600 transition-colors">SOS Panic Button Triggers</p>
                       <p className="text-[12px] text-gray-500">Push notification SMS when guard hits panic module on mobile app.</p>
                    </div>
                 </label>
                 <label className="flex items-start gap-3 cursor-pointer group">
                    <input type="checkbox" checked={alerts.missedPatrol} onChange={e=>setAlerts({...alerts, missedPatrol: e.target.checked})} className="mt-0.5 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                    <div>
                       <p className="text-[13px] font-semibold text-[#1E3A5F] leading-none mb-1 group-hover:text-blue-600 transition-colors">Missed Patrol Checkpoints</p>
                       <p className="text-[12px] text-gray-500">Alert if guard is &gt;15 mins late to NFC scan point schedule.</p>
                    </div>
                 </label>
                 <label className="flex items-start gap-3 cursor-pointer group">
                    <input type="checkbox" checked={alerts.geofence} onChange={e=>setAlerts({...alerts, geofence: e.target.checked})} className="mt-0.5 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                    <div>
                       <p className="text-[13px] font-semibold text-[#1E3A5F] leading-none mb-1 group-hover:text-blue-600 transition-colors">Spoofed Checkpoint Scans</p>
                       <p className="text-[12px] text-gray-500">Flag when a guard scans a checkpoint tag from outside the allowable physical radius.</p>
                    </div>
                 </label>
              </div>
           </section>
        </div>

        <div className="px-6 py-4 border-t border-[#E2E8F0] bg-gray-50 flex justify-end">
           <button onClick={handleSave} className="bg-[#1E3A5F] text-white px-5 py-2.5 rounded text-[13px] font-semibold hover:bg-black transition-colors shadow-sm">
              Save Global Configurations
           </button>
        </div>
    </div>
  )
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
    localStorage.removeItem('spms_token');
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
          <Route path="schedules" element={<Schedules />} />
          <Route path="logs" element={<Logs />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<SettingsOps />} />
          <Route path="*" element={<div>Page under construction</div>} />
        </Route>
        
        <Route path="/map" element={<ProtectedRoute allowed={['OPERATION_MANAGER', 'CLIENT']} role={user?.role}><DashboardLayout user={user} onLogout={handleLogout} /></ProtectedRoute>}>
            <Route index element={<MapControl />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
