"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  CalendarCheck, 
  Map, 
  ListOrdered, 
  BarChart3, 
  Settings, 
  LogOut,
  Bell
} from "lucide-react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Contracts", href: "/dashboard/contracts", icon: FileText },
    { name: "Guard Management", href: "/dashboard/guards", icon: Users },
    { name: "Assign Schedule", href: "/dashboard/schedules", icon: CalendarCheck },
    { name: "Map & Path Creation", href: "/map", icon: Map },
    { name: "Operation Log", href: "/dashboard/logs", icon: ListOrdered },
    { name: "System Report", href: "/dashboard/reports", icon: BarChart3 },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-gray-50 flex-col md:flex-row font-sans">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-72 bg-[#0f172a] text-white flex flex-col shadow-2xl h-auto md:h-full flex-shrink-0">
        <div className="p-6 border-b border-gray-700/50 flex flex-col gap-1 text-center md:text-left">
          <h1 className="text-2xl font-black bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            SPMS Command
          </h1>
          <p className="text-xs text-gray-400 font-medium tracking-wide uppercase">Manager Portal</p>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group relative overflow-hidden
                  ${isActive 
                    ? "bg-blue-600 shadow-md text-white shadow-blue-500/20" 
                    : "text-gray-300 hover:bg-slate-800 hover:text-white"
                  }
                `}
              >
                <Icon className={`w-5 h-5 transition-transform ${!isActive && "group-hover:scale-110 group-hover:text-blue-400"}`} />
                <span className="font-semibold text-sm tracking-wide">{item.name}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-6 border-t border-gray-700/50 mt-auto space-y-4">
          <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl border border-slate-700">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm shadow-inner shadow-blue-400/50">
              AD
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white">Admin User</span>
              <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">Online</span>
            </div>
          </div>
          
          <button className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg bg-slate-800 border border-slate-700/50 text-sm font-semibold hover:bg-red-500 hover:text-white text-gray-300 transition-all group shadow-sm">
            <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Top Header */}
        <header className="h-16 lg:h-20 bg-white/95 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-6 lg:px-8 shadow-sm flex-shrink-0 z-10 sticky top-0">
          <h2 className="text-lg lg:text-xl font-bold text-gray-800 tracking-tight">Dashboard Overview</h2>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-400 hover:text-blue-500 transition-colors rounded-full hover:bg-gray-100">
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              <Bell className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <div className="flex-1 overflow-auto p-6 lg:p-8 relative">
          <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] pointer-events-none -z-10" />
          {children}
        </div>
      
      </main>
    </div>
  );
}
