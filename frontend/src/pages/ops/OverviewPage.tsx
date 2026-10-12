import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Users, AlertTriangle, CheckCircle2, Calendar, ShieldAlert, BarChart } from 'lucide-react';
import { fetchReportsOverview, fetchLogs } from '../../api';

interface OverviewProps {
  role?: string;
}

export default function OverviewPage({ role = 'OPERATION_MANAGER' }: OverviewProps) {
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
  );
}
