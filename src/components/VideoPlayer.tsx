import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  RotateCw,
  Settings,
  Server,
  Tv,
  Subtitles,
  Moon,
  Sun,
  Radio,
  ExternalLink
} from 'lucide-react';
import { StreamServer } from '../types';

interface VideoPlayerProps {
  title: string;
  videoUrl: string;
  posterUrl: string;
  servers: StreamServer[];
  onServerChange?: (server: StreamServer) => void;
  onNextEpisode?: () => void;
  hasNextEpisode?: boolean;
  mediaId: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  title,
  videoUrl,
  posterUrl,
  servers,
  onServerChange,
  onNextEpisode,
  hasNextEpisode = false,
  mediaId,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isTheater, setIsTheater] = useState<boolean>(false);
  const [lightsOff, setLightsOff] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [selectedQuality, setSelectedQuality] = useState<string>('1080p FHD');
  const [selectedServer, setSelectedServer] = useState<string>(servers[0]?.id || '');
  const [activeSubtitle, setActiveSubtitle] = useState<string>('English');
  const [showSettingsMenu, setShowSettingsMenu] = useState<boolean>(false);
  const [isBuffering, setIsBuffering] = useState<boolean>(false);

  // Resume last playback time from localStorage
  useEffect(() => {
    const savedTime = localStorage.getItem(`flixcha_resume_${mediaId}`);
    if (savedTime && videoRef.current) {
      const parsed = parseFloat(savedTime);
      if (!isNaN(parsed) && parsed > 5) {
        videoRef.current.currentTime = parsed;
        setCurrentTime(parsed);
      }
    }
  }, [mediaId, videoUrl]);

  // Save playback time periodically
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const curr = videoRef.current.currentTime;
      setCurrentTime(curr);
      if (Math.floor(curr) % 5 === 0) {
        localStorage.setItem(`flixcha_resume_${mediaId}`, curr.toString());
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = targetTime;
      setCurrentTime(targetTime);
    }
  };

  const skipTime = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(Math.max(videoRef.current.currentTime + seconds, 0), duration);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    videoRef.current.muted = nextMuted;
    if (!nextMuted && volume === 0) {
      setVolume(0.5);
      videoRef.current.volume = 0.5;
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const togglePiP = async () => {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (videoRef.current.requestPictureInPicture) {
        await videoRef.current.requestPictureInPicture();
      }
    } catch {
      // PiP not supported or disallowed
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    setShowSettingsMenu(false);
  };

  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
        setShowSettingsMenu(false);
      }, 3000);
    }
  }, [isPlaying]);

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, []);

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '00:00';
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    if (h > 0) {
      return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    }
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <section aria-label="Media Player" className="w-full flex flex-col gap-3">
      {/* Lights Off Backdrop */}
      {lightsOff && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Exit theater mode dimming"
          onClick={() => setLightsOff(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setLightsOff(false);
            }
          }}
          className="fixed inset-0 z-40 bg-black/90 transition-opacity backdrop-blur-sm cursor-pointer"
        />
      )}

      {/* Main Player Box */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => isPlaying && setShowControls(false)}
        className={`relative w-full rounded-2xl overflow-hidden bg-black border border-zinc-800 shadow-2xl transition-all ${
          lightsOff ? 'z-50 ring-2 ring-amber-500/50' : ''
        } ${isTheater ? 'aspect-video lg:aspect-[21/9]' : 'aspect-video'}`}
      >
        <video
          ref={videoRef}
          src={videoUrl}
          poster={posterUrl}
          className="w-full h-full object-contain cursor-pointer"
          onClick={togglePlay}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onWaiting={() => setIsBuffering(true)}
          onPlaying={() => {
            setIsBuffering(false);
            setIsPlaying(true);
          }}
          onPause={() => setIsPlaying(false)}
          playsInline
        />

        {/* Buffering Indicator */}
        {isBuffering && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/40">
            <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Big Center Play Button Overlay when paused */}
        {!isPlaying && !isBuffering && (
          <div
            role="button"
            tabIndex={0}
            aria-label="Play video"
            onClick={togglePlay}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                togglePlay();
              }
            }}
            className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer group"
          >
            <div className="w-20 h-20 rounded-full bg-amber-500/90 text-black flex items-center justify-center shadow-2xl transform transition-transform group-hover:scale-110">
              <Play className="w-9 h-9 fill-current ml-1" />
            </div>
          </div>
        )}

        {/* Top Floating Badge Bar */}
        <div
          className={`absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-center justify-between transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-500 text-black uppercase tracking-wider">
              {selectedQuality}
            </span>
            <h2 className="text-sm font-semibold text-white drop-shadow truncate max-w-xs sm:max-w-md">
              {title}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setLightsOff(!lightsOff)}
              title={lightsOff ? 'Lights On' : 'Turn Off Lights'}
              className="cursor-pointer p-1.5 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-amber-400 border border-zinc-700/50 transition-colors text-xs flex items-center gap-1.5"
            >
              {lightsOff ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{lightsOff ? 'Lights On' : 'Lights Off'}</span>
            </button>
            <button
              type="button"
              onClick={() => setIsTheater(!isTheater)}
              title="Theater Mode"
              className={`cursor-pointer p-1.5 rounded-lg border text-xs flex items-center gap-1.5 transition-colors ${
                isTheater
                  ? 'bg-amber-500 text-black border-amber-400'
                  : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 border-zinc-700/50'
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Theater</span>
            </button>
          </div>
        </div>

        {/* Bottom Control Bar */}
        <div
          className={`absolute bottom-0 left-0 right-0 px-4 py-3 bg-gradient-to-t from-black/95 via-black/70 to-transparent flex flex-col gap-2 transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          {/* Progress Slider */}
          <div className="relative w-full flex items-center group">
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={0.1}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer group-hover:h-2 transition-all"
            />
          </div>

          {/* Controls Row */}
          <div className="flex items-center justify-between text-zinc-200 text-xs">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={togglePlay}
                className="cursor-pointer p-1 hover:text-amber-400 transition-colors"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
              </button>

              <button
                type="button"
                onClick={() => skipTime(-10)}
                className="cursor-pointer p-1 hover:text-amber-400 transition-colors"
                title="Rewind 10 seconds"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => skipTime(10)}
                className="cursor-pointer p-1 hover:text-amber-400 transition-colors"
                title="Fast forward 10 seconds"
              >
                <RotateCw className="w-4 h-4" />
              </button>

              {/* Volume */}
              <div className="flex items-center gap-1.5 group">
                <button
                  type="button"
                  onClick={toggleMute}
                  className="cursor-pointer p-1 hover:text-amber-400 transition-colors"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-14 sm:w-20 h-1 bg-zinc-700 rounded cursor-pointer hidden sm:block"
                />
              </div>

              {/* Time display */}
              <div className="font-mono text-[11px] text-zinc-400 ml-1">
                <span className="text-white">{formatTime(currentTime)}</span> / {formatTime(duration)}
              </div>
            </div>

            {/* Right side controls */}
            <div className="flex items-center gap-2 sm:gap-3">
              {hasNextEpisode && (
                <button
                  type="button"
                  onClick={onNextEpisode}
                  className="cursor-pointer px-2.5 py-1 rounded bg-amber-500/20 text-amber-400 hover:bg-amber-500 hover:text-black font-semibold text-[11px] border border-amber-500/30 transition-colors"
                >
                  Next Episode &rarr;
                </button>
              )}

              {/* Settings / Speed Popover */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                  className="cursor-pointer p-1.5 hover:text-amber-400 transition-colors"
                  title="Playback Settings"
                >
                  <Settings className="w-4 h-4" />
                </button>

                {showSettingsMenu && (
                  <div className="absolute bottom-9 right-0 w-48 rounded-xl glass-dropdown p-3 text-xs shadow-2xl z-50 flex flex-col gap-2.5">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider mb-1.5">Speed</p>
                      <div className="grid grid-cols-4 gap-1">
                        {[0.75, 1, 1.25, 1.5].map((speed) => (
                          <button
                            key={speed}
                            type="button"
                            onClick={() => handleSpeedChange(speed)}
                            className={`cursor-pointer px-1 py-1 rounded text-[11px] font-mono text-center transition-colors ${
                              playbackSpeed === speed
                                ? 'bg-amber-500 text-black font-bold'
                                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                            }`}
                          >
                            {speed}x
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-zinc-800 pt-2">
                      <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider mb-1.5">Resolution</p>
                      <div className="flex flex-col gap-1">
                        {['4K UHD', '1080p FHD', '720p HD'].map((q) => (
                          <button
                            key={q}
                            type="button"
                            onClick={() => {
                              setSelectedQuality(q);
                              setShowSettingsMenu(false);
                            }}
                            className={`cursor-pointer text-left px-2 py-1 rounded text-xs flex items-center justify-between ${
                              selectedQuality === q ? 'text-amber-400 font-bold bg-amber-500/10' : 'text-zinc-300 hover:bg-zinc-800'
                            }`}
                          >
                            <span>{q}</span>
                            {selectedQuality === q && <span className="text-amber-400 text-xs">✓</span>}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-zinc-800 pt-2">
                      <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider mb-1.5">Subtitles</p>
                      <div className="flex flex-col gap-1">
                        {['Off', 'English', 'Spanish'].map((sub) => (
                          <button
                            key={sub}
                            type="button"
                            onClick={() => {
                              setActiveSubtitle(sub);
                              setShowSettingsMenu(false);
                            }}
                            className={`cursor-pointer text-left px-2 py-1 rounded text-xs flex items-center justify-between ${
                              activeSubtitle === sub ? 'text-amber-400 font-bold bg-amber-500/10' : 'text-zinc-300 hover:bg-zinc-800'
                            }`}
                          >
                            <span>{sub}</span>
                            {activeSubtitle === sub && <span className="text-amber-400 text-xs">✓</span>}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Subtitles shortcut */}
              <button
                type="button"
                onClick={() => setActiveSubtitle(activeSubtitle === 'Off' ? 'English' : 'Off')}
                title={`Subtitles: ${activeSubtitle}`}
                className={`cursor-pointer p-1.5 transition-colors ${
                  activeSubtitle !== 'Off' ? 'text-amber-400 font-bold' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Subtitles className="w-4 h-4" />
              </button>

              {/* PiP */}
              <button
                type="button"
                onClick={togglePiP}
                className="cursor-pointer p-1.5 text-zinc-400 hover:text-white transition-colors hidden sm:block"
                title="Picture-in-Picture"
              >
                <ExternalLink className="w-4 h-4" />
              </button>

              {/* Fullscreen */}
              <button
                type="button"
                onClick={toggleFullscreen}
                className="cursor-pointer p-1.5 hover:text-amber-400 transition-colors"
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              >
                {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Streaming Server Switcher Bar */}
      <div className="w-full rounded-xl bg-zinc-900/70 border border-zinc-800/80 p-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <div className="flex items-center gap-1.5 text-xs text-zinc-300 font-medium">
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
            <span>Streaming Servers:</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {servers.map((srv) => {
            const isCurrent = selectedServer === srv.id;
            return (
              <button
                key={srv.id}
                type="button"
                onClick={() => {
                  setSelectedServer(srv.id);
                  if (onServerChange) onServerChange(srv);
                }}
                className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                  isCurrent
                    ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20 font-semibold'
                    : 'bg-zinc-800/90 text-zinc-300 hover:bg-zinc-700/80 hover:text-white border border-zinc-700/50'
                }`}
              >
                <Server className="w-3 h-3" />
                <span>{srv.name}</span>
                <span className={`text-[10px] px-1 py-0.2 rounded font-mono ${isCurrent ? 'bg-black/20 text-black' : 'bg-zinc-900 text-zinc-400'}`}>
                  {srv.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
