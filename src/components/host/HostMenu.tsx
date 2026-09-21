import React, { useState } from 'react';
import { UtensilsCrossed, Edit3, Check, X, AlertCircle, Loader2 } from 'lucide-react';
import { MenuItem } from '../../types';
import { updateMenu } from '../../api';

interface HostMenuProps {
  menu: MenuItem[];
  onRefresh: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const HostMenu: React.FC<HostMenuProps> = ({ menu, onRefresh, onShowToast }) => {
  const [editingDay, setEditingDay] = useState<string | null>(null);
  const [tiffinText, setTiffinText] = useState('');
  const [lunchText, setLunchText] = useState('');
  const [dinnerText, setDinnerText] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const startEdit = (item: MenuItem) => {
    setEditingDay(item.day);
    setTiffinText(item.tiffin.join(', '));
    setLunchText(item.lunch.join(', '));
    setDinnerText(item.dinner.join(', '));
    setError('');
  };

  const handleSave = async (day: string) => {
    setSaving(true);
    setError('');
    try {
      const parseItems = (str: string) =>
        str
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);

      const updatedDayData = {
        tiffin: parseItems(tiffinText),
        lunch: parseItems(lunchText),
        dinner: parseItems(dinnerText)
      };

      const updatedFullMenu = menu.map((m) =>
        m.day.toLowerCase() === day.toLowerCase() ? { ...m, ...updatedDayData } : m
      );

      const res = await updateMenu(updatedFullMenu);
      onShowToast(res.message || `✓ Menu for ${day} updated successfully`, 'success');
      setEditingDay(null);
      onRefresh();
    } catch (err: any) {
      setError(err.message || 'Failed to update menu');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <UtensilsCrossed className="w-6 h-6 text-indigo-600" />
            Weekly Meal Menu Management
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure daily breakfast, lunch, and dinner dishes displayed across all resident portals.
          </p>
        </div>

        <span className="text-xs font-semibold px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl">
          ✓ Real-time Sync Active
        </span>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Days Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menu.map((m) => {
          const isEditing = editingDay === m.day;

          return (
            <div
              key={m.id || m.day}
              className={`bg-white rounded-2xl p-5 border transition-all shadow-xs ${
                isEditing ? 'ring-2 ring-indigo-500 border-transparent' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <span className="font-black text-base uppercase tracking-wider text-slate-900">
                  {m.day}
                </span>

                {isEditing ? (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleSave(m.day)}
                      disabled={saving}
                      className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                      title="Save Changes"
                    >
                      {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => setEditingDay(null)}
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors"
                      title="Cancel"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => startEdit(m)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Menu</span>
                  </button>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-amber-700 uppercase mb-1">
                      Tiffin Items (comma separated)
                    </label>
                    <input
                      type="text"
                      value={tiffinText}
                      onChange={(e) => setTiffinText(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-emerald-700 uppercase mb-1">
                      Lunch Items (comma separated)
                    </label>
                    <input
                      type="text"
                      value={lunchText}
                      onChange={(e) => setLunchText(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-indigo-700 uppercase mb-1">
                      Dinner Items (comma separated)
                    </label>
                    <input
                      type="text"
                      value={dinnerText}
                      onChange={(e) => setDinnerText(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4 text-xs">
                  <div>
                    <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider block mb-1">
                      🍽 Tiffin
                    </span>
                    <div className="text-slate-700 font-medium pl-3 space-y-0.5">
                      {m.tiffin.map((item, idx) => (
                        <p key={idx}>• {item}</p>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block mb-1">
                      🍛 Lunch
                    </span>
                    <div className="text-slate-700 font-medium pl-3 space-y-0.5">
                      {m.lunch.map((item, idx) => (
                        <p key={idx}>• {item}</p>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider block mb-1">
                      🌙 Dinner
                    </span>
                    <div className="text-slate-700 font-medium pl-3 space-y-0.5">
                      {m.dinner.map((item, idx) => (
                        <p key={idx}>• {item}</p>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
