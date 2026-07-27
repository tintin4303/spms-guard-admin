import { Outlet, Link, useLocation } from 'react-router-dom';
import { Users, Settings, LogOut, ShieldAlert } from 'lucide-react';

const adminNav = [
  { href: '/admin', icon: Users, label: 'User Management' },
  { href: '/admin/settings', icon: Settings, label: 'System Settings' },
];

export default function AdminLayout({ user, onLogout }: { user: any, onLogout: () => void }) {
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <div className="flex h-screen w-full bg-[#F8FAFC]">
      {/* Admin Sidebar: Dark Gray/Black theme to differentiate from Ops */}
      <aside className="w-[240px] flex-shrink-0 flex flex-col h-full bg-[#0F172A]">
        <div className="px-5 pt-6 pb-5 border-b border-white/10">
          <h1 className="text-[20px] font-bold leading-tight text-white font-serif">
            SPMS Identity
          </h1>
          <p className="text-[11px] font-semibold tracking-wider text-red-400 mt-1 uppercase">
            Admin Root Console
          </p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {adminNav.map(({ icon: Icon, label, href }) => {
            // Strict match for admin dashboard root
            const isActive = pathname === href || (pathname !== '/admin' && pathname.startsWith(href));
            return (
              <Link
                key={label}
                to={href}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-[14px] transition-colors font-sans ${
                  isActive
                    ? 'bg-red-600 text-white font-medium shadow-sm'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? 'text-white' : 'opacity-70'}`} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="px-3 pb-4">
          <button
            onClick={onLogout}
            type="button"
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded text-[13px] font-medium text-gray-300 hover:text-white hover:bg-white/10 bg-white/5 border border-white/10 transition-colors"
          >
            <LogOut className="w-[18px] h-[18px]" />
            Sign Out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header Bar */}
        <header className="h-[56px] flex items-center px-6 gap-4 border-b border-[#E2E8F0] bg-white">
          <div className="flex-1 min-w-0">
            <h2 className="text-[16px] font-semibold text-[#0F172A] flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-600" /> System Overlord Network
            </h2>
          </div>
          <div className="flex items-center gap-3">
             <div className="text-right hidden md:block">
               <p className="text-[13px] font-bold text-[#0F172A] leading-none">{user?.name || 'Administrator'}</p>
               <p className="text-[11px] mt-1 text-red-500 font-semibold leading-none">{user?.role || 'ROOT'}</p>
             </div>
             <div className="w-9 h-9 rounded bg-red-100 flex items-center justify-center border border-red-200">
               <span className="text-red-700 font-bold text-[14px]">AD</span>
             </div>
          </div>
        </header>

        {/* Main Viewport */}
        <main className="flex-1 overflow-y-auto p-8">
           <div className="max-w-5xl mx-auto">
              <Outlet />
           </div>
        </main>
      </div>
    </div>
  );
}
