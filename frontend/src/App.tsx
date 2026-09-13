import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { useEffect, useState, useMemo } from 'react';
import { Toaster } from 'react-hot-toast';
import { ShieldAlert, Users, FileText, CheckCircle2, AlertTriangle, Calendar, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import * as XLSX from 'xlsx';
import DashboardLayout from './components/DashboardLayout';
import AdminLayout from './components/AdminLayout';
import ClientLayout from './components/ClientLayout';
import AgencyLayout from './components/AgencyLayout';
import MapControl from './components/MapControl';
import SiteLocationPicker from './components/SiteLocationPicker';
import GuardLayout from './components/GuardLayout';
import GuardDashboard from './pages/guard/Dashboard';
import GuardMyShifts from './pages/guard/MyShifts';
import GuardReportIncident from './pages/guard/ReportIncident';
import { fetchGuards, fetchContracts, createContract, updateContract, deleteContract, createGuard, updateGuard, deleteGuard, loginUser, fetchUsers, createUser, deleteUser, fetchSchedules, generateSchedules, assignGuard, fetchLogs, fetchAttendanceLogs, fetchReportsOverview, fetchGuardPerformance, createRoster, deleteRoster, createException, toggleGuardVisibility, resolveIncident, provisionGuardAccount, batchAssignGuard, fetchAutoScheduleRecommendations } from './api';

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
      const userObj = {
        ...data.user,
        name: data.user?.name || data.user?.email?.split('@')[0] || 'Guard User'
      };
      onLogin(userObj);
    } catch (err) { alert("Failed to log in"); }
    setLoading(false);
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F8FAFC] p-4 sm:p-6">
      <div className="flex flex-col md:flex-row w-full max-w-[850px] bg-white rounded-xl shadow-lg border border-[#E2E8F0] overflow-hidden">

        {/* Login Form Section */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 md:p-10 border-b md:border-b-0 md:border-r border-[#E2E8F0] flex flex-col justify-center">
          <div className="mb-6 md:mb-8 text-center md:text-left">
            <h2 className="text-[22px] sm:text-[26px] font-bold text-[#1E3A5F]">SPMS Portal</h2>
            <p className="text-[13px] sm:text-[14px] text-gray-500 mt-1">Sign in to your operations account</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">
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

        {/* Active Demo Credentials Section */}
        <div className="w-full md:w-1/2 bg-[#F1F5F9] p-6 sm:p-8 md:p-10 flex flex-col justify-center">
          <h3 className="text-[13px] sm:text-[14px] font-bold text-[#1E3A5F] mb-4 md:mb-5 uppercase tracking-wider">Active Demo Credentials</h3>
          <ul className="space-y-3 sm:space-y-4 text-[13px] text-gray-700">
            <li className="flex flex-col border-b border-gray-200 pb-2.5">
              <span className="font-semibold text-[#1E3A5F]">Operation Manager</span>
              <span className="mt-1 text-blue-600 bg-blue-50 px-2 py-1 rounded w-fit select-all font-mono text-[12px]">ops@spms.com</span>
            </li>
            <li className="flex flex-col border-b border-gray-200 pb-2.5">
              <span className="font-semibold text-[#1E3A5F]">Security Guard</span>
              <span className="mt-1 text-blue-600 bg-blue-50 px-2 py-1 rounded w-fit select-all font-mono text-[12px]">guard1@spms.com</span>
            </li>
            <li className="flex flex-col border-b border-gray-200 pb-2.5">
              <span className="font-semibold text-[#1E3A5F]">System Admin</span>
              <span className="mt-1 text-blue-600 bg-blue-50 px-2 py-1 rounded w-fit select-all font-mono text-[12px]">admin@spms.com</span>
            </li>
            <li className="flex flex-col border-b border-gray-200 pb-2.5">
              <span className="font-semibold text-[#1E3A5F]">Client</span>
              <span className="mt-1 text-blue-600 bg-blue-50 px-2 py-1 rounded w-fit select-all font-mono text-[12px]">client@spms.com</span>
            </li>
            <li className="flex flex-col pb-1">
              <span className="font-semibold text-[#1E3A5F]">Agency Manager</span>
              <span className="mt-1 text-blue-600 bg-blue-50 px-2 py-1 rounded w-fit select-all font-mono text-[12px]">agency@spms.com</span>
            </li>
          </ul>
          <p className="text-[11px] text-gray-500 mt-4 md:mt-6">(The password for all accounts is 1234 or password123)</p>
        </div>
      </div>
    </div>
  )
}


function Pagination({ currentPage, totalPages, onPageChange }: { currentPage: number, totalPages: number, onPageChange: (p: number) => void }) {
  const displayTotal = totalPages < 1 ? 1 : totalPages;
  return (
    <div className="px-6 py-3 border-t border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
      <span className="text-[13px] text-gray-500">Page {currentPage} of {displayTotal}</span>
      <div className="flex gap-2">
        <button type="button" disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)} className="px-3 py-1 border rounded text-[13px] disabled:opacity-50 bg-white hover:bg-gray-50 transition-colors text-gray-700">Previous</button>
        <button type="button" disabled={currentPage >= displayTotal} onClick={() => onPageChange(currentPage + 1)} className="px-3 py-1 border rounded text-[13px] disabled:opacity-50 bg-white hover:bg-gray-50 transition-colors text-gray-700">Next</button>
      </div>
    </div>
  );
}


function Overview({ role }: { role: string }) {
  const [stats, setStats] = useState<any>(null);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  useEffect(() => {
    fetchReportsOverview().then(setStats).catch(console.error);
    fetchLogs().then((res: any) => setRecentLogs(res.slice(0, 3))).catch(console.error);
  }, []);

  const title = role === 'ADMIN' ? 'System Command Center' :
    role === 'CLIENT' ? 'Client Command Center' :
      role === 'AGENCY_MANAGER' ? 'Vendor Command Center' :
        'Operations Command Center';

  const subtitle = role === 'ADMIN' ? 'Real-time oversight of global system identity.' :
    role === 'CLIENT' ? 'Real-time oversight of your secured properties.' :
      role === 'AGENCY_MANAGER' ? 'Real-time oversight of your deployed personnel.' :
        'Real-time oversight of global security operations.';

  const getPrefix = () => {
    if (role === 'ADMIN') return '/admin';
    if (role === 'CLIENT') return '/client';
    if (role === 'AGENCY_MANAGER') return '/agency';
    return '/dashboard';
  };
  const prefix = getPrefix();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[24px] font-bold text-[#1E3A5F]">{title}</h2>
        <p className="text-[14px] text-[#6B7280] mt-1">{subtitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to={role === 'ADMIN' ? '/admin' : role === 'AGENCY_MANAGER' ? '/agency' : `${prefix}/contracts`} className="bg-white p-6 rounded-xl border border-[#E2E8F0] shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer hover:border-blue-300">
          <div className="w-12 h-12 bg-[#F1F5F9] rounded-lg flex items-center justify-center border border-[#E2E8F0] text-[#1E3A5F]">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider">Active Contracts</p>
            <p className="text-[28px] font-bold text-[#0F172A] leading-none mt-1">{stats?.activeContracts ?? '-'}</p>
          </div>
        </Link>

        <Link to={role === 'ADMIN' ? '/admin' : role === 'CLIENT' ? '/client' : `${prefix}/guards`} className="bg-white p-6 rounded-xl border border-[#E2E8F0] shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer hover:border-blue-300">
          <div className="w-12 h-12 bg-[#F1F5F9] rounded-lg flex items-center justify-center border border-[#E2E8F0] text-[#1E3A5F]">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider">Guards on Duty</p>
            <p className="text-[28px] font-bold text-[#0F172A] leading-none mt-1">{stats?.guardsOnDuty ?? '-'}</p>
          </div>
        </Link>

        <Link to={role === 'ADMIN' ? '/admin' : role === 'CLIENT' ? '/client/reports' : `${prefix}/logs`} className="bg-white p-6 rounded-xl border border-[#E2E8F0] shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer hover:border-blue-300">
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
                    <span className="text-gray-400 font-normal text-[12px] ml-2">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
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
            <Link to={role === 'ADMIN' ? '/admin' : role === 'AGENCY_MANAGER' ? '/agency' : `${prefix}/contracts`} className="p-4 border border-[#E2E8F0] rounded-lg text-center hover:bg-[#F8FAFC] transition-colors flex flex-col items-center justify-center gap-2">
              <FileText className="w-6 h-6 text-[#1E3A5F]" />
              <span className="text-[13px] font-medium text-[#1E3A5F]">Manage Contracts</span>
            </Link>
            <Link to={role === 'ADMIN' ? '/admin' : role === 'CLIENT' ? '/client/map' : `${prefix}/schedules`} className="p-4 border border-[#E2E8F0] rounded-lg text-center hover:bg-[#F8FAFC] transition-colors flex flex-col items-center justify-center gap-2">
              <Calendar className="w-6 h-6 text-[#1E3A5F]" />
              <span className="text-[13px] font-medium text-[#1E3A5F]">Shift Schedules</span>
            </Link>
            <Link to={role === 'ADMIN' ? '/admin' : role === 'CLIENT' ? '/client/reports' : `${prefix}/logs`} className="p-4 border border-[#E2E8F0] rounded-lg text-center hover:bg-[#F8FAFC] transition-colors flex flex-col items-center justify-center gap-2">
              <ShieldAlert className="w-6 h-6 text-[#1E3A5F]" />
              <span className="text-[13px] font-medium text-[#1E3A5F]">Incident Logs</span>
            </Link>
            <Link to={role === 'ADMIN' ? '/admin' : role === 'AGENCY_MANAGER' ? '/agency/reports' : `${prefix}/reports`} className="p-4 border border-[#E2E8F0] rounded-lg text-center hover:bg-[#F8FAFC] transition-colors flex flex-col items-center justify-center gap-2">
              <BarChart className="w-6 h-6 text-[#1E3A5F]" />
              <span className="text-[13px] font-medium text-[#1E3A5F]">View Reports</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function ClientContracts({ user }: { user?: any }) {
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

function AdminGuardProvisioning() {
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
    } catch (e) { console.error(e); }
  };

  useEffect(() => { loadGuards(); }, []);

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
                <th className="px-6 py-3 text-[12px] font-semibold text-[#6B7280]">Source</th>
                <th className="px-6 py-3 text-[12px] font-semibold text-[#6B7280]">Account Status</th>
                <th className="px-6 py-3 text-[12px] font-semibold text-[#6B7280]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedGuards.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-[13px] text-gray-500">No guards found in the system.</td>
                </tr>
              ) : paginatedGuards.map(g => (
                <tr key={g.id} className="hover:bg-gray-50 border-b last:border-0 border-gray-100">
                  <td className="px-6 py-4 text-[14px] font-medium text-[#0F172A]">{g.guardId}</td>
                  <td className="px-6 py-4 text-[14px] text-gray-600">{g.firstName} {g.lastName}</td>
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

function AdminUserManagement() {
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

function Contracts() {
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
                          <option value="Residential">Residential / Condo</option>
                          <option value="Warehouse">Warehouse & Logistics</option>
                          <option value="Retail">Retail & Commercial</option>
                          <option value="Construction">Construction Site</option>
                          <option value="Corporate">Corporate Office</option>
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
                          📍 {site.latitude && site.longitude ? `${site.latitude.toFixed(4)}, ${site.longitude.toFixed(4)}` : 'Pick Pin'}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="block text-[12px] font-medium text-gray-700 mb-1">Guards Per Shift</label>
                        <input type="number" min={1} value={site.guardsPerShift} onChange={e => updateSiteField(i, 'guardsPerShift', parseInt(e.target.value) || 1)} className="w-full border rounded px-3 py-1.5 text-[14px]" />
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

function Guards() {
  const [guards, setGuards] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [shiftFilter, setShiftFilter] = useState('All');

  const filteredGuards = useMemo(() => {
    return guards.filter(g => {
      const gName = (g.firstName + ' ' + g.lastName).toLowerCase();
      const agencyName = (g.agency?.name || 'In-House').toLowerCase();
      const matchesSearch = gName.includes(searchQuery.toLowerCase()) || 
                            g.guardId.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            agencyName.includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || g.status === statusFilter;
      const matchesShift = shiftFilter === 'All' || g.shiftPreference === shiftFilter;
      return matchesSearch && matchesStatus && matchesShift;
    });
  }, [guards, searchQuery, statusFilter, shiftFilter]);

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
                  <td colSpan={7} className="px-6 py-8 text-center text-[13px] text-[#6B7280]">No guards match your search filters.</td>
                </tr>
              ) : (
                paginatedGuards.map((g) => (
                  <tr key={g.id} className="hover:bg-[#F8FAFC]">
                    <td className="px-6 py-4 text-[14px] font-medium text-[#1E3A5F]">{g.guardId}</td>
                    <td className="px-6 py-4 text-[14px] text-[#0F172A]">{g.firstName} {g.lastName}</td>
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

              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1">Shift Preferences</label>
                <select value={formData.shiftPreference} onChange={e => setFormData({ ...formData, shiftPreference: e.target.value })} className="w-full border rounded px-3 py-2 text-[14px] focus:outline-none focus:ring-1 focus:ring-[#1E3A5F]">
                  <option value="Flexible">Flexible</option>
                  <option value="Day">Day Shifts Only</option>
                  <option value="Night">Night Shifts Only</option>
                </select>
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

function Schedules({ role }: { role?: string }) {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [guards, setGuards] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'calendar' | 'monthly'>('monthly');
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const today = new Date();
    today.setDate(today.getDate() - today.getDay());
    return today;
  });
  const [isCreatingRoster, setIsCreatingRoster] = useState(false);
  const [isCreatingException, setIsCreatingException] = useState(false);
  const [siteFilter, setSiteFilter] = useState('All Sites');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [contracts, setContracts] = useState<any[]>([]);

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
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAssigning, setIsAssigning] = useState<any>(null);

  const loadSchedules = () => {
    // If a site is selected, we could pass it to fetchSchedules, but we can also just filter client-side.
    // We already fetch all restricted schedules on backend.
    fetchSchedules().then(setSchedules).catch(console.error);
  };

  useEffect(() => {
    loadSchedules();
    if (role === 'OPERATION_MANAGER' || !role) {
      fetchGuards().then(setGuards).catch(console.error);
      fetchContracts().then(setContracts).catch(console.error);
    }
  }, [role]);

  // Extract available sites from schedules so it works for all roles without full contracts access
  const uniqueSites = Array.from(
    new Map(
      schedules.filter(s => s.site).map(s => [s.site.id, s.site])
    ).values()
  ) as any[];

  // Full global sites extracted straight from contracts for Ops deployment menu
  const allGlobalSites = useMemo(() => {
    const arr: any[] = [];
    contracts.forEach(c => {
      if (c.sites) c.sites.forEach((s: any) => arr.push({ ...s, clientName: c.clientCompanyName }));
    });
    return arr;
  }, [contracts]);

  const isOps = role === 'OPERATION_MANAGER' || !role;

  const formatGuardName = (g: any) => {
    if (!g) return 'Unassigned';
    if (role === 'CLIENT') return `${g.firstName || 'Unknown'} ${g.lastName?.[0] || '?'}.`;
    return `${g.firstName || ''} ${g.lastName || ''}`.trim() || 'Unknown Guard';
  };

  const formatSiteName = (s: any) => {
    if (!s) return 'Unknown Site';
    if (isOps && s.contract?.clientCompanyName) {
      return `${s.contract.clientCompanyName} - ${s.name}`;
    }
    return s.name;
  };

  const openCreateRoster = () => {
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
    setIsCreatingException(true);
  };

  const handleDeleteRoster = async (rosterId: string) => {
    if (!confirm('Are you sure you want to delete this Permanent Post? This affects all upcoming days indefinitely.')) return;
    try {
      await deleteRoster(rosterId);
      loadSchedules();
    } catch (err) {
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
    if (!formData.guardId || !formData.siteId) return setErrorMsg('Guard and Site are required.');

    const selectedGuard = guards.find(g => g.id === formData.guardId);
    if (selectedGuard && selectedGuard.shiftPreference) {
      const startHour = parseInt(formData.startTime.split(':')[0], 10);
      const isNightShift = startHour >= 18 || startHour < 6;
      const pref = selectedGuard.shiftPreference.toLowerCase();
      let mismatch = false;
      if (pref.includes('day') && isNightShift) mismatch = true;
      if (pref.includes('night') && !isNightShift) mismatch = true;

      if (mismatch) {
        const confirmMsg = `Caution: You are assigning a ${isNightShift ? 'Night' : 'Day'} shift to a guard who prefers ${selectedGuard.shiftPreference} shifts. Do you want to proceed?`;
        if (!window.confirm(confirmMsg)) return;
      }
    }

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

  const [isGeneratingSlots, setIsGeneratingSlots] = useState(false);
  const [ungeneratedPageIndex, setUngeneratedPageIndex] = useState(0);
  const [unassignedPageIndex, setUnassignedPageIndex] = useState(0);
  const [generateSlotData, setGenerateSlotData] = useState({
    siteId: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
  });

  const handleGenerateSlotsSubmit = async (e: any) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const res = await generateSchedules({
        siteId: generateSlotData.siteId || undefined,
        startDate: generateSlotData.startDate,
        endDate: generateSlotData.endDate
      });
      setIsGeneratingSlots(false);
      alert(`Successfully generated ${res.inserted} shift slots!`);
      loadSchedules();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to generate shift slots');
    }
  };

  const [isBatchAssigning, setIsBatchAssigning] = useState(false);
  const [batchFormData, setBatchFormData] = useState({
    siteId: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 6 * 86400000).toISOString().split('T')[0],
    guardId: '',
    startTime: '08:00',
    endTime: '20:00'
  });

  const handleBatchAssignSubmit = async (e: any) => {
    e.preventDefault();
    setErrorMsg('');
    if (!batchFormData.siteId || !batchFormData.guardId) return setErrorMsg('Site and Guard are required');
    try {
      const res = await batchAssignGuard(batchFormData);
      setIsBatchAssigning(false);
      alert(`Successfully assigned guard to ${res.updatedCount} shift slots!${res.skippedCount > 0 ? ` (${res.skippedCount} skipped due to daily shift limits)` : ''}`);
      loadSchedules();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to batch assign guard');
    }
  };

  const [isAutoScheduling, setIsAutoScheduling] = useState(false);
  const [isCalculatingAutoSchedule, setIsCalculatingAutoSchedule] = useState(false);
  const [autoScheduleFilter, setAutoScheduleFilter] = useState({
    siteId: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
  });
  const [autoRecommendations, setAutoRecommendations] = useState<any[]>([]);
  const [selectedGuardMap, setSelectedGuardMap] = useState<{ [rosterId: string]: string }>({});
  const [acceptedRosterMap, setAcceptedRosterMap] = useState<{ [rosterId: string]: boolean }>({});

  const handleCalculateAutoSchedule = async (filterObj?: any) => {
    setIsCalculatingAutoSchedule(true);
    setErrorMsg('');
    const targetFilter = filterObj || autoScheduleFilter;
    try {
      const res = await fetchAutoScheduleRecommendations({
        siteId: targetFilter.siteId || undefined,
        startDate: targetFilter.startDate,
        endDate: targetFilter.endDate
      });
      const recs = res.recommendations || [];
      setAutoRecommendations(recs);

      const initialGuards: { [rId: string]: string } = {};
      const initialAccepted: { [rId: string]: boolean } = {};
      recs.forEach((item: any) => {
        if (item.recommendedGuard) {
          initialGuards[item.rosterId] = item.recommendedGuard.guardId;
          initialAccepted[item.rosterId] = true;
        }
      });
      setSelectedGuardMap(initialGuards);
      setAcceptedRosterMap(initialAccepted);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to calculate auto-schedule recommendations');
    } finally {
      setIsCalculatingAutoSchedule(false);
    }
  };

  const handleApplyAutoScheduleSubmit = async () => {
    setErrorMsg('');
    const targetRosterIds = Object.keys(acceptedRosterMap).filter(rId => acceptedRosterMap[rId] && selectedGuardMap[rId]);
    if (targetRosterIds.length === 0) {
      return setErrorMsg('No assignments selected to apply.');
    }

    try {
      let appliedCount = 0;
      for (const rId of targetRosterIds) {
        const guardId = selectedGuardMap[rId];
        await assignGuard(rId, guardId);
        appliedCount++;
      }
      setIsAutoScheduling(false);
      alert(`Successfully applied ${appliedCount} recommended shift assignments!`);
      loadSchedules();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error applying recommendations');
    }
  };

  const handleAssignGuardSubmit = async (e: any) => {
    e.preventDefault();
    setErrorMsg('');
    if (!formData.guardId) return setErrorMsg('Select a guard first');
    try {
      await assignGuard(isAssigning.id, formData.guardId);
      setIsAssigning(null);
      alert('Changes saved');
      loadSchedules();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to assign guard due to constraints');
    }
  };

  const filteredSchedules = schedules.filter(s => {
    let matchesSite = siteFilter === 'All Sites' || s.site?.id === siteFilter;
    let guardName = formatGuardName(s.guard).toLowerCase();
    let contractN = (s.site?.contract?.clientCompanyName || '').toLowerCase();
    let agencyN = (s.guard?.agency?.name || '').toLowerCase();
    
    let matchQuery = true;
    if (searchQuery) {
      let q = searchQuery.toLowerCase();
      matchQuery = guardName.includes(q) || contractN.includes(q) || agencyN.includes(q) || formatSiteName(s.site).toLowerCase().includes(q);
    }
    
    let matchDate = true;
    if (dateFilter && s.date) {
      matchDate = s.date.startsWith(dateFilter);
    }
    
    return matchesSite && matchQuery && matchDate;
  });

  // Calculate Shift Coverage Summaries for Ops Managers
  const unassignedSummaries = (() => {
    const unassignedShifts = schedules.filter(s => s.guardId == null || s.status === 'Unassigned');
    if (unassignedShifts.length === 0) return [];

    const groups: { [key: string]: { siteName: string; timing: string; dates: Date[]; count: number } } = {};

    unassignedShifts.forEach(s => {
      const siteName = formatSiteName(s.site);
      const timing = s.shiftLabel ? s.shiftLabel.split(' (')[1]?.replace(')', '') || '08:00 - 20:00' : `${s.startTime || '08:00'} - ${s.endTime || '20:00'}`;
      const key = `${s.siteId}_${timing}`;

      const d = s.date ? new Date(s.date) : new Date();

      if (!groups[key]) {
        groups[key] = { siteName, timing, dates: [d], count: 1 };
      } else {
        groups[key].dates.push(d);
        groups[key].count++;
      }
    });

    return Object.values(groups).map(g => {
      g.dates.sort((a, b) => a.getTime() - b.getTime());
      const minD = g.dates[0].toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      const maxD = g.dates[g.dates.length - 1].toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      const dateRangeStr = minD === maxD ? minD : `${minD} - ${maxD}`;
      return {
        siteId: g.siteId,
        siteName: g.siteName,
        timing: g.timing,
        dateRange: dateRangeStr,
        startDateIso: g.dates[0].toISOString().split('T')[0],
        endDateIso: g.dates[g.dates.length - 1].toISOString().split('T')[0],
        count: g.count
      };
    });
  })();

  // Calculate Slot Generation Coverage Summaries for Ops Managers (Sites with missing/ungenerated slots)
  const ungeneratedSlotSummaries = (() => {
    if (!uniqueSites || uniqueSites.length === 0) return [];
    
    // Check coverage for current month
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    // Month start and end
    const monthStart = new Date(currentYear, currentMonth, 1);
    const monthEnd = new Date(currentYear, currentMonth + 1, 0);

    const summaries: { siteId: string; siteName: string; missingStartDate: string; missingEndDate: string; dateRange: string }[] = [];

    uniqueSites.forEach((site: any) => {
      const siteSchedules = schedules.filter(s => s.siteId === site.id);
      
      // Determine existing date range generated
      if (siteSchedules.length === 0) {
        // No slots generated at all for this site
        const startStr = monthStart.toISOString().split('T')[0];
        const endStr = monthEnd.toISOString().split('T')[0];
        const minD = monthStart.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        const maxD = monthEnd.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        summaries.push({
          siteId: site.id,
          siteName: formatSiteName(site),
          missingStartDate: startStr,
          missingEndDate: endStr,
          dateRange: `${minD} - ${maxD}`
        });
      } else {
        // Find max generated date
        const generatedDates = siteSchedules.map(s => new Date(s.date).getTime());
        const maxGenTime = Math.max(...generatedDates);
        const maxGenDate = new Date(maxGenTime);

        // If max generated date is before month end, slots are missing for remaining days of month
        if (maxGenDate < monthEnd) {
          const nextDay = new Date(maxGenDate);
          nextDay.setDate(nextDay.getDate() + 1);
          
          if (nextDay <= monthEnd) {
            const startStr = nextDay.toISOString().split('T')[0];
            const endStr = monthEnd.toISOString().split('T')[0];
            const minD = nextDay.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            const maxD = monthEnd.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            summaries.push({
              siteId: site.id,
              siteName: formatSiteName(site),
              missingStartDate: startStr,
              missingEndDate: endStr,
              dateRange: `${minD} - ${maxD}`
            });
          }
        }
      }
    });

    return summaries;
  })();

  return (
    <div className="bg-white rounded border border-[#E2E8F0] shadow-sm">
      {/* Side-by-Side Operational Summary Banners with Pagination for Ops Managers */}
      {isOps && (ungeneratedSlotSummaries.length > 0 || unassignedSummaries.length > 0) && (
        <div className="bg-[#F1F5F9] border-b border-[#E2E8F0] px-6 py-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            
            {/* 1. Slot Generation Coverage Summary Panel (Left Column) */}
            {ungeneratedSlotSummaries.length > 0 ? (
              <div className="flex flex-col gap-2.5 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-bold text-[#1E3A5F] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-slate-700 inline-block"></span>
                    <span>Slot Generation Coverage ({ungeneratedSlotSummaries.length} {ungeneratedSlotSummaries.length === 1 ? 'Site Missing' : 'Sites Missing'})</span>
                  </span>
                  {ungeneratedSlotSummaries.length > 1 && (
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600">
                      <button
                        onClick={() => setUngeneratedPageIndex(prev => Math.max(0, prev - 1))}
                        disabled={ungeneratedPageIndex === 0}
                        className="px-2 py-0.5 border rounded bg-slate-50 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        ‹
                      </button>
                      <span>{ungeneratedPageIndex + 1} / {ungeneratedSlotSummaries.length}</span>
                      <button
                        onClick={() => setUngeneratedPageIndex(prev => Math.min(ungeneratedSlotSummaries.length - 1, prev + 1))}
                        disabled={ungeneratedPageIndex >= ungeneratedSlotSummaries.length - 1}
                        className="px-2 py-0.5 border rounded bg-slate-50 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        ›
                      </button>
                    </div>
                  )}
                </div>

                {(() => {
                  const safeIndex = Math.min(ungeneratedPageIndex, ungeneratedSlotSummaries.length - 1);
                  const item = ungeneratedSlotSummaries[safeIndex] || ungeneratedSlotSummaries[0];
                  if (!item) return null;
                  return (
                    <div 
                      onClick={() => {
                        setGenerateSlotData({
                          siteId: item.siteId,
                          startDate: item.missingStartDate,
                          endDate: item.missingEndDate
                        });
                        setIsGeneratingSlots(true);
                      }}
                      className="bg-slate-50 border border-slate-300 rounded-lg p-3 flex flex-col justify-between hover:border-[#1E3A5F] cursor-pointer transition-all hover:bg-white group shadow-2xs"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <span className="font-bold text-[13px] text-[#0F172A] truncate group-hover:text-[#1E3A5F]">{item.siteName}</span>
                        <span className="bg-slate-200 text-slate-800 border border-slate-300 font-bold text-[11px] px-2 py-0.5 rounded-md whitespace-nowrap">
                          Slots Not Generated
                        </span>
                      </div>
                      <div className="text-[12px] text-slate-600 mt-2 flex justify-between items-center border-t border-slate-200 pt-2">
                        <span className="font-medium text-slate-700">Missing Period: {item.dateRange}</span>
                        <span className="text-[11px] font-bold text-[#1E3A5F] underline">Generate Slots →</span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : <div />}

            {/* 2. Unassigned Shift Summary Panel (Right Column) */}
            {unassignedSummaries.length > 0 ? (
              <div className="flex flex-col gap-2.5 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-bold text-[#1E3A5F] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-slate-700 inline-block"></span>
                    <span>Unassigned Shift Summary ({unassignedSummaries.reduce((a, b) => a + b.count, 0)} Total Unassigned)</span>
                  </span>
                  {unassignedSummaries.length > 1 && (
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600">
                      <button
                        onClick={() => setUnassignedPageIndex(prev => Math.max(0, prev - 1))}
                        disabled={unassignedPageIndex === 0}
                        className="px-2 py-0.5 border rounded bg-slate-50 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        ‹
                      </button>
                      <span>{unassignedPageIndex + 1} / {unassignedSummaries.length}</span>
                      <button
                        onClick={() => setUnassignedPageIndex(prev => Math.min(unassignedSummaries.length - 1, prev + 1))}
                        disabled={unassignedPageIndex >= unassignedSummaries.length - 1}
                        className="px-2 py-0.5 border rounded bg-slate-50 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        ›
                      </button>
                    </div>
                  )}
                </div>

                {(() => {
                  const safeIndex = Math.min(unassignedPageIndex, unassignedSummaries.length - 1);
                  const item = unassignedSummaries[safeIndex] || unassignedSummaries[0];
                  if (!item) return null;
                  return (
                    <div 
                      onClick={() => {
                        setBatchFormData({
                          siteId: item.siteId || (uniqueSites[0]?.id || ''),
                          startDate: item.startDateIso || new Date().toISOString().split('T')[0],
                          endDate: item.endDateIso || new Date().toISOString().split('T')[0],
                          guardId: '',
                          startTime: item.timing.split(' - ')[0] || '08:00',
                          endTime: item.timing.split(' - ')[1] || '20:00'
                        });
                        setIsBatchAssigning(true);
                      }}
                      className="bg-slate-50 border border-slate-300 rounded-lg p-3 flex flex-col justify-between hover:border-[#1E3A5F] cursor-pointer transition-all hover:bg-white group shadow-2xs"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <span className="font-bold text-[13px] text-[#0F172A] truncate group-hover:text-[#1E3A5F]">{item.siteName}</span>
                        <span className="bg-slate-200 text-slate-800 border border-slate-300 font-bold text-[11px] px-2 py-0.5 rounded-md whitespace-nowrap">
                          {item.count} {item.count === 1 ? 'Shift Unassigned' : 'Shifts Unassigned'}
                        </span>
                      </div>
                      <div className="text-[12px] text-slate-600 mt-2 flex justify-between items-center border-t border-slate-200 pt-2">
                        <span className="font-medium text-slate-700">Time: {item.timing}</span>
                        <span className="font-medium text-slate-500">Period: {item.dateRange}</span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : <div />}

          </div>
        </div>
      )}

      <div className="px-6 py-4 border-b border-[#E2E8F0] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#F8FAFC]">
        <div>
          <h2 className="text-[18px] font-semibold font-serif text-[#1E3A5F]">Shift Schedules</h2>
          <p className="text-[13px] text-gray-500">Assign and monitor daily patrol rotations.</p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <input
            type="text"
            placeholder="Search guard, agency, client..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="border border-[#E2E8F0] rounded px-3 py-1.5 text-[13px] text-[#0F172A] outline-none flex-1 min-w-[300px] sm:min-w-[400px]"
          />
          <input
            type="date"
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
            className="border border-[#E2E8F0] rounded px-3 py-1.5 text-[13px] text-[#0F172A] outline-none"
          />
          <select
            value={siteFilter}
            onChange={e => setSiteFilter(e.target.value)}
            className="border border-[#E2E8F0] rounded px-3 py-1.5 text-[13px] text-gray-600 outline-none focus:border-[#1E3A5F]"
          >
            <option value="All Sites">All Sites</option>
            {uniqueSites.map((s: any) => <option key={s.id} value={s.id}>{formatSiteName(s)}</option>)}
          </select>
          <div className="flex bg-gray-200 p-1 rounded">
            <button
              onClick={() => setViewMode('monthly')}
              className={`px-3 py-1 text-[13px] font-medium rounded ${viewMode === 'monthly' ? 'bg-white shadow-sm text-[#1E3A5F]' : 'text-gray-500'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1 text-[13px] font-medium rounded ${viewMode === 'calendar' ? 'bg-white shadow-sm text-[#1E3A5F]' : 'text-gray-500'}`}
            >
              Weekly
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 text-[13px] font-medium rounded ${viewMode === 'list' ? 'bg-white shadow-sm text-[#1E3A5F]' : 'text-gray-500'}`}
            >
              List
            </button>
          </div>
          {isOps && (
            <>
              <button 
                onClick={() => {
                  const today = new Date();
                  const startStr = today.toISOString().split('T')[0];
                  const endStr = new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0];
                  const defaultFilter = {
                    siteId: siteFilter !== 'All Sites' ? siteFilter : '',
                    startDate: startStr,
                    endDate: endStr
                  };
                  setAutoScheduleFilter(defaultFilter);
                  setIsAutoScheduling(true);
                  handleCalculateAutoSchedule(defaultFilter);
                }}
                className="bg-[#1E3A5F] text-white px-3.5 py-1.5 rounded-lg text-[13px] font-semibold hover:bg-[#162D4A] shadow-sm transition-colors flex items-center gap-1.5"
              >
                Auto-Schedule Suggestions
              </button>
              <button 
                onClick={() => setIsGeneratingSlots(true)} 
                className="bg-[#1E3A5F] text-white px-3.5 py-1.5 rounded-lg text-[13px] font-semibold hover:bg-[#162D4A] shadow-sm transition-colors"
              >
                + Generate Shift Slots
              </button>
              <button 
                onClick={() => {
                  setBatchFormData({
                    siteId: siteFilter !== 'All Sites' ? siteFilter : (uniqueSites[0]?.id || ''),
                    startDate: new Date().toISOString().split('T')[0],
                    endDate: new Date(Date.now() + 6 * 86400000).toISOString().split('T')[0],
                    guardId: '',
                    startTime: '08:00',
                    endTime: '20:00'
                  });
                  setIsBatchAssigning(true);
                }}
                className="bg-[#1E3A5F] text-white px-3.5 py-1.5 rounded-lg text-[13px] font-semibold hover:bg-[#162D4A] shadow-sm transition-colors"
              >
                + Batch Assign (Date Range)
              </button>
              <button onClick={openCreateRoster} className="bg-[#1E3A5F] text-white px-3.5 py-1.5 rounded-lg text-[13px] font-semibold hover:bg-[#162D4A] shadow-sm transition-colors">
                + Assign Post
              </button>
            </>
          )}
        </div>
      </div>

      {viewMode === 'list' && (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-[#E2E8F0]">
                <th className="px-6 py-4 text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider">Date &amp; Time</th>
                <th className="px-6 py-4 text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider">Contract Site</th>
                <th className="px-6 py-4 text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider">Assigned Guard</th>
                <th className="px-6 py-4 text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider">Status</th>
                {isOps && <th className="px-6 py-4 text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredSchedules.length === 0 ? (
                <tr>
                  <td colSpan={isOps ? 5 : 4} className="px-6 py-8 text-center text-[13px] text-gray-500">No shift schedules found.</td>
                </tr>
              ) : (
                filteredSchedules.map(sched => (
                  <tr key={sched.id} className="hover:bg-[#F8FAFC] border-b border-gray-100">
                    <td className="px-6 py-4">
                      <p className="text-[14px] font-medium text-[#0F172A]">{sched.shiftLabel}</p>
                    </td>
                    <td className="px-6 py-4 text-[14px] text-[#475569]">{formatSiteName(sched.site)}</td>
                    <td className="px-6 py-4 text-[14px] text-[#475569]">{role === 'CLIENT' ? 'ID HIDDEN' : sched.guard?.guardId} ({formatGuardName(sched.guard)})</td>
                    <td className="px-6 py-4">
                      <span className={`text-[14px] ${sched.status === 'Pending Reassignment' ? 'text-orange-600' : 'text-green-700'}`}>
                        {sched.status || 'Scheduled'}
                      </span>
                    </td>
                    {isOps && (
                      <td className="px-6 py-4 flex gap-2 border-b-0 items-center h-[52px]">
                        {sched.status === 'Unassigned' ? (
                          <>
                            <button onClick={() => { setFormData({...defaultFormData}); setIsAssigning(sched); }} className="px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded text-[12px] font-medium hover:bg-green-100">Assign Guard</button>
                            <button onClick={() => handleDeleteRoster(sched.id)} className="text-[13px] text-red-600 hover:underline">Delete</button>
                          </>
                        ) : (
                          <>
                            {sched.status?.includes('Permanent') && (
                              <button onClick={() => handleDeleteRoster(sched.rosterId)} className="text-[13px] text-red-600 hover:underline">Delete Post</button>
                            )}
                            <button onClick={() => openCreateException(sched)} className="text-[13px] text-blue-600 hover:underline">Override</button>
                            <button onClick={() => { setFormData({...defaultFormData}); setIsAssigning(sched); }} className="text-[13px] text-orange-600 hover:underline">Reassign</button>
                            <button onClick={() => handleDeleteRoster(sched.id)} className="text-[13px] text-red-600 hover:underline">Delete</button>
                          </>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {viewMode === 'calendar' && (
        <div className="p-6 bg-[#F8FAFC] overflow-x-auto">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[14px] font-bold text-[#1E3A5F]">
              Week of {currentWeekStart.toLocaleDateString()} - {new Date(currentWeekStart.getTime() + 6 * 86400000).toLocaleDateString()}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const prev = new Date(currentWeekStart);
                  prev.setDate(prev.getDate() - 7);
                  setCurrentWeekStart(prev);
                }}
                className="px-3 py-1 bg-white border rounded text-[12px] font-medium text-gray-700 hover:bg-gray-50"
              >
                ← Prev Week
              </button>
              <button
                onClick={() => {
                  const today = new Date();
                  today.setDate(today.getDate() - today.getDay());
                  setCurrentWeekStart(today);
                }}
                className="px-3 py-1 bg-white border rounded text-[12px] font-medium text-gray-700 hover:bg-gray-50"
              >
                This Week
              </button>
              <button
                onClick={() => {
                  const next = new Date(currentWeekStart);
                  next.setDate(next.getDate() + 7);
                  setCurrentWeekStart(next);
                }}
                className="px-3 py-1 bg-white border rounded text-[12px] font-medium text-gray-700 hover:bg-gray-50"
              >
                Next Week →
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-4 min-w-[1000px]">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="font-bold text-center text-[#1E3A5F] border-b pb-2">{d}</div>
            ))}
            {Array.from({ length: 7 }).map((_, i) => {
              const d = new Date(currentWeekStart);
              d.setDate(d.getDate() + i);
              const year = d.getFullYear();
              const month = String(d.getMonth() + 1).padStart(2, '0');
              const day = String(d.getDate()).padStart(2, '0');
              const dStr = `${year}-${month}-${day}`;
              
              const dayS = filteredSchedules.filter(s => {
                if (!s.date) return false;
                const sDate = new Date(s.date);
                const sY = sDate.getFullYear();
                const sM = String(sDate.getMonth() + 1).padStart(2, '0');
                const sD = String(sDate.getDate()).padStart(2, '0');
                return `${sY}-${sM}-${sD}` === dStr;
              });
              
              return (
                <div key={i} className="min-h-[160px] border rounded bg-white p-2 flex flex-col">
                  <div className="text-[12px] font-semibold text-gray-600 mb-2 border-b pb-1 flex justify-between">
                    <span>{d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                    {dayS.some(s => s.guardId == null || s.status === 'Unassigned') && (
                      <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold">Needs Guard</span>
                    )}
                  </div>
                  <div className="space-y-2 flex flex-col flex-1">
                    {dayS.length === 0 ? (
                      <span className="text-[11px] text-gray-300 text-center my-auto">No Shifts</span>
                    ) : (
                      dayS.map(sched => {
                        const isUnassigned = sched.guardId == null || sched.status === 'Unassigned';
                        return (
                          <div key={sched.id} className={`text-[11px] p-2 rounded border flex flex-col gap-1 ${isUnassigned ? 'bg-amber-50/60 border-amber-200' : 'bg-blue-50 border-blue-100'}`}>
                            <span className="font-bold text-[#1E3A5F]">{sched.shiftLabel}</span>
                            <span className="text-gray-600 truncate">{formatSiteName(sched.site)}</span>
                            {isUnassigned ? (
                              <button
                                onClick={() => { setFormData({ ...defaultFormData }); setIsAssigning(sched); }}
                                className="mt-1 bg-emerald-600 text-white text-[11px] font-bold py-1 px-2 rounded hover:bg-emerald-700 transition-colors shadow-sm"
                              >
                                + Assign Guard
                              </button>
                            ) : (
                              <span className="font-medium text-emerald-800 flex items-center gap-1">
                                ✓ {formatGuardName(sched.guard)}
                              </span>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {viewMode === 'monthly' && (
        <div className="p-6 bg-[#F8FAFC]">
          <div className="grid grid-cols-7 gap-3 min-w-[1000px]">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="font-bold text-center text-[#1E3A5F] text-[13px] py-1">{d}</div>
            ))}
            {/* Generate 35 days for monthly grid */}
            {Array.from({ length: 35 }).map((_, i) => {
               const d = new Date();
               d.setDate(d.getDate() - d.getDay() + i); // Start from previous Sunday
               const year = d.getFullYear();
               const month = String(d.getMonth() + 1).padStart(2, '0');
               const day = String(d.getDate()).padStart(2, '0');
               const dStr = `${year}-${month}-${day}`;
               
               const dayS = filteredSchedules.filter(s => {
                 if (!s.date) return false;
                 const sDate = new Date(s.date);
                 const sY = sDate.getFullYear();
                 const sM = String(sDate.getMonth() + 1).padStart(2, '0');
                 const sD = String(sDate.getDate()).padStart(2, '0');
                 return `${sY}-${sM}-${sD}` === dStr;
               });

               const todayStr = (() => {
                 const t = new Date();
                 return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
               })();
               const isToday = dStr === todayStr;
               const unassigned = dayS.filter(s => s.guardId == null || s.status === 'Unassigned').length;
               const totalSites = Array.from(new Set(dayS.map(s => s.siteId))).length;
               
               const handleDayClick = () => {
                 const weekStart = new Date(d);
                 weekStart.setDate(weekStart.getDate() - weekStart.getDay());
                 setCurrentWeekStart(weekStart);
                 setViewMode('calendar');
               };

               return (
                 <div
                   key={i}
                   onClick={handleDayClick}
                   className={`border rounded-xl h-[105px] flex flex-col p-2.5 bg-white cursor-pointer hover:border-blue-500 hover:shadow-lg transition-all relative overflow-hidden group ${isToday ? 'ring-2 ring-blue-500 bg-blue-50/10' : 'border-gray-200'}`}
                 >
                   <div className="flex justify-between items-center">
                     <span className={`text-[13px] font-bold ${isToday ? 'text-blue-600 bg-blue-100 px-1.5 rounded' : 'text-gray-700'}`}>{d.getDate()}</span>
                     {dayS.length > 0 && (
                       <span className={`w-2 h-2 rounded-full ${unassigned > 0 ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                     )}
                   </div>

                   {dayS.length > 0 ? (
                     <div className="flex flex-col gap-1 mt-auto">
                       <div className="text-[11px] text-gray-500 font-medium truncate">
                         {totalSites} {totalSites === 1 ? 'Site' : 'Sites'} • {dayS.length} {dayS.length === 1 ? 'Shift' : 'Shifts'}
                       </div>
                       {unassigned > 0 ? (
                         <div className="bg-red-50 border border-red-200 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-md flex justify-between items-center shadow-2xs group-hover:bg-red-100 transition-colors">
                           <span>Missing: {unassigned}</span>
                           <span className="text-[10px]">Assign →</span>
                         </div>
                       ) : (
                         <div className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                           ✓ Fully Covered
                         </div>
                       )}
                     </div>
                   ) : (
                     <span className="text-[11px] text-gray-300 mt-auto text-center font-normal">No Activity</span>
                   )}
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
              <h3 className="text-lg font-semibold text-[#1E3A5F]">Assign Permanent Post</h3>
              <p className="text-[13px] text-gray-500 mt-1">This guard will be permanently assigned to this schedule until deleted.</p>
            </div>
            <div className="p-6 space-y-4">
              {errorMsg && <div className="text-red-600 text-sm font-medium">{errorMsg}</div>}

              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1">Site</label>
                <select value={formData.siteId} onChange={e => {
                  const site = allGlobalSites.find(s => s.id === e.target.value);
                  const firstShift = site?.shiftTimings?.[0];
                  setFormData({
                    ...formData,
                    siteId: e.target.value,
                    startTime: firstShift ? firstShift.split(' - ')[0] : '08:00',
                    endTime: firstShift ? firstShift.split(' - ')[1] : '20:00'
                  });
                }} className="w-full border rounded px-3 py-2 text-[14px] focus:outline-none" required>
                  <option value="">Select a Site</option>
                  {allGlobalSites.map((s: any) => (
                    <option key={s.id} value={s.id}>{s.clientName} - {s.name}</option>
                  ))}
                </select>
              </div>

              {formData.siteId && (
                <div>
                  <label className="block text-[13px] font-medium text-gray-700 mb-1">Select Shift Cycle</label>
                  <select
                    value={`${formData.startTime} - ${formData.endTime}`}
                    onChange={e => {
                      const [start, end] = e.target.value.split(' - ');
                      setFormData({ ...formData, startTime: start, endTime: end });
                    }}
                    className="w-full border rounded px-3 py-2 text-[14px] focus:outline-none bg-blue-50/50"
                    required
                  >
                    {allGlobalSites.find((s: any) => s.id === formData.siteId)?.shiftTimings?.map((timing: string, idx: number) => (
                      <option key={idx} value={timing}>Shift {idx + 1} ({timing})</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1">Guard</label>
                <select value={formData.guardId} onChange={e => setFormData({ ...formData, guardId: e.target.value })} className="w-full border rounded px-3 py-2 text-[14px] focus:outline-none" required>
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
              <h3 className="text-lg font-semibold text-orange-900">Log Emergency Override</h3>
              <p className="text-[13px] text-orange-700 mt-1">Override the permanent schedule for {formData.date}</p>
            </div>
            <div className="p-6 space-y-4">
              {errorMsg && <div className="text-red-600 text-sm font-medium">{errorMsg}</div>}

              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1">Exception Type</label>
                <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} className="w-full border rounded px-3 py-2 text-[14px] focus:outline-none">
                  <option value="Absent">Mark Guard as Absent (Uncovered)</option>
                  <option value="Swap">Temporary Guard Swap</option>
                </select>
              </div>

              {formData.type === 'Swap' && (
                <div>
                  <label className="block text-[13px] font-medium text-gray-700 mb-1">Select Replacement Guard</label>
                  <select value={formData.replacementGuardId} onChange={e => setFormData({ ...formData, replacementGuardId: e.target.value })} className="w-full border rounded px-3 py-2 text-[14px] focus:outline-none" required={formData.type === 'Swap'}>
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

      {isAutoScheduling && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col border border-gray-200 overflow-hidden">
            {/* Modal Header */}
            <div className="bg-[#1E3A5F] text-white p-5 flex justify-between items-start">
              <div>
                <h3 className="text-[18px] font-bold">Auto-Scheduler Recommendations</h3>
                <p className="text-[12px] text-slate-200 mt-1">
                  System-calculated shift assignment suggestions based on guard shift preferences, workload balance, and rest intervals.
                  <span className="font-semibold text-slate-300 ml-1">(Optional - Review & Apply)</span>
                </p>
              </div>
              <button 
                type="button" 
                onClick={() => setIsAutoScheduling(false)} 
                className="text-white opacity-70 hover:opacity-100 text-xl font-bold px-2"
              >
                ✕
              </button>
            </div>

            {/* Filter & Controls Bar */}
            <div className="p-4 bg-slate-50 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase">Site Filter</label>
                  <select
                    value={autoScheduleFilter.siteId}
                    onChange={e => setAutoScheduleFilter({ ...autoScheduleFilter, siteId: e.target.value })}
                    className="border rounded px-2.5 py-1 text-[13px] bg-white border-gray-300 focus:outline-none"
                  >
                    <option value="">All Contract Sites</option>
                    {uniqueSites.map((s: any) => (
                      <option key={s.id} value={s.id}>{formatSiteName(s)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase">Start Date</label>
                  <input
                    type="date"
                    value={autoScheduleFilter.startDate}
                    onChange={e => setAutoScheduleFilter({ ...autoScheduleFilter, startDate: e.target.value })}
                    className="border rounded px-2.5 py-1 text-[13px] bg-white border-gray-300 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase">End Date</label>
                  <input
                    type="date"
                    value={autoScheduleFilter.endDate}
                    onChange={e => setAutoScheduleFilter({ ...autoScheduleFilter, endDate: e.target.value })}
                    className="border rounded px-2.5 py-1 text-[13px] bg-white border-gray-300 focus:outline-none"
                  />
                </div>
                <div className="self-end">
                  <button
                    type="button"
                    onClick={() => handleCalculateAutoSchedule()}
                    disabled={isCalculatingAutoSchedule}
                    className="bg-[#1E3A5F] text-white px-3 py-1.5 rounded text-[13px] font-medium hover:bg-[#162D4A] disabled:opacity-50 transition-colors"
                  >
                    {isCalculatingAutoSchedule ? 'Calculating...' : 'Recalculate'}
                  </button>
                </div>
              </div>

              {autoRecommendations.length > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const allOn = Object.keys(acceptedRosterMap).length !== autoRecommendations.length || Object.values(acceptedRosterMap).some(v => !v);
                      const newMap: any = {};
                      autoRecommendations.forEach((rec: any) => {
                        newMap[rec.rosterId] = allOn;
                      });
                      setAcceptedRosterMap(newMap);
                    }}
                    className="text-[12px] font-semibold text-[#1E3A5F] underline hover:text-blue-800"
                  >
                    Toggle Select All ({autoRecommendations.length})
                  </button>
                </div>
              )}
            </div>

            {/* Error Banner if any */}
            {errorMsg && (
              <div className="mx-5 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-[13px] rounded-lg">
                {errorMsg}
              </div>
            )}

            {/* Recommendations Content Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-[#F8FAFC]">
              {isCalculatingAutoSchedule ? (
                <div className="py-12 text-center text-slate-500 text-[14px]">
                  <p className="font-semibold text-[#1E3A5F]">Calculating Optimal Guard Pairings...</p>
                  <p className="text-[12px] text-gray-400 mt-1">Analyzing guard shift preferences, workload balances, and rest constraints.</p>
                </div>
              ) : autoRecommendations.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-[14px] bg-white rounded-lg border border-dashed border-gray-300">
                  <p className="font-semibold text-gray-700">No Unassigned Shifts Found</p>
                  <p className="text-[12px] text-gray-400 mt-1">All shift slots for the selected filter are already assigned or no slots have been generated yet.</p>
                </div>
              ) : (
                autoRecommendations.map((rec: any) => {
                  const isAccepted = acceptedRosterMap[rec.rosterId] ?? true;
                  const chosenGuardId = selectedGuardMap[rec.rosterId] || rec.recommendedGuard?.guardId || '';
                  const topGuard = rec.recommendedGuard;

                  // Find full guard details for chosen selection
                  const selectedScoredGuard = rec.allScoredGuards?.find((sg: any) => sg.guardId === chosenGuardId) || 
                    (topGuard?.guardId === chosenGuardId ? topGuard : null);
                  const activeGuard = selectedScoredGuard || topGuard;

                  return (
                    <div 
                      key={rec.rosterId}
                      className={`bg-white rounded-lg border p-4 shadow-sm transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${isAccepted ? 'border-slate-300 ring-1 ring-slate-200' : 'border-gray-200 opacity-60'}`}
                    >
                      {/* Left: Checkbox & Shift Details */}
                      <div className="flex items-start gap-3 flex-1">
                        <input
                          type="checkbox"
                          checked={isAccepted}
                          onChange={e => setAcceptedRosterMap({ ...acceptedRosterMap, [rec.rosterId]: e.target.checked })}
                          className="mt-1 w-4 h-4 text-[#1E3A5F] rounded border-gray-300 focus:ring-0 cursor-pointer"
                        />
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[13px] font-bold text-[#1E3A5F]">{rec.siteName}</span>
                            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-medium border border-slate-200">{rec.date}</span>
                            <span className="bg-blue-50 text-blue-800 px-2 py-0.5 rounded text-[11px] font-medium border border-blue-100">{rec.timing}</span>
                          </div>

                          {/* Recommended Guard Info & Rationale */}
                          {activeGuard ? (
                            <div className="mt-2.5">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[13px] font-semibold text-slate-800">
                                  {chosenGuardId && chosenGuardId !== topGuard?.guardId ? 'Manual Selection: ' : 'System Recommendation: '}
                                  <span className="text-[#1E3A5F] font-bold">{activeGuard.guardName}</span>
                                </span>
                                <span className="bg-slate-100 text-[#1E3A5F] text-[11px] font-bold px-2 py-0.5 rounded border border-slate-300">
                                  {activeGuard.matchScore}% Match Score
                                </span>
                              </div>

                              {/* Rationale Badges */}
                              <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
                                {activeGuard.rationale?.map((rat: string, idx: number) => (
                                  <span key={idx} className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded font-medium border border-slate-200">
                                    [ {rat} ]
                                  </span>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <p className="text-[12px] text-slate-500 font-medium mt-1">No unassigned guard available matching requirements for this date.</p>
                          )}
                        </div>
                      </div>

                      {/* Right: Guard Override Selector */}
                      <div className="w-full md:w-64 flex flex-col justify-center border-t md:border-t-0 md:border-l border-gray-100 md:pl-4 pt-2 md:pt-0">
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">Assigned Guard (Override)</label>
                        <select
                          value={chosenGuardId}
                          onChange={e => setSelectedGuardMap({ ...selectedGuardMap, [rec.rosterId]: e.target.value })}
                          className="w-full border rounded px-2.5 py-1.5 text-[12px] bg-white border-gray-300 focus:outline-none focus:border-[#1E3A5F] font-medium"
                        >
                          <option value="">Select Guard...</option>
                          {rec.allScoredGuards && rec.allScoredGuards.length > 0 ? (
                            rec.allScoredGuards.map((sg: any, index: number) => {
                              const isRecommended = topGuard && sg.guardId === topGuard.guardId;
                              const pref = sg.shiftPreference || 'Flexible';
                              return (
                                <option key={sg.guardId} value={sg.guardId}>
                                  #{index + 1} • {sg.guardName} ({pref}) [{sg.matchScore}% Match]{isRecommended ? ' (Recommended)' : ''}
                                </option>
                              );
                            })
                          ) : (
                            guards.map((g: any) => {
                              const isRecommended = topGuard && g.id === topGuard.guardId;
                              const pref = g.shiftPreference || 'Flexible';
                              return (
                                <option key={g.id} value={g.id}>
                                  {g.firstName} {g.lastName} ({pref}){isRecommended ? ' (Recommended)' : ''}
                                </option>
                              );
                            })
                          )}
                        </select>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between rounded-b-xl">
              <p className="text-[12px] text-slate-500">
                Suggestions are non-binding until explicitly applied.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAutoScheduling(false)}
                  className="px-4 py-2 border rounded-lg text-[13px] font-medium text-gray-600 bg-white hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApplyAutoScheduleSubmit}
                  disabled={autoRecommendations.length === 0 || isCalculatingAutoSchedule}
                  className="bg-[#1E3A5F] text-white px-5 py-2 rounded-lg text-[13px] font-semibold hover:bg-[#162D4A] disabled:opacity-50 transition-colors shadow-sm"
                >
                  Apply Selected Assignments ({Object.keys(acceptedRosterMap).filter(k => acceptedRosterMap[k] && selectedGuardMap[k]).length})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isGeneratingSlots && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-40 z-50 flex items-start justify-center pt-16 p-4">
          <form onSubmit={handleGenerateSlotsSubmit} className="bg-white rounded-lg shadow-2xl w-[480px] overflow-visible flex flex-col border border-gray-200">
            <div className="px-6 py-4 border-b bg-slate-100">
              <h3 className="text-lg font-semibold text-[#1E3A5F]">Generate Shift Slots (Date Range)</h3>
              <p className="text-[13px] text-slate-600 mt-1">Generate unassigned shift slots for contract sites across your specified period.</p>
            </div>
            <div className="p-6 space-y-4">
              {errorMsg && <div className="text-red-600 text-sm font-medium">{errorMsg}</div>}
              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1">Target Contract Site (Optional)</label>
                <select
                  value={generateSlotData.siteId}
                  onChange={e => setGenerateSlotData({ ...generateSlotData, siteId: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-slate-500 bg-white"
                >
                  <option value="">All Contract Sites</option>
                  {uniqueSites.map((s: any) => (
                    <option key={s.id} value={s.id}>{formatSiteName(s)}</option>
                  ))}
                </select>
                <p className="text-[11px] text-gray-500 mt-1">Leave as "All Contract Sites" to generate slots for all active locations.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={generateSlotData.startDate}
                    onChange={e => setGenerateSlotData({ ...generateSlotData, startDate: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-[14px] focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={generateSlotData.endDate}
                    onChange={e => setGenerateSlotData({ ...generateSlotData, endDate: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-[14px] focus:outline-none"
                    required
                  />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-2 rounded-b-lg">
              <button type="button" onClick={() => setIsGeneratingSlots(false)} className="px-4 py-2 border rounded-lg text-[13px] font-medium text-gray-600 bg-white hover:bg-gray-100">Cancel</button>
              <button type="submit" className="bg-[#1E3A5F] px-5 py-2 text-white text-[13px] font-semibold rounded-lg hover:bg-[#162D4A] shadow-sm transition-colors">Generate Shift Slots</button>
            </div>
          </form>
        </div>
      )}

      {isBatchAssigning && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-40 z-50 flex items-start justify-center pt-16 p-4">
          <form onSubmit={handleBatchAssignSubmit} className="bg-white rounded-lg shadow-2xl w-[480px] overflow-visible flex flex-col border border-gray-200">
            <div className="px-6 py-4 border-b bg-slate-100">
              <h3 className="text-lg font-semibold text-[#1E3A5F]">Batch Assign Guard (Date Range)</h3>
              <p className="text-[13px] text-slate-600 mt-1">Assign a guard across multiple dates in a single action.</p>
            </div>
            <div className="p-6 space-y-4">
              {errorMsg && <div className="text-red-600 text-sm font-medium">{errorMsg}</div>}
              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1">Contract Site</label>
                <select
                  value={batchFormData.siteId}
                  onChange={e => {
                    const newSiteId = e.target.value;
                    const site = uniqueSites.find((s: any) => s.id === newSiteId);
                    const defaultShift = site?.shiftTimings?.[0] ? `${site.shiftTimings[0].start} - ${site.shiftTimings[0].end}` : '';
                    const defaultStart = site?.shiftTimings?.[0]?.start || '08:00';
                    const defaultEnd = site?.shiftTimings?.[0]?.end || '20:00';
                    setBatchFormData({
                      ...batchFormData,
                      siteId: newSiteId,
                      startTime: defaultStart,
                      endTime: defaultEnd
                    });
                  }}
                  className="w-full border rounded-lg px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-slate-500 bg-white"
                  required
                >
                  <option value="">Select a Site</option>
                  {uniqueSites.map((s: any) => (
                    <option key={s.id} value={s.id}>{formatSiteName(s)}</option>
                  ))}
                </select>
              </div>

              {batchFormData.siteId && (() => {
                const site = uniqueSites.find((s: any) => s.id === batchFormData.siteId);
                const timings = site?.shiftTimings || [];
                return (
                  <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-1">Select Shift Time</label>
                    <select
                      value={`${batchFormData.startTime} - ${batchFormData.endTime}`}
                      onChange={e => {
                        const val = e.target.value;
                        if (!val) {
                          setBatchFormData({ ...batchFormData, startTime: '', endTime: '' });
                        } else {
                          const [sTime, eTime] = val.split(' - ');
                          setBatchFormData({ ...batchFormData, startTime: sTime, endTime: eTime });
                        }
                      }}
                      className="w-full border rounded-lg px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-slate-500 bg-white"
                    >
                      <option value="">All Shifts / Any Shift Time</option>
                      {timings.map((t: any, i: number) => (
                        <option key={i} value={`${t.start} - ${t.end}`}>
                          {t.label ? `${t.label} (${t.start} - ${t.end})` : `${t.start} - ${t.end}`}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })()}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={batchFormData.startDate}
                    onChange={e => setBatchFormData({ ...batchFormData, startDate: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-[14px] focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={batchFormData.endDate}
                    onChange={e => setBatchFormData({ ...batchFormData, endDate: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-[14px] focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1">Guard to Assign</label>
                <select
                  value={batchFormData.guardId}
                  onChange={e => setBatchFormData({ ...batchFormData, guardId: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-slate-500 bg-white"
                  required
                >
                  <option value="">Select a Guard</option>
                  {guards.map((g: any) => (
                    <option key={g.id} value={g.id}>
                      {g.firstName} {g.lastName} ({g.guardId}) {g.agency?.name ? `— ${g.agency.name}` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-2 rounded-b-lg">
              <button type="button" onClick={() => setIsBatchAssigning(false)} className="px-4 py-2 border rounded-lg text-[13px] font-medium text-gray-600 bg-white hover:bg-gray-100">Cancel</button>
              <button type="submit" className="bg-[#1E3A5F] px-5 py-2 text-white text-[13px] font-semibold rounded-lg hover:bg-[#162D4A] shadow-sm transition-colors">Confirm Batch Assignment</button>
            </div>
          </form>
        </div>
      )}

      {isAssigning && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-40 z-50 flex items-start justify-center pt-24 p-4">
          <form onSubmit={handleAssignGuardSubmit} className="bg-white rounded-lg shadow-2xl w-[420px] overflow-visible flex flex-col border border-gray-200">
            <div className="px-6 py-4 border-b bg-emerald-50/80">
              <h3 className="text-lg font-semibold text-emerald-900">Assign Guard to Shift</h3>
              <p className="text-[13px] text-emerald-700 mt-1">{isAssigning.shiftLabel} • {formatSiteName(isAssigning.site)}</p>
            </div>
            <div className="p-6 space-y-4 min-h-[160px]">
              {errorMsg && <div className="text-red-600 text-sm font-medium">{errorMsg}</div>}
              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Select Guard</label>
                <select
                  value={formData.guardId}
                  onChange={e => setFormData({ ...formData, guardId: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white shadow-sm"
                  required
                >
                  <option value="">Choose a guard...</option>
                  {(() => {
                    const shiftStartHour = parseInt(isAssigning.startTime?.split(':')[0] || '8', 10);
                    const targetShiftType = (shiftStartHour >= 6 && shiftStartHour < 18) ? 'Day' : 'Night';

                    const matching = guards.filter((g: any) => !g.shiftPreference || g.shiftPreference === 'Flexible' || g.shiftPreference === targetShiftType);
                    const nonMatching = guards.filter((g: any) => g.shiftPreference && g.shiftPreference !== 'Flexible' && g.shiftPreference !== targetShiftType);

                    return (
                      <>
                        <optgroup label={`⭐ Recommended (${targetShiftType} / Flexible)`}>
                          {matching.map((g: any) => (
                            <option key={g.id} value={g.id}>
                              {g.firstName} {g.lastName} ({g.guardId}) • {g.shiftPreference || 'Flexible'}
                            </option>
                          ))}
                        </optgroup>
                        {nonMatching.length > 0 && (
                          <optgroup label="Other Guards">
                            {nonMatching.map((g: any) => (
                              <option key={g.id} value={g.id}>
                                {g.firstName} {g.lastName} ({g.guardId}) • {g.shiftPreference}
                              </option>
                            ))}
                          </optgroup>
                        )}
                      </>
                    );
                  })()}
                </select>
              </div>
            </div>
            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-2 rounded-b-lg">
              <button type="button" onClick={() => setIsAssigning(null)} className="px-4 py-2 border rounded-lg text-[13px] font-medium text-gray-600 bg-white hover:bg-gray-100">Cancel</button>
              <button type="submit" className="bg-emerald-600 px-5 py-2 text-white text-[13px] font-semibold rounded-lg hover:bg-emerald-700 shadow-sm transition-colors">Assign Guard</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function Logs({ role }: { role?: string }) {
  const [activeTab, setActiveTab] = useState<'attendance' | 'incidents'>('attendance');
  const [logs, setLogs] = useState<any[]>([]);
  const [attendanceLogs, setAttendanceLogs] = useState<any[]>([]);
  const [siteFilter, setSiteFilter] = useState('All Sites');
  const [searchQuery, setSearchQuery] = useState('');

  const [isResolving, setIsResolving] = useState<any>(null);
  const [resolutionNote, setResolutionNote] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const loadLogs = () => {
    fetchLogs().then(data => setLogs(Array.isArray(data) ? data : [])).catch(console.error);
    fetchAttendanceLogs().then(data => setAttendanceLogs(Array.isArray(data) ? data : [])).catch(console.error);
  };

  useEffect(() => {
    loadLogs();
    const interval = setInterval(loadLogs, 15000); // Polling every 15s for live updates
    return () => clearInterval(interval);
  }, []);

  const handleResolveSubmit = async (e: any) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      await resolveIncident(isResolving.id, resolutionNote);
      setIsResolving(null);
      setResolutionNote('');
      loadLogs();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to resolve incident.');
    }
  };

  const isOps = role === 'OPERATION_MANAGER' || !role;

  const safeLogs = Array.isArray(logs) ? logs : [];
  const safeAttendance = Array.isArray(attendanceLogs) ? attendanceLogs : [];

  const uniqueSites = Array.from(new Set([
    ...safeLogs.map(log => log.mapPin?.patrolPath?.site?.name),
    ...safeAttendance.map(a => a.roster?.site?.name)
  ].filter(Boolean)));

  const filteredAttendance = safeAttendance.filter(a => {
    const matchesSite = siteFilter === 'All Sites' || a.roster?.site?.name === siteFilter;
    const guardName = a.guard ? `${a.guard.firstName} ${a.guard.lastName}`.toLowerCase() : '';
    const siteName = (a.roster?.site?.name || '').toLowerCase();
    const matchesSearch = guardName.includes(searchQuery.toLowerCase()) || siteName.includes(searchQuery.toLowerCase());
    return matchesSite && matchesSearch;
  });

  const filteredLogs = safeLogs.filter(l => {
    if (role === 'CLIENT' && l.description?.includes('DEBUG')) return false;
    const matchesSite = siteFilter === 'All Sites' || l.mapPin?.patrolPath?.site?.name === siteFilter;
    const guardName = l.guard ? `${l.guard.firstName} ${l.guard.lastName}`.toLowerCase() : 'system';
    const desc = (l.description || '').toLowerCase();
    const pinLoc = (l.mapPin?.name || '').toLowerCase();
    const matchesSearch = guardName.includes(searchQuery.toLowerCase()) || desc.includes(searchQuery.toLowerCase()) || pinLoc.includes(searchQuery.toLowerCase());
    return matchesSite && matchesSearch;
  });

  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm">
      <div className="px-6 py-4 border-b border-[#E2E8F0] flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-[#F8FAFC]">
        <div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('attendance')}
              className={`text-[15px] font-bold pb-0.5 border-b-2 transition-colors ${activeTab === 'attendance' ? 'text-[#1E3A5F] border-[#1E3A5F]' : 'text-gray-400 border-transparent hover:text-gray-600'}`}
            >
              Live Guard Attendance
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={() => setActiveTab('incidents')}
              className={`text-[15px] font-bold pb-0.5 border-b-2 transition-colors ${activeTab === 'incidents' ? 'text-[#1E3A5F] border-[#1E3A5F]' : 'text-gray-400 border-transparent hover:text-gray-600'}`}
            >
              Patrol & Incident Logs
            </button>
          </div>
          <p className="text-[12px] text-gray-500 mt-1">
            {activeTab === 'attendance' ? 'Real-time guard check-ins and arrival punctuality stream.' : 'Real-time audit trail of field activities and security alerts.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <input
            type="text"
            placeholder="Search guard or site..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="border border-[#E2E8F0] rounded px-3 py-1.5 text-[13px] text-[#0F172A] outline-none focus:border-[#1E3A5F] w-[200px]"
          />
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
        {activeTab === 'attendance' ? (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                <th className="px-6 py-3 text-[11px] font-bold text-[#475569] uppercase tracking-wider">Arrival Time</th>
                <th className="px-6 py-3 text-[11px] font-bold text-[#475569] uppercase tracking-wider">Guard</th>
                <th className="px-6 py-3 text-[11px] font-bold text-[#475569] uppercase tracking-wider">Site & Shift</th>
                <th className="px-6 py-3 text-[11px] font-bold text-[#475569] uppercase tracking-wider">Arrival Status</th>
                <th className="px-6 py-3 text-[11px] font-bold text-[#475569] uppercase tracking-wider">Check-In Location (GPS)</th>
              </tr>
            </thead>
            <tbody>
              {filteredAttendance.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-[13px] text-gray-400 font-medium">No real-time guard check-ins recorded yet.</td>
                </tr>
              ) : (
                filteredAttendance.map(item => (
                  <tr key={item.id} className="hover:bg-[#F8FAFC] border-b border-gray-100">
                    <td className="px-6 py-4 text-[13px] text-[#0F172A] font-medium">
                      {item.timestamp ? new Date(item.timestamp).toLocaleString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-[13px] text-[#0F172A]">
                        {item.guard ? `${item.guard.firstName || ''} ${item.guard.lastName || ''}`.trim() || 'Unknown Guard' : 'Unknown Guard'}
                      </div>
                      <div className="text-[11px] text-gray-400 font-mono">
                        {item.guard?.guardId || 'N/A'} {item.guard?.agency ? `• ${item.guard.agency.name}` : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-[13px] text-[#1E3A5F]">{item.roster?.site?.name || 'Unassigned Site'}</div>
                      <div className="text-[12px] text-gray-500">{item.roster?.shiftLabel || 'Shift'} ({item.roster?.startTime || ''} - {item.roster?.endTime || ''})</div>
                    </td>
                    <td className="px-6 py-4">
                      {(() => {
                        const s = (item.status || 'On Time').toLowerCase();
                        const isOnTime = s.includes('on') || s.includes('time');
                        return (
                          <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${isOnTime ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-800 border border-amber-300'}`}>
                            {item.status || 'On Time'}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-4 text-[12px] text-gray-500 font-mono">
                      {typeof item.latitude === 'number' && typeof item.longitude === 'number' ? (
                        <a href={`https://maps.google.com/?q=${item.latitude},${item.longitude}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                          📍 {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
                        </a>
                      ) : (
                        <span className="text-gray-400">Site Mobile Check-in</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC]">
                <th className="px-6 py-3 text-[12px] font-semibold text-[#6B7280]">Timestamp</th>
                <th className="px-6 py-3 text-[12px] font-semibold text-[#6B7280]">Type</th>
                <th className="px-6 py-3 text-[12px] font-semibold text-[#6B7280]">Description</th>
                <th className="px-6 py-3 text-[12px] font-semibold text-[#6B7280]">Personnel</th>
                <th className="px-6 py-3 text-[12px] font-semibold text-[#6B7280]">Status / Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-[13px] text-gray-500">No logs match your filters.</td>
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
                    <td className="px-6 py-4">
                      {log.resolved ? (
                        <div>
                          <span className="text-[13px] text-green-700 font-medium flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Resolved</span>
                          {log.resolutionNote && <p className="text-[11px] text-gray-500 mt-1 max-w-[200px] truncate" title={log.resolutionNote}>Note: {log.resolutionNote}</p>}
                        </div>
                      ) : (
                        log.isIncident ? (
                          isOps ? <button onClick={() => setIsResolving(log)} className="text-[12px] bg-blue-50 text-blue-600 px-3 py-1 rounded font-medium hover:bg-blue-100 border border-blue-200">Resolve</button> : <span className="text-[13px] text-orange-600 font-medium">Unresolved</span>
                        ) : (
                          <span className="text-[13px] text-gray-400">N/A</span>
                        )
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {isResolving && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-40 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleResolveSubmit} className="bg-white rounded-lg shadow-xl w-[500px] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b bg-[#F8FAFC]">
              <h3 className="text-lg font-semibold text-[#1E3A5F]">Resolve Incident</h3>
              <p className="text-[13px] text-gray-500 mt-1">Log resolution details for incident reported at {new Date(isResolving.timestamp).toLocaleString()}</p>
            </div>
            <div className="p-6 space-y-4">
              {errorMsg && <div className="text-red-600 text-sm font-medium">{errorMsg}</div>}
              <div className="p-3 bg-red-50 border border-red-100 rounded">
                <p className="text-[13px] text-gray-800"><span className="font-semibold">Guard:</span> {isResolving.guard ? `${isResolving.guard.firstName} ${isResolving.guard.lastName}` : 'System'}</p>
                <p className="text-[13px] text-gray-800 mt-1"><span className="font-semibold">Description:</span> {isResolving.description || 'None'}</p>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-2">Resolution Note & Actions Taken</label>
                <textarea
                  required
                  value={resolutionNote}
                  onChange={e => setResolutionNote(e.target.value)}
                  rows={4}
                  className="w-full border rounded px-3 py-2 text-[14px] focus:outline-none focus:border-blue-500 resize-none"
                  placeholder="Detail how this incident was resolved or why it is being dismissed..."
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-2">
              <button type="button" onClick={() => { setIsResolving(null); setResolutionNote(''); }} className="px-4 py-2 border rounded text-[13px] font-medium text-gray-600 bg-white hover:bg-gray-100">Cancel</button>
              <button type="submit" className="bg-blue-600 px-4 py-2 text-white text-[13px] font-medium rounded hover:bg-blue-700">Mark as Resolved</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function Reports({ role }: { role?: string }) {
  const [stats, setStats] = useState<any>(null);
  const [guards, setGuards] = useState<any[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [agencyFilter, setAgencyFilter] = useState('All');
  const [siteFilter, setSiteFilter] = useState('All Sites');

  const formatGuardName = (g: any) => {
    if (role === 'CLIENT') return `${g.firstName || 'Unknown'} ${g.lastName?.[0] || '?'}.`;
    return `${g.firstName || ''} ${g.lastName || ''}`.trim() || 'Unknown Guard';
  };

  useEffect(() => {
    fetchReportsOverview().then(setStats).catch(console.error);
  }, []);

  useEffect(() => {
    fetchGuardPerformance(dateFrom, dateTo, siteFilter).then(setGuards).catch(console.error);
  }, [dateFrom, dateTo, siteFilter]);

  const chartData = useMemo(() => {
    if (!stats?.incidentFrequency) return [];
    return Object.keys(stats.incidentFrequency).map(site => ({
      name: site,
      incidents: stats.incidentFrequency[site]
    }));
  }, [stats]);

  const filteredGuards = useMemo(() => {
    return guards.filter(g => {
      const gName = (g.firstName + ' ' + g.lastName).toLowerCase();
      const agencyName = (g.agency?.name || 'In-House').toLowerCase();
      const matchesSearch = gName.includes(searchQuery.toLowerCase()) || g.guardId.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesAgency = agencyFilter === 'All' || g.agency?.name === agencyFilter;
      // Note: time/date mapping in simple guard objects isn't directly present without rosters, we simulate filtering visually
      return matchesSearch && matchesAgency;
    });
  }, [guards, searchQuery, agencyFilter]);

  const uniqueAgencies = Array.from(new Set(guards.map(g => g.agency?.name).filter(Boolean)));

  const exportReport = () => {
    const ws = XLSX.utils.json_to_sheet(filteredGuards.map(g => ({
      'Guard ID': role === 'CLIENT' ? 'HIDDEN' : g.guardId,
      'Name': formatGuardName(g),
      'Agency': g.agency?.name || 'In-House',
      'Status': g.status,
      'Incident Count': g.incidentCount,
      'Utilization %': g.utilization
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Guard_Performance");
    XLSX.writeFile(wb, "SPMS_Performance_Report.xlsx");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start gap-8">
        <div className="flex-shrink-0">
          <h2 className="text-[24px] font-bold text-[#1E3A5F]">Performance Analytics</h2>
          <p className="text-[14px] text-[#6B7280] mt-1">Live metrics, incident frequency, and guard duty evaluations.</p>
        </div>
        <div className="flex flex-1 gap-2 items-center flex-wrap justify-end">
          <input
            type="text"
            placeholder="Search guard or ID..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="border border-[#E2E8F0] rounded px-3 py-1.5 text-[13px] outline-none focus:border-[#1E3A5F] flex-1 max-w-[600px]"
          />
          <div className="flex gap-1 items-center bg-gray-50 border rounded px-2">
            <span className="text-[11px] text-gray-500 font-medium">Dates:</span>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="bg-transparent border-none outline-none text-[12px] p-1 text-gray-700 w-[105px]"/>
            <span className="text-gray-400 text-[10px]">to</span>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="bg-transparent border-none outline-none text-[12px] p-1 text-gray-700 w-[105px]"/>
          </div>
          <select
            value={siteFilter}
            onChange={e => setSiteFilter(e.target.value)}
            className="border border-[#E2E8F0] rounded px-3 py-1.5 text-[13px] text-gray-600 outline-none focus:border-[#1E3A5F]"
          >
            <option value="All Sites">All Sites</option>
            {Object.keys(stats?.incidentFrequency || {}).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select
            value={agencyFilter}
            onChange={e => setAgencyFilter(e.target.value)}
            className="border border-[#E2E8F0] rounded px-3 py-1.5 text-[13px] text-gray-600 outline-none"
          >
            <option value="All">All Agencies</option>
            {uniqueAgencies.map((a: any) => <option key={a} value={a}>{a}</option>)}
          </select>
          <button onClick={exportReport} className="flex items-center gap-2 bg-[#1E3A5F] px-4 py-2 text-[13px] text-white font-medium rounded hover:bg-[#162D4A] transition-colors">
            <Download className="w-4 h-4" /> Export XLSX
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Guards Deployed', val: stats?.guardsOnDuty || 0, desc: `Out of ${stats?.totalGuardsCount || 0} registered` },
          { label: 'Active Service Contracts', val: stats?.activeContracts || 0, desc: 'Currently managed' },
          { label: 'Pending Security Alerts', val: stats?.pendingAlerts || 0, desc: 'Unresolved incidents' },
          { label: 'SLA Fulfillment Rate', val: `${stats?.contractFulfillment || 0}%`, desc: 'Average across all sites' }
        ].map((kpi, idx) => (
          <div key={idx} className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-4">
            <h3 className="text-[13px] font-bold text-[#6B7280] mb-1">{kpi.label}</h3>
            <span className="text-[28px] font-bold text-[#0F172A] leading-tight">{kpi.val}</span>
            <p className="text-[11px] text-gray-400 mt-2">{kpi.desc}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Guard Attendance & Arrival Punctuality by Site */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-[14px] font-bold text-[#1E3A5F] uppercase tracking-wide">Guard Attendance Breakdown By Site</h3>
              <p className="text-[12px] text-[#6B7280] mt-0.5">On-time arrivals, late check-ins, and absences</p>
            </div>
            <div className="flex gap-4 text-[11px] font-medium text-[#475569]">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#1E3A5F]"></span> On-Time</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#64748B]"></span> Late</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#CBD5E1]"></span> Absent</span>
            </div>
          </div>
          {(stats?.siteAttendanceData?.length || 0) > 0 ? (
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.siteAttendanceData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="site" tick={{ fontSize: 11, fill: '#475569', fontWeight: 500 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#475569', fontWeight: 500 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip cursor={{ fill: '#F8FAFC' }} contentStyle={{ borderRadius: 6, border: '1px solid #E2E8F0', fontSize: 12, fontWeight: 500 }} />
                  <Bar dataKey="onTime" name="On-Time" fill="#1E3A5F" radius={[2, 2, 0, 0]} stackId="a" barSize={36} />
                  <Bar dataKey="late" name="Late" fill="#64748B" radius={[2, 2, 0, 0]} stackId="a" barSize={36} />
                  <Bar dataKey="absent" name="Absent" fill="#CBD5E1" radius={[4, 4, 0, 0]} stackId="a" barSize={36} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-[13px] text-gray-400 font-medium">No guard attendance logs recorded for this period.</div>
          )}
        </div>

        {/* Operational Guard Punctuality & Performance Summary */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-[14px] font-bold text-[#1E3A5F] uppercase tracking-wide">Punctuality & Arrival Compliance</h3>
            <p className="text-[12px] text-[#6B7280] mt-0.5">Overall guard arrival promptness against shift start times</p>
          </div>

          <div className="grid grid-cols-3 gap-3 my-4">
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-4 rounded-lg text-center">
              <p className="text-[11px] font-bold text-[#475569] uppercase tracking-wider">On-Time Shifts</p>
              <p className="text-[28px] font-extrabold text-[#0F172A] mt-1 leading-none">{stats?.punctualitySummary?.onTime ?? 0}</p>
            </div>
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-4 rounded-lg text-center">
              <p className="text-[11px] font-bold text-[#475569] uppercase tracking-wider">Late Arrivals</p>
              <p className="text-[28px] font-extrabold text-[#0F172A] mt-1 leading-none">{stats?.punctualitySummary?.late ?? 0}</p>
            </div>
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-4 rounded-lg text-center">
              <p className="text-[11px] font-bold text-[#475569] uppercase tracking-wider">Absences</p>
              <p className="text-[28px] font-extrabold text-[#0F172A] mt-1 leading-none">{stats?.punctualitySummary?.absent ?? 0}</p>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between text-[13px] font-medium text-[#0F172A] mb-1.5">
                <span className="font-semibold text-[#334155]">On-Time Arrival Compliance Rate</span>
                <span className="font-extrabold text-[15px] text-[#0F172A]">{stats?.punctualitySummary?.onTimeRate ?? 100}%</span>
              </div>
              <div className="w-full bg-[#E2E8F0] rounded-full h-2">
                <div className="bg-[#1E3A5F] h-2 rounded-full transition-all duration-300" style={{ width: `${stats?.punctualitySummary?.onTimeRate ?? 100}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[13px] font-medium text-[#0F172A] mb-1.5">
                <span className="font-semibold text-[#334155]">Overall Roster Attendance Rate</span>
                <span className="font-extrabold text-[15px] text-[#0F172A]">{stats?.attendanceRate ?? 0}%</span>
              </div>
              <div className="w-full bg-[#E2E8F0] rounded-full h-2">
                <div className="bg-[#475569] h-2 rounded-full transition-all duration-300" style={{ width: `${stats?.attendanceRate ?? 0}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm">
        <div className="px-6 py-4 border-b border-[#E2E8F0] bg-[#F8FAFC]">
          <h3 className="text-[14px] font-bold text-[#1E3A5F]">Guard Performance Log</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-[#E2E8F0]">
                <th className="px-6 py-3 text-[12px] font-semibold text-[#6B7280] uppercase">Guard</th>
                {role === 'OPERATION_MANAGER' && <th className="px-6 py-3 text-[12px] font-semibold text-[#6B7280] uppercase">Affiliation</th>}
                <th className="px-6 py-3 text-[12px] font-semibold text-[#6B7280] uppercase">Status</th>
                <th className="px-6 py-3 text-[12px] font-semibold text-[#6B7280] uppercase text-center">Lifetime Incidents</th>
                <th className="px-6 py-3 text-[12px] font-semibold text-[#6B7280] uppercase text-right">Duty Utilization</th>
              </tr>
            </thead>
            <tbody>
              {filteredGuards.map(g => (
                <tr key={g.id} className="hover:bg-gray-50 border-b border-gray-100 last:border-0">
                  <td className="px-6 py-4">
                    <p className="font-medium text-[13px] text-[#0F172A]">{formatGuardName(g)}</p>
                    <p className="text-[11px] text-gray-400">ID: {role === 'CLIENT' ? 'HIDDEN' : g.guardId}</p>
                  </td>
                  {role === 'OPERATION_MANAGER' && (
                    <td className="px-6 py-4 text-[13px] text-gray-600">
                      {g.agency?.name || 'In-House'}
                    </td>
                  )}
                  <td className="px-6 py-4">
                    <span className={`text-[12px] px-2 py-0.5 rounded-full font-medium ${g.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                      {g.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-[13px] font-medium text-[#1E3A5F]">
                    {g.incidentCount}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-[13px] font-medium text-gray-700">{g.utilization}%</span>
                  </td>
                </tr>
              ))}
              {filteredGuards.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-[13px] text-gray-400">No matching guard performance data.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function RoleSettings({ user }: { user?: any }) {
  const role = user?.role || 'OPERATION_MANAGER';
  const [profile, setProfile] = useState(() => ({
    name: user?.name || (role === 'CLIENT' ? 'Client Org' : role === 'AGENCY' ? 'Agency Contact' : 'Ops Manager'),
    email: user?.email || 'manager@spms.com',
    phone: '+66 81 234 5678'
  }));

  const [passwordForm, setPasswordForm] = useState({ current: '', next: '', confirm: '' });
  const [opsPrefs, setOpsPrefs] = useState(() => ({
    defaultShiftCycle: localStorage.getItem('ops_shift_cycle') || '2-shift',
    emailAlerts: JSON.parse(localStorage.getItem('ops_email_alerts') || 'true'),
    contractExpiryReminders: JSON.parse(localStorage.getItem('ops_expiry_reminders') || 'true')
  }));

  const [adminPrefs, setAdminPrefs] = useState(() => ({
    defaultUserRole: localStorage.getItem('admin_default_role') || 'GUARD',
    pageSize: parseInt(localStorage.getItem('admin_page_size') || '10', 10),
    dateFormat: localStorage.getItem('admin_date_format') || 'YYYY-MM-DD'
  }));

  const [agencyPrefs, setAgencyPrefs] = useState(() => ({
    agencyName: localStorage.getItem('agency_name') || 'Apex Security Agency',
    defaultShiftPref: localStorage.getItem('agency_default_shift') || 'Flexible',
    autoVisibility: JSON.parse(localStorage.getItem('agency_auto_vis') || 'true')
  }));

  const [clientPrefs, setClientPrefs] = useState(() => ({
    companyName: localStorage.getItem('client_company_name') || 'Siam Retail Group',
    incidentAlerts: JSON.parse(localStorage.getItem('client_incident_alerts') || 'true'),
    scheduleChangeAlerts: JSON.parse(localStorage.getItem('client_schedule_alerts') || 'true')
  }));

  const handleSaveOps = () => {
    localStorage.setItem('ops_shift_cycle', opsPrefs.defaultShiftCycle);
    localStorage.setItem('ops_email_alerts', JSON.stringify(opsPrefs.emailAlerts));
    localStorage.setItem('ops_expiry_reminders', JSON.stringify(opsPrefs.contractExpiryReminders));
    alert('Operations Settings saved.');
  };

  const handleSaveAdmin = () => {
    localStorage.setItem('admin_default_role', adminPrefs.defaultUserRole);
    localStorage.setItem('admin_page_size', adminPrefs.pageSize.toString());
    localStorage.setItem('admin_date_format', adminPrefs.dateFormat);
    alert('Admin System Preferences saved.');
  };

  const handleSaveAgency = () => {
    localStorage.setItem('agency_name', agencyPrefs.agencyName);
    localStorage.setItem('agency_default_shift', agencyPrefs.defaultShiftPref);
    localStorage.setItem('agency_auto_vis', JSON.stringify(agencyPrefs.autoVisibility));
    alert('Agency Profile & Preferences saved.');
  };

  const handleSaveClient = () => {
    localStorage.setItem('client_company_name', clientPrefs.companyName);
    localStorage.setItem('client_incident_alerts', JSON.stringify(clientPrefs.incidentAlerts));
    localStorage.setItem('client_schedule_alerts', JSON.stringify(clientPrefs.scheduleChangeAlerts));
    alert('Client Profile & Alert Settings saved.');
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.next !== passwordForm.confirm) {
      return alert('New passwords do not match.');
    }
    alert('Password updated successfully.');
    setPasswordForm({ current: '', next: '', confirm: '' });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6">
        <h2 className="text-[20px] font-bold text-[#1E3A5F] mb-1">
          {role === 'ADMIN' ? 'System Administrator Settings' :
           role === 'CLIENT' ? 'Client Organization Settings' :
           role === 'AGENCY' ? 'Agency Manager Settings' : 'Operations Manager Settings'}
        </h2>
        <p className="text-[13px] text-gray-500">Manage profile data, notification policies, and account credentials.</p>
      </div>

      {/* Common Section: Profile Data */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6 space-y-4">
        <h3 className="text-[15px] font-bold text-[#0F172A] border-b pb-2">User Profile & Contact Info</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1">Full Name / Entity</label>
            <input value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} className="w-full border rounded px-3 py-1.5 text-[13px]" />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1">Email Address</label>
            <input value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })} className="w-full border rounded px-3 py-1.5 text-[13px]" />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1">Contact Telephone</label>
            <input value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} className="w-full border rounded px-3 py-1.5 text-[13px]" />
          </div>
        </div>
      </div>

      {/* Role-Specific Panels */}
      {(role === 'OPERATION_MANAGER' || !role) && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6 space-y-4">
          <h3 className="text-[15px] font-bold text-[#0F172A] border-b pb-2">Operations Scheduling & Dispatch Preferences</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-medium text-gray-700 mb-1">Default Contract Shift Cycle</label>
              <select value={opsPrefs.defaultShiftCycle} onChange={e => setOpsPrefs({ ...opsPrefs, defaultShiftCycle: e.target.value })} className="w-full border rounded px-3 py-1.5 text-[13px]">
                <option value="2-shift">2-Shift (12 Hours each)</option>
                <option value="3-shift">3-Shift (8 Hours each)</option>
              </select>
            </div>
          </div>
          <div className="space-y-3 pt-2">
            <label className="flex items-center gap-2 text-[13px] text-gray-700 cursor-pointer">
              <input type="checkbox" checked={opsPrefs.emailAlerts} onChange={e => setOpsPrefs({ ...opsPrefs, emailAlerts: e.target.checked })} className="rounded text-blue-600" />
              <span>Send immediate email alerts for Unresolved Critical Incidents</span>
            </label>
            <label className="flex items-center gap-2 text-[13px] text-gray-700 cursor-pointer">
              <input type="checkbox" checked={opsPrefs.contractExpiryReminders} onChange={e => setOpsPrefs({ ...opsPrefs, contractExpiryReminders: e.target.checked })} className="rounded text-blue-600" />
              <span>Remind Operations 30 days prior to contract expiration</span>
            </label>
          </div>
          <div className="flex justify-end pt-2">
            <button onClick={handleSaveOps} className="bg-[#1E3A5F] text-white px-4 py-2 rounded text-[13px] font-semibold hover:bg-blue-900 transition-colors">Save Ops Preferences</button>
          </div>
        </div>
      )}

      {role === 'ADMIN' && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6 space-y-4">
          <h3 className="text-[15px] font-bold text-[#0F172A] border-b pb-2">System Defaults & Backup</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[12px] font-medium text-gray-700 mb-1">Default Onboarding Role</label>
              <select value={adminPrefs.defaultUserRole} onChange={e => setAdminPrefs({ ...adminPrefs, defaultUserRole: e.target.value })} className="w-full border rounded px-3 py-1.5 text-[13px]">
                <option value="GUARD">Guard</option>
                <option value="CLIENT">Client</option>
                <option value="AGENCY">Agency</option>
                <option value="OPERATION_MANAGER">Operations Manager</option>
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-medium text-gray-700 mb-1">Table Items Per Page</label>
              <input type="number" value={adminPrefs.pageSize} onChange={e => setAdminPrefs({ ...adminPrefs, pageSize: parseInt(e.target.value) || 10 })} className="w-full border rounded px-3 py-1.5 text-[13px]" />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-gray-700 mb-1">Display Date Format</label>
              <select value={adminPrefs.dateFormat} onChange={e => setAdminPrefs({ ...adminPrefs, dateFormat: e.target.value })} className="w-full border rounded px-3 py-1.5 text-[13px]">
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              </select>
            </div>
          </div>
          <div className="flex justify-between items-center pt-3 border-t">
            <button onClick={() => alert('Exporting full database JSON backup...')} className="px-3 py-1.5 border border-gray-300 text-gray-700 text-[12px] font-semibold rounded hover:bg-gray-100">Export System Database Backup</button>
            <button onClick={handleSaveAdmin} className="bg-[#1E3A5F] text-white px-4 py-2 rounded text-[13px] font-semibold hover:bg-blue-900 transition-colors">Save Admin Preferences</button>
          </div>
        </div>
      )}

      {role === 'AGENCY' && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6 space-y-4">
          <h3 className="text-[15px] font-bold text-[#0F172A] border-b pb-2">Agency Profile & Guard Onboarding Defaults</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-medium text-gray-700 mb-1">Registered Agency Name</label>
              <input value={agencyPrefs.agencyName} onChange={e => setAgencyPrefs({ ...agencyPrefs, agencyName: e.target.value })} className="w-full border rounded px-3 py-1.5 text-[13px]" />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-gray-700 mb-1">Default Guard Shift Preference</label>
              <select value={agencyPrefs.defaultShiftPref} onChange={e => setAgencyPrefs({ ...agencyPrefs, defaultShiftPref: e.target.value })} className="w-full border rounded px-3 py-1.5 text-[13px]">
                <option value="Flexible">Flexible</option>
                <option value="Day">Day</option>
                <option value="Night">Night</option>
              </select>
            </div>
          </div>
          <label className="flex items-center gap-2 text-[13px] text-gray-700 cursor-pointer pt-2">
            <input type="checkbox" checked={agencyPrefs.autoVisibility} onChange={e => setAgencyPrefs({ ...agencyPrefs, autoVisibility: e.target.checked })} className="rounded text-blue-600" />
            <span>Automatically mark newly onboarded guards as Visible to Operations Managers</span>
          </label>
          <div className="flex justify-end pt-2">
            <button onClick={handleSaveAgency} className="bg-[#1E3A5F] text-white px-4 py-2 rounded text-[13px] font-semibold hover:bg-blue-900 transition-colors">Save Agency Settings</button>
          </div>
        </div>
      )}

      {role === 'CLIENT' && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6 space-y-4">
          <h3 className="text-[15px] font-bold text-[#0F172A] border-b pb-2">Client Company Profile & Alert Subscriptions</h3>
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1">Company Entity Name</label>
            <input value={clientPrefs.companyName} onChange={e => setClientPrefs({ ...clientPrefs, companyName: e.target.value })} className="w-full border rounded px-3 py-1.5 text-[13px]" />
          </div>
          <div className="space-y-3 pt-2">
            <label className="flex items-center gap-2 text-[13px] text-gray-700 cursor-pointer">
              <input type="checkbox" checked={clientPrefs.incidentAlerts} onChange={e => setClientPrefs({ ...clientPrefs, incidentAlerts: e.target.checked })} className="rounded text-blue-600" />
              <span>Receive real-time notifications for verified site security incidents</span>
            </label>
            <label className="flex items-center gap-2 text-[13px] text-gray-700 cursor-pointer">
              <input type="checkbox" checked={clientPrefs.scheduleChangeAlerts} onChange={e => setClientPrefs({ ...clientPrefs, scheduleChangeAlerts: e.target.checked })} className="rounded text-blue-600" />
              <span>Receive weekly summary of guard shift allocations</span>
            </label>
          </div>
          <div className="flex justify-end pt-2">
            <button onClick={handleSaveClient} className="bg-[#1E3A5F] text-white px-4 py-2 rounded text-[13px] font-semibold hover:bg-blue-900 transition-colors">Save Client Settings</button>
          </div>
        </div>
      )}

      {/* Common Section: Password Change */}
      <form onSubmit={handlePasswordChange} className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6 space-y-4">
        <h3 className="text-[15px] font-bold text-[#0F172A] border-b pb-2">Security & Password Credentials</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1">Current Password</label>
            <input type="password" required value={passwordForm.current} onChange={e => setPasswordForm({ ...passwordForm, current: e.target.value })} className="w-full border rounded px-3 py-1.5 text-[13px]" />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1">New Password</label>
            <input type="password" required value={passwordForm.next} onChange={e => setPasswordForm({ ...passwordForm, next: e.target.value })} className="w-full border rounded px-3 py-1.5 text-[13px]" />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1">Confirm New Password</label>
            <input type="password" required value={passwordForm.confirm} onChange={e => setPasswordForm({ ...passwordForm, confirm: e.target.value })} className="w-full border rounded px-3 py-1.5 text-[13px]" />
          </div>
        </div>
        <div className="flex justify-end pt-2">
          <button type="submit" className="bg-[#1E3A5F] text-white px-4 py-2 rounded text-[13px] font-semibold hover:bg-black transition-colors">Update Password</button>
        </div>
      </form>
    </div>
  );
}

export function ClientReports() {
  return <Reports />;
}

export function AgencyGuards() {
  const [guards, setGuards] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [shiftFilter, setShiftFilter] = useState('All');

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

  const loadGuards = () => fetchGuards().then(setGuards).catch(console.error);
  useEffect(() => { loadGuards(); }, []);

  const handleToggle = async (id: string, current: boolean) => {
    try {
      await toggleGuardVisibility(id, !current);
      loadGuards();
    } catch (e) { console.error(e); }
  };

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
      shiftPreference: g.shiftPreference || 'Flexible',
      status: g.status || 'Active',
      contactNumber: g.contactNumber || '',
      certificationExpiry: g.certificationExpiry ? g.certificationExpiry.split('T')[0] : '',
      skills: g.skills ? (Array.isArray(g.skills) ? g.skills : []) : [],
    });
    setIsCreating(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this guard from agency?")) return;
    try { await deleteGuard(id); loadGuards(); } catch (e) { console.error(e); }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const dataToSend = {
      ...formData,
      skills: formData.skills.length > 0 ? formData.skills : null,
      certificationExpiry: formData.certificationExpiry ? new Date(formData.certificationExpiry).toISOString() : null
    };
    try {
      if (editingId) await updateGuard(editingId, dataToSend);
      else await createGuard(dataToSend);
      setIsCreating(false);
      loadGuards();
    } catch (err) { alert("Error saving guard."); }
  };

  const filteredGuards = useMemo(() => {
    return guards.filter(g => {
      const gName = (g.firstName + ' ' + g.lastName).toLowerCase();
      const agencyName = (g.agency?.name || 'In-House').toLowerCase();
      const matchesSearch = gName.includes(searchQuery.toLowerCase()) || g.guardId.toLowerCase().includes(searchQuery.toLowerCase()) || agencyName.includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || g.status === statusFilter;
      const matchesShift = shiftFilter === 'All' || g.shiftPreference === shiftFilter;
      return matchesSearch && matchesStatus && matchesShift;
    });
  }, [guards, searchQuery, statusFilter, shiftFilter]);

  return (
    <>
      <div className="bg-white rounded border border-[#E2E8F0] shadow-sm">
        <div className="px-6 py-4 border-b border-[#E2E8F0] flex justify-between items-center bg-[#F8FAFC] gap-6">
          <div className="flex-shrink-0">
            <h2 className="text-[18px] font-semibold text-[#1E3A5F]">Agency Roster</h2>
            <p className="text-[13px] text-gray-500">Manage guards under your agency and toggle their availability for Ops.</p>
          </div>
          <div className="flex flex-1 items-center gap-2 justify-end">
            <input
              type="text"
              placeholder="Search ID, Name, Agency..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="border border-[#E2E8F0] rounded px-3 py-1.5 text-[13px] outline-none focus:border-[#1E3A5F] flex-1 max-w-[800px]"
            />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border border-[#E2E8F0] rounded px-3 py-1.5 text-[13px] outline-none">
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
              <option value="Suspended">Suspended</option>
            </select>
            <select value={shiftFilter} onChange={e => setShiftFilter(e.target.value)} className="border border-[#E2E8F0] rounded px-3 py-1.5 text-[13px] outline-none">
              <option value="All">All Shifts</option>
              <option value="Flexible">Flexible</option>
              <option value="Day">Day</option>
              <option value="Night">Night</option>
            </select>
            <button onClick={openCreate} className="bg-[#1E3A5F] text-white px-4 py-2 rounded text-[13px] font-medium hover:bg-[#162D4A] transition-colors ml-2">
              + Add Guard
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC]">
                <th className="px-6 py-3 text-[12px] font-semibold text-[#6B7280]">Guard ID</th>
                <th className="px-6 py-3 text-[12px] font-semibold text-[#6B7280]">Name</th>
                <th className="px-6 py-3 text-[12px] font-semibold text-[#6B7280]">Status</th>
                <th className="px-6 py-3 text-[12px] font-semibold text-[#6B7280]">Available to Ops?</th>
                <th className="px-6 py-3 text-[12px] font-semibold text-[#6B7280]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredGuards.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500 text-[13px]">No guards match your search filters.</td></tr>
              ) : (
                filteredGuards.map(g => (
                  <tr key={g.id} className="hover:bg-[#F8FAFC]">
                    <td className="px-6 py-4 text-[14px] font-medium text-[#1E3A5F]">{g.guardId}</td>
                    <td className="px-6 py-4 text-[14px] text-[#0F172A]">{g.firstName} {g.lastName}</td>
                    <td className="px-6 py-4 text-[14px] text-[#475569]">{g.status}</td>
                    <td className="px-6 py-4">
                      <label className="flex items-center cursor-pointer">
                        <div className="relative">
                          <input type="checkbox" className="sr-only" checked={g.isVisibleToOps || false} onChange={() => handleToggle(g.id, g.isVisibleToOps || false)} />
                          <div className={`block w-10 h-6 rounded-full transition ${g.isVisibleToOps ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                          <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform ${g.isVisibleToOps ? 'translate-x-4' : ''}`}></div>
                        </div>
                      </label>
                    </td>
                    <td className="px-6 py-4 flex gap-2">
                      <button onClick={() => openEdit(g)} className="text-[13px] text-blue-600 hover:underline">Edit</button>
                      <button onClick={() => handleDelete(g.id)} className="text-[13px] text-red-600 hover:underline">Remove</button>
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
            <div className="px-6 py-4 border-b bg-[#F8FAFC] flex justify-between">
              <h3 className="text-lg font-semibold text-[#1E3A5F]">Agency Guard Form</h3>
              <button type="button" onClick={() => setIsCreating(false)} className="text-gray-500 hover:text-black">✖</button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4">
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

              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1">Shift Preferences</label>
                <select value={formData.shiftPreference} onChange={e => setFormData({ ...formData, shiftPreference: e.target.value })} className="w-full border rounded px-3 py-2 text-[14px] focus:outline-none focus:ring-1 focus:ring-[#1E3A5F]">
                  <option value="Flexible">Flexible</option>
                  <option value="Day">Day Shifts Only</option>
                  <option value="Night">Night Shifts Only</option>
                </select>
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
                  <label className="block text-[13px] font-medium text-gray-700 mb-1">Skills (Press Enter)</label>
                  <div className="w-full border rounded px-2 py-1.5 focus-within:ring-1 focus-within:ring-[#1E3A5F] flex flex-wrap gap-1.5 items-center bg-white text-[14px]">
                    {formData.skills.map((s: string) => (
                      <span key={s} className="bg-blue-100 text-[#1E3A5F] font-medium text-[12px] px-2 py-0.5 rounded flex items-center gap-1 leading-none shadow-sm">
                        {s}
                        <button type="button" onClick={() => setFormData({ ...formData, skills: formData.skills.filter((sk: string) => sk !== s) })} className="text-blue-500 hover:text-red-500 outline-none leading-none pt-0.5">&times;</button>
                      </span>
                    ))}
                    <input
                      type="text"
                      placeholder={formData.skills.length === 0 ? "e.g. Armed" : ""}
                      className="flex-1 min-w-[50px] outline-none border-none p-0 focus:ring-0 text-[13px] h-[24px]"
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
            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end">
              <button type="button" onClick={() => setIsCreating(false)} className="px-4 py-2 text-[14px] text-gray-600">Cancel</button>
              <button type="submit" className="ml-2 bg-[#1E3A5F] text-white px-4 py-2 rounded text-[14px]">Save Guard</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

export function AgencySchedules() {
  const [schedules, setSchedules] = useState<any[]>([]);
  useEffect(() => {
    fetchSchedules().then(setSchedules).catch(console.error);
  }, []);

  return (
    <div className="bg-white rounded border border-[#E2E8F0] shadow-sm">
      <div className="px-6 py-4 border-b border-[#E2E8F0] flex justify-between items-center bg-[#F8FAFC]">
        <div>
          <h2 className="text-[18px] font-semibold text-[#1E3A5F]">Guard Schedules</h2>
          <p className="text-[13px] text-gray-500">Monitor upcoming shifts assigned to your agency's guards.</p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F8FAFC]">
              <th className="px-6 py-3 text-[12px] font-semibold text-[#6B7280]">Date &amp; Time</th>
              <th className="px-6 py-3 text-[12px] font-semibold text-[#6B7280]">Contract Site</th>
              <th className="px-6 py-3 text-[12px] font-semibold text-[#6B7280]">Assigned Guard</th>
              <th className="px-6 py-3 text-[12px] font-semibold text-[#6B7280]">Status</th>
            </tr>
          </thead>
          <tbody>
            {schedules.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-[13px] text-gray-500">No shift schedules found.</td>
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
                      {sched.status || 'Active'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
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
    localStorage.removeItem('spms_token');
    window.location.href = '/';
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  function ClientGuards() {
    const [guards, setGuards] = useState<any[]>([]);
    useEffect(() => { fetchGuards().then(setGuards).catch(console.error); }, []);
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
                <th className="px-6 py-3 text-[12px] font-semibold text-[#6B7280]">Status</th>
              </tr>
            </thead>
            <tbody>
              {guards.length === 0 ? (
                <tr><td colSpan={3} className="px-6 py-8 text-center text-gray-500 text-[13px]">No guards assigned to your properties.</td></tr>
              ) : (
                guards.map(g => (
                  <tr key={g.id} className="hover:bg-[#F8FAFC] border-t border-gray-100">
                    <td className="px-6 py-4 text-[14px] text-gray-500 font-medium italic">ID HIDDEN</td>
                    <td className="px-6 py-4 text-[14px]">{g.firstName} {g.lastName?.[0] || '?'}.</td>
                    <td className="px-6 py-4 text-[14px] text-green-700">{g.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  function ServiceRequests() {
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
    )
  }

  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      <Routes>
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="/" element={<Navigate to={
          user?.role === 'ADMIN' ? "/admin" :
            user?.role === 'AGENCY_MANAGER' ? "/agency" :
              user?.role === 'CLIENT' ? "/client" :
                user?.role === 'GUARD' ? "/guard" :
                  "/dashboard"
        } replace />} />

        {/* Guard Sphere */}
        <Route path="/guard" element={<ProtectedRoute allowed={['GUARD']} role={user?.role}><GuardLayout user={user} onLogout={handleLogout} /></ProtectedRoute>}>
          <Route index element={<GuardDashboard />} />
          <Route path="shifts" element={<GuardMyShifts />} />
          <Route path="incidents" element={<GuardReportIncident />} />
          <Route path="settings" element={<RoleSettings user={user} />} />
        </Route>

        {/* Admin Sphere */}
        <Route path="/admin" element={<ProtectedRoute allowed={['ADMIN']} role={user?.role}><AdminLayout user={user} onLogout={handleLogout} /></ProtectedRoute>}>
          <Route index element={<AdminUserManagement />} />
          <Route path="guards" element={<AdminGuardProvisioning />} />
          <Route path="settings" element={<RoleSettings user={user} />} />
        </Route>

        {/* Agency Sphere */}
        <Route path="/agency" element={<ProtectedRoute allowed={['AGENCY_MANAGER']} role={user?.role}><AgencyLayout user={user} onLogout={handleLogout} /></ProtectedRoute>}>
          <Route index element={<AgencyGuards />} />
          <Route path="schedules" element={<Schedules role={user?.role} />} />
          <Route path="logs" element={<Logs role={user?.role} />} />
          <Route path="reports" element={<Reports role={user?.role} />} />
          <Route path="settings" element={<RoleSettings user={user} />} />
        </Route>

        {/* Ops Sphere */}
        <Route path="/dashboard" element={<ProtectedRoute allowed={['OPERATION_MANAGER']} role={user?.role}><DashboardLayout user={user} onLogout={handleLogout} /></ProtectedRoute>}>
          <Route index element={<Overview role={user?.role} />} />
          <Route path="contracts" element={<Contracts />} />
          <Route path="guards" element={<Guards />} />
          <Route path="schedules" element={<Schedules role={user?.role} />} />
          <Route path="logs" element={<Logs role={user?.role} />} />
          <Route path="reports" element={<Reports role={user?.role} />} />
          <Route path="requests" element={<ServiceRequests />} />
          <Route path="settings" element={<RoleSettings user={user} />} />
          <Route path="*" element={<div>Page under construction</div>} />
        </Route>

        <Route path="/map" element={<ProtectedRoute allowed={['OPERATION_MANAGER']} role={user?.role}><DashboardLayout user={user} onLogout={handleLogout} /></ProtectedRoute>}>
          <Route index element={<MapControl />} />
        </Route>

        {/* Client Sphere */}
        <Route path="/client" element={<ProtectedRoute allowed={['CLIENT']} role={user?.role}><ClientLayout user={user} onLogout={handleLogout} /></ProtectedRoute>}>
          <Route index element={<ClientContracts />} />
          <Route path="guards" element={<ClientGuards />} />
          <Route path="schedules" element={<Schedules role={user?.role} />} />
          <Route path="reports" element={<Reports role={user?.role} />} />
          <Route path="settings" element={<RoleSettings user={user} />} />
          <Route path="*" element={<div>Client Module under construction</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
