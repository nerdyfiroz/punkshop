import React, { useState } from 'react';
import {
  Star,
  Download,
  Bookmark,
  Check,
  Share2,
  Calendar,
  Clock,
  Globe,
  Film,
  Award,
  MessageSquare,
  Send,
  ThumbsUp,
  AlertTriangle,
  Play,
  Tv,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Layers
} from 'lucide-react';
import { MediaItem, Episode, DownloadOption, UserReview } from '../types';
import { VideoPlayer } from '../components/VideoPlayer';
import { AdSenseBanner } from '../components/AdSenseBanner';
import { MediaCard } from '../components/MediaCard';

interface DetailViewProps {
  media: MediaItem;
  allMedia: MediaItem[];
  onSelectMedia: (media: MediaItem) => void;
  onDownloadMedia: (media: MediaItem, option?: DownloadOption) => void;
  isWatchlisted: boolean;
  onToggleWatchlist: (media: MediaItem) => void;
  onBackToHome: () => void;
  onSelectCategory: (cat: string) => void;
  reviews: UserReview[];
  onAddReview: (mediaId: string, review: Omit<UserReview, 'id' | 'likes'>) => void;
  onLikeReview: (reviewId: string) => void;
}

export const DetailView: React.FC<DetailViewProps> = ({
  media,
  allMedia,
  onSelectMedia,
  onDownloadMedia,
  isWatchlisted,
  onToggleWatchlist,
  onBackToHome,
  onSelectCategory,
  reviews,
  onAddReview,
  onLikeReview
}) => {
  const [selectedSeasonNumber, setSelectedSeasonNumber] = useState<number>(1);
  const [activeEpisode, setActiveEpisode] = useState<Episode | null>(
    media.seasons?.[0]?.episodes?.[0] || null
  );
  const [activeVideoUrl, setActiveVideoUrl] = useState<string>(
    activeEpisode ? activeEpisode.videoUrl : media.videoUrl
  );
  const [copiedLink, setCopiedLink] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newRating, setNewRating] = useState(9);
  const [reportSent, setReportSent] = useState(false);

  const activeSeason = media.seasons?.find((s) => s.seasonNumber === selectedSeasonNumber);

  const handleEpisodeSelect = (ep: Episode) => {
    setActiveEpisode(ep);
    setActiveVideoUrl(ep.videoUrl);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNextEpisode = () => {
    if (!activeSeason || !activeEpisode) return;
    const currIdx = activeSeason.episodes.findIndex((e) => e.id === activeEpisode.id);
    if (currIdx !== -1 && currIdx < activeSeason.episodes.length - 1) {
      handleEpisodeSelect(activeSeason.episodes[currIdx + 1]);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !newAuthor.trim()) return;

    onAddReview(media.id, {
      mediaId: media.id,
      author: newAuthor,
      rating: newRating,
      date: 'Just now',
      content: newComment
    });

    setNewComment('');
    setNewAuthor('');
  };

  const relatedItems = allMedia
    .filter((m) => m.id !== media.id && m.genres.some((g) => media.genres.includes(g)))
    .slice(0, 4);

  return (
    <div className="w-full flex flex-col space-y-8 pb-16">
      {/* Breadcrumb Navigation (For SEO & Schema.org) */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-zinc-400 overflow-x-auto py-1">
        <button
          type="button"
          onClick={onBackToHome}
          className="cursor-pointer hover:text-amber-400 transition-colors shrink-0"
        >
          Home
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
        <button
          type="button"
          onClick={() => onSelectCategory(media.type)}
          className="cursor-pointer hover:text-amber-400 transition-colors uppercase shrink-0"
        >
          {media.type === 'tv' ? 'TV Shows' : media.type === 'anime' ? 'Anime' : 'Movies'}
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
        <button
          type="button"
          onClick={() => onSelectCategory(media.genres[0])}
          className="cursor-pointer hover:text-amber-400 transition-colors shrink-0"
        >
          {media.genres[0]}
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
        <span className="text-zinc-200 font-medium truncate">{media.title}</span>
      </nav>

      {/* Main Video Streaming Player */}
      <VideoPlayer
        mediaId={media.id}
        title={activeEpisode ? `${media.title} - S${activeEpisode.seasonNumber}E${activeEpisode.episodeNumber}: ${activeEpisode.title}` : media.title}
        videoUrl={activeVideoUrl}
        posterUrl={media.backdropUrl}
        servers={media.servers}
        onServerChange={(srv) => setActiveVideoUrl(srv.videoUrl)}
        onNextEpisode={handleNextEpisode}
        hasNextEpisode={Boolean(
          activeSeason &&
          activeEpisode &&
          activeSeason.episodes.findIndex((e) => e.id === activeEpisode.id) < activeSeason.episodes.length - 1
        )}
      />

      {/* Primary Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onDownloadMedia(media)}
            className="cursor-pointer px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all transform active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Download ({media.quality})</span>
          </button>

          <button
            type="button"
            onClick={() => onToggleWatchlist(media)}
            className={`cursor-pointer px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border flex items-center gap-2 transition-colors ${
              isWatchlisted
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/40'
                : 'bg-zinc-800 text-zinc-200 border-zinc-700 hover:text-white'
            }`}
          >
            {isWatchlisted ? <Check className="w-4 h-4 text-amber-400" /> : <Bookmark className="w-4 h-4" />}
            <span>{isWatchlisted ? 'In Watchlist' : 'Add Watchlist'}</span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="cursor-pointer px-3.5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 text-xs sm:text-sm font-semibold flex items-center gap-2 transition-colors"
            title="Share Movie Link"
          >
            <Share2 className="w-4 h-4" />
            <span>{copiedLink ? 'Link Copied!' : 'Share'}</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            setReportSent(true);
            setTimeout(() => setReportSent(false), 3000);
          }}
          className="cursor-pointer text-xs text-zinc-400 hover:text-amber-400 flex items-center gap-1.5 transition-colors"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-zinc-500" />
          <span>{reportSent ? 'Feedback logged! Thanks.' : 'Report Issue / Broken Server'}</span>
        </button>
      </div>

      {/* AdSense In-Content Banner */}
      <AdSenseBanner slotType="responsive" slotId="pub-detail-below-player" />

      {/* TV Series Episode Browser (Only for TV Shows) */}
      {media.seasons && media.seasons.length > 0 && (
        <section aria-label="Episodes and Seasons" className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Tv className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-bold text-white font-heading">Episodes & Season Packs</h2>
            </div>

            {/* Season Selector Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1">
              {media.seasons.map((s) => (
                <button
                  key={s.seasonNumber}
                  type="button"
                  onClick={() => {
                    setSelectedSeasonNumber(s.seasonNumber);
                    setActiveEpisode(s.episodes[0]);
                    setActiveVideoUrl(s.episodes[0].videoUrl);
                  }}
                  className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    selectedSeasonNumber === s.seasonNumber
                      ? 'bg-amber-500 text-black'
                      : 'bg-zinc-800 text-zinc-300 hover:text-white'
                  }`}
                >
                  Season {s.seasonNumber}
                </button>
              ))}
            </div>
          </div>

          {/* Episode Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {activeSeason?.episodes.map((ep) => {
              const isCurrent = activeEpisode?.id === ep.id;
              return (
                <div
                  key={ep.id}
                  className={`rounded-xl p-3 border flex gap-3 transition-all ${
                    isCurrent
                      ? 'bg-amber-500/10 border-amber-500/50 ring-1 ring-amber-500/30'
                      : 'bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-700'
                  }`}
                >
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => handleEpisodeSelect(ep)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleEpisodeSelect(ep);
                      }
                    }}
                    className="cursor-pointer relative w-28 h-20 rounded-lg overflow-hidden shrink-0 group bg-zinc-900"
                  >
                    <img
                      src={ep.stillUrl}
                      alt={ep.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="w-7 h-7 rounded-full bg-amber-500 text-black flex items-center justify-center shadow">
                        <Play className="w-3.5 h-3.5 fill-black ml-0.5" />
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-white truncate">
                          Ep {ep.episodeNumber}: {ep.title}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-mono shrink-0 ml-2">
                          {ep.duration}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                        {ep.overview}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => handleEpisodeSelect(ep)}
                        className="cursor-pointer text-[11px] text-amber-400 font-semibold hover:underline flex items-center gap-1"
                      >
                        <Play className="w-3 h-3 fill-amber-400" />
                        <span>Watch Now</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onDownloadMedia(media, ep.downloadOptions[0])}
                        className="cursor-pointer text-[11px] text-zinc-400 hover:text-white font-medium flex items-center gap-1 ml-auto"
                      >
                        <Download className="w-3 h-3" />
                        <span>Download Ep</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Main Synopsis & Editorial Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Synopsis, Editorial Review & Cast */}
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="px-2 py-0.5 rounded bg-amber-500 text-black font-bold">
                {media.quality}
              </span>
              <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-semibold">
                {media.ageRating}
              </span>
              <div className="flex items-center gap-1 text-amber-400 font-bold bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>{media.rating} / 10 ({media.voteCount.toLocaleString()} votes)</span>
              </div>
              <span className="text-zinc-400">
                Release: {media.releaseDate} &bull; {media.duration}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white font-heading">
              {media.title} ({media.releaseYear})
            </h1>

            {/* Genres */}
            <div className="flex flex-wrap gap-1.5">
              {media.genres.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => onSelectCategory(g)}
                  className="cursor-pointer text-xs font-semibold px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-amber-400 border border-zinc-800 transition-colors"
                >
                  {g}
                </button>
              ))}
            </div>

            {/* Plot Synopsis */}
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono mb-2">
                Plot Synopsis & Summary
              </h2>
              <p className="text-zinc-300 text-sm leading-relaxed">
                {media.overview}
              </p>
            </div>

            {/* Original Editorial Review (CRITICAL FOR ADSENSE POLICY ELIGIBILITY) */}
            <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                <Award className="w-4 h-4" />
                <span>PunkShop Editorial Review & Cinema Critique</span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed italic">
                &ldquo;{media.editorialReview}&rdquo;
              </p>
              <div className="pt-2 flex items-center justify-between text-[11px] text-zinc-500">
                <span>Reviewed by: PunkShop Film Curation Guild</span>
                <span className="text-emerald-400 font-semibold">Verified Editorial</span>
              </div>
            </div>

            {/* Cast & Characters */}
            <div className="space-y-3">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Cast & Key Characters
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {media.cast.map((c) => (
                  <div key={c.name} className="flex items-center gap-2.5 p-2 rounded-xl bg-zinc-900 border border-zinc-800/80">
                    <img
                      src={c.photo}
                      alt={c.name}
                      className="w-10 h-10 rounded-lg object-cover bg-zinc-800"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">{c.name}</p>
                      <p className="text-[10px] text-zinc-400 truncate">{c.character}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Media FAQs */}
            {media.faq && media.faq.length > 0 && (
              <div className="space-y-3 pt-2">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Title Questions & Answers
                </h2>
                <div className="space-y-2">
                  {media.faq.map((f) => (
                    <div key={f.question} className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/80 text-xs space-y-1">
                      <p className="font-semibold text-white">{f.question}</p>
                      <p className="text-zinc-400 leading-relaxed">{f.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Technical Specs & Download Hub Card */}
        <div className="space-y-6">
          {/* Technical Specs Card */}
          <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-5 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider font-mono text-white flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-amber-400" />
              <span>Technical Media Specifications</span>
            </h2>

            <div className="divide-y divide-zinc-800 text-xs">
              <div className="py-2 flex justify-between">
                <span className="text-zinc-400">Director:</span>
                <span className="text-white font-medium">{media.director}</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-zinc-400">Country:</span>
                <span className="text-white font-medium">{media.country}</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-zinc-400">Audio Channels:</span>
                <span className="text-white font-medium">{media.audio.join(', ')}</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-zinc-400">Subtitles:</span>
                <span className="text-white font-medium text-right max-w-[180px] truncate">
                  {media.subtitles.join(', ')}
                </span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-zinc-400">Primary Quality:</span>
                <span className="text-amber-400 font-bold">{media.quality}</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-zinc-400">Total Downloads:</span>
                <span className="text-zinc-300 font-mono">{media.downloadsCount.toLocaleString()}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onDownloadMedia(media)}
              className="cursor-pointer w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-colors"
            >
              <Download className="w-4 h-4" />
              Open Multi-Quality Download Hub
            </button>
          </div>

          {/* AdSense Sidebar Rectangle Banner (300x250) */}
          <AdSenseBanner slotType="rectangle" slotId="pub-detail-sidebar-rect" />
        </div>
      </div>

      {/* User Reviews & Community Discussions */}
      <section aria-label="Community Reviews" className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white font-heading">
              User Reviews & Comments ({reviews.length})
            </h2>
          </div>
          <span className="text-xs text-zinc-400 font-mono">Community Moderated</span>
        </div>

        {/* Post Comment Form */}
        <form onSubmit={handleCommentSubmit} className="space-y-3 bg-zinc-950 p-4 rounded-xl border border-zinc-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <input
              type="text"
              required
              placeholder="Your Name or Nickname"
              value={newAuthor}
              onChange={(e) => setNewAuthor(e.target.value)}
              className="px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
            />
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <span>Your Star Rating:</span>
              <select
                value={newRating}
                onChange={(e) => setNewRating(Number(e.target.value))}
                className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-amber-400 font-bold focus:outline-none"
              >
                {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((r) => (
                  <option key={r} value={r}>
                    ★ {r} / 10
                  </option>
                ))}
              </select>
            </div>
          </div>

          <textarea
            required
            rows={3}
            placeholder="Write your review, thoughts on the ending, or stream speed feedback..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 resize-none"
          />

          <div className="flex justify-end">
            <button
              type="submit"
              className="cursor-pointer px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Post Review</span>
            </button>
          </div>
        </form>

        {/* Existing Reviews List */}
        <div className="space-y-3">
          {reviews.length === 0 ? (
            <p className="text-xs text-zinc-500 italic">Be the first to review {media.title}!</p>
          ) : (
            reviews.map((rev) => (
              <div key={rev.id} className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center">
                      {rev.author.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs font-bold text-white">{rev.author}</span>
                    <span className="text-[10px] text-zinc-500 font-mono">&bull; {rev.date}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-amber-400">
                    <Star className="w-3 h-3 fill-amber-400" />
                    <span>{rev.rating} / 10</span>
                  </div>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">{rev.content}</p>
                <div className="pt-1 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onLikeReview(rev.id)}
                    className="cursor-pointer text-[10px] text-zinc-400 hover:text-amber-400 flex items-center gap-1 transition-colors"
                  >
                    <ThumbsUp className="w-3 h-3" />
                    <span>Helpful ({rev.likes})</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Related Content Recommendations */}
      {relatedItems.length > 0 && (
        <section aria-label="Related Titles" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white font-heading">
              You Might Also Enjoy
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {relatedItems.map((item) => (
              <MediaCard
                key={item.id}
                media={item}
                onSelect={onSelectMedia}
                onDownload={onDownloadMedia}
                isWatchlisted={isWatchlisted}
                onToggleWatchlist={onToggleWatchlist}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
