import React, { useState, useEffect } from 'react';
import { Bookmark, Clock, Film, Play, Download, Trash2, CheckCircle2 } from 'lucide-react';
import { MediaItem } from '../types';
import { MediaCard } from '../components/MediaCard';

interface LibraryViewProps {
  allMedia: MediaItem[];
  watchlist: string[];
  onToggleWatchlist: (media: MediaItem) => void;
  onSelectMedia: (media: MediaItem) => void;
  onDownloadMedia: (media: MediaItem) => void;
  onExplore: () => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  allMedia,
  watchlist,
  onToggleWatchlist,
  onSelectMedia,
  onDownloadMedia,
  onExplore
}) => {
  const [tab, setTab] = useState<'watchlist' | 'history' | 'requests'>('watchlist');
  const [requests, setRequests] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('flixcha_movie_requests');
    if (saved) {
      try {
        setRequests(JSON.parse(saved));
      } catch {
        // ignore
      }
    }
  }, []);

  const watchlistedMedia = allMedia.filter((m) => watchlist.includes(m.id));

  // Determine which media have saved playback progress
  const historyMedia = allMedia
    .map((m) => {
      const savedTime = localStorage.getItem(`flixcha_resume_${m.id}`);
      const progress = savedTime ? parseFloat(savedTime) : 0;
      return { media: m, progress };
    })
    .filter((item) => item.progress > 5);

  const clearHistory = () => {
    historyMedia.forEach((h) => {
      localStorage.removeItem(`flixcha_resume_${h.media.id}`);
    });
    window.location.reload();
  };

  return (
    <div className="w-full space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white font-heading">My Personal Library</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Access your saved watchlists, resume playback history, and track movie requests.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-xl p-1 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setTab('watchlist')}
            className={`cursor-pointer px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              tab === 'watchlist' ? 'bg-amber-500 text-black' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Watchlist ({watchlistedMedia.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setTab('history')}
            className={`cursor-pointer px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              tab === 'history' ? 'bg-amber-500 text-black' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Continue Watching ({historyMedia.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setTab('requests')}
            className={`cursor-pointer px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              tab === 'requests' ? 'bg-amber-500 text-black' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Requests ({requests.length})</span>
          </button>
        </div>
      </div>

      {/* Watchlist Tab */}
      {tab === 'watchlist' && (
        <div>
          {watchlistedMedia.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {watchlistedMedia.map((item) => (
                <MediaCard
                  key={item.id}
                  media={item}
                  onSelect={onSelectMedia}
                  onDownload={onDownloadMedia}
                  isWatchlisted={true}
                  onToggleWatchlist={onToggleWatchlist}
                />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center rounded-2xl bg-zinc-900/40 border border-zinc-800 p-8 space-y-4">
              <Bookmark className="w-12 h-12 text-zinc-600 mx-auto" />
              <h2 className="text-lg font-bold text-white">Your Watchlist is Empty</h2>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                Explore our catalog of 4K and 1080p movies and click the bookmark icon to save titles for later.
              </p>
              <button
                type="button"
                onClick={onExplore}
                className="cursor-pointer px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all shadow-md"
              >
                Explore Trending Titles
              </button>
            </div>
          )}
        </div>
      )}

      {/* History Tab */}
      {tab === 'history' && (
        <div className="space-y-4">
          {historyMedia.length > 0 && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={clearHistory}
                className="cursor-pointer text-xs text-zinc-400 hover:text-red-400 flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Playback History</span>
              </button>
            </div>
          )}

          {historyMedia.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {historyMedia.map(({ media, progress }) => (
                <div
                  key={media.id}
                  className="rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 flex flex-col justify-between"
                >
                  <div className="relative aspect-video w-full bg-zinc-950">
                    <img
                      src={media.backdropUrl}
                      alt={media.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => onSelectMedia(media)}
                        aria-label={`Resume watching ${media.title}`}
                        className="cursor-pointer w-12 h-12 rounded-full bg-amber-500 text-black flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                      >
                        <Play className="w-5 h-5 fill-black ml-0.5" />
                      </button>
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <h2 className="text-sm font-bold text-white truncate">{media.title}</h2>
                      <span className="text-[10px] text-amber-400 font-mono font-bold">
                        {Math.floor(progress / 60)}m watched
                      </span>
                    </div>

                    <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full" style={{ width: '45%' }} />
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <button
                        type="button"
                        onClick={() => onSelectMedia(media)}
                        className="cursor-pointer text-xs font-semibold text-amber-400 hover:underline flex items-center gap-1"
                      >
                        <span>Resume Playback &rarr;</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onDownloadMedia(media)}
                        className="cursor-pointer text-xs text-zinc-400 hover:text-white"
                      >
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center rounded-2xl bg-zinc-900/40 border border-zinc-800 p-8 space-y-4">
              <Clock className="w-12 h-12 text-zinc-600 mx-auto" />
              <h2 className="text-lg font-bold text-white">No Stream History Found</h2>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                Videos you play will automatically record your progress here so you can pick up exactly where you left off.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Requests Tab */}
      {tab === 'requests' && (
        <div>
          {requests.length > 0 ? (
            <div className="rounded-xl bg-zinc-900 border border-zinc-800 divide-y divide-zinc-800 overflow-hidden">
              {requests.map((r) => (
                <div key={r.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-bold text-white">{r.title}</h2>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Type: <span className="capitalize text-zinc-300">{r.type}</span> &bull; Year: {r.year} &bull; Submitted: {r.date}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      {r.status || 'In Encoding Queue'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center rounded-2xl bg-zinc-900/40 border border-zinc-800 p-8 space-y-4">
              <Film className="w-12 h-12 text-zinc-600 mx-auto" />
              <h2 className="text-lg font-bold text-white">No Pending Movie Requests</h2>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                Use our &quot;Request&quot; feature in the navbar to ask for any missing movie or TV show.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
