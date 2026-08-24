import { Outlet, Link, useLocation } from 'react-router-dom';
import { Users, CalendarDays, BookOpen, BarChart2, Settings, LogOut, Shield, Bell, ShieldAlert } from 'lucide-react';

const agencyNav = [
 { href: '/agency', icon: Users, label: 'Agency Roster' },
 { href: '/agency/schedules', icon: CalendarDays, label: 'Shift Schedules' },
 { href: '/agency/logs', icon: BookOpen, label: 'Incident Reports' },
 { href: '/agency/reports', icon: BarChart2, label: 'Performance Analytics' },
];

export default function AgencyLayout({ user, onLogout }: { user: any, onLogout: () => void }) {
 const location = useLocation();
 const pathname = location.pathname;

 return (
 <div className="flex h-screen w-full overflow-hidden bg-[#F8FAFC]">
 {/* Sidebar: Primary Navy Color #1E3A5F */}
 <aside className="w-[240px] flex-shrink-0 flex flex-col h-full bg-[#1E3A5F]">
 <div className="px-5 pt-6 pb-5 border-b border-white/10">
 <Link to="/agency" className="block hover:opacity-80 transition-opacity">
 <h1 className="text-[24px] font-bold leading-tight text-white ">
 SPMS Vendor
 </h1>
 <p className="text-[11px] font-semibold tracking-wider text-blue-200 mt-1 uppercase">
 Vendor Portal
 </p>
 </Link>
 </div>

 <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
 {agencyNav.map(({ icon: Icon, label, href }) => {
 const isActive = pathname === href || (href !== '/agency' && pathname.startsWith(href));
 return (
 <Link
 key={label}
 to={href}
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
 <header className="h-[56px] flex items-center justify-end px-6 flex-shrink-0 bg-white border-b border-[#E2E8F0] shadow-sm">
 <div className="flex items-center gap-2.5">
 <div className="hidden md:block text-right">
 <p className="text-[13px] font-semibold text-[#1E3A5F] leading-none">{user?.name || 'Authorized Agency'}</p>
 <p className="text-[11px] mt-1 leading-none text-[#6B7280]">{user?.role || 'AGENCY_MANAGER'}</p>
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
