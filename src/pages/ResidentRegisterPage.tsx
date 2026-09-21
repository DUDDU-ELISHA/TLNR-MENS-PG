import React, { useState, useEffect } from 'react';
import {
  UserPlus,
  Mail,
  Phone,
  Lock,
  KeyRound,
  Calendar,
  Building,
  UploadCloud,
  FileCheck,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Eye,
  EyeOff
} from 'lucide-react';
import { getPublicRooms, residentRegister, sendOtp, verifyOtp } from '../api';

interface ResidentRegisterPageProps {
  onSuccessNavigateLogin: () => void;
  onNavigateLogin: () => void;
  onBackHome: () => void;
}

export const ResidentRegisterPage: React.FC<ResidentRegisterPageProps> = ({
  onSuccessNavigateLogin,
  onNavigateLogin,
  onBackHome
}) => {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [joiningDate, setJoiningDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Aadhaar File
  const [aadhaarDataUrl, setAadhaarDataUrl] = useState<string>('');
  const [aadhaarFileName, setAadhaarFileName] = useState<string>('');

  // OTP Verification state
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpNotice, setOtpNotice] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    getPublicRooms()
      .then((data) => {
        setRooms(data);
        const firstAvailable = data.find((r) => r.availableBeds > 0);
        if (firstAvailable) {
          setRoomNumber(firstAvailable.roomNumber);
          setRoomCode(`TLNR${firstAvailable.roomNumber}`);
        }
      })
      .catch((err) => console.error('Failed to load rooms:', err))
      .finally(() => setLoadingRooms(false));
  }, []);

  const handleRoomChange = (rn: string) => {
    setRoomNumber(rn);
    setRoomCode(`TLNR${rn}`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: 10MB
    if (file.size > 10 * 1024 * 1024) {
      setError('Aadhaar file must be under 10MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAadhaarDataUrl(reader.result as string);
      setAadhaarFileName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleSendOtp = async () => {
    if (!mobile || mobile.trim().length < 10) {
      setError('Please enter a valid 10-digit mobile number first.');
      return;
    }

    setError('');
    setOtpLoading(true);
    try {
      const res = await sendOtp(mobile.trim(), 'Resident Registration');
      setOtpSent(true);
      setOtpNotice(res.message || 'OTP sent to your mobile.');
      if (res.debugOtp) {
        setOtpNotice(`OTP sent! (Verification Code: ${res.debugOtp})`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP. Please check mobile number.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.trim().length < 4) {
      setError('Please enter the verification code.');
      return;
    }

    setError('');
    setOtpLoading(true);
    try {
      await verifyOtp(mobile.trim(), otp.trim());
      setOtpVerified(true);
      setOtpNotice('✓ Mobile verified successfully.');
    } catch (err: any) {
      setError(err.message || 'Invalid or expired OTP.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim() || !mobile.trim() || !roomNumber || !roomCode || !joiningDate || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Password and Confirm Password do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (!otpVerified) {
      setError('Please verify your mobile number with OTP before submitting.');
      return;
    }

    setLoading(true);
    try {
      const res = await residentRegister({
        name: name.trim(),
        email: email.trim(),
        mobile: mobile.trim(),
        roomNumber: roomNumber.trim(),
        roomCode: roomCode.trim(),
        joiningDate,
        password,
        aadhaarDataUrl,
        aadhaarFileName
      });

      setSuccessMsg(res.message || 'Registration successful! Redirecting to login...');
      setTimeout(() => {
        onSuccessNavigateLogin();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check inputs and try again.');
    } finally {
      setLoading(false);
    }
  };

  const availableRooms = rooms.filter((r) => r.availableBeds > 0);

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={onBackHome}
          className="text-xs text-slate-500 hover:text-slate-800 mb-4 inline-flex items-center gap-1 transition-colors font-medium"
        >
          ← Back to TLNR MEN&apos;S PG Home
        </button>

        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-sm mb-3">
            <UserPlus className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Resident Registration
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Join TLNR MEN&apos;S PG • KPHB Road Number 3
          </p>
        </div>

        <div className="bg-white border border-slate-200 p-6 sm:p-10 rounded-2xl shadow-sm">
          {error && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs font-medium flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white border border-slate-300 text-slate-900 rounded-xl px-3.5 py-2.5 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Email and Mobile Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white border border-slate-300 text-slate-900 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    placeholder="10-digit mobile"
                    value={mobile}
                    onChange={(e) => {
                      setMobile(e.target.value);
                      setOtpVerified(false);
                      setOtpSent(false);
                    }}
                    className="w-full bg-white border border-slate-300 text-slate-900 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Real OTP Section */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  Mobile OTP Verification
                </span>
                {otpVerified ? (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={otpLoading || !mobile}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 disabled:opacity-50"
                  >
                    {otpSent ? 'Resend OTP' : 'Send OTP'}
                  </button>
                )}
              </div>

              {otpNotice && (
                <p className="text-xs text-indigo-700 bg-indigo-50 p-2 rounded-lg border border-indigo-100 font-medium">{otpNotice}</p>
              )}

              {otpSent && !otpVerified && (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="flex-1 bg-white border border-slate-300 text-slate-900 rounded-lg px-3 py-2 text-sm tracking-widest text-center focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={otpLoading}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
                  >
                    {otpLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify'}
                  </button>
                </div>
              )}
            </div>

            {/* Room Number & Room Code */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Room Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <select
                    required
                    value={roomNumber}
                    onChange={(e) => handleRoomChange(e.target.value)}
                    className="w-full bg-white border border-slate-300 text-slate-900 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {loadingRooms ? (
                      <option value="">Loading available rooms...</option>
                    ) : availableRooms.length > 0 ? (
                      availableRooms.map((r) => (
                        <option key={r.roomNumber} value={r.roomNumber}>
                          Room {r.roomNumber} ({r.availableBeds} beds free)
                        </option>
                      ))
                    ) : (
                      <option value="">No beds currently available</option>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Room Code <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. TLNR101"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value)}
                    className="w-full bg-white border border-slate-300 text-slate-900 rounded-xl pl-9 pr-3 py-2.5 text-sm uppercase tracking-wider focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Date of Joining */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Date of Joining <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="date"
                  required
                  value={joiningDate}
                  onChange={(e) => setJoiningDate(e.target.value)}
                  className="w-full bg-white border border-slate-300 text-slate-900 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Password and Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white border border-slate-300 text-slate-900 rounded-xl pl-9 pr-10 py-2.5 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? 'Hide password' : 'Show password'}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-2.5 p-1 text-slate-400 hover:text-slate-700 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    placeholder="Repeat password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-white border border-slate-300 text-slate-900 rounded-xl pl-9 pr-10 py-2.5 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    title={showConfirmPassword ? 'Hide password' : 'Show password'}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-2.5 p-1 text-slate-400 hover:text-slate-700 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Aadhaar Upload */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Aadhaar Document Upload (PDF, JPG, PNG)
              </label>
              <div className="mt-1 flex justify-center px-4 pt-4 pb-4 border-2 border-slate-300 border-dashed rounded-xl hover:border-slate-400 transition-colors bg-white">
                <div className="space-y-1 text-center">
                  {aadhaarFileName ? (
                    <div className="flex items-center justify-center gap-2 text-emerald-600 text-xs font-semibold">
                      <FileCheck className="w-5 h-5" />
                      <span>{aadhaarFileName}</span>
                    </div>
                  ) : (
                    <UploadCloud className="mx-auto h-8 w-8 text-slate-400" />
                  )}
                  <div className="flex text-xs text-slate-600 justify-center">
                    <label className="relative cursor-pointer bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-md font-semibold text-indigo-600 px-2 py-0.5 transition-colors">
                      <span>Upload Aadhaar File</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,application/pdf"
                        onChange={handleFileUpload}
                        className="sr-only"
                      />
                    </label>
                  </div>
                  <p className="text-[11px] text-slate-400">Stored securely in cloud repository</p>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-xs transition-all active:scale-[0.98] disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <span>Complete Resident Registration</span>
                )}
              </button>
            </div>
          </form>

          {/* Already have an account */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Already registered?{' '}
              <button
                type="button"
                onClick={onNavigateLogin}
                className="text-indigo-600 hover:text-indigo-800 font-bold transition-colors"
              >
                Go to Resident Login
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
