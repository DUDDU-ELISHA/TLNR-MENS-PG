import React, { useState } from 'react';
import { ShieldCheck, Mail, Lock, ArrowRight, AlertCircle, Loader2, KeyRound, Eye, EyeOff } from 'lucide-react';
import { hostLogin } from '../api';

interface HostLoginPageProps {
  onSuccess: (user: any) => void;
  onNavigateForgotPassword: () => void;
  onBackHome: () => void;
}

export const HostLoginPage: React.FC<HostLoginPageProps> = ({
  onSuccess,
  onNavigateForgotPassword,
  onBackHome
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter host email and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await hostLogin(email.trim(), password);
      onSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Authorized Host credentials required.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <button
          onClick={onBackHome}
          className="text-xs text-slate-500 hover:text-slate-800 mb-4 inline-flex items-center gap-1 transition-colors font-medium"
        >
          ← Back to TLNR MEN&apos;S PG Home
        </button>

        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-cyan-700 text-white flex items-center justify-center mx-auto shadow-sm mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">
            Host Management Login
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Administrative access for TLNR MEN&apos;S PG owner.
          </p>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white border border-slate-200 py-8 px-6 sm:px-10 rounded-2xl shadow-sm">
          {error && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Authorized Host Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder="Enter registered host email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-slate-300 text-slate-900 rounded-xl pl-9 pr-3 py-2.5 text-sm placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-cyan-600 focus:border-cyan-600"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Host Password
                </label>
                <button
                  type="button"
                  onClick={onNavigateForgotPassword}
                  className="text-xs text-cyan-700 hover:text-cyan-800 font-medium transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter host password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border border-slate-300 text-slate-900 rounded-xl pl-9 pr-10 py-2.5 text-sm placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-cyan-600 focus:border-cyan-600"
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

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white text-sm font-bold shadow-xs transition-all active:scale-[0.98] disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Authenticating Host...</span>
                  </>
                ) : (
                  <>
                    <span>Login to Host Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <span className="text-[11px] text-slate-400 block">
              Hostel Location: KPHB Road Number 3 • Secure Access
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
