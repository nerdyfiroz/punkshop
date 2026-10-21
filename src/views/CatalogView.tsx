import React from 'react';
import { Filter, SlidersHorizontal, RotateCcw, Search, Film } from 'lucide-react';
import { MediaItem, FilterState } from '../types';
import { MediaCard } from '../components/MediaCard';
import { GENRES_LIST, YEARS_LIST, QUALITY_LIST, SORT_OPTIONS } from '../data/mockMedia';
import { AdSenseBanner } from '../components/AdSenseBanner';

interface CatalogViewProps {
  mediaList: MediaItem[];
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onResetFilters: () => void;
  onSelectMedia: (media: MediaItem) => void;
  onDownloadMedia: (media: MediaItem) => void;
  watchlist: string[];
  onToggleWatchlist: (media: MediaItem) => void;
  onRequestOpen: () => void;
  title?: string;
}

export const CatalogView: React.FC<CatalogViewProps> = ({
  mediaList,
  filters,
  onFilterChange,
  onResetFilters,
  onSelectMedia,
  onDownloadMedia,
  watchlist,
  onToggleWatchlist,
  onRequestOpen,
  title = 'Browse Entertainment Catalog'
}) => {
  // Apply dynamic filtering
  const filtered = mediaList
    .filter((item) => {
      // Type
      if (filters.type && filters.type !== 'all' && item.type !== filters.type) {
        return false;
      }
      // Genre
      if (
        filters.genre &&
        filters.genre !== 'All Genres' &&
        !item.genres.some((g) => g.toLowerCase() === filters.genre.toLowerCase())
      ) {
        return false;
      }
      // Year
      if (filters.year && filters.year !== 'All Years') {
        if (filters.year === 'Older' && item.releaseYear >= 2022) return false;
        if (filters.year !== 'Older' && item.releaseYear.toString() !== filters.year) return false;
      }
      // Quality
      if (filters.quality && filters.quality !== 'All Qualities' && item.quality !== filters.quality) {
        return false;
      }
      // Search query
      if (filters.query) {
        const q = filters.query.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesGenre = item.genres.some((g) => g.toLowerCase().includes(q));
        const matchesActor = item.cast.some((c) => c.name.toLowerCase().includes(q));
        if (!matchesTitle && !matchesGenre && !matchesActor) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (filters.sortBy === 'rating') return b.rating - a.rating;
      if (filters.sortBy === 'latest') return b.releaseYear - a.releaseYear;
      if (filters.sortBy === 'downloads') return b.downloadsCount - a.downloadsCount;
      if (filters.sortBy === 'views') return b.views - a.views;
      // Default trending
      return (b.isTrending ? 1 : 0) - (a.isTrending ? 1 : 0);
    });

  return (
    <div className="w-full space-y-6 pb-16">
      {/* Header and Filter Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
          <div>
            <h1 className="text-2xl font-black text-white font-heading">{title}</h1>
            <p className="text-xs text-zinc-400 mt-1">
              Showing <span className="text-amber-400 font-semibold">{filtered.length}</span> titles matching your criteria
            </p>
          </div>

          <button
            type="button"
            onClick={onResetFilters}
            className="cursor-pointer text-xs text-zinc-400 hover:text-white flex items-center gap-1.5 self-start sm:self-auto transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Filters</span>
          </button>
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800">
          {/* Content Type */}
          <div>
            <label htmlFor="filter-content-type" className="block text-[10px] uppercase font-mono font-bold text-zinc-400 mb-1">Type</label>
            <select
              id="filter-content-type"
              value={filters.type}
              onChange={(e) => onFilterChange({ ...filters, type: e.target.value })}
              className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
            >
              <option value="all">All Types</option>
              <option value="movie">Movies</option>
              <option value="tv">TV Shows</option>
              <option value="anime">Anime</option>
            </select>
          </div>

          {/* Genre */}
          <div>
            <label htmlFor="filter-genre-type" className="block text-[10px] uppercase font-mono font-bold text-zinc-400 mb-1">Genre</label>
            <select
              id="filter-genre-type"
              value={filters.genre}
              onChange={(e) => onFilterChange({ ...filters, genre: e.target.value })}
              className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
            >
              {GENRES_LIST.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          {/* Year */}
          <div>
            <label htmlFor="filter-release-year" className="block text-[10px] uppercase font-mono font-bold text-zinc-400 mb-1">Year</label>
            <select
              id="filter-release-year"
              value={filters.year}
              onChange={(e) => onFilterChange({ ...filters, year: e.target.value })}
              className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
            >
              {YEARS_LIST.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* Quality */}
          <div>
            <label htmlFor="filter-video-quality" className="block text-[10px] uppercase font-mono font-bold text-zinc-400 mb-1">Quality</label>
            <select
              id="filter-video-quality"
              value={filters.quality}
              onChange={(e) => onFilterChange({ ...filters, quality: e.target.value })}
              className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
            >
              {QUALITY_LIST.map((q) => (
                <option key={q} value={q}>
                  {q}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="col-span-2 sm:col-span-1">
            <label htmlFor="filter-sort-order" className="block text-[10px] uppercase font-mono font-bold text-zinc-400 mb-1">Sort By</label>
            <select
              id="filter-sort-order"
              value={filters.sortBy}
              onChange={(e) => onFilterChange({ ...filters, sortBy: e.target.value })}
              className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
            >
              {SORT_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Leaderboard AdSense Slot */}
      <AdSenseBanner slotType="leaderboard" slotId="pub-catalog-top" />

      {/* Media Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((item) => (
            <MediaCard
              key={item.id}
              media={item}
              onSelect={onSelectMedia}
              onDownload={onDownloadMedia}
              isWatchlisted={watchlist.includes(item.id)}
              onToggleWatchlist={onToggleWatchlist}
            />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center rounded-2xl bg-zinc-900/40 border border-zinc-800 p-8 space-y-4">
          <Film className="w-12 h-12 text-zinc-600 mx-auto" />
          <h2 className="text-lg font-bold text-white">No titles match your active filters</h2>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            Try adjusting your genre or year selection, or submit a request for this specific title to our indexing team.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={onResetFilters}
              className="cursor-pointer px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold"
            >
              Clear Filters
            </button>
            <button
              type="button"
              onClick={onRequestOpen}
              className="cursor-pointer px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold"
            >
              Request Title
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
