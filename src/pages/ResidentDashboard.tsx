import React, { useState, useEffect } from 'react';
import {
  User,
  Building,
  CreditCard,
  History,
  FileText,
  UtensilsCrossed,
  MapPin,
  Phone,
  CheckCircle2,
  AlertCircle,
  Download,
  Upload,
  Calendar,
  KeyRound,
  FileCheck,
  Loader2
} from 'lucide-react';
import { getResidentDetails, uploadResidentAadhaar, getMenu, subscribeToRealtimeUpdates } from '../api';
import { Payment, MenuItem } from '../types';
import { ReceiptModal } from '../components/ReceiptModal';

interface ResidentDashboardProps {
  onLogout: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const ResidentDashboard: React.FC<ResidentDashboardProps> = ({
  onLogout,
  onShowToast
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'room' | 'payment' | 'history' | 'aadhaar' | 'menu' | 'hostel'>('profile');
  const [data, setData] = useState<any>(null);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Aadhaar upload state
  const [uploadingAadhaar, setUploadingAadhaar] = useState(false);

  // Selected payment for receipt download
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  const loadData = async () => {
    try {
      const [resDetails, menuData] = await Promise.all([
        getResidentDetails(),
        getMenu()
      ]);
      setData(resDetails);
      setMenu(menuData);
    } catch (err: any) {
      setError(err.message || 'Failed to load resident dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Subscribe to realtime updates from server (Requirement 30 & 32)
    const unsubscribe = subscribeToRealtimeUpdates((event) => {
      if (event.type === 'DATA_SYNC') {
        loadData();
      }
    });

    return () => unsubscribe();
  }, []);

  // Time-based greeting (Requirement 6)
  const getGreeting = (name: string) => {
    const hour = new Date().getHours();
    let timeGreeting = 'Good Morning';
    if (hour >= 12 && hour < 17) {
      timeGreeting = 'Good Afternoon';
    } else if (hour >= 17) {
      timeGreeting = 'Good Evening';
    }
    const firstName = name ? name.split(' ')[0] : 'Resident';
    return `${timeGreeting}, ${firstName}!`;
  };

  // Avatar text e.g. "EL | Elisha" (Requirement 10)
  const getAvatarDisplay = (name: string) => {
    if (!name) return 'PG';
    const clean = name.trim();
    const initials = clean.length >= 2 ? clean.substring(0, 2).toUpperCase() : clean.substring(0, 1).toUpperCase();
    return `${initials} | ${clean}`;
  };

  const handleAadhaarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      onShowToast('Aadhaar file must be under 10MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      setUploadingAadhaar(true);
      try {
        const res = await uploadResidentAadhaar(reader.result as string, file.name);
        onShowToast(res.message || '✓ Aadhaar uploaded successfully.', 'success');
        loadData();
      } catch (err: any) {
        onShowToast(err.message || 'Unable to upload Aadhaar. Please check file format and try again.', 'error');
      } finally {
        setUploadingAadhaar(false);
      }
    };
    reader.readAsDataURL(file);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-2" />
        <p className="text-sm font-medium text-slate-600">Loading Resident Dashboard...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 max-w-md w-full text-center">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900 mb-1">Unable to Load Dashboard</h3>
          <p className="text-sm text-slate-600 mb-4">{error || 'Resident profile could not be found.'}</p>
          <button
            onClick={onLogout}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700"
          >
            Logout & Try Again
          </button>
        </div>
      </div>
    );
  }

  const { profile, room, payment } = data;
  const isFullyPaid = payment.paymentStatus === 'Paid' || payment.balance === 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Top Welcome Banner */}
      <div className="bg-white border-b border-slate-200 text-slate-900 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold uppercase tracking-wider mb-2">
                <Building className="w-3.5 h-3.5" />
                TLNR MEN&apos;S PG • Resident Portal
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                {getGreeting(profile.name)}
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Room {profile.roomNumber} (Bed #{room.residentBed}) • Joined on {profile.joiningDate}
              </p>
            </div>

            {/* Resident Avatar Chip & Call Owner */}
            <div className="flex items-center gap-3">
              <a
                id="resident-header-call-owner-btn"
                href="tel:9908522152"
                title="Call Owner (+91 9908522152)"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95"
              >
                <Phone className="w-4 h-4 text-emerald-600 animate-pulse" />
                <span>Call Owner</span>
              </a>

              <div className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3 shadow-xs">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-xs">
                  {profile.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block leading-tight">
                    {getAvatarDisplay(profile.name)}
                  </span>
                  <span className="text-[11px] text-emerald-600 font-semibold block">
                    Active Resident
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-1.5 mt-8 border-t border-slate-200 pt-4 overflow-x-auto pb-1">
            {[
              { id: 'profile', label: 'My Profile', icon: User },
              { id: 'room', label: 'Room Details', icon: Building },
              { id: 'payment', label: 'Payment', icon: CreditCard },
              { id: 'history', label: 'Payment History', icon: History },
              { id: 'aadhaar', label: 'Aadhaar Document', icon: FileText },
              { id: 'menu', label: 'Weekly Food Menu', icon: UtensilsCrossed },
              { id: 'hostel', label: 'Hostel Info', icon: MapPin }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* TAB 1: Profile */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs max-w-3xl">
            <h2 className="text-lg font-bold text-slate-900 pb-4 border-b border-slate-100 flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-600" />
              Resident Profile
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Registered Full Name
                </span>
                <span className="text-base font-bold text-slate-900 mt-1 block">
                  {profile.name}
                </span>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Mobile Number
                </span>
                <span className="text-base font-bold text-slate-900 mt-1 block">
                  {profile.mobile}
                </span>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Email Address
                </span>
                <span className="text-base font-bold text-slate-900 mt-1 block">
                  {profile.email}
                </span>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Assigned Room & Bed
                </span>
                <span className="text-base font-bold text-slate-900 mt-1 block">
                  Room {profile.roomNumber} • Bed #{room.residentBed}
                </span>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Room Passcode / Code
                </span>
                <span className="text-base font-bold text-cyan-700 mt-1 block tracking-wider">
                  {profile.roomCode}
                </span>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Date of Joining
                </span>
                <span className="text-base font-bold text-slate-900 mt-1 block">
                  {profile.joiningDate}
                </span>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 bg-slate-50/70 -mx-6 sm:-mx-8 -mb-6 sm:-mb-8 p-6 sm:p-8 rounded-b-2xl flex items-center justify-between text-xs text-slate-500">
              <span>Hostel: TLNR MEN&apos;S PG • KPHB Road Number 3</span>
              <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Verified Resident Account
              </span>
            </div>
          </div>
        )}

        {/* TAB 2: Room Details */}
        {activeTab === 'room' && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs max-w-3xl">
            <h2 className="text-lg font-bold text-slate-900 pb-4 border-b border-slate-100 flex items-center gap-2">
              <Building className="w-5 h-5 text-indigo-600" />
              Room Allocation & Capacity
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <span className="text-xs text-slate-500 font-medium block">Room Number</span>
                <span className="text-2xl font-black text-slate-900">{room.roomNumber}</span>
                <span className="text-[11px] text-slate-500 block">Floor {room.roomNumber.charAt(0)}</span>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <span className="text-xs text-slate-500 font-medium block">Total Beds</span>
                <span className="text-2xl font-black text-slate-900">{room.totalBeds}</span>
                <span className="text-[11px] text-slate-500 block">Capacity</span>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <span className="text-xs text-slate-500 font-medium block">Occupied Beds</span>
                <span className="text-2xl font-black text-slate-900">{room.occupiedBeds}</span>
                <span className="text-[11px] text-slate-500 block">Current Residents</span>
              </div>

              <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                <span className="text-xs text-emerald-700 font-medium block">Available Beds</span>
                <span className="text-2xl font-black text-emerald-900">{room.availableBeds}</span>
                <span className="text-[11px] text-emerald-700 block">Vacant</span>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-indigo-900 block">Your Assigned Bed</span>
                <span className="text-sm font-semibold text-indigo-700">
                  Bed #{room.residentBed} in Room {room.roomNumber}
                </span>
              </div>
              <span className="px-3 py-1 rounded-full bg-indigo-600 text-white font-bold text-xs">
                Allocated
              </span>
            </div>
          </div>
        )}

        {/* TAB 3: Payment */}
        {activeTab === 'payment' && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs max-w-3xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-indigo-600" />
                Payment Summary
              </h2>
              {isFullyPaid ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  FULLY PAID
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider">
                  STATUS: {payment.paymentStatus}
                </span>
              )}
            </div>

            {/* Note: Collection amount strictly absent from Resident Dashboard (Requirement 12 & 40) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <span className="text-xs text-slate-500 font-medium block">Monthly Rent</span>
                <span className="text-xl font-bold text-slate-900">₹{payment.rent.toLocaleString('en-IN')}</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <span className="text-xs text-slate-500 font-medium block">Security Advance</span>
                <span className="text-xl font-bold text-slate-900">₹{payment.advance.toLocaleString('en-IN')}</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <span className="text-xs text-slate-500 font-medium block">Total Payable</span>
                <span className="text-xl font-bold text-slate-900">₹{payment.totalAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                <span className="text-xs text-emerald-700 font-medium block">Amount Paid</span>
                <span className="text-xl font-bold text-emerald-950">₹{payment.amountPaid.toLocaleString('en-IN')}</span>
              </div>
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                <span className="text-xs text-amber-700 font-medium block">Balance Outstanding</span>
                <span className="text-xl font-bold text-amber-950">₹{payment.balance.toLocaleString('en-IN')}</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <span className="text-xs text-slate-500 font-medium block">Last Payment Mode</span>
                <span className="text-sm font-bold text-slate-800">{payment.paymentMode}</span>
              </div>
            </div>

            {/* Download Receipt Button (Requirement 21) */}
            {payment.history?.length > 0 ? (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedPayment(payment.history[0])}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-sm transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF Receipt</span>
                </button>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">
                Receipt will be available once the Host records your first payment.
              </p>
            )}
          </div>
        )}

        {/* TAB 4: Payment History */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900 pb-4 border-b border-slate-100 flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-600" />
              Payment History & Receipts
            </h2>

            {payment.history && payment.history.length > 0 ? (
              <div className="overflow-x-auto mt-6">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                      <th className="pb-3 px-3">Receipt No</th>
                      <th className="pb-3 px-3">Date</th>
                      <th className="pb-3 px-3">Amount</th>
                      <th className="pb-3 px-3">Mode</th>
                      <th className="pb-3 px-3">Status</th>
                      <th className="pb-3 px-3">Balance</th>
                      <th className="pb-3 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {payment.history.map((p: Payment) => (
                      <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-3 font-bold text-slate-900">{p.receiptNumber}</td>
                        <td className="py-3 px-3 text-slate-600">{p.paymentDate}</td>
                        <td className="py-3 px-3 font-bold text-emerald-700">₹{p.amountPaid.toLocaleString('en-IN')}</td>
                        <td className="py-3 px-3 text-slate-600">{p.paymentMode}</td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                              p.paymentStatus === 'Paid'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {p.paymentStatus}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-700">₹{p.balance.toLocaleString('en-IN')}</td>
                        <td className="py-3 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedPayment(p)}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Receipt</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400">
                <FileText className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                <p className="text-sm font-medium">No payment records yet.</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: Aadhaar Document */}
        {activeTab === 'aadhaar' && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs max-w-3xl space-y-6">
            <h2 className="text-lg font-bold text-slate-900 pb-4 border-b border-slate-100 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              Aadhaar Document Management
            </h2>

            {profile.aadhaarFile ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                    <FileCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-emerald-950 block">
                      {profile.aadhaarFile.name || 'Aadhaar Card File'}
                    </span>
                    <span className="text-xs text-emerald-700">
                      Uploaded on {new Date(profile.aadhaarFile.uploadedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <a
                  href={profile.aadhaarFile.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>View / Download Document</span>
                </a>
              </div>
            ) : (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-medium">
                No Aadhaar document uploaded yet. Please upload your Aadhaar document for government record compliance.
              </div>
            )}

            {/* Upload / Re-upload form */}
            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:border-indigo-500 transition-colors">
              <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
              <h3 className="text-sm font-bold text-slate-800">
                {profile.aadhaarFile ? 'Upload Updated Aadhaar' : 'Upload Aadhaar File'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 mb-4">
                Supported formats: JPG, JPEG, PNG, PDF (Max 10MB)
              </p>

              <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-sm transition-all">
                {uploadingAadhaar ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Choose File from Device</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,application/pdf"
                  disabled={uploadingAadhaar}
                  onChange={handleAadhaarUpload}
                  className="sr-only"
                />
              </label>
            </div>
          </div>
        )}

        {/* TAB 6: Weekly Food Menu (Requirement 26 & 27) */}
        {activeTab === 'menu' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <UtensilsCrossed className="w-5 h-5 text-indigo-600" />
                    Weekly Food Schedule
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Fresh breakfast, lunch, and dinner served daily.
                  </p>
                </div>
                <span className="text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-700 rounded-full">
                  Resident View
                </span>
              </div>

              {/* 7 Days Grid with Attractive Card UI (Requirement 27) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {menu.map((m) => {
                  const todayName = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());
                  const isToday = m.day.toLowerCase() === todayName.toLowerCase();
                  return (
                    <div
                      key={m.id}
                      className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden shadow-xs hover:shadow-md flex flex-col ${
                        isToday ? 'border-indigo-400 ring-2 ring-indigo-100' : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {/* Card Day Header */}
                      <div className={`px-5 py-3.5 border-b flex items-center justify-between ${
                        isToday ? 'bg-indigo-50/80 border-indigo-100' : 'bg-slate-50 border-slate-100'
                      }`}>
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                          <span className="font-bold text-sm tracking-wide text-slate-900">
                            {m.day}
                          </span>
                        </div>
                        {isToday ? (
                          <span className="text-[11px] font-bold px-2.5 py-0.5 bg-indigo-600 text-white rounded-full shadow-xs">
                            Today
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold px-2 py-0.5 bg-slate-200/80 text-slate-700 rounded-md">
                            All 3 Meals
                          </span>
                        )}
                      </div>

                      {/* Meals Content */}
                      <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                        {/* Tiffin Card */}
                        <div className="bg-amber-50/60 border border-amber-200/70 rounded-xl p-3">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 uppercase tracking-wide mb-1.5">
                            <span className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center text-xs">☕</span>
                            <span>Tiffin / Breakfast</span>
                          </div>
                          <div className="text-xs text-slate-700 font-medium space-y-1 pl-6">
                            {m.tiffin.map((f, i) => (
                              <p key={i} className="flex items-start gap-1">
                                <span className="text-amber-500 font-bold">•</span>
                                <span>{f}</span>
                              </p>
                            ))}
                          </div>
                        </div>

                        {/* Lunch Card */}
                        <div className="bg-emerald-50/60 border border-emerald-200/70 rounded-xl p-3">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wide mb-1.5">
                            <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-xs">🍛</span>
                            <span>Lunch Special</span>
                          </div>
                          <div className="text-xs text-slate-700 font-medium space-y-1 pl-6">
                            {m.lunch.map((f, i) => (
                              <p key={i} className="flex items-start gap-1">
                                <span className="text-emerald-500 font-bold">•</span>
                                <span>{f}</span>
                              </p>
                            ))}
                          </div>
                        </div>

                        {/* Dinner Card */}
                        <div className="bg-indigo-50/60 border border-indigo-200/70 rounded-xl p-3">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-800 uppercase tracking-wide mb-1.5">
                            <span className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-xs">🍲</span>
                            <span>Dinner Menu</span>
                          </div>
                          <div className="text-xs text-slate-700 font-medium space-y-1 pl-6">
                            {m.dinner.map((f, i) => (
                              <p key={i} className="flex items-start gap-1">
                                <span className="text-indigo-500 font-bold">•</span>
                                <span>{f}</span>
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: Hostel Info */}
        {activeTab === 'hostel' && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs max-w-3xl space-y-6">
            <h2 className="text-lg font-bold text-slate-900 pb-4 border-b border-slate-100 flex items-center gap-2">
              <Building className="w-5 h-5 text-indigo-600" />
              TLNR MEN&apos;S PG Contact & Facility Details
            </h2>

            <div className="space-y-4 text-sm">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase block">Hostel Name</span>
                <span className="font-bold text-slate-900 text-base">TLNR MEN&apos;S PG</span>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase block">Address</span>
                <span className="font-medium text-slate-800">KPHB Road Number 3, Hyderabad</span>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase block mb-1">Owner Contact Numbers</span>
                <div className="flex flex-wrap items-center gap-3">
                  <a
                    id="hostel-tab-call-owner-primary-btn"
                    href="tel:9908522152"
                    className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Owner: 9908522152</span>
                  </a>
                  <a
                    id="hostel-tab-call-owner-secondary-btn"
                    href="tel:9133699944"
                    className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold border border-slate-200 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-slate-600" />
                    <span>Call Secondary: 9133699944</span>
                  </a>
                </div>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase block mb-2">Hostel Facilities</span>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold text-slate-700">
                  <li className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> CCTV Camera
                  </li>
                  <li className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> High-Speed Wi-Fi
                  </li>
                  <li className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Washing Machine
                  </li>
                  <li className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Elevator / Lift
                  </li>
                  <li className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Refrigerator
                  </li>
                  <li className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Freezer in Every Room
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Receipt Modal */}
      <ReceiptModal
        payment={selectedPayment}
        onClose={() => setSelectedPayment(null)}
      />
    </div>
  );
};
