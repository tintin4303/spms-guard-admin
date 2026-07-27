import { Outlet, Link, useLocation } from 'react-router-dom';
import { Users, CalendarDays, BookOpen, BarChart2, Settings, LogOut, Shield } from 'lucide-react';

const agencyNav = [
  { href: '/agency', icon: Users, label: 'Agency Roster' },
  { href: '/agency/schedules', icon: CalendarDays, label: 'Shift Schedules' },
  { href: '/agency/logs', icon: BookOpen, label: 'Incident Reports' },
  { href: '/agency/reports', icon: BarChart2, label: 'Performance Analytics' },
  { href: '/agency/settings', icon: Settings, label: 'Vendor Settings' },
];

export default function AgencyLayout({ user, onLogout }: { user: any, onLogout: () => void }) {
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <div className="flex h-screen w-full bg-[#F3F4F6]">
      {/* Agency Sidebar: Clean Emerald/Dark theme for external vendors */}
      <aside className="w-[250px] flex-shrink-0 flex flex-col h-full bg-[#064E3B]">
        <div className="px-6 pt-7 pb-6 border-b border-emerald-800">
          <h1 className="text-[20px] font-bold leading-tight text-white font-serif flex items-center gap-2">
            SPMS <Shield className="w-5 h-5 text-emerald-400" />
          </h1>
          <p className="text-[12px] font-medium tracking-wide text-emerald-400 mt-1 uppercase">
            Vendor Portal
          </p>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          {agencyNav.map(({ icon: Icon, label, href }) => {
            const isActive = pathname === href || (pathname !== '/agency' && pathname.startsWith(href));
            return (
              <Link
                key={label}
                to={href}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-[13.5px] transition-all font-sans ${
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-300 font-semibold border-l-4 border-emerald-400 pl-3 shadow-inner'
                    : 'text-emerald-100 hover:text-white hover:bg-emerald-800/50 font-medium'
                }`}
              >
                <Icon className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? 'text-emerald-300' : 'opacity-70'}`} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-emerald-800">
          <div className="flex items-center gap-3 px-2 mb-4 bg-emerald-900/40 p-3 rounded-lg border border-emerald-800/50">
            <div className="overflow-hidden">
               <p className="text-[13px] font-bold text-white truncate px-1">{user?.name || 'Authorized Agency'}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            type="button"
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-[13px] font-medium text-emerald-100 hover:text-white hover:bg-emerald-800 transition-colors bg-black/20"
          >
            <LogOut className="w-[16px] h-[16px]" />
            Exit Portal
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-[60px] bg-white border-b border-gray-200 flex items-center px-8 shadow-sm z-10 w-full shrink-0">
           <h2 className="text-[17px] font-bold text-gray-800 font-serif">Agency Synchronization Hub</h2>
        </header>

        <main className="flex-1 overflow-y-auto p-10">
           <div className="max-w-6xl mx-auto h-full">
              <Outlet />
           </div>
        </main>
      </div>
    </div>
  );
}
