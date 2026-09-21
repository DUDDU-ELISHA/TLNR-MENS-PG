import React, { useState } from 'react';
import {
  ShoppingCart,
  PlusCircle,
  Calendar,
  IndianRupee,
  Edit2,
  Trash2,
  Filter,
  AlertCircle,
  X,
  Loader2
} from 'lucide-react';
import { GroceryExpense } from '../../types';
import { addGroceryItem, editGroceryItem, deleteGroceryItem } from '../../api';
import { ConfirmationModal } from '../ConfirmationModal';

interface HostGroceryProps {
  groceryItems: GroceryExpense[];
  onRefresh: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const HostGrocery: React.FC<HostGroceryProps> = ({
  groceryItems,
  onRefresh,
  onShowToast
}) => {
  const currentMonthStr = new Date().toISOString().substring(0, 7); // 'YYYY-MM'
  const [selectedMonth, setSelectedMonth] = useState<string>('ALL');

  // Add / Edit Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GroceryExpense | null>(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    item: '',
    amount: 500,
    paymentMode: 'Cash',
    notes: ''
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Delete modal state
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      item: '',
      amount: 500,
      paymentMode: 'Cash',
      notes: ''
    });
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (g: GroceryExpense) => {
    setEditingItem(g);
    setFormData({
      date: g.date,
      item: g.item,
      amount: g.amount,
      paymentMode: g.paymentMode || 'Cash',
      notes: g.notes || ''
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.item.trim() || !formData.amount) {
      setFormError('Item name and amount are required.');
      return;
    }

    setFormLoading(true);
    try {
      if (editingItem) {
        const res = await editGroceryItem(editingItem.id, {
          date: formData.date,
          item: formData.item.trim(),
          amount: Number(formData.amount) || 0,
          paymentMode: formData.paymentMode,
          notes: formData.notes
        });
        onShowToast(res.message || '✓ Grocery item updated', 'success');
      } else {
        const res = await addGroceryItem({
          date: formData.date,
          item: formData.item.trim(),
          amount: Number(formData.amount) || 0,
          paymentMode: formData.paymentMode,
          notes: formData.notes
        });
        onShowToast(res.message || '✓ Grocery expense added', 'success');
      }
      setModalOpen(false);
      onRefresh();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save grocery expense');
    } finally {
      setFormLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    setDeleteLoading(true);
    try {
      const res = await deleteGroceryItem(deletingId);
      onShowToast(res.message || '✓ Grocery expense deleted', 'success');
      setDeletingId(null);
      onRefresh();
    } catch (err: any) {
      onShowToast(err.message || 'Failed to delete grocery item', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const filtered = groceryItems.filter((g) => {
    if (selectedMonth === 'ALL') return true;
    return g.date.startsWith(selectedMonth);
  });

  const totalFilteredExpense = filtered.reduce((acc, g) => acc + (g.amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-rose-600" />
            Hostel Grocery & Kitchen Expenses
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Log daily vegetables, provisions, dairy, and culinary supplies.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="px-4 py-2 bg-rose-50 border border-rose-200 rounded-xl text-right">
            <span className="text-[10px] uppercase font-bold text-rose-700 block">
              {selectedMonth === 'ALL' ? 'Total Expenses' : 'Month Expense'}
            </span>
            <span className="text-lg font-black text-rose-950">
              ₹{totalFilteredExpense.toLocaleString('en-IN')}
            </span>
          </div>

          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-bold shadow-md shadow-rose-600/20 transition-all active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Add Expense</span>
          </button>
        </div>
      </div>

      {/* Month Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-3">
        <span className="text-xs font-semibold text-slate-600">Filter by Month:</span>
        <div className="flex items-center gap-2">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
          >
            <option value="ALL">All Recorded Expenses</option>
            <option value={currentMonthStr}>This Month ({currentMonthStr})</option>
            <option value="2026-08">August 2026</option>
            <option value="2026-07">July 2026</option>
            <option value="2026-06">June 2026</option>
          </select>
        </div>
      </div>

      {/* Grocery Items Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-3">Item / Description</th>
                  <th className="py-3.5 px-3">Amount</th>
                  <th className="py-3.5 px-3">Payment Mode</th>
                  <th className="py-3.5 px-3">Notes</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filtered.map((g) => (
                  <tr key={g.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{g.date}</td>
                    <td className="py-3.5 px-3 font-semibold text-slate-800">{g.item}</td>
                    <td className="py-3.5 px-3 font-bold text-rose-700">
                      ₹{g.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-3 text-slate-600">{g.paymentMode || 'Cash'}</td>
                    <td className="py-3.5 px-3 text-slate-500">{g.notes || '—'}</td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(g)}
                          title="Edit Expense"
                          className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingId(g.id)}
                          title="Delete Expense"
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
            <ShoppingCart className="w-12 h-12 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-700">No grocery expenses logged yet</p>
            <p className="text-xs text-slate-500 mt-0.5">Click &apos;+ Add Expense&apos; to record food procurement.</p>
          </div>
        )}
      </div>

      {/* Add / Edit Expense Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-800/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingItem ? 'Edit Grocery Expense' : 'Add Grocery Expense'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="my-3 p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 pt-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Expense Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Item / Description <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vegetables & Tomatoes, Rice 25kg"
                  value={formData.item}
                  onChange={(e) => setFormData({ ...formData, item: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Amount (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-bold text-rose-700"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payment Mode</label>
                  <select
                    value={formData.paymentMode}
                    onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm bg-white"
                  >
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI / GPay</option>
                    <option value="Card">Card</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="Vendor name or bill notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold flex items-center gap-2"
                >
                  {formLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Save Expense</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deletingId}
        title="Delete Grocery Expense?"
        message="Are you sure you want to delete this kitchen expense entry? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={deleteLoading}
        onConfirm={confirmDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
};
