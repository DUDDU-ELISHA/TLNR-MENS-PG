import React, { useState } from 'react';
import { Phone, PhoneCall } from 'lucide-react';
import { OWNER_PHONE_PRIMARY, CallOwnerModal, triggerCallOwner } from './CallOwnerModal';

interface FloatingCallButtonProps {
  onShowToast?: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const FloatingCallButton: React.FC<FloatingCallButtonProps> = ({ onShowToast }) => {
  const [modalOpen, setModalOpen] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    // If user clicks on mobile or wants direct dial, initiate call
    triggerCallOwner(OWNER_PHONE_PRIMARY);
    // Also open modal for clarity and secondary options/copying
    setModalOpen(true);
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
        <button
          id="floating-call-owner-btn"
          onClick={handleClick}
          title="Call Owner (+91 9908522152)"
          className="group flex items-center gap-2.5 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-lg shadow-emerald-600/30 transition-all hover:scale-105 active:scale-95 border-2 border-white"
        >
          <div className="w-5 h-5 flex items-center justify-center animate-pulse">
            <PhoneCall className="w-5 h-5 text-white" />
          </div>
          <span className="text-xs sm:text-sm font-black tracking-wide pr-1 whitespace-nowrap">
            Call Owner
          </span>
        </button>
      </div>

      <CallOwnerModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onShowToast={onShowToast}
      />
    </>
  );
};
