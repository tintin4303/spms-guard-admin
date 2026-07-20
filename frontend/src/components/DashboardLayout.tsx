import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Users,
  CalendarDays,
  Map,
  BookOpen,
  BarChart2,
  Settings,
  LogOut,
  Bell,
  ShieldAlert,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Overview', roles: ['OPERATION_MANAGER', 'CLIENT', 'AGENCY_MANAGER'] },
  { href: '/dashboard/users', icon: Users, label: 'User Management', roles: ['ADMIN'] },
  { href: '/dashboard/contracts', icon: FileText, label: 'Contracts', roles: ['OPERATION_MANAGER', 'CLIENT'] },
  { href: '/map', icon: Map, label: 'Map Control', roles: ['OPERATION_MANAGER', 'CLIENT'] },
  { href: '/dashboard/guards', icon: Users, label: 'Guards', roles: ['OPERATION_MANAGER', 'CLIENT', 'AGENCY_MANAGER'] },
  { href: '/dashboard/schedules', icon: CalendarDays, label: 'Schedules', roles: ['OPERATION_MANAGER', 'AGENCY_MANAGER'] },
  { href: '/dashboard/logs', icon: BookOpen, label: 'Log', roles: ['OPERATION_MANAGER', 'CLIENT', 'AGENCY_MANAGER'] },
  { href: '/dashboard/reports', icon: BarChart2, label: 'Reports', roles: ['OPERATION_MANAGER', 'CLIENT', 'AGENCY_MANAGER'] },
  { href: '/dashboard/settings', icon: Settings, label: 'Settings', roles: ['ADMIN', 'OPERATION_MANAGER', 'CLIENT', 'AGENCY_MANAGER'] },
];

export default function DashboardLayout({ user, onLogout }: { user: any, onLogout: () => void }) {
  const location = useLocation();
  const pathname = location.pathname;

  const allowedNav = navItems.filter(item => item.roles.includes(user?.role || 'CLIENT'));

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#F8FAFC]">
      {/* Sidebar: Primary Navy Color #1E3A5F */}
      <aside className="w-[240px] flex-shrink-0 flex flex-col h-full bg-[#1E3A5F]">
        <div className="px-5 pt-6 pb-5 border-b border-white/10">
          <h1 className="text-[24px] font-bold leading-tight text-white font-serif">
            SPMS Command
          </h1>
          <p className="text-[11px] font-semibold tracking-wider text-blue-200 mt-1 uppercase">
            Operations Portal
          </p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {allowedNav.map(({ icon: Icon, label, href }) => {
            const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
            return (
              <Link
                key={label}
                to={href}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-[14px] transition-all duration-150 font-sans ${
                  isActive
                    ? 'bg-[#2563EB] text-white font-medium shadow-sm'
                    : 'text-gray-300 hover:bg-white/10'
                }`}
              >
                <Icon className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="px-3 pb-4">
          <button
            onClick={onLogout}
            type="button"
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded text-[13px] font-medium transition-colors bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10"
          >
            <LogOut className="w-[18px] h-[18px]" />
            Sign Out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header Bar */}
        <header className="h-[56px] flex items-center px-6 gap-4 flex-shrink-0 bg-white border-b border-[#E2E8F0] shadow-sm">
          <div className="flex-1 min-w-0">
            <h2 className="text-[18px] font-semibold text-[#1E3A5F] font-serif leading-none tracking-tight">
              Dashboard Workspace
            </h2>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-[12px] font-medium px-2.5 py-1 rounded bg-[#F1F5F9] text-[#1E3A5F] border border-[#CBD5E1]">
            <span className="w-1.5 h-1.5 bg-[#16A34A] rounded-full animate-pulse" />
            System Normal
          </div>
          <button className="relative w-8 h-8 rounded flex items-center justify-center transition-colors hover:bg-gray-100">
            <Bell className="w-4 h-4 text-[#6B7280]" />
          </button>
          <div className="flex items-center gap-2.5 pl-4 ml-2 border-l border-[#E2E8F0]">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[12px] font-bold bg-[#1E3A5F]">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div className="hidden md:block">
              <p className="text-[13px] font-semibold text-[#1E3A5F] leading-none">{user?.name || 'User'}</p>
              <p className="text-[11px] mt-1 leading-none text-[#6B7280]">{user?.role || 'Guest'}</p>
            </div>
          </div>
        </header>

        {/* Main Content Pane */}
        <main className="flex-1 overflow-y-auto p-6 bg-[#F8FAFC]">
          <div className="max-w-6xl mx-auto">
             <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
