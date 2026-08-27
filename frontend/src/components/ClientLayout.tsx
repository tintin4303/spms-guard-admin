import { Outlet, Link, useLocation } from 'react-router-dom';
import { Briefcase, BarChart2, Settings, LogOut, CheckCircle2 } from 'lucide-react';

const clientNav = [
  { href: '/client', icon: Briefcase, label: 'My Contracts' },
  { href: '/client/guards', icon: Briefcase, label: 'Assigned Guards' },
  { href: '/client/reports', icon: BarChart2, label: 'Analytics & Reports' },
  { href: '/client/settings', icon: Settings, label: 'Account Settings' },
];

export default function ClientLayout({ user, onLogout }: { user: any, onLogout: () => void }) {
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <div className="flex h-screen w-full bg-[#F8FAFC]">
      {/* Client Sidebar: Primary Navy Color #1E3A5F */}
      <aside className="w-[260px] flex-shrink-0 flex flex-col h-full bg-[#1E3A5F] z-10">
        <div className="px-6 pt-7 pb-6 border-b border-white/10">
          <Link to="/client" className="block hover:opacity-80 transition-opacity">
            <h1 className="text-[22px] font-bold leading-tight text-white font-serif">
              SPMS Client
            </h1>
            <p className="text-[12px] font-medium text-blue-200 mt-1 flex items-center gap-1 uppercase tracking-wider">
              <CheckCircle2 className="w-3.5 h-3.5" /> SECURE OVERSIGHT
            </p>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-5 space-y-1.5 overflow-y-auto">
          {clientNav.map(({ icon: Icon, label, href }) => {
            const isActive = pathname === href || (pathname !== '/client' && pathname.startsWith(href));
            return (
              <Link
                key={label}
                to={href}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[14px] transition-all duration-150 font-sans ${isActive
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

        <div className="px-4 pb-4 border-t border-white/10 pt-4">
          <div className="flex items-center gap-3 px-2 mb-4">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
              <span className="text-white font-bold text-[14px]">{user?.name?.charAt(0) || 'C'}</span>
            </div>
            <div className="overflow-hidden">
              <p className="text-[13px] font-bold text-white truncate">{user?.name || 'Authorized Client'}</p>
              <p className="text-[11px] font-medium text-gray-300 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            type="button"
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-[13px] font-medium text-gray-300 hover:text-white hover:bg-white/10 border border-white/10 transition-all bg-white/5"
          >
            <LogOut className="w-[18px] h-[18px]" />
            Disconnect Securely
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header Bar */}
        <header className="h-[56px] flex items-center justify-end px-6 flex-shrink-0 bg-white border-b border-[#E2E8F0] shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="hidden md:block text-right">
              <p className="text-[13px] font-semibold text-[#1E3A5F] leading-none">{user?.name || 'Authorized Client'}</p>
              <p className="text-[11px] mt-1 leading-none text-[#6B7280]">{user?.role || 'CLIENT'}</p>
            </div>
          </div>
        </header>

        {/* Main Content Pane */}
        <main className="flex-1 overflow-y-auto p-6 bg-[#F8FAFC]">
          <div className="w-full max-w-[1400px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
