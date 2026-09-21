import React, { useState } from 'react';
import { Phone, PhoneCall, Copy, Check, X, ShieldCheck } from 'lucide-react';

interface CallOwnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast?: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const OWNER_PHONE_PRIMARY = '9908522152';
export const OWNER_PHONE_SECONDARY = '9133699944';

export const triggerCallOwner = (phoneNumber: string = OWNER_PHONE_PRIMARY) => {
  window.location.href = `tel:${phoneNumber}`;
};

export const CallOwnerModal: React.FC<CallOwnerModalProps> = ({
  isOpen,
  onClose,
  onShowToast
}) => {
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopiedNumber(num);
    if (onShowToast) {
      onShowToast(`Copied ${num} to clipboard`, 'success');
    }
    setTimeout(() => {
      setCopiedNumber(null);
    }, 2500);
  };

  const handleCall = (num: string) => {
    triggerCallOwner(num);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-800/40 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95">
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Call Owner</h3>
              <p className="text-xs text-slate-500">TLNR MEN&apos;S PG Management</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-4 space-y-3">
          <p className="text-xs text-slate-600 leading-relaxed">
            Click to dial directly or copy the verified owner contact numbers below:
          </p>

          {/* Primary Owner Contact */}
          <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50 flex items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                  Primary
                </span>
                <span className="text-xs font-semibold text-slate-700">Owner Mobile</span>
              </div>
              <div className="text-base font-black text-slate-900 tracking-wide mt-1">
                +91 {OWNER_PHONE_PRIMARY}
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleCopy(OWNER_PHONE_PRIMARY)}
                title="Copy Number"
                className="p-2 text-slate-500 hover:text-slate-800 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200"
              >
                {copiedNumber === OWNER_PHONE_PRIMARY ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
              <a
                href={`tel:${OWNER_PHONE_PRIMARY}`}
                onClick={() => handleCall(OWNER_PHONE_PRIMARY)}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Now</span>
              </a>
            </div>
          </div>

          {/* Secondary Owner Contact */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-200 px-1.5 py-0.5 rounded">
                  Alternate
                </span>
                <span className="text-xs font-semibold text-slate-700">Office / Support</span>
              </div>
              <div className="text-base font-bold text-slate-900 tracking-wide mt-1">
                +91 {OWNER_PHONE_SECONDARY}
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleCopy(OWNER_PHONE_SECONDARY)}
                title="Copy Number"
                className="p-2 text-slate-500 hover:text-slate-800 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200"
              >
                {copiedNumber === OWNER_PHONE_SECONDARY ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
              <a
                href={`tel:${OWNER_PHONE_SECONDARY}`}
                onClick={() => handleCall(OWNER_PHONE_SECONDARY)}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Now</span>
              </a>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Available 24/7 for admissions, rent & hostel queries.</span>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 px-4 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
