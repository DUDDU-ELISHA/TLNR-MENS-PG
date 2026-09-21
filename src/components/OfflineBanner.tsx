import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, RefreshCw } from 'lucide-react';

interface OfflineBannerProps {
  onSync?: () => void;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({ onSync }) => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [showRestored, setShowRestored] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowRestored(true);
      if (onSync) onSync();
      const timer = setTimeout(() => setShowRestored(false), 4000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowRestored(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [onSync]);

  if (isOnline && !showRestored) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 transition-transform duration-300">
      {!isOnline ? (
        <div className="bg-amber-500 text-amber-950 px-4 py-2.5 text-center text-sm font-semibold flex items-center justify-center gap-2 shadow-md">
          <WifiOff className="w-4 h-4 shrink-0 animate-pulse" />
          <span>You&apos;re offline. Changes will sync when connection is restored.</span>
        </div>
      ) : (
        <div className="bg-emerald-600 text-white px-4 py-2 text-center text-sm font-semibold flex items-center justify-center gap-2 shadow-md">
          <Wifi className="w-4 h-4 shrink-0" />
          <span>✓ Connection restored. Changes synced successfully.</span>
        </div>
      )}
    </div>
  );
};
