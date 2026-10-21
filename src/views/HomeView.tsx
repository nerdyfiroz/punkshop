import React, { useState } from 'react';
import {
  Play,
  Download,
  Star,
  Sparkles,
  TrendingUp,
  Film,
  Tv,
  ChevronRight,
  ShieldCheck,
  Zap,
  Globe2,
  HelpCircle,
  ChevronDown
} from 'lucide-react';
import { MediaItem } from '../types';
import { MediaCard } from '../components/MediaCard';
import { AdSenseBanner } from '../components/AdSenseBanner';

interface HomeViewProps {
  mediaList: MediaItem[];
  onSelectMedia: (media: MediaItem) => void;
  onDownloadMedia: (media: MediaItem) => void;
  onExploreCategory: (category: string) => void;
  watchlist: string[];
  onToggleWatchlist: (media: MediaItem) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  mediaList,
  onSelectMedia,
  onDownloadMedia,
  onExploreCategory,
  watchlist,
  onToggleWatchlist
}) => {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const featured = mediaList.find((m) => m.isFeatured) || mediaList[0];
  const trending = mediaList.filter((m) => m.isTrending);
  const movies = mediaList.filter((m) => m.type === 'movie');
  const tvSeries = mediaList.filter((m) => m.type === 'tv');
  const anime = mediaList.filter((m) => m.type === 'anime');

  const faqs = [
    {
      q: 'How do I stream or download videos on PunkShop?',
      a: 'Simply click on any movie or TV series card to begin streaming instantly on our fast HTML5 video player. To download for offline viewing, click the "Download" button to select your preferred resolution (4K, 1080p, 720p, or 480p mobile size).'
    },
    {
      q: 'Are the download links safe and free of malware?',
      a: 'Yes. All indexed downloads undergo automated checksum validation (SHA-256) and malware safety scans prior to generating direct CDN download URLs.'
    },
    {
      q: 'Is PunkShop compliant with Google AdSense guidelines?',
      a: 'PunkShop is designed from the ground up for full Google Publisher & AdSense eligibility. It features original human-written editorial reviews, comprehensive metadata, zero intrusive pop-unders, standard fixed-aspect ad units with zero CLS (Cumulative Layout Shift), and fully transparent DMCA and GDPR policies.'
    },
    {
      q: 'Can I watch with multilingual subtitles?',
      a: 'Yes! Our custom player and download packages provide soft and embedded subtitles in English, Spanish, French, German, Japanese, and more.'
    }
  ];

  return (
    <div className="w-full flex flex-col space-y-10 pb-12">
      {/* Hero Featured Backdrop Banner */}
      {featured && (
        <section aria-label="Featured Media" className="relative w-full min-h-[500px] md:min-h-[580px] flex items-end rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl bg-zinc-950">
          {/* Backdrop Image with gradient overlay */}
          <div className="absolute inset-0">
            <img
              src={featured.backdropUrl}
              alt={featured.title}
              className="w-full h-full object-cover object-center filter brightness-[0.65]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/40 to-transparent" />
          </div>

          {/* Hero Content */}
          <div className="relative z-10 p-6 md:p-12 max-w-3xl space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500 text-black uppercase tracking-wider flex items-center gap-1 shadow-md">
                <Sparkles className="w-3 h-3 fill-black" />
                Featured Premiere
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-zinc-800/90 text-white border border-zinc-700">
                {featured.quality}
              </span>
              <div className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-black/60 px-2 py-0.5 rounded-full border border-amber-500/30">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{featured.rating} IMDb</span>
              </div>
              <span className="text-xs text-zinc-300 font-medium">
                {featured.releaseYear} &bull; {featured.duration} &bull; {featured.ageRating}
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white font-heading tracking-tight drop-shadow-md leading-tight">
              {featured.title}
            </h1>

            <p className="text-zinc-300 text-sm md:text-base leading-relaxed line-clamp-3 max-w-2xl">
              {featured.overview}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => onSelectMedia(featured)}
                className="cursor-pointer px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm shadow-xl shadow-amber-500/25 flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95"
              >
                <Play className="w-4 h-4 fill-black" />
                <span>Stream in HD Now</span>
              </button>

              <button
                type="button"
                onClick={() => onDownloadMedia(featured)}
                className="cursor-pointer px-5 py-3 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-white font-semibold text-sm border border-zinc-700/80 flex items-center gap-2 transition-all hover:border-zinc-500"
              >
                <Download className="w-4 h-4" />
                <span>Download (4K / 1080p)</span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Top Leaderboard AdSense Unit */}
      <AdSenseBanner slotType="leaderboard" slotId="pub-top-home-leaderboard" />

      {/* Quick Category Filter Bar */}
      <section aria-label="Browse By Category" className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { label: 'All Catalog', category: 'all' },
          { label: '4K Ultra HD', category: '4k' },
          { label: 'Action Blockbusters', category: 'Action' },
          { label: 'Sci-Fi & Cyberpunk', category: 'Sci-Fi' },
          { label: 'Fantasy & Dragons', category: 'Fantasy' },
          { label: 'Binge TV Shows', category: 'tv' },
          { label: 'Trending Anime', category: 'Anime' },
        ].map((cat) => (
          <button
            key={cat.category}
            type="button"
            onClick={() => onExploreCategory(cat.category)}
            className="cursor-pointer px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white border border-zinc-800 hover:border-zinc-700 whitespace-nowrap transition-colors"
          >
            {cat.label}
          </button>
        ))}
      </section>

      {/* Trending Now Section */}
      <section aria-label="Trending Now" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white font-heading">Trending Now</h2>
              <p className="text-xs text-zinc-400">Most viewed and downloaded titles this week</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onExploreCategory('trending')}
            className="cursor-pointer text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {trending.map((item) => (
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
      </section>

      {/* Popular Movies Section */}
      <section aria-label="Popular Movies" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white font-heading">Popular HD Movies</h2>
              <p className="text-xs text-zinc-400">Stream in 1080p / 4K with multiple direct download mirrors</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onExploreCategory('movies')}
            className="cursor-pointer text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
          >
            <span>Browse Movies</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {movies.map((item) => (
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
      </section>

      {/* Mid-Content Responsive AdSense Placement */}
      <AdSenseBanner slotType="responsive" slotId="pub-mid-home-responsive" />

      {/* Latest TV Series & Anime Section */}
      <section aria-label="TV Series & Anime" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Tv className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white font-heading">TV Shows & Anime Series</h2>
              <p className="text-xs text-zinc-400">Complete multi-season packs and episodic downloads</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onExploreCategory('tv')}
            className="cursor-pointer text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
          >
            <span>Explore TV</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...tvSeries, ...anime].map((item) => (
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
      </section>

      {/* Why Choose Flixcha - High-Value Feature Grid (Crucial for AdSense Editorial Quality) */}
      <section aria-label="Why Flixcha" className="rounded-2xl bg-zinc-900/40 border border-zinc-800 p-6 md:p-8 space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
            The Flixcha Advantage
          </span>
          <h2 className="text-2xl font-bold text-white font-heading">
            Engineered for Fast Streaming & Seamless Offline Downloads
          </h2>
          <p className="text-xs text-zinc-400">
            A contemporary entertainment directory optimized for speed, security, and exceptional audiovisual fidelity.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
          <div className="p-5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 space-y-2 text-center sm:text-left">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto sm:mx-0">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Ultra-Fast Bufferless CDN</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Decentralized edge servers across North America, Europe, and Asia dynamically adapt to your network bandwidth for instant playback without delays.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 space-y-2 text-center sm:text-left">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto sm:mx-0">
              <Download className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Lossless Multi-Quality Downloads</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Choose from 4K UHD Remux, 1080p FHD, 720p HD, or lightweight 480p mobile MP4 files compatible with VLC, smart TVs, and mobile media players.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 space-y-2 text-center sm:text-left">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mx-auto sm:mx-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">No Deceptive Popups or Malware</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Unlike typical aggregator hubs, PunkShop does not deploy intrusive pop-unders, sneaky browser hijacks, or scam redirects.
            </p>
          </div>
        </div>
      </section>

      {/* SEO FAQ Accordion (For Rich Snippets & Search Visibility) */}
      <section aria-label="Frequently Asked Questions" className="space-y-4">
        <div className="text-center max-w-xl mx-auto mb-6">
          <div className="flex items-center justify-center gap-1.5 text-xs font-mono font-bold text-amber-400 uppercase tracking-widest mb-1">
            <HelpCircle className="w-4 h-4" />
            <span>Frequently Asked Questions</span>
          </div>
          <h2 className="text-2xl font-bold text-white font-heading">
            Everything You Need to Know About PunkShop
          </h2>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div
                key={faq.q}
                className="rounded-xl bg-zinc-900/60 border border-zinc-800/80 overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="cursor-pointer w-full p-4 text-left flex items-center justify-between text-sm font-semibold text-white hover:text-amber-400 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${
                      isOpen ? 'transform rotate-180 text-amber-400' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-xs text-zinc-300 leading-relaxed border-t border-zinc-800/40 pt-3 animate-fade-in">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
