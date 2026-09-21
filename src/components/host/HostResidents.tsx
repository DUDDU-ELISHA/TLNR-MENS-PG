import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Trash2,
  Edit2,
  FileCheck,
  Eye,
  AlertCircle,
  X,
  Upload,
  Calendar,
  Building,
  Mail,
  Phone,
  IndianRupee,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { Resident, Room } from '../../types';
import { addHostResident, editHostResident, deleteHostResident } from '../../api';
import { ConfirmationModal } from '../ConfirmationModal';

interface HostResidentsProps {
  residents: Array<Resident & { balance: number; paymentStatus: string }>;
  rooms: any[];
  onRefresh: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const HostResidents: React.FC<HostResidentsProps> = ({
  residents,
  rooms,
  onRefresh,
  onShowToast
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [floorFilter, setFloorFilter] = useState('ALL');
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Add / Edit Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingResident, setEditingResident] = useState<Resident | null>(null);

  // View Resident Details Modal
  const [viewingResident, setViewingResident] = useState<Resident | null>(null);

  // Delete Confirmation state (Requirement 16 & 50)
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Form fields
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    roomNumber: '101',
    bedNumber: 1,
    roomCode: 'TLNR101',
    joiningDate: new Date().toISOString().split('T')[0],
    rent: 7000,
    advance: 2000,
    paymentStatus: 'Pending',
    aadhaarDataUrl: '',
    aadhaarFileName: ''
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const openAddModal = () => {
    setEditingResident(null);
    const firstAvailable = rooms.find((r) => r.availableBeds > 0) || rooms[0];
    const initialRoom = firstAvailable ? firstAvailable.roomNumber : '101';
    setFormData({
      name: '',
      email: '',
      mobile: '',
      roomNumber: initialRoom,
      bedNumber: 1,
      roomCode: `TLNR${initialRoom}`,
      joiningDate: new Date().toISOString().split('T')[0],
      rent: 7000,
      advance: 2000,
      paymentStatus: 'Paid',
      aadhaarDataUrl: '',
      aadhaarFileName: ''
    });
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (res: Resident) => {
    setEditingResident(res);
    setFormData({
      name: res.name,
      email: res.email,
      mobile: res.mobile,
      roomNumber: res.roomNumber,
      bedNumber: res.bedNumber,
      roomCode: res.roomCode,
      joiningDate: res.joiningDate,
      rent: res.rent,
      advance: res.advance,
      paymentStatus: (res as any).paymentStatus || 'Pending',
      aadhaarDataUrl: '',
      aadhaarFileName: ''
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleRoomChange = (rn: string) => {
    setFormData((prev) => ({
      ...prev,
      roomNumber: rn,
      roomCode: `TLNR${rn}`
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setFormError('Aadhaar document size must be under 10MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({
        ...prev,
        aadhaarDataUrl: reader.result as string,
        aadhaarFileName: file.name
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSaveResident = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name || !formData.email || !formData.mobile || !formData.roomNumber) {
      setFormError('Please fill in all mandatory fields.');
      return;
    }

    setFormLoading(true);
    try {
      if (editingResident) {
        const res = await editHostResident(editingResident.id, formData);
        onShowToast(res.message || '✓ Resident updated successfully', 'success');
      } else {
        const res = await addHostResident(formData);
        onShowToast(res.message || '✓ Resident added successfully', 'success');
      }
      setModalOpen(false);
      onRefresh();
    } catch (err: any) {
      setFormError(err.message || 'Unable to save resident. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  const confirmDeleteResident = async () => {
    if (!deletingId) return;
    setDeleteLoading(true);
    try {
      const res = await deleteHostResident(deletingId);
      onShowToast(res.message || '✓ Resident deleted successfully', 'success');
      setDeletingId(null);
      onRefresh();
    } catch (err: any) {
      onShowToast(err.message || 'Unable to delete resident. Please try again.', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Filtering & Sorting (Requirement 49)
  const filtered = residents.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.roomNumber.includes(searchTerm) ||
      r.mobile.includes(searchTerm) ||
      r.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFloor = floorFilter === 'ALL' || r.roomNumber.startsWith(floorFilter);

    const matchesPayment =
      paymentFilter === 'ALL' ||
      (paymentFilter === 'PAID' && r.paymentStatus === 'Paid') ||
      (paymentFilter === 'PENDING' && (r.paymentStatus === 'Pending' || r.paymentStatus === 'Partially Paid'));

    return matchesSearch && matchesFloor && matchesPayment;
  });

  const sorted = [...filtered].sort((a, b) => {
    const dateA = new Date(a.joiningDate).getTime();
    const dateB = new Date(b.joiningDate).getTime();
    return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
  });

  const selectedRoomDetails = rooms.find((r) => r.roomNumber === formData.roomNumber);

  return (
    <div className="space-y-6">
      {/* Top Header with + Add Resident button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600" />
            All Residents ({residents.length})
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage allocations, profiles, room codes, and Aadhaar compliance.
          </p>
        </div>

        <button
          id="host-add-resident-btn"
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-600/20 transition-all active:scale-[0.98]"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Add Resident</span>
        </button>
      </div>

      {/* Search & Filter Bar (Requirement 49) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by name, room, or mobile..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Floor filter */}
          <select
            value={floorFilter}
            onChange={(e) => setFloorFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden"
          >
            <option value="ALL">All Floors (1-8)</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((f) => (
              <option key={f} value={String(f)}>
                Floor {f}
              </option>
            ))}
          </select>

          {/* Payment filter */}
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden"
          >
            <option value="ALL">All Payment Status</option>
            <option value="PAID">Fully Paid</option>
            <option value="PENDING">Pending / Partial</option>
          </select>

          {/* Sort order */}
          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100"
          >
            Join Date: {sortOrder === 'desc' ? 'Newest' : 'Oldest'}
          </button>
        </div>
      </div>

      {/* Residents Table / Layout (Requirement 16) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {sorted.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Resident</th>
                  <th className="py-3.5 px-3">Room & Bed</th>
                  <th className="py-3.5 px-3">Contact</th>
                  <th className="py-3.5 px-3">Joining Date</th>
                  <th className="py-3.5 px-3">Payment Status</th>
                  <th className="py-3.5 px-3">Balance</th>
                  <th className="py-3.5 px-3">Aadhaar</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {sorted.map((res) => (
                  <tr key={res.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-cyan-700 text-white font-bold text-xs flex items-center justify-center shrink-0">
                          {res.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 text-sm block leading-tight">
                            {res.name}
                          </span>
                          <span className="text-[11px] text-slate-500">{res.email}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="font-bold text-slate-900 block">Room {res.roomNumber}</span>
                      <span className="text-[11px] text-indigo-600 font-semibold">
                        Bed #{res.bedNumber} ({res.roomCode})
                      </span>
                    </td>

                    <td className="py-3.5 px-3 font-semibold text-slate-700">
                      {res.mobile}
                    </td>

                    <td className="py-3.5 px-3 text-slate-600">
                      {res.joiningDate}
                    </td>

                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full font-bold text-[10px] ${
                          res.paymentStatus === 'Paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {res.paymentStatus || 'Pending'}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 font-bold text-slate-900">
                      ₹{(res.balance || 0).toLocaleString('en-IN')}
                    </td>

                    <td className="py-3.5 px-3">
                      {res.aadhaarFile ? (
                        <a
                          href={res.aadhaarFile.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800"
                        >
                          <FileCheck className="w-4 h-4 text-emerald-600" />
                          <span>Uploaded</span>
                        </a>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Missing</span>
                      )}
                    </td>

                    {/* Host Actions: View, Edit, Delete (Requirement 16) */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setViewingResident(res)}
                          title="View Resident Details"
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(res)}
                          title="Edit Resident"
                          className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {/* Clearly visible Delete button (Requirement 16) */}
                        <button
                          onClick={() => setDeletingId(res.id)}
                          title="Delete Resident"
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
            <Users className="w-12 h-12 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-700">No residents match your search</p>
            <p className="text-xs text-slate-500 mt-0.5">Try clearing filters or click &apos;+ Add Resident&apos;</p>
          </div>
        )}
      </div>

      {/* View Resident Modal */}
      {viewingResident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-800/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Resident Details</h3>
              <button
                onClick={() => setViewingResident(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 py-5 text-xs">
              <div>
                <span className="text-slate-500 block">Name</span>
                <span className="font-bold text-slate-900 text-sm">{viewingResident.name}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Mobile</span>
                <span className="font-bold text-slate-900 text-sm">{viewingResident.mobile}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Email</span>
                <span className="font-medium text-slate-800">{viewingResident.email}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Room & Bed</span>
                <span className="font-bold text-slate-900">
                  Room {viewingResident.roomNumber} (Bed #{viewingResident.bedNumber})
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Room Passcode</span>
                <span className="font-bold text-cyan-700 tracking-wider">{viewingResident.roomCode}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Joining Date</span>
                <span className="font-semibold text-slate-800">{viewingResident.joiningDate}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Monthly Rent</span>
                <span className="font-bold text-slate-900">₹{viewingResident.rent.toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Security Deposit</span>
                <span className="font-bold text-slate-900">₹{viewingResident.advance.toLocaleString('en-IN')}</span>
              </div>
            </div>
            {viewingResident.aadhaarFile && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs mb-4">
                <span className="font-semibold text-emerald-950 flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-emerald-600" />
                  {viewingResident.aadhaarFile.name}
                </span>
                <a
                  href={viewingResident.aadhaarFile.url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-emerald-700 hover:underline"
                >
                  View Document
                </a>
              </div>
            )}
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setViewingResident(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Resident Modal (Requirement 17 & 18) */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-800/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[92vh] overflow-y-auto p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 sticky top-0 bg-white">
              <h3 className="text-base font-bold text-slate-900">
                {editingResident ? `Edit Resident: ${editingResident.name}` : 'Add New Resident'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="my-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveResident} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="resident@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="10-digit mobile"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Room Number <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.roomNumber}
                    onChange={(e) => handleRoomChange(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm bg-white font-bold"
                  >
                    {rooms.map((r) => (
                      <option key={r.roomNumber} value={r.roomNumber}>
                        Room {r.roomNumber} ({r.availableBeds} beds free)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Bed Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={selectedRoomDetails?.totalBeds || 6}
                    required
                    value={formData.bedNumber}
                    onChange={(e) => setFormData({ ...formData, bedNumber: parseInt(e.target.value, 10) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Room Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.roomCode}
                    onChange={(e) => setFormData({ ...formData, roomCode: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Date of Joining <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.joiningDate}
                    onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Rent (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.rent}
                    onChange={(e) => setFormData({ ...formData, rent: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Advance (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.advance}
                    onChange={(e) => setFormData({ ...formData, advance: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
              </div>

              {!editingResident && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Initial Payment Status</label>
                  <select
                    value={formData.paymentStatus}
                    onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm bg-white"
                  >
                    <option value="Paid">Mark as Paid (Auto-generate initial receipt)</option>
                    <option value="Pending">Pending (Log payment later)</option>
                  </select>
                </div>
              )}

              {/* Aadhaar File Upload */}
              <div className="border border-slate-200 p-3 rounded-xl bg-slate-50">
                <label className="block font-bold text-slate-700 mb-1">
                  Aadhaar Document (PDF / JPG / PNG)
                </label>
                <div className="flex items-center gap-3">
                  <label className="px-3 py-1.5 bg-cyan-700 text-white rounded-lg cursor-pointer text-xs font-semibold hover:bg-cyan-800 transition-colors shadow-xs">
                    <span>Choose Aadhaar File</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,application/pdf"
                      onChange={handleFileUpload}
                      className="sr-only"
                    />
                  </label>
                  <span className="text-slate-500 truncate max-w-[200px]">
                    {formData.aadhaarFileName || 'No file selected'}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-2"
                >
                  {formLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{editingResident ? 'Update Resident' : 'Save Resident'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Permanent Deletion (Requirement 16 & 50) */}
      <ConfirmationModal
        isOpen={!!deletingId}
        title="Delete Resident?"
        message="Are you sure you want to delete this resident? This will remove the resident from the room and update occupancy. This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={deleteLoading}
        onConfirm={confirmDeleteResident}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
};
