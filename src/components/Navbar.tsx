import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bookmark,
  Menu,
  X,
  Play,
  Film,
  Tv,
  Sparkles,
  TrendingUp,
  Star,
  PlusCircle,
  FileCode,
  ShieldAlert,
  Lock,
  Sliders
} from 'lucide-react';
import { MediaItem } from '../types';
import { MOCK_MEDIA } from '../data/mockMedia';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onSelectMedia: (media: MediaItem) => void;
  watchlistCount: number;
  onRequestOpen: () => void;
  onOpenSitemap: () => void;
  onOpenLegal: (page: import('../types').LegalPageType) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onSelectMedia,
  watchlistCount,
  onRequestOpen,
  onOpenSitemap,
  onOpenLegal,
  searchQuery,
  onSearchChange
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Auto-suggest matches
  const suggestions = searchQuery.trim().length > 1
    ? MOCK_MEDIA.filter((m) =>
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.genres.some((g) => g.toLowerCase().includes(searchQuery.toLowerCase()))
      ).slice(0, 5)
    : [];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { id: 'home', label: 'Home', icon: <Play className="w-3.5 h-3.5" /> },
    { id: 'movies', label: 'Movies', icon: <Film className="w-3.5 h-3.5" /> },
    { id: 'tv', label: 'TV Shows', icon: <Tv className="w-3.5 h-3.5" /> },
    { id: 'anime', label: 'Anime', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: 'top-imdb', label: 'Top IMDb', icon: <Star className="w-3.5 h-3.5" /> },
    { id: 'trending', label: 'Trending', icon: <TrendingUp className="w-3.5 h-3.5" /> },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => onSelectTab('home')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSelectTab('home');
            }
          }}
          className="cursor-pointer flex items-center gap-2.5 shrink-0 group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-600 flex items-center justify-center text-black font-black text-xl shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
            <Play className="w-5 h-5 fill-black ml-0.5" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-xl tracking-tight text-white font-heading flex items-center">
              PUNK<span className="text-amber-400">SHOP</span>
              <span className="ml-1.5 px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                PRO
              </span>
            </span>
          </div>
        </div>

        {/* Desktop Nav Links */}
        <nav aria-label="Main Navigation" className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = currentTab === link.id;
            return (
              <button
                key={link.id}
                type="button"
                onClick={() => onSelectTab(link.id)}
                className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  isActive
                    ? 'bg-amber-500 text-black shadow-sm'
                    : 'text-zinc-300 hover:text-white hover:bg-zinc-800/70'
                }`}
              >
                {link.icon}
                <span>{link.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Global Instant Search Bar */}
        <div ref={searchContainerRef} className="relative flex-1 max-w-xs md:max-w-sm hidden sm:block">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search movies, TV shows, anime..."
              value={searchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onChange={(e) => {
                onSearchChange(e.target.value);
                setIsSearchFocused(true);
              }}
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="cursor-pointer absolute right-2.5 p-1 text-zinc-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Auto-suggest dropdown */}
          {isSearchFocused && suggestions.length > 0 && (
            <div className="absolute top-11 left-0 right-0 rounded-xl glass-dropdown p-2 shadow-2xl z-50 border border-zinc-700 space-y-1">
              <div className="px-2 py-1 text-[10px] uppercase font-mono font-bold text-zinc-400">
                Top Matches:
              </div>
              {suggestions.map((item) => (
                <div
                  key={item.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    onSelectMedia(item);
                    setIsSearchFocused(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectMedia(item);
                      setIsSearchFocused(false);
                    }
                  }}
                  className="cursor-pointer p-2 rounded-lg flex items-center gap-3 hover:bg-zinc-800/80 transition-colors text-left"
                >
                  <img
                    src={item.posterUrl}
                    alt={item.title}
                    className="w-8 h-11 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate">{item.title}</p>
                    <p className="text-[10px] text-zinc-400 flex items-center gap-1.5 mt-0.5">
                      <span className="text-amber-400 font-semibold">{item.quality}</span>
                      <span>&bull;</span>
                      <span>{item.releaseYear}</span>
                      <span>&bull;</span>
                      <span className="capitalize">{item.type}</span>
                    </p>
                  </div>
                  <span className="text-amber-400 font-bold text-xs">★ {item.rating}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Request Button */}
          <button
            type="button"
            onClick={onRequestOpen}
            className="cursor-pointer hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold border border-zinc-800 transition-colors"
            title="Request a movie or show"
          >
            <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Request</span>
          </button>

          {/* Watchlist / Library Button */}
          <button
            type="button"
            onClick={() => onSelectTab('library')}
            aria-label={`My Library (${watchlistCount} items)`}
            className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              currentTab === 'library'
                ? 'bg-amber-500 text-black'
                : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800'
            }`}
            title="My Watchlist & History"
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">My Library</span>
            {watchlistCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                currentTab === 'library' ? 'bg-black text-amber-400' : 'bg-amber-500 text-black'
              }`}>
                {watchlistCount}
              </span>
            )}
          </button>

          {/* Admin Panel Button */}
          <button
            type="button"
            onClick={() => onSelectTab('admin')}
            aria-label="Admin Panel"
            className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              currentTab === 'admin'
                ? 'bg-amber-500 text-black shadow-md font-bold'
                : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 hover:border-amber-500/50 hover:text-amber-400'
            }`}
            title="Administrator Portal"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Admin</span>
          </button>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="cursor-pointer lg:hidden p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-zinc-950 border-b border-zinc-800 p-4 space-y-4 animate-fade-in">
          {/* Mobile Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search movies, TV shows..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Mobile Nav Links */}
          <div className="grid grid-cols-2 gap-2">
            {navLinks.map((link) => (
              <button
                key={link.id}
                type="button"
                onClick={() => {
                  onSelectTab(link.id);
                  setMobileMenuOpen(false);
                }}
                className={`cursor-pointer px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                  currentTab === link.id
                    ? 'bg-amber-500 text-black'
                    : 'bg-zinc-900 text-zinc-300 hover:text-white'
                }`}
              >
                {link.icon}
                <span>{link.label}</span>
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => {
                onRequestOpen();
                setMobileMenuOpen(false);
              }}
              className="cursor-pointer text-amber-400 font-semibold flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Request Content</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onOpenSitemap();
                setMobileMenuOpen(false);
              }}
              className="cursor-pointer text-zinc-400 hover:text-white flex items-center gap-1"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>XML Sitemap</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onSelectTab('admin');
                setMobileMenuOpen(false);
              }}
              className="cursor-pointer text-amber-400 font-bold flex items-center gap-1"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Admin Panel</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
