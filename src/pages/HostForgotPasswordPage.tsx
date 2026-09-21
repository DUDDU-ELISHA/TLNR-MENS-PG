import React, { useState } from 'react';
import { ShieldAlert, Mail, Lock, AlertCircle, CheckCircle2, Loader2, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { sendOtp, hostResetPassword } from '../api';

interface HostForgotPasswordPageProps {
  onNavigateLogin: () => void;
  onBackHome: () => void;
}

export const HostForgotPasswordPage: React.FC<HostForgotPasswordPageProps> = ({
  onNavigateLogin,
  onBackHome
}) => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [otpSent, setOtpSent] = useState(false);
  const [otpNotice, setOtpNotice] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSendOtp = async () => {
    setError('');
    setOtpLoading(true);
    try {
      const res = await sendOtp('9908522152', 'Host Password Reset');
      setOtpSent(true);
      setOtpNotice(res.message);
      if (res.debugOtp) {
        setOtpNotice(`OTP Sent to Owner Mobile! (Code: ${res.debugOtp})`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP to owner phone.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter the host email address.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await hostResetPassword(email.trim(), newPassword, otp.trim());
      setSuccess(res.message || 'Host password reset successfully! Redirecting to login...');
      setTimeout(() => {
        onNavigateLogin();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to reset host password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <button
          onClick={onNavigateLogin}
          className="text-xs text-slate-500 hover:text-slate-800 mb-4 inline-flex items-center gap-1 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Host Login
        </button>

        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-cyan-700 text-white flex items-center justify-center mx-auto shadow-sm mb-3">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Reset Host Password</h2>
          <p className="mt-1 text-xs text-slate-500">
            Authorization & verification required for hostel management
          </p>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-2xl shadow-sm">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Host Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder="Enter registered host email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-slate-300 text-slate-900 rounded-xl pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  Security OTP (Sent to Owner Mobile)
                </label>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={otpLoading}
                  className="text-xs font-bold text-cyan-700 hover:text-cyan-800"
                >
                  {otpLoading ? 'Sending...' : otpSent ? 'Resend' : 'Send OTP to Owner'}
                </button>
              </div>
              {otpNotice && <p className="text-xs text-cyan-800 mb-2 font-medium bg-cyan-50 p-2 rounded-lg border border-cyan-100">{otpNotice}</p>}
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full bg-white border border-slate-300 text-slate-900 rounded-xl px-3 py-2 text-sm tracking-widest text-center focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                New Host Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-white border border-slate-300 text-slate-900 rounded-xl pl-9 pr-10 py-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  title={showNewPassword ? 'Hide password' : 'Show password'}
                  aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-2 p-1 text-slate-400 hover:text-slate-700 transition-colors"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-white border border-slate-300 text-slate-900 rounded-xl pl-9 pr-10 py-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  title={showConfirmPassword ? 'Hide password' : 'Show password'}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-2 p-1 text-slate-400 hover:text-slate-700 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-cyan-700 hover:bg-cyan-800 text-white text-sm font-bold rounded-xl shadow-xs transition-colors disabled:opacity-60"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Reset Host Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
