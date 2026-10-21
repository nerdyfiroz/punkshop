import React, { useState } from 'react';
import { ExternalLink, Info, X } from 'lucide-react';

export type AdSlotType = 'leaderboard' | 'rectangle' | 'responsive' | 'sticky';

interface AdSenseBannerProps {
  slotType: AdSlotType;
  slotId?: string;
  className?: string;
  showDismiss?: boolean;
}

export const AdSenseBanner: React.FC<AdSenseBannerProps> = ({
  slotType,
  slotId = '1234567890',
  className = '',
  showDismiss = false
}) => {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  if (slotType === 'sticky') {
    return (
      <aside aria-label="Advertisement" className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 backdrop-blur-md border-t border-zinc-800 shadow-2xl py-2 px-4 transition-all">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-zinc-500 font-mono">
            <Info className="w-3.5 h-3.5" />
            <span>Advertisement</span>
          </div>
          
          <div className="flex-1 flex items-center justify-center">
            <div className="w-full max-w-[728px] h-[60px] md:h-[70px] rounded bg-gradient-to-r from-zinc-900 via-zinc-800/80 to-zinc-900 border border-zinc-700/50 flex items-center justify-between px-4 sm:px-8 text-xs text-zinc-300">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-sm">
                  ⚡
                </div>
                <div>
                  <p className="font-semibold text-white text-xs sm:text-sm">Ultra High-Speed Gigabit VPN & Cloud Storage</p>
                  <p className="text-[11px] text-zinc-400 hidden sm:block">Unlimited bandwidth with zero logging. 30-day money-back guarantee.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => window.open('https://www.google.com/adsense/start/', '_blank')}
                className="cursor-pointer px-3 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs flex items-center gap-1.5 transition-colors shrink-0"
              >
                Learn More <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            className="cursor-pointer p-1 text-zinc-400 hover:text-white transition-colors"
            title="Close Ad"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </aside>
    );
  }

  if (slotType === 'leaderboard') {
    return (
      <aside aria-label="Advertisement" className={`w-full my-6 flex flex-col items-center justify-center ${className}`}>
        <div className="flex items-center gap-1 text-[10px] uppercase font-mono tracking-widest text-zinc-500 mb-1.5">
          <span>Advertisement &bull; Google AdSense</span>
          <span className="text-zinc-600">(Slot: {slotId})</span>
        </div>
        <div className="w-full max-w-[970px] min-h-[90px] rounded-lg bg-zinc-900/60 border border-zinc-800/80 p-3 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left transition-all hover:border-zinc-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-base shrink-0">
              AD
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-200">Stream in 4K HDR with High Speed Fiber Broadband</p>
              <p className="text-xs text-zinc-400">Zero buffering on all streaming devices. Check availability in your area today.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => window.open('https://www.google.com/adsense/start/', '_blank')}
            className="cursor-pointer px-4 py-2 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium text-xs flex items-center gap-1.5 border border-zinc-700 transition-colors whitespace-nowrap"
          >
            <span>Visit Sponsor</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </aside>
    );
  }

  if (slotType === 'rectangle') {
    return (
      <aside aria-label="Advertisement" className={`w-full max-w-[320px] mx-auto my-4 flex flex-col items-center ${className}`}>
        <div className="flex items-center gap-1 text-[10px] uppercase font-mono tracking-widest text-zinc-500 mb-1.5">
          <span>Sponsored Ad</span>
        </div>
        <div className="w-[300px] h-[250px] rounded-lg bg-zinc-900/80 border border-zinc-800/80 p-5 flex flex-col justify-between text-center transition-all hover:border-zinc-700">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3 text-lg font-bold">
              ★
            </div>
            <h4 className="text-sm font-semibold text-zinc-100 mb-1">Premium Cinema Audio Gear</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Experience theater-grade Dolby Atmos acoustics directly in your living room with next-gen wireless soundbars.
            </p>
          </div>
          <button
            type="button"
            onClick={() => window.open('https://www.google.com/adsense/start/', '_blank')}
            className="cursor-pointer w-full py-2 rounded bg-amber-500/90 hover:bg-amber-500 text-black font-semibold text-xs transition-colors flex items-center justify-center gap-1"
          >
            <span>Shop Deals</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </aside>
    );
  }

  // Responsive slot
  return (
    <aside aria-label="Advertisement" className={`w-full my-6 flex flex-col items-center ${className}`}>
      <div className="flex items-center gap-1 text-[10px] uppercase font-mono tracking-widest text-zinc-500 mb-1.5">
        <span>Advertisement &bull; Google AdSense Responsive</span>
      </div>
      <div className="w-full rounded-lg bg-zinc-900/60 border border-zinc-800/80 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-sm shrink-0">
            PRO
          </div>
          <div>
            <h4 className="text-sm font-semibold text-zinc-200">High-Performance Media Server Hosting</h4>
            <p className="text-xs text-zinc-400">Deploy your own private streaming cluster with NVMe SSDs and unmetered 10Gbps connectivity.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => window.open('https://www.google.com/adsense/start/', '_blank')}
          className="cursor-pointer px-4 py-2 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 flex items-center gap-1.5 transition-colors whitespace-nowrap"
        >
          <span>Explore Pricing</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>
    </aside>
  );
};
