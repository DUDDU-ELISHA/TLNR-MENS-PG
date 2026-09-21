import React, { useState } from 'react';
import {
  CreditCard,
  PlusCircle,
  Search,
  Filter,
  Trash2,
  Download,
  IndianRupee,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  Loader2
} from 'lucide-react';
import { Payment, Resident } from '../../types';
import { addHostPayment, deleteHostPayment } from '../../api';
import { ConfirmationModal } from '../ConfirmationModal';
import { ReceiptModal } from '../ReceiptModal';

interface HostPaymentsProps {
  payments: Payment[];
  residents: Resident[];
  totalCollection: number; // Strictly in Host Dashboard
  onRefresh: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const HostPayments: React.FC<HostPaymentsProps> = ({
  payments,
  residents,
  totalCollection,
  onRefresh,
  onShowToast
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [modeFilter, setModeFilter] = useState('ALL');

  // Add Payment Modal state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedResidentId, setSelectedResidentId] = useState('');
  const [rent, setRent] = useState(7000);
  const [advance, setAdvance] = useState(0);
  const [amountPaid, setAmountPaid] = useState(7000);
  const [paymentDate, setPaymentDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [notes, setNotes] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Selected payment for Receipt
  const [receiptPayment, setReceiptPayment] = useState<Payment | null>(null);

  // Delete Payment Modal state (Requirement 20)
  const [deletingPaymentId, setDeletingPaymentId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Auto-calculated fields (Requirement 20)
  const totalAmount = (Number(rent) || 0) + (Number(advance) || 0);
  const balance = Math.max(0, totalAmount - (Number(amountPaid) || 0));
  const derivedStatus =
    amountPaid >= totalAmount
      ? 'Paid'
      : amountPaid > 0
      ? 'Partially Paid'
      : 'Pending';

  const handleSelectResident = (resId: string) => {
    setSelectedResidentId(resId);
    const found = residents.find((r) => r.id === resId);
    if (found) {
      setRent(found.rent || 7000);
      setAdvance(0);
      setAmountPaid(found.rent || 7000);
    }
  };

  const openAddModal = () => {
    if (residents.length > 0) {
      handleSelectResident(residents[0].id);
    }
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setPaymentMode('UPI');
    setNotes('');
    setFormError('');
    setAddModalOpen(true);
  };

  const handleSavePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!selectedResidentId) {
      setFormError('Please select a resident.');
      return;
    }

    setFormLoading(true);
    try {
      const res = await addHostPayment({
        residentId: selectedResidentId,
        rent: Number(rent) || 0,
        advance: Number(advance) || 0,
        amountPaid: Number(amountPaid) || 0,
        paymentDate,
        paymentMode,
        notes
      });
      onShowToast(res.message || '✓ Payment recorded and receipt generated', 'success');
      setAddModalOpen(false);
      onRefresh();
      // Auto preview receipt
      if (res.payment) {
        setReceiptPayment(res.payment);
      }
    } catch (err: any) {
      setFormError(err.message || 'Failed to record payment');
    } finally {
      setFormLoading(false);
    }
  };

  const confirmDeletePayment = async () => {
    if (!deletingPaymentId) return;
    setDeleteLoading(true);
    try {
      const res = await deleteHostPayment(deletingPaymentId);
      onShowToast(res.message || '✓ Payment record deleted', 'success');
      setDeletingPaymentId(null);
      onRefresh();
    } catch (err: any) {
      onShowToast(err.message || 'Failed to delete payment', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const filtered = payments.filter((p) => {
    const matchesSearch =
      p.residentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.roomNumber.includes(searchTerm) ||
      p.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'Paid' && p.paymentStatus === 'Paid') ||
      (statusFilter === 'Pending' && (p.paymentStatus === 'Pending' || p.paymentStatus === 'Partially Paid'));

    const matchesMode = modeFilter === 'ALL' || p.paymentMode === modeFilter;

    return matchesSearch && matchesStatus && matchesMode;
  });

  return (
    <div className="space-y-6">
      {/* Top Header with Total Collection (Host ONLY) and + Add Payment button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-indigo-600" />
            Payment & Rent Management
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Log resident rent, track balances, and generate instant PDF receipts.
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Confirmed Host Only Collection Metric */}
          <div className="px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-right">
            <span className="text-[10px] uppercase font-bold text-emerald-700 block">
              Total Collection
            </span>
            <span className="text-lg font-black text-emerald-950">
              ₹{(totalCollection || 0).toLocaleString('en-IN')}
            </span>
          </div>

          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-600/20 transition-all active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Record Payment</span>
          </button>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by resident name, room, or receipt #..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
          >
            <option value="ALL">All Statuses</option>
            <option value="Paid">Fully Paid</option>
            <option value="Pending">Pending / Partial</option>
          </select>

          <select
            value={modeFilter}
            onChange={(e) => setModeFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
          >
            <option value="ALL">All Payment Modes</option>
            <option value="UPI">UPI</option>
            <option value="Google Pay">Google Pay</option>
            <option value="PhonePe">PhonePe</option>
            <option value="Cash">Cash</option>
            <option value="Bank Transfer">Bank Transfer</option>
          </select>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Receipt #</th>
                  <th className="py-3.5 px-3">Resident & Room</th>
                  <th className="py-3.5 px-3">Date</th>
                  <th className="py-3.5 px-3">Rent / Advance</th>
                  <th className="py-3.5 px-3">Total Amount</th>
                  <th className="py-3.5 px-3">Amount Paid</th>
                  <th className="py-3.5 px-3">Balance</th>
                  <th className="py-3.5 px-3">Status</th>
                  <th className="py-3.5 px-3">Mode</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {p.receiptNumber}
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="font-bold text-slate-900 block">{p.residentName}</span>
                      <span className="text-[11px] text-slate-500">Room {p.roomNumber}</span>
                    </td>

                    <td className="py-3.5 px-3 text-slate-600">
                      {p.paymentDate}
                    </td>

                    <td className="py-3.5 px-3 text-slate-600">
                      <div>₹{p.rent.toLocaleString('en-IN')}</div>
                      {p.advance > 0 && (
                        <div className="text-[10px] text-indigo-600 font-semibold">
                          +₹{p.advance.toLocaleString('en-IN')} adv
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-3 font-semibold text-slate-900">
                      ₹{p.totalAmount.toLocaleString('en-IN')}
                    </td>

                    <td className="py-3.5 px-3 font-bold text-emerald-700">
                      ₹{p.amountPaid.toLocaleString('en-IN')}
                    </td>

                    <td className="py-3.5 px-3 font-bold text-amber-800">
                      ₹{p.balance.toLocaleString('en-IN')}
                    </td>

                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full font-bold text-[10px] ${
                          p.paymentStatus === 'Paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {p.paymentStatus}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 font-medium text-slate-700">
                      {p.paymentMode}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setReceiptPayment(p)}
                          title="Download PDF Receipt"
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Receipt</span>
                        </button>
                        <button
                          onClick={() => setDeletingPaymentId(p.id)}
                          title="Delete Payment Record"
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-slate-400">
            <CreditCard className="w-12 h-12 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-700">No payment records found</p>
            <p className="text-xs text-slate-500 mt-0.5">Click &apos;+ Record Payment&apos; to log rent collection.</p>
          </div>
        )}
      </div>

      {/* Record Payment Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-800/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Record Resident Payment</h3>
              <button onClick={() => setAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="my-3 p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSavePayment} className="space-y-4 pt-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Select Resident <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={selectedResidentId}
                  onChange={(e) => handleSelectResident(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-medium"
                >
                  {residents.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} (Room {r.roomNumber}, Bed #{r.bedNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Monthly Rent (₹)</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={rent}
                    onChange={(e) => setRent(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Advance / Deposit (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={advance}
                    onChange={(e) => setAdvance(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Amount Paid (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-bold text-emerald-700"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payment Date</label>
                  <input
                    type="date"
                    required
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
              </div>

              {/* Calculation Summary Bar (Requirement 20) */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 grid grid-cols-3 gap-2 text-center">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Total Payable</span>
                  <span className="font-bold text-slate-900 text-sm">₹{totalAmount.toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Calculated Balance</span>
                  <span className="font-bold text-amber-800 text-sm">₹{balance.toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Status</span>
                  <span className="font-bold text-emerald-700 text-sm">{derivedStatus}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payment Mode</label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm bg-white"
                  >
                    <option value="UPI">UPI</option>
                    <option value="Google Pay">Google Pay</option>
                    <option value="PhonePe">PhonePe</option>
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Notes / Transaction Ref</label>
                  <input
                    type="text"
                    placeholder="e.g. UPI Ref #987654"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-2"
                >
                  {formLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Save & Generate Receipt</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Payment Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deletingPaymentId}
        title="Delete Payment Record?"
        message="Are you sure you want to delete this payment record? The resident balance will be adjusted accordingly. This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={deleteLoading}
        onConfirm={confirmDeletePayment}
        onCancel={() => setDeletingPaymentId(null)}
      />

      {/* Receipt Modal */}
      <ReceiptModal
        payment={receiptPayment}
        onClose={() => setReceiptPayment(null)}
      />
    </div>
  );
};
