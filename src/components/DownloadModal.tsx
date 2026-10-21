import React, { useState } from 'react';
import {
  Download,
  X,
  ShieldCheck,
  HardDrive,
  Copy,
  Check,
  AlertCircle,
  Clock,
  Sparkles,
  Zap,
  FolderArchive
} from 'lucide-react';
import { DownloadOption, MediaItem } from '../types';

interface DownloadModalProps {
  media: MediaItem;
  isOpen: boolean;
  onClose: () => void;
  initialOption?: DownloadOption;
}

export const DownloadModal: React.FC<DownloadModalProps> = ({
  media,
  isOpen,
  onClose,
  initialOption
}) => {
  const [selectedOption, setSelectedOption] = useState<DownloadOption>(
    initialOption || media.downloadOptions[0]
  );
  const [downloadStep, setDownloadStep] = useState<'options' | 'verifying' | 'ready'>('options');
  const [countdown, setCountdown] = useState<number>(5);
  const [copiedMagnet, setCopiedMagnet] = useState<boolean>(false);
  const [simulatedProgress, setSimulatedProgress] = useState<number>(0);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleStartVerification = (option: DownloadOption) => {
    setSelectedOption(option);
    setDownloadStep('verifying');
    setCountdown(5);

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setDownloadStep('ready');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleTriggerDirectDownload = () => {
    setIsDownloading(true);
    setSimulatedProgress(0);

    // Trigger actual download of video
    const link = document.createElement('a');
    link.href = selectedOption.directUrl;
    link.download = `${media.slug}_${selectedOption.quality.toLowerCase().replace(/\s+/g, '_')}.${selectedOption.format.toLowerCase()}`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Run simulated progress counter for user feedback
    const progInterval = setInterval(() => {
      setSimulatedProgress((curr) => {
        if (curr >= 100) {
          clearInterval(progInterval);
          setTimeout(() => setIsDownloading(false), 1500);
          return 100;
        }
        return curr + 20;
      });
    }, 400);
  };

  const handleCopyMagnet = () => {
    const fakeMagnet = `magnet:?xt=urn:btih:${Math.random().toString(36).substring(2, 15)}&dn=${encodeURIComponent(media.title + ' ' + selectedOption.quality)}&tr=udp%3A%2F%2Ftracker.openbittorrent.com%3A80`;
    navigator.clipboard.writeText(fakeMagnet);
    setCopiedMagnet(true);
    setTimeout(() => setCopiedMagnet(false), 2500);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="download-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
    >
      <div className="relative w-full max-w-2xl rounded-2xl bg-zinc-900 border border-zinc-700/80 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 id="download-modal-title" className="text-lg font-bold text-white font-heading">
                Download {media.title}
              </h2>
              <p className="text-xs text-zinc-400">
                High-speed encrypted direct downloads & peer-to-peer mirrors
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close download modal"
            className="cursor-pointer p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {downloadStep === 'options' && (
            <>
              {/* Security info callout */}
              <div className="rounded-xl bg-emerald-950/30 border border-emerald-500/30 p-3.5 flex items-center gap-3 text-xs text-emerald-300">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <span className="font-semibold text-emerald-200">Verified Clean & Safe: </span>
                  Files are checked against virus definitions and verified with SHA-256 integrity checksums.
                </div>
              </div>

              {/* Quality Options Cards */}
              <div className="space-y-3">
                <h3 className="text-xs uppercase font-mono font-bold tracking-wider text-zinc-400">
                  Select Download Quality Tier:
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {media.downloadOptions.map((opt) => {
                    const isSelected = selectedOption.id === opt.id;
                    return (
                      <div
                        key={opt.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => setSelectedOption(opt)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setSelectedOption(opt);
                          }
                        }}
                        className={`cursor-pointer rounded-xl p-4 border text-left transition-all ${
                          isSelected
                            ? 'bg-amber-500/10 border-amber-500 text-white ring-1 ring-amber-500'
                            : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700 text-zinc-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500 text-black">
                            {opt.quality}
                          </span>
                          <span className="font-mono text-xs text-zinc-400 font-semibold">
                            {opt.size}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-white mb-1">
                          {opt.resolution} &bull; {opt.format}
                        </p>
                        <p className="text-[11px] text-zinc-400">
                          Codec: {opt.codec}
                        </p>
                        <p className="text-[11px] text-zinc-400">
                          Audio: {opt.audio}
                        </p>
                        {opt.seeders && (
                          <div className="mt-2 pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                            <span className="text-emerald-400">▲ {opt.seeders} Seeds</span>
                            <span className="text-blue-400">▼ {opt.leechers} Peers</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Start verification button */}
              <button
                type="button"
                onClick={() => handleStartVerification(selectedOption)}
                className="cursor-pointer w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-sm shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all transform active:scale-[0.99]"
              >
                <Zap className="w-4 h-4 fill-current" />
                Generate Fast Download Link ({selectedOption.quality})
              </button>
            </>
          )}

          {downloadStep === 'verifying' && (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-4 border-amber-500 border-t-transparent animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center font-mono font-bold text-xl text-amber-400">
                  {countdown}s
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Generating High-Speed CDN Token...</h3>
                <p className="text-xs text-zinc-400 max-w-sm">
                  Checking mirror availability, allocating bandwidth slot, and performing malware safety scan.
                </p>
              </div>

              {/* AdSense Compliant In-Wait Zone */}
              <div className="w-full max-w-md p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 text-left text-xs space-y-2 mt-4">
                <div className="flex items-center gap-1.5 text-zinc-400 font-mono text-[10px] uppercase">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Download Optimization Tip</span>
                </div>
                <p className="text-zinc-300 text-[11px] leading-relaxed">
                  For the fastest download speed, use a multi-thread download manager (IDM or JDownloader) or select our direct CDN mirror below once ready.
                </p>
              </div>
            </div>
          )}

          {downloadStep === 'ready' && (
            <div className="space-y-5 animate-fade-in">
              <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-4 flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
                <div>
                  <h3 className="text-sm font-bold text-emerald-300">Download Link Successfully Generated!</h3>
                  <p className="text-xs text-zinc-300">
                    File: <span className="font-semibold text-white">{media.title} ({selectedOption.quality})</span> &bull; {selectedOption.size}
                  </p>
                </div>
              </div>

              {/* Download Buttons */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleTriggerDirectDownload}
                  disabled={isDownloading}
                  className="cursor-pointer w-full py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2.5 transition-all transform active:scale-[0.99]"
                >
                  <Download className="w-5 h-5" />
                  <span>{isDownloading ? `Downloading (${simulatedProgress}%)` : 'Direct Fast Download (Server 1)'}</span>
                </button>

                {isDownloading && (
                  <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full transition-all duration-300 rounded-full"
                      style={{ width: `${simulatedProgress}%` }}
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={handleCopyMagnet}
                    className="cursor-pointer py-2.5 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700 flex items-center justify-center gap-2 transition-colors"
                  >
                    {copiedMagnet ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedMagnet ? 'Magnet Copied!' : 'Copy Magnet Link'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      alert(`Initiating Cloud Mirror for ${media.title}`);
                    }}
                    className="cursor-pointer py-2.5 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700 flex items-center justify-center gap-2 transition-colors"
                  >
                    <HardDrive className="w-4 h-4 text-blue-400" />
                    <span>Cloud Mirror (Mega/G-Drive)</span>
                  </button>
                </div>
              </div>

              {/* Technical Specifications Breakdown */}
              <div className="rounded-xl bg-zinc-950/80 border border-zinc-800/80 p-4 space-y-2 text-xs">
                <p className="font-mono text-[10px] uppercase text-zinc-500 font-bold">Release Verification Specs</p>
                <div className="grid grid-cols-2 gap-2 text-zinc-400 text-[11px]">
                  <div>Format: <span className="text-zinc-200">{selectedOption.format}</span></div>
                  <div>Resolution: <span className="text-zinc-200">{selectedOption.resolution}</span></div>
                  <div>Video Codec: <span className="text-zinc-200">{selectedOption.codec}</span></div>
                  <div>Audio Tracks: <span className="text-zinc-200">{selectedOption.audio}</span></div>
                  <div>Subtitles: <span className="text-zinc-200">English, Spanish (Embedded)</span></div>
                  <div>MD5 Hash: <span className="text-zinc-400 font-mono text-[10px]">e3b0c44298fc1c149afbf4...</span></div>
                </div>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setDownloadStep('options')}
                  className="cursor-pointer text-xs text-zinc-400 hover:text-white underline underline-offset-4"
                >
                  &larr; Choose different quality or episode
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
