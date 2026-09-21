import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { X, Download, Calendar, ArrowUpRight, ArrowDownRight, IndianRupee, Loader2 } from 'lucide-react';
import { getHostMonthlyReport } from '../api';

interface MonthlyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report?: any;
}

export const MonthlyReportModal: React.FC<MonthlyReportModalProps> = ({ isOpen, onClose, report: initialReport }) => {
  const [month, setMonth] = useState<string>(() => String(new Date().getMonth() + 1).padStart(2, '0'));
  const [year, setYear] = useState<string>(() => String(new Date().getFullYear()));
  const [loading, setLoading] = useState<boolean>(false);
  const [report, setReport] = useState<any>(initialReport || null);
  const [error, setError] = useState<string>('');

  const fetchReport = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getHostMonthlyReport(month, year);
      setReport(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (initialReport) {
        setReport(initialReport);
      } else {
        fetchReport();
      }
    }
  }, [isOpen, month, year, initialReport]);

  if (!isOpen) return null;

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const selectedMonthName = monthNames[parseInt(month, 10) - 1] || 'Current Month';

  const handleDownloadReportPDF = () => {
    if (!report) return;

    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.setTextColor(15, 23, 42);
      doc.text("TLNR MEN'S PG", 105, 22, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      doc.text('KPHB Road Number 3  |  Owner Contact: 9908522152 / 9133699944', 105, 28, { align: 'center' });

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(14, 116, 144);
      doc.text(`MONTHLY FINANCIAL REPORT - ${selectedMonthName.toUpperCase()} ${year}`, 105, 38, { align: 'center' });

      doc.setDrawColor(226, 232, 240);
      doc.line(15, 44, 195, 44);

      // Section 1: Resident Payments
      let y = 54;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text('1. RESIDENT PAYMENTS SUMMARY', 20, y);

      y += 8;
      doc.setFillColor(248, 250, 252);
      doc.rect(20, y, 170, 32, 'F');
      doc.setDrawColor(203, 213, 225);
      doc.rect(20, y, 170, 32);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Total Active Residents: ${report.residentPayments.totalResidents}`, 25, y + 8);
      doc.text(`Total Payment Transactions: ${report.residentPayments.totalPaymentsReceived}`, 110, y + 8);

      doc.setFont('helvetica', 'bold');
      doc.text(`Total Amount Collected: INR ${(report.residentPayments.paidAmount || 0).toLocaleString('en-IN')}`, 25, y + 18);
      doc.text(`Total Pending Rent: INR ${(report.residentPayments.pendingAmount || 0).toLocaleString('en-IN')}`, 110, y + 18);

      doc.setFont('helvetica', 'normal');
      doc.text(`Cumulative Balance: INR ${(report.residentPayments.balanceAmount || 0).toLocaleString('en-IN')}`, 25, y + 26);

      // Section 2: Grocery Expenses
      y += 42;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text('2. GROCERY & KITCHEN EXPENSES', 20, y);

      y += 8;
      doc.setFillColor(248, 250, 252);
      doc.rect(20, y, 170, 24, 'F');
      doc.setDrawColor(203, 213, 225);
      doc.rect(20, y, 170, 24);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Total Grocery Transactions: ${report.grocery.transactionCount}`, 25, y + 8);
      doc.setFont('helvetica', 'bold');
      doc.text(`Total Grocery Expenses: INR ${(report.grocery.totalGroceryExpenses || 0).toLocaleString('en-IN')}`, 25, y + 17);

      // Section 3: Overall Summary
      y += 34;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text('3. OVERALL FINANCIAL NET SUMMARY', 20, y);

      y += 8;
      doc.setFillColor(15, 23, 42);
      doc.rect(20, y, 170, 36, 'F');

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(241, 245, 249);
      doc.text(`(+) Total Collections Received: INR ${(report.overallSummary.totalResidentPayments || 0).toLocaleString('en-IN')}`, 25, y + 10);
      doc.text(`(-) Total Expenses (Grocery): INR ${(report.overallSummary.totalExpenses || 0).toLocaleString('en-IN')}`, 25, y + 19);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      const net = report.overallSummary.netAmount || 0;
      doc.setTextColor(net >= 0 ? 74 : 248, net >= 0 ? 222 : 113, net >= 0 ? 128 : 113);
      doc.text(`(=) NET OPERATING SURPLUS: INR ${net.toLocaleString('en-IN')}`, 25, y + 29);

      // Signatory
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(148, 163, 184);
      doc.text(`Report generated on: ${new Date().toLocaleString()}`, 20, 260);
      doc.text('Authorized By: TLNR MEN\'S PG Management', 130, 260);

      doc.save(`TLNR_Monthly_Report_${year}_${month}.pdf`);
    } catch (err) {
      console.error('PDF Error:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-800/40 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-bold text-slate-900">Monthly Summary Report</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Controls: Month & Year Selector */}
          <div className="flex flex-wrap items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex-1 min-w-[140px]">
              <label className="block text-xs font-semibold text-slate-500 mb-1">Month</label>
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                {monthNames.map((name, i) => {
                  const val = String(i + 1).padStart(2, '0');
                  return (
                    <option key={val} value={val}>
                      {name}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="w-28">
              <label className="block text-xs font-semibold text-slate-500 mb-1">Year</label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2027">2027</option>
              </select>
            </div>

            <div className="flex items-end pt-5">
              <button
                type="button"
                onClick={fetchReport}
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-xs transition-colors flex items-center gap-1.5"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Load Report'}
              </button>
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400 flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              <p className="text-sm">Calculating financial summary...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm font-medium border border-red-200">
              {error}
            </div>
          ) : report ? (
            <div className="space-y-6">
              {/* Top Financial Overview Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                  <div className="flex items-center justify-between text-xs font-semibold text-emerald-800">
                    <span>Resident Payments</span>
                    <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-xl font-bold text-emerald-950 mt-1">
                    ₹{(report.overallSummary?.totalResidentPayments || 0).toLocaleString('en-IN')}
                  </div>
                  <div className="text-[11px] text-emerald-700 mt-1">
                    {report.residentPayments?.totalPaymentsReceived || 0} payments collected
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <div className="flex items-center justify-between text-xs font-semibold text-amber-800">
                    <span>Grocery Expenses</span>
                    <ArrowDownRight className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="text-xl font-bold text-amber-950 mt-1">
                    ₹{(report.overallSummary?.groceryExpenses || 0).toLocaleString('en-IN')}
                  </div>
                  <div className="text-[11px] text-amber-700 mt-1">
                    {report.grocery?.transactionCount || 0} items purchased
                  </div>
                </div>

                <div className="bg-indigo-700 text-white rounded-xl p-4 shadow-xs">
                  <div className="flex items-center justify-between text-xs font-semibold text-indigo-100">
                    <span>Net Operating Surplus</span>
                    <IndianRupee className="w-4 h-4 text-emerald-300" />
                  </div>
                  <div className="text-xl font-bold text-white mt-1">
                    ₹{(report.overallSummary?.netAmount || 0).toLocaleString('en-IN')}
                  </div>
                  <div className="text-[11px] text-indigo-200 mt-1">
                    Receipts minus expenses
                  </div>
                </div>
              </div>

              {/* Detailed Breakdown Cards */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Resident Payments Breakdown
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 block">Active Residents</span>
                    <span className="font-bold text-slate-900 text-sm">{report.residentPayments?.totalResidents}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Payments Received</span>
                    <span className="font-bold text-slate-900 text-sm">{report.residentPayments?.totalPaymentsReceived}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Pending Amount</span>
                    <span className="font-bold text-amber-700 text-sm">₹{report.residentPayments?.pendingAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Balance Outstanding</span>
                    <span className="font-bold text-slate-900 text-sm">₹{report.residentPayments?.balanceAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Grocery breakdown preview */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Grocery Items ({report.grocery?.items?.length || 0})
                  </h4>
                  <span className="text-xs font-bold text-slate-900">
                    Total: ₹{report.grocery?.totalGroceryExpenses.toLocaleString('en-IN')}
                  </span>
                </div>
                {report.grocery?.items?.length > 0 ? (
                  <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                    {report.grocery.items.map((item: any) => (
                      <div key={item.id} className="flex justify-between text-xs py-1 border-b border-slate-200/60 last:border-0">
                        <span className="text-slate-700 font-medium">
                          {item.date} — {item.item}
                        </span>
                        <span className="font-semibold text-slate-900">
                          ₹{item.amount.toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No grocery expenses recorded for this month.</p>
                )}
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer Actions */}
        <div className="p-6 pt-0 border-t border-slate-100 flex items-center justify-between">
          <div className="text-xs text-slate-500 font-medium">
            TLNR MEN&apos;S PG • KPHB Road Number 3
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleDownloadReportPDF}
              disabled={!report || loading}
              className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white text-sm font-semibold rounded-xl shadow-xs transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download Report as PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
