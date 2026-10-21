import React, { useState } from 'react';
import { Send, X, Film, CheckCircle2, AlertCircle } from 'lucide-react';

interface RequestMovieModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RequestMovieModal: React.FC<RequestMovieModalProps> = ({ isOpen, onClose }) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'movie' | 'tv' | 'anime'>('movie');
  const [year, setYear] = useState('');
  const [imdbLink, setImdbLink] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Save request to localStorage so user can see it
    const existing = JSON.parse(localStorage.getItem('flixcha_movie_requests') || '[]');
    existing.unshift({
      id: Date.now().toString(),
      title,
      type,
      year: year || 'Unknown',
      imdbLink,
      email,
      date: new Date().toLocaleDateString(),
      status: 'In Review'
    });
    localStorage.setItem('flixcha_movie_requests', JSON.stringify(existing));

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setTitle('');
      setYear('');
      setImdbLink('');
      setEmail('');
      onClose();
    }, 2000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="request-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
    >
      <div className="relative w-full max-w-lg rounded-2xl bg-zinc-900 border border-zinc-700/80 shadow-2xl p-6">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close request modal"
          className="cursor-pointer absolute top-4 right-4 p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Film className="w-5 h-5" />
          </div>
          <div>
            <h2 id="request-modal-title" className="text-lg font-bold text-white font-heading">
              Request Movie or Series
            </h2>
            <p className="text-xs text-zinc-400">
              Can't find a title? Submit your request and our indexing team will upload it.
            </p>
          </div>
        </div>

        {submitted ? (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
            <CheckCircle2 className="w-14 h-14 text-emerald-400 animate-bounce" />
            <h3 className="text-base font-bold text-white">Request Received!</h3>
            <p className="text-xs text-zinc-400 max-w-xs">
              Thank you! Our community encoders have queued &ldquo;{title}&rdquo; for priority 1080p / 4K upload.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="req-media-title" className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Title Name <span className="text-amber-400">*</span>
              </label>
              <input
                id="req-media-title"
                type="text"
                required
                placeholder="e.g. Dune: Part Three or Severance Season 2"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="req-media-type" className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Content Type
                </label>
                <select
                  id="req-media-type"
                  value={type}
                  onChange={(e) => setType(e.target.value as 'movie' | 'tv' | 'anime')}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
                >
                  <option value="movie">Movie</option>
                  <option value="tv">TV Series</option>
                  <option value="anime">Anime</option>
                </select>
              </div>

              <div>
                <label htmlFor="req-media-year" className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Release Year
                </label>
                <input
                  id="req-media-year"
                  type="text"
                  placeholder="e.g. 2026"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label htmlFor="req-imdb-link" className="block text-xs font-semibold text-zinc-300 mb-1.5">
                IMDb / TMDb Link (Optional)
              </label>
              <input
                id="req-imdb-link"
                type="url"
                placeholder="https://www.imdb.com/title/..."
                value={imdbLink}
                onChange={(e) => setImdbLink(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="req-user-email" className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Notify Me When Added (Email - Optional)
              </label>
              <input
                id="req-user-email"
                type="email"
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              className="cursor-pointer w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all"
            >
              <Send className="w-4 h-4" />
              Submit Content Request
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
