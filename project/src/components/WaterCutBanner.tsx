import { Droplets, AlertTriangle, X } from 'lucide-react';
import { useState } from 'react';
import type { WaterCutStatus } from '../types';

interface WaterCutBannerProps {
  waterCut: WaterCutStatus;
}

export function WaterCutBanner({ waterCut }: WaterCutBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (!waterCut.is_active || dismissed) return null;

  return (
    <div className="relative bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white px-4 py-3 shadow-lg animate-pulse-subtle">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex-shrink-0 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-white animate-bounce" />
            <Droplets className="w-5 h-5 text-white/80" />
          </div>
          <p className="text-sm font-medium truncate">
            {waterCut.message}
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="flex-shrink-0 p-1 hover:bg-white/20 rounded-full transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
