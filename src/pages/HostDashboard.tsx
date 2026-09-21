import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  Building2,
  CreditCard,
  ShoppingCart,
  UtensilsCrossed,
  FileSpreadsheet,
  FileText,
  ShieldCheck,
  RefreshCw,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { getHostStats, subscribeToRealtimeUpdates } from '../api';
import { HostOverview } from '../components/host/HostOverview';
import { HostResidents } from '../components/host/HostResidents';
import { HostRooms } from '../components/host/HostRooms';
import { HostPayments } from '../components/host/HostPayments';
import { HostGrocery } from '../components/host/HostGrocery';
import { HostMenu } from '../components/host/HostMenu';
import { HostReports } from '../components/host/HostReports';
import { HostDocuments } from '../components/host/HostDocuments';

interface HostDashboardProps {
  onLogout: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const HostDashboard: React.FC<HostDashboardProps> = ({ onLogout, onShowToast }) => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const stats = await getHostStats();
      setData(stats);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to load host dashboard');
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();

    // Real-time synchronization using Server-Sent Events (Requirement 30 & 32)
    const unsubscribe = subscribeToRealtimeUpdates((event) => {
      if (event.type === 'DATA_SYNC') {
        loadData();
      }
    });

    return () => unsubscribe();
  }, []);

  const navTabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'residents', label: 'Residents', count: data?.residents?.length, icon: Users },
    { id: 'rooms', label: 'Rooms (1-8)', count: data?.rooms?.length, icon: Building2 },
    { id: 'payments', label: 'Payments', count: data?.payments?.length, icon: CreditCard },
    { id: 'grocery', label: 'Grocery', count: data?.grocery?.length, icon: ShoppingCart },
    { id: 'menu', label: 'Meal Menu', icon: UtensilsCrossed },
    { id: 'reports', label: 'Reports', icon: FileSpreadsheet },
    { id: 'documents', label: 'KYC Vault', icon: FileText }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <Loader2 className="w-10 h-10 animate-spin text-cyan-600 mb-2" />
        <p className="text-sm font-medium text-slate-600">Connecting to TLNR Host Administration...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 max-w-md w-full text-center">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900 mb-1">Host Authentication Error</h3>
          <p className="text-sm text-slate-600 mb-4">{error || 'Session expired or unauthorized access.'}</p>
          <button
            onClick={onLogout}
            className="px-4 py-2 bg-cyan-700 text-white rounded-xl text-sm font-semibold hover:bg-cyan-800 shadow-xs"
          >
            Re-login as Host
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Host Sub-navigation Header - Light theme without black colors */}
      <div className="bg-white text-slate-900 border-b border-slate-200 sticky top-16 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-700 text-white flex items-center justify-center shadow-xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-sm font-black tracking-tight text-slate-900 leading-tight">
                  TLNR MEN&apos;S PG • Administrative Host Portal
                </h1>
                <p className="text-[11px] text-slate-500">
                  Authorized Host Management Session Active
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => loadData(true)}
                disabled={refreshing}
                title="Refresh live data"
                className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Navigation Tab Bar */}
          <div className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-none">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-cyan-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {typeof tab.count === 'number' && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                        isActive ? 'bg-cyan-900/60 text-white' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'overview' && (
          <HostOverview
            data={data.stats}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'residents' && (
          <HostResidents
            residents={data.residents}
            rooms={data.rooms}
            onRefresh={() => loadData()}
            onShowToast={onShowToast}
          />
        )}

        {activeTab === 'rooms' && (
          <HostRooms
            rooms={data.rooms}
            onRefresh={() => loadData()}
            onShowToast={onShowToast}
          />
        )}

        {activeTab === 'payments' && (
          <HostPayments
            payments={data.payments}
            residents={data.residents}
            totalCollection={data.stats.totalCollection}
            onRefresh={() => loadData()}
            onShowToast={onShowToast}
          />
        )}

        {activeTab === 'grocery' && (
          <HostGrocery
            groceryItems={data.grocery}
            onRefresh={() => loadData()}
            onShowToast={onShowToast}
          />
        )}

        {activeTab === 'menu' && (
          <HostMenu
            menu={data.menu}
            onRefresh={() => loadData()}
            onShowToast={onShowToast}
          />
        )}

        {activeTab === 'reports' && (
          <HostReports onShowToast={onShowToast} />
        )}

        {activeTab === 'documents' && (
          <HostDocuments residents={data.residents} />
        )}
      </main>
    </div>
  );
};
