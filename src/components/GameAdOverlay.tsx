'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import AdBanner from './AdBanner';

export default function GameAdOverlay() {
  const [isVisible, setIsVisible] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    // Refresh the ad every 15 seconds and make it visible again
    const intervalId = setInterval(() => {
      setRefreshKey(prev => prev + 1);
      setIsVisible(true);
    }, 15000);
    
    return () => clearInterval(intervalId);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="absolute bottom-4 left-1/2 z-50 -translate-x-1/2 flex flex-col items-end">
      <button 
        onClick={() => setIsVisible(false)}
        className="mb-1 rounded-full bg-black/60 p-1 text-white hover:bg-red-500/80 transition"
        aria-label="Close ad"
      >
        <X className="h-4 w-4" />
      </button>
      <div key={refreshKey} className="overflow-hidden rounded-md shadow-lg border border-white/10 bg-black/50">
        <AdBanner className="flex justify-center overflow-hidden" />
      </div>
    </div>
  );
}
