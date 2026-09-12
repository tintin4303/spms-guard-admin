import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, CalendarDays, AlertTriangle, LogOut, Menu, X } from 'lucide-react';

const guardNav = [
  { href: '/guard', icon: LayoutDashboard, label: 'Guard Dashboard' },
  { href: '/guard/shifts', icon: CalendarDays, label: 'My Shifts' },
  { href: '/guard/incidents', icon: AlertTriangle, label: 'Report Incident' },
];

export default function GuardLayout({ user, onLogout }: { user: any, onLogout: () => void }) {
  const location = useLocation();
  const pathname = location.pathname;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#F8FAFC]">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar: Primary Navy Color #1E3A5F */}
      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-[240px] flex-shrink-0 flex flex-col h-full bg-[#1E3A5F] transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="px-5 pt-6 pb-5 border-b border-white/10 flex justify-between items-center">
          <Link to="/guard" className="block hover:opacity-80 transition-opacity" onClick={() => setIsSidebarOpen(false)}>
            <h1 className="text-[24px] font-bold leading-tight text-white ">
              SPMS Guard
            </h1>
            <p className="text-[11px] font-semibold tracking-wider text-blue-200 mt-1 uppercase">
              Guard Portal
            </p>
          </Link>
          <button 
            className="md:hidden text-white hover:text-gray-300" 
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {guardNav.map(({ icon: Icon, label, href }) => {
            const isActive = pathname === href || (href !== '/guard' && pathname.startsWith(href));
            return (
              <Link
                key={label}
                to={href}
                onClick={() => setIsSidebarOpen(false)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-[14px] transition-all duration-150 ${
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
        <header className="h-[56px] flex items-center justify-between md:justify-end px-4 md:px-6 flex-shrink-0 bg-white border-b border-[#E2E8F0] shadow-sm">
          <button 
            className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-md"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2.5">
            <div className="text-right">
              <p className="text-[13px] font-semibold text-[#1E3A5F] leading-none">{user?.name || 'Security Guard'}</p>
              <p className="text-[11px] mt-1 leading-none text-[#6B7280]">GUARD</p>
            </div>
          </div>
        </header>

        {/* Main Content Pane */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#F8FAFC]">
          <div className="w-full max-w-[1400px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
