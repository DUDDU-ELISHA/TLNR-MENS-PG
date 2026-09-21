import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Download,
  Calendar,
  IndianRupee,
  ShoppingCart,
  TrendingUp,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { getMonthlyReport } from '../../api';
import { MonthlyReportModal } from '../MonthlyReportModal';

interface HostReportsProps {
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const HostReports: React.FC<HostReportsProps> = ({ onShowToast }) => {
  const currentMonthNum = new Date().getMonth() + 1;
  const currentYearNum = new Date().getFullYear();

  const [month, setMonth] = useState<number>(currentMonthNum);
  const [year, setYear] = useState<number>(currentYearNum);
  const [report, setReport] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);

  const fetchReport = async (m: number, y: number) => {
    setLoading(true);
    try {
      const data = await getMonthlyReport(m, y);
      setReport(data);
    } catch (err: any) {
      onShowToast(err.message || 'Failed to generate monthly report', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport(month, year);
  }, [month, year]);

  const months = [
    { num: 1, name: 'January' },
    { num: 2, name: 'February' },
    { num: 3, name: 'March' },
    { num: 4, name: 'April' },
    { num: 5, name: 'May' },
    { num: 6, name: 'June' },
    { num: 7, name: 'July' },
    { num: 8, name: 'August' },
    { num: 9, name: 'September' },
    { num: 10, name: 'October' },
    { num: 11, name: 'November' },
    { num: 12, name: 'December' }
  ];

  const netSurplus = (report?.totalCollections || 0) - (report?.totalGroceryExpenses || 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-indigo-600" />
            Comprehensive Monthly Financial & Occupancy Report
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit monthly room occupancies, rent receipts, kitchen disbursements, and net cash flow.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Month selector */}
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
          >
            {months.map((m) => (
              <option key={m.num} value={m.num}>
                {m.name}
              </option>
            ))}
          </select>

          {/* Year selector */}
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
          >
            {[2025, 2026, 2027].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          <button
            onClick={() => setPreviewModalOpen(true)}
            disabled={!report || loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50 shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF Report</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-2" />
          <p className="text-xs font-medium text-slate-600">Compiling monthly figures...</p>
        </div>
      ) : report ? (
        <div className="space-y-6">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase block">Total Collections</span>
              <div className="text-2xl font-black text-emerald-700 mt-1">
                ₹{report.totalCollections.toLocaleString('en-IN')}
              </div>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                {report.paymentsList?.length || 0} receipts logged
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase block">Kitchen Expenses</span>
              <div className="text-2xl font-black text-rose-700 mt-1">
                ₹{report.totalGroceryExpenses.toLocaleString('en-IN')}
              </div>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                {report.groceryList?.length || 0} grocery entries
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase block">Net Cashflow</span>
              <div className={`text-2xl font-black mt-1 ${netSurplus >= 0 ? 'text-indigo-600' : 'text-rose-600'}`}>
                ₹{netSurplus.toLocaleString('en-IN')}
              </div>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                Collections minus Expenses
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase block">Hostel Occupancy</span>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {report.occupiedBeds} / {report.totalBeds}
              </div>
              <span className="text-[11px] text-emerald-600 font-semibold block mt-0.5">
                {report.availableBeds} beds available
              </span>
            </div>
          </div>

          {/* Payments & Grocery Double-column Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Rent Collections List */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center justify-between">
                <span>Collections in {report.monthName} {report.year}</span>
                <span className="text-xs font-bold text-emerald-700">₹{report.totalCollections.toLocaleString('en-IN')}</span>
              </h3>

              {report.paymentsList?.length > 0 ? (
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 mt-3 text-xs">
                  {report.paymentsList.map((p: any) => (
                    <div key={p.id} className="py-2.5 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900 block">{p.residentName} (Room {p.roomNumber})</span>
                        <span className="text-[11px] text-slate-500">{p.paymentDate} • {p.paymentMode} ({p.receiptNumber})</span>
                      </div>
                      <span className="font-bold text-emerald-700 text-sm">₹{p.amountPaid.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-8 text-center text-xs text-slate-400">No rent collected this month.</p>
              )}
            </div>

            {/* Grocery Disbursements List */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center justify-between">
                <span>Kitchen Disbursements in {report.monthName}</span>
                <span className="text-xs font-bold text-rose-700">₹{report.totalGroceryExpenses.toLocaleString('en-IN')}</span>
              </h3>

              {report.groceryList?.length > 0 ? (
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 mt-3 text-xs">
                  {report.groceryList.map((g: any) => (
                    <div key={g.id} className="py-2.5 flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-slate-800 block">{g.item}</span>
                        <span className="text-[11px] text-slate-500">{g.date} • {g.paymentMode || 'Cash'}</span>
                      </div>
                      <span className="font-bold text-rose-700 text-sm">₹{g.amount.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-8 text-center text-xs text-slate-400">No grocery expenses logged for this month.</p>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* Monthly Report PDF Modal */}
      <MonthlyReportModal
        report={report}
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
      />
    </div>
  );
};
