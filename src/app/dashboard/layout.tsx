"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
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
} from 'lucide-react';

const palette = {
  navy: '#021526',
  midBlue: '#03346E',
  sky: '#6EACDA',
  cream: '#E2E2B6',
};

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { href: '/dashboard/contracts', icon: FileText, label: 'Contracts' },
  { href: '/dashboard/guards', icon: Users, label: 'Guard Management' },
  { href: '/dashboard/schedules', icon: CalendarDays, label: 'Assign Schedule' },
  { href: '/map', icon: Map, label: 'Map & Path Creation' },
  { href: '/dashboard/logs', icon: BookOpen, label: 'Operation Log' },
  { href: '/dashboard/reports', icon: BarChart2, label: 'System Report' },
  { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ fontFamily: "'Inter', system-ui, sans-serif", backgroundColor: "#f0f4f8" }}>
      <aside className="w-60 flex-shrink-0 flex flex-col h-full" style={{ backgroundColor: palette.navy }}>
        <div className="px-5 pt-6 pb-5" style={{ borderBottom: `1px solid rgba(110,172,218,0.15)` }}>
          <h1 className="text-xl font-bold leading-tight tracking-tight" style={{ color: palette.sky, fontFamily: "'Outfit', sans-serif" }}>
            SPMS Command
          </h1>
          <p className="text-[10px] font-semibold tracking-[0.2em] uppercase mt-1" style={{ color: palette.cream, opacity: 0.65 }}>
            Manager Portal
          </p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ icon: Icon, label, href }) => {
            const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
            return (
              <Link
                key={label}
                href={href}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-medium transition-all duration-150 text-left"
                style={
                  isActive
                    ? { backgroundColor: palette.midBlue, color: "#ffffff" }
                    : { color: palette.cream, backgroundColor: "transparent" }
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0" style={{ color: isActive ? "#ffffff" : palette.sky, opacity: isActive ? 1 : 0.75 }} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="mx-3 mb-3 rounded-xl p-3" style={{ backgroundColor: "rgba(3,52,110,0.5)", border: `1px solid rgba(110,172,218,0.15)` }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[13px] font-bold flex-shrink-0" style={{ backgroundColor: palette.midBlue, border: `2px solid ${palette.sky}` }}>
              AD
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-white leading-none">Admin User</p>
              <p className="text-[11px] font-semibold mt-1 leading-none uppercase tracking-wide" style={{ color: "#4ade80" }}>
                ● Online
              </p>
            </div>
          </div>
        </div>
        <div className="px-3 pb-4">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            type="button"
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150"
            style={{ backgroundColor: "rgba(110,172,218,0.08)", color: palette.cream, border: `1px solid rgba(110,172,218,0.15)` }}
          >
            <LogOut className="w-4 h-4" style={{ color: palette.sky }} />
            Logout
          </button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 flex items-center px-6 gap-4 flex-shrink-0" style={{ backgroundColor: palette.midBlue, borderBottom: `1px solid rgba(110,172,218,0.2)` }}>
          <div className="flex-1 min-w-0">
            <h2 className="text-[15px] font-bold text-white leading-none tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
              System Overview
            </h2>
            <p className="text-[11px] mt-0.5 leading-none" style={{ color: palette.sky, opacity: 0.75 }}>
              Sunday, July 13, 2026
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: "rgba(110,172,218,0.15)", color: palette.sky, border: `1px solid rgba(110,172,218,0.3)` }}>
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            All Systems Normal
          </div>
          <button className="relative w-8 h-8 rounded-lg flex items-center justify-center transition-colors" style={{ backgroundColor: "rgba(110,172,218,0.1)" }}>
            <Bell className="w-4 h-4" style={{ color: palette.cream }} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2" style={{ borderColor: palette.midBlue }} />
          </button>
          <div className="flex items-center gap-2.5 pl-3" style={{ borderLeft: `1px solid rgba(110,172,218,0.25)` }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold" style={{ background: `linear-gradient(135deg, ${palette.sky}, ${palette.midBlue})` }}>
              AD
            </div>
            <div className="hidden md:block">
              <p className="text-[12px] font-semibold text-white leading-none">Admin</p>
              <p className="text-[10px] mt-0.5 leading-none" style={{ color: palette.cream, opacity: 0.65 }}>Super Admin</p>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-5 space-y-4" style={{ backgroundColor: "#eef2f7" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
