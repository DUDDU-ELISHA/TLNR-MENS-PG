import React from 'react';
import {
  Building2,
  Users,
  Bed,
  CheckCircle2,
  Clock,
  IndianRupee,
  ShoppingCart,
  TrendingUp,
  Layers,
  ArrowRight
} from 'lucide-react';

interface HostOverviewProps {
  data: {
    totalRooms: number;
    totalBeds: number;
    occupiedBeds: number;
    availableBeds: number;
    totalResidents: number;
    totalCollection: number; // Shown ONLY in Host Dashboard!
    paidPaymentsCount: number;
    pendingPaymentsCount: number;
    totalGroceryExpenses: number;
    floorStats: Record<number, { totalBeds: number; occupiedBeds: number }>;
  };
  onNavigateTab: (tab: string) => void;
}

export const HostOverview: React.FC<HostOverviewProps> = ({ data, onNavigateTab }) => {
  const cards = [
    {
      title: 'Total Rooms',
      value: data.totalRooms,
      sub: 'Floors 1 to 8 (37 designated rooms)',
      icon: Building2,
      color: 'bg-cyan-700 text-white'
    },
    {
      title: 'Total Beds',
      value: data.totalBeds,
      sub: 'Total configured capacity',
      icon: Bed,
      color: 'bg-indigo-600 text-white'
    },
    {
      title: 'Occupied Beds',
      value: data.occupiedBeds,
      sub: `${data.totalResidents} active residents`,
      icon: Users,
      color: 'bg-cyan-600 text-white'
    },
    {
      title: 'Available Beds',
      value: data.availableBeds,
      sub: 'Vacant & ready for check-in',
      icon: CheckCircle2,
      color: 'bg-emerald-600 text-white'
    },
    {
      title: 'Total Collection',
      value: `₹${(data.totalCollection || 0).toLocaleString('en-IN')}`,
      sub: 'Host Admin Confidential',
      icon: IndianRupee,
      color: 'bg-emerald-700 text-white',
      highlight: true
    },
    {
      title: 'Paid Payments',
      value: data.paidPaymentsCount,
      sub: 'Settled transactions',
      icon: CheckCircle2,
      color: 'bg-teal-600 text-white'
    },
    {
      title: 'Pending / Partial',
      value: data.pendingPaymentsCount,
      sub: 'Outstanding balances',
      icon: Clock,
      color: 'bg-amber-600 text-white'
    },
    {
      title: 'Grocery Expenses',
      value: `₹${(data.totalGroceryExpenses || 0).toLocaleString('en-IN')}`,
      sub: 'Kitchen procurement',
      icon: ShoppingCart,
      color: 'bg-rose-600 text-white'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.title}
              className={`rounded-2xl p-5 border shadow-xs transition-all ${
                c.highlight
                  ? 'bg-gradient-to-br from-slate-900 to-emerald-950 border-emerald-700 text-white shadow-md'
                  : 'bg-white border-slate-200/80 text-slate-900 hover:shadow-md'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`text-xs font-bold uppercase tracking-wider ${
                    c.highlight ? 'text-emerald-400' : 'text-slate-500'
                  }`}
                >
                  {c.title}
                </span>
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    c.highlight ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black tracking-tight">
                {c.value}
              </div>
              <p
                className={`text-xs mt-1 font-medium ${
                  c.highlight ? 'text-emerald-300' : 'text-slate-500'
                }`}
              >
                {c.sub}
              </p>
            </div>
          );
        })}
      </div>

      {/* Floor-wise Occupancy Visualizer */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-5 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              Floor-by-Floor Occupancy Distribution
            </h3>
            <p className="text-xs text-slate-500">
              Live capacity breakdown across all 8 residential floors.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('rooms')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1"
          >
            Manage Room Capacities <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 pt-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((floor) => {
            const stat = data.floorStats?.[floor] || { totalBeds: floor === 8 ? 8 : 20, occupiedBeds: 0 };
            const pct = stat.totalBeds > 0 ? Math.round((stat.occupiedBeds / stat.totalBeds) * 100) : 0;
            const isFull = pct >= 100;

            return (
              <div
                key={floor}
                className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col justify-between hover:border-indigo-300 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>Floor {floor}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                        isFull ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {pct}%
                    </span>
                  </div>
                  <div className="text-lg font-black text-slate-900 mt-1">
                    {stat.occupiedBeds} / {stat.totalBeds}
                  </div>
                  <span className="text-[10px] text-slate-500 block">Beds Occupied</span>
                </div>

                {/* Mini progress bar */}
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-3">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      pct > 80 ? 'bg-amber-500' : isFull ? 'bg-rose-500' : 'bg-indigo-600'
                    }`}
                    style={{ width: `${Math.min(100, pct)}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => onNavigateTab('residents')}
          className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-indigo-400 cursor-pointer transition-all shadow-xs group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase text-indigo-600">Resident Registry</span>
            <Users className="w-5 h-5 text-indigo-600 group-hover:translate-x-1 transition-transform" />
          </div>
          <h4 className="text-base font-bold text-slate-900">Manage All Residents</h4>
          <p className="text-xs text-slate-500 mt-1">
            Add, update room allocations, delete residents, or verify Aadhaar documents.
          </p>
        </div>

        <div
          onClick={() => onNavigateTab('payments')}
          className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-400 cursor-pointer transition-all shadow-xs group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase text-emerald-600">Rent & Billing</span>
            <IndianRupee className="w-5 h-5 text-emerald-600 group-hover:translate-x-1 transition-transform" />
          </div>
          <h4 className="text-base font-bold text-slate-900">Record Payments & Receipts</h4>
          <p className="text-xs text-slate-500 mt-1">
            Log rents, advances, calculate balances, and download official PDF receipts.
          </p>
        </div>

        <div
          onClick={() => onNavigateTab('grocery')}
          className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-rose-400 cursor-pointer transition-all shadow-xs group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase text-rose-600">Kitchen Expenses</span>
            <ShoppingCart className="w-5 h-5 text-rose-600 group-hover:translate-x-1 transition-transform" />
          </div>
          <h4 className="text-base font-bold text-slate-900">Manage Grocery Expenses</h4>
          <p className="text-xs text-slate-500 mt-1">
            Track daily vegetables, provisions, and compute monthly food budgets.
          </p>
        </div>
      </div>
    </div>
  );
};
