import { 
  Users, 
  Building2, 
  AlertOctagon, 
  CheckCircle2, 
  Map, 
  AlertTriangle,
  Clock,
  ShieldAlert,
  ArrowRight
} from "lucide-react";

export default function DashboardOverview() {
  const stats = [
    { label: "Active Guards", value: "24", trend: "+2 this week", icon: Users, color: "text-blue-600", bg: "bg-blue-100" },
    { label: "Active Sites", value: "8", trend: "Stable", icon: Building2, color: "text-indigo-600", bg: "bg-indigo-100" },
    { label: "Pending Incidents", value: "3", trend: "-5 since yesterday", icon: AlertOctagon, alert: true, color: "text-rose-600", bg: "bg-rose-100" },
    { label: "Patrol Routes Today", value: "112", trend: "95% completion rate", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-100" },
  ];

  return (
    <div className="max-w-7xl mx-auto animation-fade-in space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">System Overview</h1>
          <p className="text-gray-500 mt-1 text-sm font-medium">Real-time operational snapshot of active deployments.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div 
              key={i} 
              className={`p-6 rounded-2xl bg-white border shadow-sm flex flex-col gap-4 transform transition-all duration-300 hover:shadow-md ${stat.alert ? 'border-rose-200' : 'border-gray-200'}`}
            >
              <div className="flex justify-between items-start">
                <div className={`p-3 rounded-lg ${stat.bg}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
              
              <div>
                <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wider">{stat.label}</h3>
                <p className="text-3xl font-black text-gray-900 mt-2 tracking-tight">{stat.value}</p>
                <p className={`text-xs mt-3 font-semibold ${stat.alert ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {stat.trend}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col h-[500px]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Map className="w-5 h-5 text-gray-400" />
              Live Route Execution
            </h2>
          </div>
          
          <div className="flex-1 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-500 text-sm font-medium">
             Map Tracking Integration Pending
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col h-[500px]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-gray-400" />
              Recent Incidents
            </h2>
          </div>
          
          <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
            <div className="p-4 rounded-xl border border-rose-100 bg-rose-50/50 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-gray-900 text-sm">Missed Checkpoint</h4>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">North Gate - Route C</p>
                <div className="flex items-center gap-1 mt-2 text-rose-600 font-semibold text-xs">
                  <Clock className="w-3 h-3" />
                  <span>10 mins ago</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-amber-100 bg-amber-50/50 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-gray-900 text-sm">Suspicious Activity</h4>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">Parking Lot B - Unauthorized vehicle reported</p>
                <div className="flex items-center gap-1 mt-2 text-amber-600 font-semibold text-xs">
                  <Clock className="w-3 h-3" />
                  <span>1 hour ago</span>
                </div>
              </div>
            </div>
          </div>
          
          <button className="w-full mt-4 py-2.5 rounded-xl bg-gray-50 text-gray-600 font-semibold text-sm hover:bg-gray-100 hover:text-gray-900 transition-colors border border-gray-200 flex items-center justify-center gap-2 group">
            View All Incidents
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

    </div>
  );
}