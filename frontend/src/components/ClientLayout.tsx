import { Outlet, Link, useLocation } from 'react-router-dom';
import { Briefcase, Map, BarChart2, Settings, LogOut, CheckCircle2 } from 'lucide-react';

const clientNav = [
  { href: '/client', icon: Briefcase, label: 'My Contracts' },
  { href: '/client/map', icon: Map, label: 'Live Patrol Map' },
  { href: '/client/reports', icon: BarChart2, label: 'Analytics & Reports' },
  { href: '/client/settings', icon: Settings, label: 'Account Settings' },
];

export default function ClientLayout({ user, onLogout }: { user: any, onLogout: () => void }) {
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <div className="flex h-screen w-full bg-[#FAFAFA]">
      {/* Client Sidebar: Clean White/Blue theme */}
      <aside className="w-[260px] flex-shrink-0 flex flex-col h-full bg-white border-r border-[#E2E8F0] shadow-sm z-10">
        <div className="px-6 pt-7 pb-6 border-b border-[#E2E8F0]">
          <h1 className="text-[22px] font-bold leading-tight text-[#1E3A5F] font-serif">
            SPMS Client
          </h1>
          <p className="text-[12px] font-medium text-blue-600 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> SECURE OVERSIGHT
          </p>
        </div>

        <nav className="flex-1 px-4 py-5 space-y-2 overflow-y-auto">
          {clientNav.map(({ icon: Icon, label, href }) => {
            const isActive = pathname === href || (pathname !== '/client' && pathname.startsWith(href));
            return (
              <Link
                key={label}
                to={href}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[14px] transition-all duration-200 font-sans ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-bold shadow-sm border border-blue-100'
                    : 'text-gray-500 hover:text-[#1E3A5F] hover:bg-gray-50 font-medium'
                }`}
              >
                <Icon className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? 'text-blue-700' : 'opacity-70'}`} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="px-4 pb-4 border-t border-[#E2E8F0] pt-4">
          <div className="flex items-center gap-3 px-2 mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center border border-blue-200 shadow-inner">
               <span className="text-blue-700 font-bold text-[14px]">{user?.name?.charAt(0) || 'C'}</span>
            </div>
            <div className="overflow-hidden">
               <p className="text-[13px] font-bold text-[#1E3A5F] truncate">{user?.name || 'Authorized Client'}</p>
               <p className="text-[11px] font-medium text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            type="button"
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-[13px] font-medium text-red-600 hover:text-white hover:bg-red-500 border border-red-200 transition-all shadow-sm bg-white"
          >
            <LogOut className="w-[18px] h-[18px]" />
            Disconnect Securely
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Subtle top decoration for premium feel */}
        <div className="h-1 w-full bg-gradient-to-r from-blue-600 to-indigo-500 absolute top-0 left-0 z-50"></div>
        {/* Main Viewport */}
        <main className="flex-1 overflow-y-auto p-10 mt-1">
           <div className="max-w-6xl mx-auto">
              <Outlet />
           </div>
        </main>
      </div>
    </div>
  );
}
