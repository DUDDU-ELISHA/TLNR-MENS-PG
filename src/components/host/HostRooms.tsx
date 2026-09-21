import React, { useState } from 'react';
import {
  Building2,
  Bed,
  Users,
  Edit2,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  X,
  Loader2
} from 'lucide-react';
import { Room } from '../../types';
import { updateRoomCapacity } from '../../api';

interface HostRoomsProps {
  rooms: any[];
  onRefresh: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const HostRooms: React.FC<HostRoomsProps> = ({ rooms, onRefresh, onShowToast }) => {
  const [selectedFloor, setSelectedFloor] = useState<number | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'VACANT' | 'FULL'>('ALL');

  // Edit capacity state
  const [editingRoom, setEditingRoom] = useState<any | null>(null);
  const [newCapacity, setNewCapacity] = useState<number>(4);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const openEditModal = (room: any) => {
    setEditingRoom(room);
    setNewCapacity(room.totalBeds);
    setError('');
  };

  const handleSaveCapacity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoom) return;

    if (newCapacity < editingRoom.occupiedBeds) {
      setError(`Cannot reduce capacity below current occupied beds (${editingRoom.occupiedBeds}).`);
      return;
    }

    setSaving(true);
    try {
      const res = await updateRoomCapacity(editingRoom.roomNumber, newCapacity);
      onShowToast(res.message || `✓ Room ${editingRoom.roomNumber} capacity updated to ${newCapacity} beds`, 'success');
      setEditingRoom(null);
      onRefresh();
    } catch (err: any) {
      setError(err.message || 'Failed to update capacity');
    } finally {
      setSaving(false);
    }
  };

  const filteredRooms = rooms.filter((r) => {
    const matchesFloor = selectedFloor === 'ALL' || r.floor === selectedFloor;
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'VACANT' && r.availableBeds > 0) ||
      (statusFilter === 'FULL' && r.availableBeds === 0);
    return matchesFloor && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-indigo-600" />
            Designated Room Matrix (Floors 1 to 8)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Strict allocation strictly adhering to 37 designated rooms (101-105 to 801-802).
          </p>
        </div>

        {/* Floor Filter pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSelectedFloor('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              selectedFloor === 'ALL'
                ? 'bg-cyan-700 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Floors
          </button>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((f) => (
            <button
              key={f}
              onClick={() => setSelectedFloor(f)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                selectedFloor === f
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              F{f}
            </button>
          ))}
        </div>
      </div>

      {/* Vacancy status filter */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-slate-500">Filter status:</span>
        <button
          onClick={() => setStatusFilter('ALL')}
          className={`px-3 py-1 rounded-full text-xs font-bold ${
            statusFilter === 'ALL' ? 'bg-cyan-700 text-white' : 'bg-slate-200 text-slate-700'
          }`}
        >
          All Rooms ({rooms.length})
        </button>
        <button
          onClick={() => setStatusFilter('VACANT')}
          className={`px-3 py-1 rounded-full text-xs font-bold ${
            statusFilter === 'VACANT' ? 'bg-emerald-700 text-white' : 'bg-emerald-100 text-emerald-800'
          }`}
        >
          Available Vacancies
        </button>
        <button
          onClick={() => setStatusFilter('FULL')}
          className={`px-3 py-1 rounded-full text-xs font-bold ${
            statusFilter === 'FULL' ? 'bg-rose-700 text-white' : 'bg-rose-100 text-rose-800'
          }`}
        >
          Fully Occupied
        </button>
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredRooms.map((room) => {
          const isFull = room.availableBeds === 0;
          return (
            <div
              key={room.roomNumber}
              className={`bg-white rounded-2xl p-5 border transition-all ${
                isFull
                  ? 'border-slate-200/80'
                  : 'border-emerald-200 shadow-xs hover:border-emerald-400'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-xl font-black text-slate-900">Room {room.roomNumber}</span>
                  <span className="text-xs text-slate-500 block font-medium">Floor {room.floor}</span>
                </div>

                <div className="flex items-center gap-1">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isFull ? 'bg-slate-100 text-slate-600' : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {isFull ? 'FULL' : `${room.availableBeds} VACANT`}
                  </span>
                  <button
                    onClick={() => openEditModal(room)}
                    title="Change Bed Capacity"
                    className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-md"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Bed metrics */}
              <div className="grid grid-cols-3 gap-2 py-3 text-center text-xs">
                <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase block">Total</span>
                  <span className="text-base font-bold text-slate-900">{room.totalBeds}</span>
                </div>
                <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase block">Occupied</span>
                  <span className="text-base font-bold text-slate-900">{room.occupiedBeds}</span>
                </div>
                <div className="bg-emerald-50 p-2 rounded-xl border border-emerald-100">
                  <span className="text-[10px] text-emerald-700 font-semibold uppercase block">Free</span>
                  <span className="text-base font-bold text-emerald-950">{room.availableBeds}</span>
                </div>
              </div>

              {/* Residents In Room */}
              <div className="pt-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                  Occupants ({room.residents?.length || 0})
                </span>
                {room.residents && room.residents.length > 0 ? (
                  <div className="space-y-1">
                    {room.residents.map((res: any) => (
                      <div
                        key={res.id}
                        className="text-xs bg-slate-50 px-2.5 py-1 rounded-lg flex items-center justify-between text-slate-800 font-medium"
                      >
                        <span className="truncate">{res.name}</span>
                        <span className="text-[10px] text-indigo-600 font-bold">Bed #{res.bedNumber}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 italic">No occupants currently.</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Capacity Modal */}
      {editingRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-800/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Configure Capacity: Room {editingRoom.roomNumber}
              </h3>
              <button onClick={() => setEditingRoom(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="my-3 p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSaveCapacity} className="space-y-4 pt-3 text-xs">
              <div>
                <span className="text-slate-500 block mb-1">Current Occupied Beds</span>
                <span className="text-sm font-bold text-slate-900">{editingRoom.occupiedBeds} beds in use</span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Total Beds Capacity (1 - 10)
                </label>
                <input
                  type="number"
                  min={editingRoom.occupiedBeds || 1}
                  max={10}
                  required
                  value={newCapacity}
                  onChange={(e) => setNewCapacity(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-bold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingRoom(null)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-1.5"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Capacity</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
