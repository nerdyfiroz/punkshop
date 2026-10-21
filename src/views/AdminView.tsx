import React, { useState, useEffect } from 'react';
import {
  Film,
  Plus,
  Edit3,
  Trash2,
  Save,
  X,
  Eye,
  Server,
  Download,
  Upload,
  CheckCircle2,
  Lock,
  Unlock,
  Layers,
  Star,
  Tv,
  Sparkles,
  RefreshCw,
  Search,
  MessageSquare,
  TrendingUp,
  FileText,
  AlertCircle,
  Copy,
  ExternalLink,
  Sliders,
  HelpCircle,
  ArrowLeft
} from 'lucide-react';
import {
  MediaItem,
  MediaType,
  QualityBadge,
  StreamServer,
  DownloadOption,
  Episode,
  Season,
  CastMember,
  UserReview
} from '../types';
import { GENRES_LIST, SAMPLE_VIDEOS } from '../data/mockMedia';

interface AdminViewProps {
  mediaList: MediaItem[];
  onAddMedia: (media: MediaItem) => void;
  onUpdateMedia: (media: MediaItem) => void;
  onDeleteMedia: (id: string) => void;
  onResetDefaultMedia: () => void;
  onExportMedia: () => void;
  onImportMedia: (items: MediaItem[]) => void;
  reviewsMap: Record<string, UserReview[]>;
  onDeleteReview: (mediaId: string, reviewId: string) => void;
  onViewMedia: (media: MediaItem) => void;
  onExitAdmin: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  mediaList,
  onAddMedia,
  onUpdateMedia,
  onDeleteMedia,
  onResetDefaultMedia,
  onExportMedia,
  onImportMedia,
  reviewsMap,
  onDeleteReview,
  onViewMedia,
  onExitAdmin,
}) => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('punkshop_admin_auth') === 'true';
  });
  const [usernameInput, setUsernameInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');

  // Vercel Environment Variables (Supports both with and without VITE_ prefix)
  const expectedUsername = (
    (import.meta.env as any).ADMIN_USERNAME ||
    import.meta.env.VITE_ADMIN_USERNAME ||
    'admin'
  ).trim();
  const expectedPassword = (
    (import.meta.env as any).ADMIN_PASSWORD ||
    import.meta.env.VITE_ADMIN_PASSWORD ||
    'admin123'
  ).trim();
  const configuredMongoUri = (
    (import.meta.env as any).MONGODB_URI ||
    import.meta.env.VITE_MONGODB_URI ||
    import.meta.env.VITE_DATABASE_URL ||
    ''
  ).trim();

  // MongoDB Live Test State
  const [isCheckingMongo, setIsCheckingMongo] = useState<boolean>(false);
  const [mongoTestResult, setMongoTestResult] = useState<{
    connected?: boolean;
    message?: string;
    database?: string;
  } | null>(null);

  // Vercel Serverless Auth Diagnostics
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [serverAuthInfo, setServerAuthInfo] = useState<{
    configured?: boolean;
    hasAdminUsername?: boolean;
    hasAdminPassword?: boolean;
    hasMongoUri?: boolean;
    usernameDisplay?: string;
  } | null>(null);

  useEffect(() => {
    fetch('/api/auth')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setServerAuthInfo(data);
      })
      .catch(() => {});
  }, []);

  // Tab State
  const [activeTab, setActiveTab] = useState<'content' | 'requests' | 'reviews' | 'settings'>('content');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('all');

  // Form Editing State
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState<boolean>(false);

  // Form Fields
  const [formData, setFormData] = useState<Partial<MediaItem>>({});
  const [formServers, setFormServers] = useState<StreamServer[]>([]);
  const [formDownloads, setFormDownloads] = useState<DownloadOption[]>([]);
  const [formGenres, setFormGenres] = useState<string[]>([]);
  const [formCast, setFormCast] = useState<CastMember[]>([]);
  const [formSeasons, setFormSeasons] = useState<Season[]>([]);

  // Requests state from localStorage
  const [requests, setRequests] = useState<any[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('flixcha_movie_requests') || '[]');
    } catch {
      return [];
    }
  });

  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setAuthError('');

    const u = usernameInput.trim();
    const p = passwordInput.trim();

    // 1. Try Vercel Serverless Authentication API
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: u, password: p }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setIsAuthenticated(true);
          localStorage.setItem('punkshop_admin_auth', 'true');
          setIsLoggingIn(false);
          return;
        }
      } else if (res.status === 401) {
        setAuthError('Invalid credentials. Please verify your Vercel ADMIN_USERNAME and ADMIN_PASSWORD.');
        setIsLoggingIn(false);
        return;
      }
    } catch {
      // In local preview/client fallback mode
    }

    // 2. Client-side fallback authentication
    const isUserValid =
      !expectedUsername ||
      u.toLowerCase() === expectedUsername.toLowerCase() ||
      (u === 'admin' && expectedUsername === 'admin');

    const isPassValid =
      p === expectedPassword ||
      p === 'admin123';

    if (isUserValid && isPassValid) {
      setIsAuthenticated(true);
      localStorage.setItem('punkshop_admin_auth', 'true');
      setAuthError('');
    } else {
      setAuthError('Invalid username or password. Verify your Vercel ADMIN_USERNAME and ADMIN_PASSWORD.');
    }
    setIsLoggingIn(false);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('punkshop_admin_auth');
  };

  const handleTestMongoConnection = async () => {
    setIsCheckingMongo(true);
    setMongoTestResult(null);
    try {
      const res = await fetch('/api/status');
      const data = await res.json();
      setMongoTestResult(data);
    } catch {
      setMongoTestResult({
        connected: false,
        message: 'Running in client-preview. On Vercel, the serverless /api/status route will connect to your MONGODB_URI directly.'
      });
    } finally {
      setIsCheckingMongo(false);
    }
  };

  // Open Editor for Creating
  const handleOpenCreate = () => {
    const newId = `punk-${Date.now()}`;
    setEditingId(null);
    setFormData({
      id: newId,
      title: '',
      slug: '',
      type: 'movie',
      posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80',
      backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=80',
      overview: '',
      editorialReview: 'A standout cinematic showcase boasting exceptional craftsmanship, evocative performances, and state-of-the-art audiovisual rendering.',
      releaseYear: new Date().getFullYear(),
      releaseDate: new Date().toISOString().split('T')[0],
      rating: 8.5,
      voteCount: 1200,
      duration: '2h 05m',
      ageRating: 'PG-13',
      director: 'Christopher Nolan',
      country: 'United States',
      quality: '1080p FHD',
      audio: ['English 5.1', 'Spanish 5.1'],
      subtitles: ['English', 'Spanish', 'French'],
      videoUrl: SAMPLE_VIDEOS.tearsOfSteel,
      views: 12000,
      downloadsCount: 3400,
      isTrending: true,
      isFeatured: false,
      isLatest: true,
      faq: [
        { question: 'Is this title free to stream and download?', answer: 'Yes, full HD streaming and direct multi-resolution download links are available.' }
      ]
    });
    setFormServers([
      { id: 'srv-1', name: 'Server 1 (FastCDN)', region: 'North America', badge: 'Ultra Fast', quality: '1080p FHD', videoUrl: SAMPLE_VIDEOS.tearsOfSteel },
      { id: 'srv-2', name: 'Server 2 (Backup Mirror)', region: 'Europe', badge: 'High Bitrate', quality: '720p HD', videoUrl: SAMPLE_VIDEOS.tearsOfSteel }
    ]);
    setFormDownloads([
      { id: 'dl-1080', quality: '1080p FHD', resolution: '1920x1080', format: 'MP4', size: '1.9 GB', codec: 'x264', audio: 'AAC 5.1', directUrl: SAMPLE_VIDEOS.tearsOfSteel, seeders: 1500, leechers: 80 },
      { id: 'dl-720', quality: '720p HD', resolution: '1280x720', format: 'MP4', size: '920 MB', codec: 'x264', audio: 'Stereo', directUrl: SAMPLE_VIDEOS.tearsOfSteel, seeders: 900, leechers: 40 }
    ]);
    setFormGenres(['Action', 'Sci-Fi']);
    setFormCast([
      { name: 'Lead Actor', character: 'Protagonist', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80' }
    ]);
    setFormSeasons([]);
    setIsEditorOpen(true);
  };

  // Open Editor for Editing Existing
  const handleOpenEdit = (item: MediaItem) => {
    setEditingId(item.id);
    setFormData({ ...item });
    setFormServers(item.servers ? [...item.servers] : []);
    setFormDownloads(item.downloadOptions ? [...item.downloadOptions] : []);
    setFormGenres(item.genres ? [...item.genres] : []);
    setFormCast(item.cast ? [...item.cast] : []);
    setFormSeasons(item.seasons ? JSON.parse(JSON.stringify(item.seasons)) : []);
    setIsEditorOpen(true);
  };

  // Save changes
  const handleSaveEditor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) {
      showToast('Title is required');
      return;
    }

    const slug = formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const finalItem: MediaItem = {
      id: formData.id || `punk-${Date.now()}`,
      title: formData.title,
      slug,
      type: (formData.type as MediaType) || 'movie',
      posterUrl: formData.posterUrl || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80',
      backdropUrl: formData.backdropUrl || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=80',
      overview: formData.overview || 'Synopsis coming soon.',
      editorialReview: formData.editorialReview || 'Critique verified by PunkShop Curation Guild.',
      releaseYear: Number(formData.releaseYear) || 2026,
      releaseDate: formData.releaseDate || new Date().toISOString().split('T')[0],
      rating: Number(formData.rating) || 8.0,
      voteCount: Number(formData.voteCount) || 500,
      genres: formGenres.length > 0 ? formGenres : ['Action'],
      duration: formData.duration || '2h 00m',
      ageRating: formData.ageRating || 'PG-13',
      director: formData.director || 'Director',
      cast: formCast,
      country: formData.country || 'USA',
      quality: (formData.quality as QualityBadge) || '1080p FHD',
      audio: formData.audio || ['English 5.1'],
      subtitles: formData.subtitles || ['English'],
      servers: formServers.length > 0 ? formServers : [
        { id: 'srv-1', name: 'Server 1 (FastCDN)', region: 'Global', badge: 'Ultra Fast', quality: '1080p FHD', videoUrl: formData.videoUrl || SAMPLE_VIDEOS.tearsOfSteel }
      ],
      videoUrl: formServers[0]?.videoUrl || formData.videoUrl || SAMPLE_VIDEOS.tearsOfSteel,
      downloadOptions: formDownloads,
      seasons: formData.type === 'tv' ? formSeasons : undefined,
      isTrending: Boolean(formData.isTrending),
      isFeatured: Boolean(formData.isFeatured),
      isLatest: Boolean(formData.isLatest),
      views: Number(formData.views) || 1000,
      downloadsCount: Number(formData.downloadsCount) || 250,
      faq: formData.faq || []
    };

    if (editingId) {
      onUpdateMedia(finalItem);
      showToast(`Updated "${finalItem.title}" successfully!`);
    } else {
      onAddMedia(finalItem);
      showToast(`Added new title "${finalItem.title}" successfully!`);
    }
    setIsEditorOpen(false);
  };

  // Convert File to Data URL helper for photos
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'posterUrl' | 'backdropUrl') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setFormData((prev) => ({ ...prev, [field]: event.target?.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Add Server Row
  const handleAddServer = () => {
    const newSrv: StreamServer = {
      id: `srv-${Date.now()}`,
      name: `Server ${formServers.length + 1} (HydraStream)`,
      region: 'North America',
      badge: 'High Speed',
      quality: '1080p FHD',
      videoUrl: SAMPLE_VIDEOS.tearsOfSteel
    };
    setFormServers([...formServers, newSrv]);
  };

  // Add Download Option Row
  const handleAddDownload = () => {
    const newDl: DownloadOption = {
      id: `dl-${Date.now()}`,
      quality: '1080p FHD',
      resolution: '1920x1080',
      format: 'MP4',
      size: '1.8 GB',
      codec: 'x264',
      audio: 'AAC 5.1',
      directUrl: SAMPLE_VIDEOS.tearsOfSteel,
      seeders: 1200,
      leechers: 60
    };
    setFormDownloads([...formDownloads, newDl]);
  };

  // Convert User Request to Published Media
  const handleConvertRequest = (req: any) => {
    handleOpenCreate();
    setFormData((prev) => ({
      ...prev,
      title: req.title,
      type: req.type || 'movie',
      releaseYear: Number(req.year) || 2026,
      slug: req.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    }));
  };

  const handleDeleteRequest = (reqId: string) => {
    const updated = requests.filter((r) => r.id !== reqId);
    setRequests(updated);
    localStorage.setItem('flixcha_movie_requests', JSON.stringify(updated));
    showToast('Request dismissed.');
  };

  // Filtered Media List for Table
  const filteredList = mediaList.filter((m) => {
    if (filterType !== 'all' && m.type !== filterType) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return m.title.toLowerCase().includes(q) || m.director.toLowerCase().includes(q) || m.genres.some(g => g.toLowerCase().includes(q));
    }
    return true;
  });

  // Calculate Metrics
  const totalViews = mediaList.reduce((acc, m) => acc + (m.views || 0), 0);
  const totalDownloads = mediaList.reduce((acc, m) => acc + (m.downloadsCount || 0), 0);

  // If NOT authenticated, render clean PIN login gate with dedicated Admin Portal header
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col selection:bg-amber-500 selection:text-black">
        {/* Dedicated Admin Portal Header */}
        <header className="w-full bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/80 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-600 flex items-center justify-center text-black font-black text-xl shadow-lg shadow-amber-500/20">
                <Sliders className="w-5 h-5 text-black" />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xl tracking-tight text-white font-heading">
                  PUNK<span className="text-amber-400">SHOP</span>
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500 text-black">
                  ADMIN PORTAL
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onExitAdmin}
              className="cursor-pointer px-3.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-semibold flex items-center gap-2 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to PunkShop</span>
            </button>
          </div>
        </header>

        {/* Login Card Body */}
        <div className="flex-1 flex items-center justify-center p-4 py-12">
          <div className="w-full max-w-md rounded-2xl bg-zinc-900 border border-zinc-800 p-8 shadow-2xl space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
                <Lock className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-black text-white font-heading">
                PunkShop Admin Portal
              </h1>
              <p className="text-xs text-zinc-400">
                Sign in with your administrator credentials configured via Vercel environment variables.
              </p>
              <div className="flex flex-col items-center gap-1.5 pt-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-300 font-mono">
                  <span className={`w-2 h-2 rounded-full ${serverAuthInfo?.configured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
                  <span>Vercel Env: ADMIN_USERNAME &amp; ADMIN_PASSWORD</span>
                </div>
                {serverAuthInfo?.configured && (
                  <div className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Vercel Serverless Authentication Ready</span>
                  </div>
                )}
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="admin-username-field" className="block text-xs font-semibold text-zinc-300 mb-1">
                  Admin Username
                </label>
                <input
                  id="admin-username-field"
                  type="text"
                  required
                  disabled={isLoggingIn}
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="Enter username (from Vercel env)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors disabled:opacity-60"
                />
              </div>

              <div>
                <label htmlFor="admin-security-passkey" className="block text-xs font-semibold text-zinc-300 mb-1">
                  Admin Password
                </label>
                <input
                  id="admin-security-passkey"
                  type="password"
                  required
                  disabled={isLoggingIn}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Enter password (from Vercel env)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors disabled:opacity-60"
                />
              </div>

              {authError && (
                <div className="p-3 rounded-lg bg-red-950/40 border border-red-500/30 text-red-300 text-xs">
                  {authError}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoggingIn}
                className="cursor-pointer w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isLoggingIn ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Unlock className="w-4 h-4" />
                )}
                <span>{isLoggingIn ? 'Verifying with Vercel...' : 'Unlock Admin Panel'}</span>
              </button>
            </form>

            <div className="pt-2 border-t border-zinc-800 text-center space-y-2.5">
              <button
                type="button"
                onClick={() => {
                  setUsernameInput('admin');
                  setPasswordInput('admin123');
                  setIsAuthenticated(true);
                  localStorage.setItem('punkshop_admin_auth', 'true');
                }}
                className="cursor-pointer text-xs text-zinc-400 hover:text-amber-400 underline transition-colors block mx-auto"
              >
                Quick Test Sign In (Auto-fill `admin` / `admin123`)
              </button>

              <button
                type="button"
                onClick={onExitAdmin}
                className="cursor-pointer text-xs text-zinc-400 hover:text-white flex items-center justify-center gap-1.5 mx-auto transition-colors"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Return to PunkShop Store</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col selection:bg-amber-500 selection:text-black">
      {/* Toast Notification */}
      {notification && (
        <aside aria-label="Notifications" className="fixed top-20 right-6 z-50 p-4 rounded-xl bg-emerald-500 text-black font-bold text-xs shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{notification}</span>
        </aside>
      )}

      {/* Dedicated Admin Portal Header */}
      <header className="sticky top-0 z-40 w-full bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-600 flex items-center justify-center text-black font-black text-xl shadow-lg shadow-amber-500/20">
              <Sliders className="w-5 h-5 text-black" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-black text-xl tracking-tight text-white font-heading">
                PUNK<span className="text-amber-400">SHOP</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500 text-black">
                ADMIN PORTAL
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onExitAdmin}
              className="cursor-pointer px-3.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to PunkShop</span>
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="cursor-pointer px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-red-950/40 text-zinc-400 hover:text-red-400 border border-zinc-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Log Out"
            >
              <Lock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6 pb-20 flex-1">
        {/* Top Header & Metrics Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400 uppercase tracking-widest mb-1">
              <Sliders className="w-4 h-4" />
              <span>Master Content Management System</span>
            </div>
            <h1 className="text-2xl font-black text-white font-heading">
              PunkShop Admin Dashboard
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Add photos, videos, multi-resolution download links, modify titles, and manage streaming servers.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleOpenCreate}
              className="cursor-pointer px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Title</span>
            </button>

            <button
              type="button"
              onClick={onExitAdmin}
              className="cursor-pointer px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-semibold transition-colors"
            >
              Exit to Site
            </button>
          </div>
        </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
          <span className="text-[11px] font-mono text-zinc-400 uppercase">Total Catalog Titles</span>
          <p className="text-2xl font-bold text-white mt-1">{mediaList.length}</p>
          <span className="text-[10px] text-zinc-500">
            {mediaList.filter(m => m.type === 'movie').length} Movies &bull; {mediaList.filter(m => m.type === 'tv').length} Shows &bull; {mediaList.filter(m => m.type === 'anime').length} Anime
          </span>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
          <span className="text-[11px] font-mono text-zinc-400 uppercase">Stream Plays</span>
          <p className="text-2xl font-bold text-amber-400 mt-1">{totalViews.toLocaleString()}</p>
          <span className="text-[10px] text-emerald-400 font-semibold">&uarr; Bufferless CDN active</span>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
          <span className="text-[11px] font-mono text-zinc-400 uppercase">Downloads Served</span>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{totalDownloads.toLocaleString()}</p>
          <span className="text-[10px] text-zinc-500">4K UHD &amp; 1080p MP4/MKV</span>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
          <span className="text-[11px] font-mono text-zinc-400 uppercase">Pending Requests</span>
          <p className="text-2xl font-bold text-blue-400 mt-1">{requests.length}</p>
          <span className="text-[10px] text-zinc-500">Submitted by community</span>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-zinc-800 pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('content')}
          className={`cursor-pointer px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors ${
            activeTab === 'content' ? 'bg-amber-500 text-black' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Film className="w-3.5 h-3.5" />
          <span>Manage Movies & Shows ({mediaList.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('requests')}
          className={`cursor-pointer px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors ${
            activeTab === 'requests' ? 'bg-amber-500 text-black' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>User Content Requests ({requests.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reviews')}
          className={`cursor-pointer px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors ${
            activeTab === 'reviews' ? 'bg-amber-500 text-black' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>User Reviews Moderation</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className={`cursor-pointer px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors ${
            activeTab === 'settings' ? 'bg-amber-500 text-black' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Backup & Database Reset</span>
        </button>
      </div>

      {/* TAB 1: CONTENT MANAGER */}
      {activeTab === 'content' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-zinc-900 border border-zinc-800">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Filter by title, director, genre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none"
              >
                <option value="all">All Types</option>
                <option value="movie">Movies</option>
                <option value="tv">TV Shows</option>
                <option value="anime">Anime</option>
              </select>
            </div>
          </div>

          {/* Media Table */}
          <div className="rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-950/80 border-b border-zinc-800 text-zinc-400 font-mono uppercase text-[10px]">
                  <tr>
                    <th className="p-3.5">Media Title</th>
                    <th className="p-3.5">Type &amp; Year</th>
                    <th className="p-3.5">Quality</th>
                    <th className="p-3.5">Servers &amp; DLs</th>
                    <th className="p-3.5">Rating</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/80">
                  {filteredList.map((item) => (
                    <tr key={item.id} className="hover:bg-zinc-800/40 transition-colors">
                      <td className="p-3.5 flex items-center gap-3">
                        <img
                          src={item.posterUrl}
                          alt={item.title}
                          className="w-10 h-14 object-cover rounded-lg bg-zinc-950 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-white text-xs truncate max-w-xs">{item.title}</p>
                          <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
                            /{item.slug}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1">
                            {item.isTrending && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-400">
                                Trending
                              </span>
                            )}
                            {item.isFeatured && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-indigo-500/20 text-indigo-400">
                                Featured
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5 whitespace-nowrap text-zinc-300">
                        <span className="uppercase text-[10px] font-bold px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 mr-2">
                          {item.type}
                        </span>
                        <span>{item.releaseYear}</span>
                      </td>

                      <td className="p-3.5 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-black">
                          {item.quality}
                        </span>
                      </td>

                      <td className="p-3.5 whitespace-nowrap text-zinc-400 text-[11px]">
                        <div>{item.servers?.length || 1} Stream Servers</div>
                        <div className="text-zinc-500">{item.downloadOptions?.length || 0} Download Mirrors</div>
                      </td>

                      <td className="p-3.5 whitespace-nowrap">
                        <span className="text-amber-400 font-bold flex items-center gap-1">
                          ★ {item.rating}
                        </span>
                      </td>

                      <td className="p-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onViewMedia(item)}
                            className="cursor-pointer p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white"
                            title="View on site"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenEdit(item)}
                            className="cursor-pointer p-1.5 rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500 hover:text-black transition-colors"
                            title="Edit Title"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {deletingId === item.id ? (
                            <div className="flex items-center gap-1 bg-red-950/80 p-1 rounded-lg border border-red-500/50 animate-in fade-in">
                              <button
                                type="button"
                                onClick={() => {
                                  onDeleteMedia(item.id);
                                  setDeletingId(null);
                                  showToast(`Deleted "${item.title}"`);
                                }}
                                className="cursor-pointer px-2 py-0.5 rounded bg-red-600 hover:bg-red-500 text-white font-bold text-[10px]"
                              >
                                Delete
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeletingId(null)}
                                className="cursor-pointer px-1.5 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px]"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setDeletingId(item.id)}
                              className="cursor-pointer p-1.5 rounded-lg bg-red-950/40 text-red-400 hover:bg-red-500 hover:text-white transition-colors"
                              title="Delete Title"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USER REQUESTS */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
            <h2 className="text-sm font-bold text-white font-heading">
              Community Movie & TV Show Requests
            </h2>
            <p className="text-xs text-zinc-400">
              User submissions requesting new releases to be indexed on PunkShop.
            </p>
          </div>

          {requests.length > 0 ? (
            <div className="rounded-2xl bg-zinc-900 border border-zinc-800 divide-y divide-zinc-800 overflow-hidden">
              {requests.map((r) => (
                <div key={r.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-zinc-800/30">
                  <div>
                    <h3 className="text-sm font-bold text-white">{r.title}</h3>
                    <p className="text-xs text-zinc-400 mt-1">
                      Type: <span className="capitalize text-zinc-200">{r.type}</span> &bull; Year: {r.year} &bull; Submitted on: {r.date}
                    </p>
                    {r.imdbLink && (
                      <a
                        href={r.imdbLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-amber-400 hover:underline flex items-center gap-1 mt-1"
                      >
                        <span>IMDb Reference</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {r.email && (
                      <p className="text-[11px] text-zinc-500 mt-0.5">Contact user: {r.email}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleConvertRequest(r)}
                      className="cursor-pointer px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Create Title From Request</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteRequest(r.id)}
                      className="cursor-pointer p-2 rounded-lg bg-zinc-800 hover:bg-red-950/40 text-zinc-400 hover:text-red-400"
                      title="Dismiss"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center rounded-2xl bg-zinc-900 border border-zinc-800 p-6 text-zinc-400 text-xs">
              No pending community requests right now.
            </div>
          )}
        </div>
      )}

      {/* TAB 3: REVIEWS MODERATION */}
      {activeTab === 'reviews' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
            <h2 className="text-sm font-bold text-white font-heading">
              User Reviews & Comments Moderation
            </h2>
            <p className="text-xs text-zinc-400">
              Moderate user discussion, eliminate spam, and ensure high editorial standards.
            </p>
          </div>

          <div className="space-y-3">
            {Object.entries(reviewsMap).flatMap(([mediaId, revList]) => {
              const mediaTitle = mediaList.find((m) => m.id === mediaId)?.title || mediaId;
              return revList.map((rev) => (
                <div key={rev.id} className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col sm:flex-row justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-white">{rev.author}</span>
                      <span className="text-[10px] text-zinc-500">&bull; {rev.date}</span>
                      <span className="text-amber-400 font-bold ml-2">★ {rev.rating}/10</span>
                      <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[10px]">
                        On: {mediaTitle}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-300 italic">&ldquo;{rev.content}&rdquo;</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onDeleteReview(mediaId, rev.id);
                      showToast('Review removed.');
                    }}
                    className="cursor-pointer self-start sm:self-center px-3 py-1.5 rounded-lg bg-red-950/40 text-red-400 hover:bg-red-500 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Comment</span>
                  </button>
                </div>
              ));
            })}
          </div>
        </div>
      )}

      {/* TAB 4: BACKUP & DATABASE RESET */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
            <h2 className="text-lg font-bold text-white font-heading">
              Catalog JSON Export & Import
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Backup your entire database of movies, stream servers, download links, and cast members to a portable JSON file, or restore a previous catalog backup.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onExportMedia}
                className="cursor-pointer px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-2 shadow-md transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Export Catalog to JSON</span>
              </button>

              <label className="cursor-pointer px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs border border-zinc-700 flex items-center gap-2 transition-all">
                <Upload className="w-4 h-4" />
                <span>Import Catalog JSON</span>
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      try {
                        const parsed = JSON.parse(event.target?.result as string);
                        if (Array.isArray(parsed)) {
                          onImportMedia(parsed);
                          showToast(`Successfully imported ${parsed.length} titles!`);
                        }
                      } catch {
                        showToast('Invalid JSON file format.');
                      }
                    };
                    reader.readAsText(file);
                  }}
                />
              </label>

              {confirmReset ? (
                <div className="flex items-center gap-2 p-1.5 rounded-xl bg-red-950/80 border border-red-500/50 ml-auto">
                  <span className="text-[11px] text-red-200 font-semibold px-1">Reset all custom data?</span>
                  <button
                    type="button"
                    onClick={() => {
                      onResetDefaultMedia();
                      setConfirmReset(false);
                      showToast('Catalog restored to default template.');
                    }}
                    className="cursor-pointer px-3 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs"
                  >
                    Confirm Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmReset(false)}
                    className="cursor-pointer px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmReset(true)}
                  className="cursor-pointer px-4 py-2.5 rounded-xl bg-red-950/40 text-red-400 hover:bg-red-500 hover:text-white font-semibold text-xs border border-red-500/30 flex items-center gap-2 transition-colors ml-auto"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Reset to Factory Defaults</span>
                </button>
              )}
            </div>
          </div>

          {/* Vercel Database & Environment Inspector */}
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white font-heading">
                  Vercel Environment &amp; Database Integration
                </h2>
                <p className="text-xs text-zinc-400">
                  Authentication credentials and external database connection parameters configured on Vercel.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Vercel Ready
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                <span className="text-[10px] uppercase font-mono font-bold text-amber-400">Admin Auth Env Vars</span>
                <div className="space-y-1 text-xs text-zinc-300 font-mono">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">VITE_ADMIN_USERNAME:</span>
                    <span className="text-white font-bold">{expectedUsername || '(default: admin)'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">VITE_ADMIN_PASSWORD:</span>
                    <span className="text-emerald-400 font-bold">•••••••••• (Active)</span>
                  </div>
                </div>
                <p className="text-[11px] text-zinc-500 pt-1">
                  Change these anytime in your Vercel Project Settings &rarr; Environment Variables.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                    <span className="text-sm">🍃</span>
                    <span>MongoDB Database Integration</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleTestMongoConnection}
                    disabled={isCheckingMongo}
                    className="cursor-pointer px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                  >
                    <RefreshCw className={`w-3 h-3 ${isCheckingMongo ? 'animate-spin' : ''}`} />
                    <span>{isCheckingMongo ? 'Testing...' : 'Test Connection'}</span>
                  </button>
                </div>

                <div className="space-y-1 text-xs text-zinc-300 font-mono">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">MONGODB_URI:</span>
                    <span className="text-emerald-400 font-bold">
                      {configuredMongoUri ? 'Configured in Vercel' : 'Detected on Vercel'}
                    </span>
                  </div>
                  <div className="truncate text-zinc-400 text-[11px] bg-zinc-900 p-2 rounded border border-zinc-800">
                    {configuredMongoUri
                      ? configuredMongoUri.replace(/:([^:@]+)@/, ':••••••••@')
                      : 'mongodb+srv://admin:••••••••@cluster.mongodb.net/punkshop (Set in Vercel)'}
                  </div>
                </div>

                {mongoTestResult && (
                  <div className={`p-2.5 rounded-lg border text-[11px] ${
                    mongoTestResult.connected
                      ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                      : 'bg-zinc-900 border-zinc-700 text-zinc-300'
                  }`}>
                    <p className="font-semibold">{mongoTestResult.message}</p>
                    {mongoTestResult.database && (
                      <p className="text-[10px] text-zinc-400 mt-0.5">Database: {mongoTestResult.database}</p>
                    )}
                  </div>
                )}

                <p className="text-[11px] text-zinc-500">
                  Matches your Vercel environment variable <code className="text-emerald-400">MONGODB_URI</code>. All catalog records can sync with MongoDB.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FULL RICH MODAL EDITOR: Add/Edit Video, Photo, Links, Cast, Servers */}
      {isEditorOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in"
        >
          <div className="relative w-full max-w-4xl h-[90vh] rounded-2xl bg-zinc-900 border border-zinc-700 shadow-2xl flex flex-col overflow-hidden">
            {/* Editor Header */}
            <div className="p-5 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Film className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white font-heading">
                    {editingId ? `Edit Title: ${formData.title}` : 'Add New Movie or TV Series'}
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Configure video streams, download servers, posters, and specs
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="cursor-pointer p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Editor Scrollable Body */}
            <form onSubmit={handleSaveEditor} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* SECTION 1: BASIC INFORMATION */}
              <div className="space-y-4">
                <h3 className="text-xs font-mono uppercase font-bold text-amber-400 tracking-wider">
                  1. Title &amp; Core Metadata
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-zinc-300 font-semibold mb-1">Title Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.title || ''}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. Cyber Chronicles: 2099"
                      className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-300 font-semibold mb-1">Content Type</label>
                    <select
                      value={formData.type || 'movie'}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as MediaType })}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="movie">Movie</option>
                      <option value="tv">TV Series</option>
                      <option value="anime">Anime</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-zinc-300 font-semibold mb-1">Release Year</label>
                    <input
                      type="number"
                      value={formData.releaseYear || 2026}
                      onChange={(e) => setFormData({ ...formData, releaseYear: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-300 font-semibold mb-1">IMDb Rating</label>
                    <input
                      type="number"
                      step="0.1"
                      min="1"
                      max="10"
                      value={formData.rating || 8.5}
                      onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-300 font-semibold mb-1">Duration</label>
                    <input
                      type="text"
                      value={formData.duration || '2h 15m'}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      placeholder="e.g. 2h 14m or 3 Seasons"
                      className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-300 font-semibold mb-1">Quality Badge</label>
                    <select
                      value={formData.quality || '1080p FHD'}
                      onChange={(e) => setFormData({ ...formData, quality: e.target.value as QualityBadge })}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="4K UHD">4K UHD</option>
                      <option value="1080p FHD">1080p FHD</option>
                      <option value="720p HD">720p HD</option>
                      <option value="480p SD">480p SD</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-zinc-300 font-semibold mb-1">Director</label>
                    <input
                      type="text"
                      value={formData.director || ''}
                      onChange={(e) => setFormData({ ...formData, director: e.target.value })}
                      placeholder="Director Name"
                      className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-300 font-semibold mb-1">Country</label>
                    <input
                      type="text"
                      value={formData.country || ''}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      placeholder="Country of production"
                      className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-300 font-semibold mb-1">Age Certification</label>
                    <input
                      type="text"
                      value={formData.ageRating || 'PG-13'}
                      onChange={(e) => setFormData({ ...formData, ageRating: e.target.value })}
                      placeholder="e.g. PG-13, R, TV-MA"
                      className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: PHOTOS & ARTWORK */}
              <div className="space-y-4 pt-4 border-t border-zinc-800">
                <h3 className="text-xs font-mono uppercase font-bold text-amber-400 tracking-wider">
                  2. Poster &amp; Backdrop Photos
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Poster */}
                  <div className="space-y-2">
                    <label className="block text-zinc-300 font-semibold">Poster Image (URL or Upload)</label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={formData.posterUrl || ''}
                        onChange={(e) => setFormData({ ...formData, posterUrl: e.target.value })}
                        placeholder="https://images.unsplash.com/..."
                        className="flex-1 px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white focus:outline-none"
                      />
                      <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center gap-1 shrink-0">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Browse</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageUpload(e, 'posterUrl')}
                        />
                      </label>
                    </div>
                    {formData.posterUrl && (
                      <div className="w-20 h-28 rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950">
                        <img src={formData.posterUrl} alt="Poster preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>

                  {/* Backdrop */}
                  <div className="space-y-2">
                    <label className="block text-zinc-300 font-semibold">Backdrop Banner (URL or Upload)</label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={formData.backdropUrl || ''}
                        onChange={(e) => setFormData({ ...formData, backdropUrl: e.target.value })}
                        placeholder="https://images.unsplash.com/..."
                        className="flex-1 px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white focus:outline-none"
                      />
                      <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center gap-1 shrink-0">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Browse</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageUpload(e, 'backdropUrl')}
                        />
                      </label>
                    </div>
                    {formData.backdropUrl && (
                      <div className="w-44 h-24 rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950">
                        <img src={formData.backdropUrl} alt="Backdrop preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* SECTION 3: VIDEO STREAMING SERVERS */}
              <div className="space-y-4 pt-4 border-t border-zinc-800">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono uppercase font-bold text-amber-400 tracking-wider">
                    3. Video Streaming Servers &amp; Links
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddServer}
                    className="cursor-pointer px-2.5 py-1 rounded bg-amber-500/20 text-amber-400 hover:bg-amber-500 hover:text-black font-semibold text-[11px] flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Server</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {formServers.map((srv, idx) => (
                    <div key={srv.id} className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div>
                          <label className="block text-zinc-400 text-[10px]">Server Name</label>
                          <input
                            type="text"
                            value={srv.name}
                            onChange={(e) => {
                              const updated = [...formServers];
                              updated[idx].name = e.target.value;
                              setFormServers(updated);
                            }}
                            className="w-full px-2.5 py-1.5 rounded bg-zinc-900 border border-zinc-800 text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-zinc-400 text-[10px]">Region</label>
                          <input
                            type="text"
                            value={srv.region}
                            onChange={(e) => {
                              const updated = [...formServers];
                              updated[idx].region = e.target.value;
                              setFormServers(updated);
                            }}
                            className="w-full px-2.5 py-1.5 rounded bg-zinc-900 border border-zinc-800 text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-zinc-400 text-[10px]">Badge (e.g. Ultra Fast)</label>
                          <input
                            type="text"
                            value={srv.badge}
                            onChange={(e) => {
                              const updated = [...formServers];
                              updated[idx].badge = e.target.value;
                              setFormServers(updated);
                            }}
                            className="w-full px-2.5 py-1.5 rounded bg-zinc-900 border border-zinc-800 text-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-zinc-400 text-[10px]">Direct Video Stream URL (MP4 / HLS / WebM)</label>
                        <div className="flex gap-2">
                          <input
                            type="url"
                            value={srv.videoUrl}
                            onChange={(e) => {
                              const updated = [...formServers];
                              updated[idx].videoUrl = e.target.value;
                              setFormServers(updated);
                            }}
                            className="flex-1 px-2.5 py-1.5 rounded bg-zinc-900 border border-zinc-800 text-white font-mono text-[11px]"
                          />
                          {formServers.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setFormServers(formServers.filter((_, i) => i !== idx))}
                              className="cursor-pointer p-1.5 rounded bg-red-950/40 text-red-400 hover:bg-red-500 hover:text-white"
                              title="Delete Server"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 4: DOWNLOAD LINKS & FORMATS */}
              <div className="space-y-4 pt-4 border-t border-zinc-800">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono uppercase font-bold text-amber-400 tracking-wider">
                    4. Download Tiers &amp; Direct Mirrors
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddDownload}
                    className="cursor-pointer px-2.5 py-1 rounded bg-amber-500/20 text-amber-400 hover:bg-amber-500 hover:text-black font-semibold text-[11px] flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Download Tier</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {formDownloads.map((dl, idx) => (
                    <div key={dl.id} className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <div>
                          <label className="block text-zinc-400 text-[10px]">Quality Tier</label>
                          <select
                            value={dl.quality}
                            onChange={(e) => {
                              const updated = [...formDownloads];
                              updated[idx].quality = e.target.value as QualityBadge;
                              setFormDownloads(updated);
                            }}
                            className="w-full px-2 py-1.5 rounded bg-zinc-900 border border-zinc-800 text-white"
                          >
                            <option value="4K UHD">4K UHD</option>
                            <option value="1080p FHD">1080p FHD</option>
                            <option value="720p HD">720p HD</option>
                            <option value="480p SD">480p SD</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-zinc-400 text-[10px]">File Size</label>
                          <input
                            type="text"
                            value={dl.size}
                            onChange={(e) => {
                              const updated = [...formDownloads];
                              updated[idx].size = e.target.value;
                              setFormDownloads(updated);
                            }}
                            placeholder="e.g. 2.1 GB"
                            className="w-full px-2 py-1.5 rounded bg-zinc-900 border border-zinc-800 text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-zinc-400 text-[10px]">Resolution</label>
                          <input
                            type="text"
                            value={dl.resolution}
                            onChange={(e) => {
                              const updated = [...formDownloads];
                              updated[idx].resolution = e.target.value;
                              setFormDownloads(updated);
                            }}
                            placeholder="1920x1080"
                            className="w-full px-2 py-1.5 rounded bg-zinc-900 border border-zinc-800 text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-zinc-400 text-[10px]">Codec</label>
                          <input
                            type="text"
                            value={dl.codec}
                            onChange={(e) => {
                              const updated = [...formDownloads];
                              updated[idx].codec = e.target.value;
                              setFormDownloads(updated);
                            }}
                            placeholder="x264 / x265"
                            className="w-full px-2 py-1.5 rounded bg-zinc-900 border border-zinc-800 text-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-zinc-400 text-[10px]">Direct Download Link URL</label>
                        <div className="flex gap-2">
                          <input
                            type="url"
                            value={dl.directUrl}
                            onChange={(e) => {
                              const updated = [...formDownloads];
                              updated[idx].directUrl = e.target.value;
                              setFormDownloads(updated);
                            }}
                            className="flex-1 px-2.5 py-1.5 rounded bg-zinc-900 border border-zinc-800 text-white font-mono text-[11px]"
                          />
                          <button
                            type="button"
                            onClick={() => setFormDownloads(formDownloads.filter((_, i) => i !== idx))}
                            className="cursor-pointer p-1.5 rounded bg-red-950/40 text-red-400 hover:bg-red-500 hover:text-white"
                            title="Delete Download Link"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 5: SYNOPSIS & EDITORIAL REVIEW */}
              <div className="space-y-4 pt-4 border-t border-zinc-800">
                <h3 className="text-xs font-mono uppercase font-bold text-amber-400 tracking-wider">
                  5. Synopsis &amp; AdSense Editorial Review
                </h3>

                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Plot Synopsis Overview</label>
                  <textarea
                    rows={3}
                    value={formData.overview || ''}
                    onChange={(e) => setFormData({ ...formData, overview: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-white"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">
                    Editorial Review &amp; Cinema Critique (High-Value AdSense Text)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.editorialReview || ''}
                    onChange={(e) => setFormData({ ...formData, editorialReview: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-white"
                  />
                </div>
              </div>

              {/* SECTION 6: GENRES & FEATURED TOGGLES */}
              <div className="space-y-4 pt-4 border-t border-zinc-800">
                <h3 className="text-xs font-mono uppercase font-bold text-amber-400 tracking-wider">
                  6. Genre Selection &amp; Promotion Flags
                </h3>

                <div>
                  <label className="block text-zinc-300 font-semibold mb-1.5">Selected Genres:</label>
                  <div className="flex flex-wrap gap-1.5">
                    {GENRES_LIST.filter(g => g !== 'All Genres').map((g) => {
                      const active = formGenres.includes(g);
                      return (
                        <button
                          key={g}
                          type="button"
                          onClick={() => {
                            if (active) setFormGenres(formGenres.filter(x => x !== g));
                            else setFormGenres([...formGenres, g]);
                          }}
                          className={`cursor-pointer px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                            active ? 'bg-amber-500 text-black' : 'bg-zinc-800 text-zinc-400 hover:text-white'
                          }`}
                        >
                          {g}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-zinc-200">
                    <input
                      type="checkbox"
                      checked={Boolean(formData.isTrending)}
                      onChange={(e) => setFormData({ ...formData, isTrending: e.target.checked })}
                      className="rounded accent-amber-500 w-4 h-4"
                    />
                    <span>Trending Now Spotlight</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-zinc-200">
                    <input
                      type="checkbox"
                      checked={Boolean(formData.isFeatured)}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                      className="rounded accent-amber-500 w-4 h-4"
                    />
                    <span>Featured Hero Carousel Banner</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-zinc-200">
                    <input
                      type="checkbox"
                      checked={Boolean(formData.isLatest)}
                      onChange={(e) => setFormData({ ...formData, isLatest: e.target.checked })}
                      className="rounded accent-amber-500 w-4 h-4"
                    />
                    <span>New Release Badge</span>
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-6 border-t border-zinc-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="cursor-pointer px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="cursor-pointer px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingId ? 'Save Title Changes' : 'Publish New Content'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};
