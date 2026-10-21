import React from 'react';
import { Play, Download, Star, Bookmark, Check } from 'lucide-react';
import { MediaItem } from '../types';

interface MediaCardProps {
  media: MediaItem;
  onSelect: (media: MediaItem) => void;
  onDownload: (media: MediaItem) => void;
  isWatchlisted?: boolean;
  onToggleWatchlist?: (media: MediaItem) => void;
}

export const MediaCard: React.FC<MediaCardProps> = ({
  media,
  onSelect,
  onDownload,
  isWatchlisted = false,
  onToggleWatchlist
}) => {
  return (
    <article className="group relative flex flex-col rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800/80 hover:border-amber-500/50 hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300">
      {/* Poster Image Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-zinc-950">
        <img
          src={media.posterUrl}
          alt={`${media.title} Poster`}
          loading="lazy"
          className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-105"
        />

        {/* Top Badges */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-black shadow-md uppercase tracking-wider">
            {media.quality}
          </span>
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/75 backdrop-blur-sm text-[11px] font-bold text-amber-400 border border-amber-500/20">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span>{media.rating}</span>
          </div>
        </div>

        {/* Hover Action Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3.5 gap-2">
          <div className="flex items-center justify-center gap-2 mb-2">
            <button
              type="button"
              onClick={() => onSelect(media)}
              aria-label={`Stream ${media.title}`}
              className="cursor-pointer w-10 h-10 rounded-full bg-amber-500 text-black flex items-center justify-center shadow-lg hover:bg-amber-400 transform hover:scale-110 transition-all"
              title="Stream Now"
            >
              <Play className="w-5 h-5 fill-current ml-0.5" />
            </button>
            <button
              type="button"
              onClick={() => onDownload(media)}
              aria-label={`Download ${media.title}`}
              className="cursor-pointer w-10 h-10 rounded-full bg-zinc-800 text-white flex items-center justify-center shadow-lg hover:bg-zinc-700 hover:text-amber-400 border border-zinc-700 transform hover:scale-110 transition-all"
              title="Download Options"
            >
              <Download className="w-4 h-4" />
            </button>
            {onToggleWatchlist && (
              <button
                type="button"
                onClick={() => onToggleWatchlist(media)}
                aria-label={isWatchlisted ? `Remove ${media.title} from watchlist` : `Add ${media.title} to watchlist`}
                className={`cursor-pointer w-10 h-10 rounded-full flex items-center justify-center shadow-lg border transform hover:scale-110 transition-all ${
                  isWatchlisted
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/50'
                    : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:text-white'
                }`}
                title={isWatchlisted ? 'In Watchlist' : 'Add to Watchlist'}
              >
                {isWatchlisted ? <Check className="w-4 h-4 text-amber-400" /> : <Bookmark className="w-4 h-4" />}
              </button>
            )}
          </div>

          <p className="text-[11px] text-zinc-300 line-clamp-2 leading-relaxed hidden sm:block">
            {media.overview}
          </p>
        </div>
      </div>

      {/* Meta info below poster */}
      <div className="p-3 flex flex-col flex-1 justify-between bg-zinc-900/90">
        <div>
          <h3
            role="button"
            tabIndex={0}
            onClick={() => onSelect(media)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect(media);
              }
            }}
            className="cursor-pointer text-sm font-bold text-white group-hover:text-amber-400 line-clamp-1 transition-colors text-left"
            title={media.title}
          >
            {media.title}
          </h3>
          <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-1">
            <span>{media.releaseYear}</span>
            <span>&bull;</span>
            <span className="uppercase text-[10px] font-semibold text-zinc-300 px-1 py-0.2 rounded bg-zinc-800">
              {media.type === 'tv' ? 'TV Series' : media.type === 'anime' ? 'Anime' : 'Movie'}
            </span>
            <span>&bull;</span>
            <span>{media.duration}</span>
          </div>
        </div>

        <div className="mt-2 flex flex-wrap gap-1">
          {media.genres.slice(0, 2).map((g) => (
            <span key={g} className="text-[10px] text-zinc-400 px-1.5 py-0.5 rounded bg-zinc-800/80">
              {g}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
};
