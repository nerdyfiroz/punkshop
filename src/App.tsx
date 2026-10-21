import React, { useState, useEffect, useCallback } from 'react';
import { MediaItem, DownloadOption, FilterState, LegalPageType, UserReview } from './types';
import { MOCK_MEDIA, INITIAL_REVIEWS } from './data/mockMedia';
import { updatePageSEO } from './utils/seo';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { DownloadModal } from './components/DownloadModal';
import { RequestMovieModal } from './components/RequestMovieModal';
import { LegalModal } from './components/LegalModal';
import { CookieBanner } from './components/CookieBanner';
import { SitemapView } from './components/SitemapView';
import { AdSenseBanner } from './components/AdSenseBanner';
import { HomeView } from './views/HomeView';
import { DetailView } from './views/DetailView';
import { CatalogView } from './views/CatalogView';
import { LibraryView } from './views/LibraryView';
import { AdminView } from './views/AdminView';

const defaultFilters: FilterState = {
  query: '',
  type: 'all',
  genre: 'All Genres',
  year: 'All Years',
  quality: 'All Qualities',
  sortBy: 'trending'
};

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [downloadModalMedia, setDownloadModalMedia] = useState<MediaItem | null>(null);
  const [downloadModalOption, setDownloadModalOption] = useState<DownloadOption | undefined>(undefined);
  const [requestModalOpen, setRequestModalOpen] = useState<boolean>(false);
  const [legalPage, setLegalPage] = useState<LegalPageType | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filters, setFilters] = useState<FilterState>(defaultFilters);

  // Dynamic Media Catalog with LocalStorage Persistence
  const [mediaList, setMediaList] = useState<MediaItem[]>(() => {
    try {
      const saved = localStorage.getItem('punkshop_media_catalog');
      return saved ? JSON.parse(saved) : MOCK_MEDIA;
    } catch {
      return MOCK_MEDIA;
    }
  });

  // Watchlist persisted state
  const [watchlist, setWatchlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('punkshop_watchlist');
      return saved ? JSON.parse(saved) : ['cyber-chronicles-2099', 'chronicles-of-the-abyss'];
    } catch {
      return [];
    }
  });

  // User reviews persisted state
  const [reviewsMap, setReviewsMap] = useState<Record<string, UserReview[]>>(() => {
    try {
      const saved = localStorage.getItem('punkshop_reviews_data');
      return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
    } catch {
      return INITIAL_REVIEWS;
    }
  });

  // Sync media list to localStorage
  useEffect(() => {
    localStorage.setItem('punkshop_media_catalog', JSON.stringify(mediaList));
  }, [mediaList]);

  // Sync watchlist to localStorage
  useEffect(() => {
    localStorage.setItem('punkshop_watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  // Sync reviews to localStorage
  useEffect(() => {
    localStorage.setItem('punkshop_reviews_data', JSON.stringify(reviewsMap));
  }, [reviewsMap]);

  // Deep Link & URL Hash Synchronizer
  const parseHash = useCallback(() => {
    const hash = window.location.hash.replace(/^#/, '');
    if (!hash) {
      setCurrentTab('home');
      setSelectedMedia(null);
      return;
    }

    if (hash.startsWith('watch?id=')) {
      const id = hash.replace('watch?id=', '');
      const found = mediaList.find((m) => m.id === id || m.slug === id);
      if (found) {
        setSelectedMedia(found);
        return;
      }
    }

    if (hash.startsWith('download?id=')) {
      const id = hash.replace('download?id=', '');
      const found = mediaList.find((m) => m.id === id || m.slug === id);
      if (found) {
        setSelectedMedia(found);
        setDownloadModalMedia(found);
        return;
      }
    }

    if (['privacy', 'dmca', 'terms', 'about', 'contact', 'adsense-guide'].includes(hash)) {
      setLegalPage(hash as LegalPageType);
      return;
    }

    if (hash === 'sitemap') {
      setCurrentTab('sitemap');
      setSelectedMedia(null);
      return;
    }

    if (hash === 'admin') {
      setCurrentTab('admin');
      setSelectedMedia(null);
      return;
    }

    if (['home', 'movies', 'tv', 'anime', 'top-imdb', 'trending', 'library'].includes(hash)) {
      setCurrentTab(hash);
      setSelectedMedia(null);
      if (hash === 'movies') setFilters({ ...defaultFilters, type: 'movie' });
      else if (hash === 'tv') setFilters({ ...defaultFilters, type: 'tv' });
      else if (hash === 'anime') setFilters({ ...defaultFilters, type: 'anime' });
      else if (hash === 'top-imdb') setFilters({ ...defaultFilters, sortBy: 'rating' });
      else if (hash === 'trending') setFilters({ ...defaultFilters, sortBy: 'trending' });
    }
  }, [mediaList]);

  useEffect(() => {
    parseHash();
    window.addEventListener('hashchange', parseHash);
    return () => window.removeEventListener('hashchange', parseHash);
  }, [parseHash]);

  // Dynamic SEO Synchronization
  useEffect(() => {
    if (selectedMedia) {
      updatePageSEO({
        title: `${selectedMedia.title} (${selectedMedia.releaseYear}) – Watch Online & Free HD Download`,
        description: `Watch ${selectedMedia.title} online in 4K / 1080p or download direct MP4. ${selectedMedia.overview}`,
        image: selectedMedia.posterUrl,
        type: selectedMedia.type === 'movie' ? 'video.movie' : 'video.tv_show',
        media: selectedMedia,
        breadcrumbs: [
          { name: 'Home', item: 'https://punkshop.net' },
          { name: selectedMedia.type === 'tv' ? 'TV Shows' : 'Movies', item: `https://punkshop.net/#${selectedMedia.type}` },
          { name: selectedMedia.genres[0], item: `https://punkshop.net/#genre=${selectedMedia.genres[0]}` },
          { name: selectedMedia.title, item: `https://punkshop.net/#watch?id=${selectedMedia.slug}` }
        ]
      });
    } else if (currentTab === 'movies') {
      updatePageSEO({
        title: 'HD Movies – Watch Online & Fast Downloads | PunkShop',
        description: 'Browse the latest HD and 4K movies with multi-language subtitles and direct fast server downloads.',
        breadcrumbs: [{ name: 'Home', item: 'https://punkshop.net' }, { name: 'Movies', item: 'https://punkshop.net/#movies' }]
      });
    } else if (currentTab === 'tv') {
      updatePageSEO({
        title: 'TV Series & Full Seasons – Stream & Download | PunkShop',
        description: 'Stream popular TV shows and download complete episodic season packs in high bitrate 1080p and 720p.',
        breadcrumbs: [{ name: 'Home', item: 'https://punkshop.net' }, { name: 'TV Shows', item: 'https://punkshop.net/#tv' }]
      });
    } else if (currentTab === 'anime') {
      updatePageSEO({
        title: 'Anime Stream & Download (Sub & Dub) | PunkShop',
        description: 'Watch Japanese anime in 1080p with English subtitles and dubbing options, fast direct download links.',
        breadcrumbs: [{ name: 'Home', item: 'https://punkshop.net' }, { name: 'Anime', item: 'https://punkshop.net/#anime' }]
      });
    } else if (currentTab === 'sitemap') {
      updatePageSEO({
        title: 'SEO XML Sitemap & Google Indexing Slugs | PunkShop',
        description: 'Review PunkShop live search engine sitemap, video nodes, and robots.txt crawler protocol.'
      });
    } else if (currentTab === 'admin') {
      updatePageSEO({
        title: 'Admin Content & Streaming Manager | PunkShop',
        description: 'Administrator panel to add, edit, and remove video streams, download links, and titles.'
      });
    } else {
      updatePageSEO({
        title: 'PunkShop – Stream & Download Movies and TV Shows Online in HD',
        description: 'Stream & download full HD movies and TV series online with ultra-fast servers and multi-resolution downloads. High quality cinema with zero buffering.'
      });
    }
  }, [selectedMedia, currentTab]);

  // Fetch initial media from MongoDB when connected on Vercel
  useEffect(() => {
    fetch('/api/media')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.success && Array.isArray(data.items) && data.items.length > 0) {
          setMediaList((prev) => {
            const map = new Map<string, MediaItem>();
            prev.forEach((item) => map.set(item.id, item));
            data.items.forEach((item: MediaItem) => map.set(item.id, item));
            return Array.from(map.values());
          });
        }
      })
      .catch(() => {
        // Fallback to local catalog
      });
  }, []);

  // Handlers for Admin Operations with MongoDB Sync
  const handleAddMedia = (newMedia: MediaItem) => {
    setMediaList((prev) => [newMedia, ...prev]);
    // Asynchronously sync to MongoDB on Vercel
    fetch('/api/media', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMedia),
    }).catch(() => {});
  };

  const handleUpdateMedia = (updatedMedia: MediaItem) => {
    setMediaList((prev) =>
      prev.map((item) => (item.id === updatedMedia.id ? updatedMedia : item))
    );
    if (selectedMedia?.id === updatedMedia.id) {
      setSelectedMedia(updatedMedia);
    }
    // Asynchronously sync to MongoDB on Vercel
    fetch('/api/media', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedMedia),
    }).catch(() => {});
  };

  const handleDeleteMedia = (id: string) => {
    setMediaList((prev) => prev.filter((item) => item.id !== id));
    if (selectedMedia?.id === id) {
      setSelectedMedia(null);
    }
    // Asynchronously sync to MongoDB on Vercel
    fetch(`/api/media?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }).catch(() => {});
  };

  const handleResetDefaultMedia = () => {
    setMediaList(MOCK_MEDIA);
    localStorage.removeItem('punkshop_media_catalog');
  };

  const handleExportMedia = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(mediaList, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `punkshop_media_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportMedia = (importedItems: MediaItem[]) => {
    setMediaList(importedItems);
  };

  const handleDeleteReview = (mediaId: string, reviewId: string) => {
    setReviewsMap((prev) => {
      const currentList = prev[mediaId] || [];
      const updated = currentList.filter((r) => r.id !== reviewId);
      return { ...prev, [mediaId]: updated };
    });
  };

  // General Handlers
  const handleSelectMedia = (media: MediaItem) => {
    setSelectedMedia(media);
    window.location.hash = `watch?id=${media.slug}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDownloadMedia = (media: MediaItem, option?: DownloadOption) => {
    setDownloadModalMedia(media);
    setDownloadModalOption(option);
  };

  const handleToggleWatchlist = (media: MediaItem) => {
    setWatchlist((prev) => {
      if (prev.includes(media.id)) {
        return prev.filter((id) => id !== media.id);
      }
      return [...prev, media.id];
    });
  };

  const handleSelectTab = (tab: string) => {
    setSelectedMedia(null);
    setCurrentTab(tab);
    window.location.hash = tab === 'home' ? '' : tab;

    if (tab === 'movies') {
      setFilters({ ...defaultFilters, type: 'movie' });
    } else if (tab === 'tv') {
      setFilters({ ...defaultFilters, type: 'tv' });
    } else if (tab === 'anime') {
      setFilters({ ...defaultFilters, type: 'anime' });
    } else if (tab === 'top-imdb') {
      setFilters({ ...defaultFilters, sortBy: 'rating' });
    } else if (tab === 'trending') {
      setFilters({ ...defaultFilters, sortBy: 'trending' });
    } else if (tab === 'home') {
      setFilters(defaultFilters);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExploreCategory = (category: string) => {
    setSelectedMedia(null);
    if (category === 'all') {
      setCurrentTab('catalog');
      setFilters(defaultFilters);
    } else if (category === '4k') {
      setCurrentTab('catalog');
      setFilters({ ...defaultFilters, quality: '4K UHD' });
    } else if (category === 'movies' || category === 'movie') {
      handleSelectTab('movies');
    } else if (category === 'tv') {
      handleSelectTab('tv');
    } else if (category === 'trending') {
      handleSelectTab('trending');
    } else {
      setCurrentTab('catalog');
      setFilters({ ...defaultFilters, genre: category });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    if (q.trim()) {
      if (selectedMedia) setSelectedMedia(null);
      setCurrentTab('catalog');
      setFilters((prev) => ({ ...prev, query: q }));
    }
  };

  const handleAddReview = (mediaId: string, newRev: Omit<UserReview, 'id' | 'likes'>) => {
    const rev: UserReview = {
      ...newRev,
      id: Date.now().toString(),
      likes: 0
    };
    setReviewsMap((prev) => ({
      ...prev,
      [mediaId]: [rev, ...(prev[mediaId] || [])]
    }));
  };

  const handleLikeReview = (reviewId: string) => {
    if (!selectedMedia) return;
    setReviewsMap((prev) => {
      const currentList = prev[selectedMedia.id] || [];
      const updated = currentList.map((r) =>
        r.id === reviewId ? { ...r, likes: r.likes + 1 } : r
      );
      return { ...prev, [selectedMedia.id]: updated };
    });
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-between selection:bg-amber-500 selection:text-black">
      {/* Top Main Navigation Header */}
      <Navbar
        currentTab={selectedMedia ? '' : currentTab}
        onSelectTab={handleSelectTab}
        onSelectMedia={handleSelectMedia}
        watchlistCount={watchlist.length}
        onRequestOpen={() => setRequestModalOpen(true)}
        onOpenSitemap={() => {
          setSelectedMedia(null);
          setCurrentTab('sitemap');
          window.location.hash = 'sitemap';
        }}
        onOpenLegal={(page) => setLegalPage(page)}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6">
        {selectedMedia ? (
          <DetailView
            media={selectedMedia}
            allMedia={mediaList}
            onSelectMedia={handleSelectMedia}
            onDownloadMedia={handleDownloadMedia}
            isWatchlisted={watchlist.includes(selectedMedia.id)}
            onToggleWatchlist={handleToggleWatchlist}
            onBackToHome={() => {
              setSelectedMedia(null);
              setCurrentTab('home');
              window.location.hash = '';
            }}
            onSelectCategory={handleExploreCategory}
            reviews={reviewsMap[selectedMedia.id] || []}
            onAddReview={handleAddReview}
            onLikeReview={handleLikeReview}
          />
        ) : currentTab === 'home' ? (
          <HomeView
            mediaList={mediaList}
            onSelectMedia={handleSelectMedia}
            onDownloadMedia={handleDownloadMedia}
            onExploreCategory={handleExploreCategory}
            watchlist={watchlist}
            onToggleWatchlist={handleToggleWatchlist}
          />
        ) : currentTab === 'admin' ? (
          <AdminView
            mediaList={mediaList}
            onAddMedia={handleAddMedia}
            onUpdateMedia={handleUpdateMedia}
            onDeleteMedia={handleDeleteMedia}
            onResetDefaultMedia={handleResetDefaultMedia}
            onExportMedia={handleExportMedia}
            onImportMedia={handleImportMedia}
            reviewsMap={reviewsMap}
            onDeleteReview={handleDeleteReview}
            onViewMedia={handleSelectMedia}
            onExitAdmin={() => handleSelectTab('home')}
          />
        ) : currentTab === 'library' ? (
          <LibraryView
            allMedia={mediaList}
            watchlist={watchlist}
            onToggleWatchlist={handleToggleWatchlist}
            onSelectMedia={handleSelectMedia}
            onDownloadMedia={handleDownloadMedia}
            onExplore={() => handleSelectTab('home')}
          />
        ) : currentTab === 'sitemap' ? (
          <SitemapView />
        ) : (
          <CatalogView
            title={
              currentTab === 'movies'
                ? 'Featured HD Movies'
                : currentTab === 'tv'
                ? 'TV Shows & Seasons'
                : currentTab === 'anime'
                ? 'Anime Series (Sub & Dub)'
                : currentTab === 'top-imdb'
                ? 'Top Rated on IMDb'
                : currentTab === 'trending'
                ? 'Trending Cinema & Shows'
                : 'Browse Entertainment Catalog'
            }
            mediaList={mediaList}
            filters={filters}
            onFilterChange={setFilters}
            onResetFilters={() => setFilters(defaultFilters)}
            onSelectMedia={handleSelectMedia}
            onDownloadMedia={handleDownloadMedia}
            watchlist={watchlist}
            onToggleWatchlist={handleToggleWatchlist}
            onRequestOpen={() => setRequestModalOpen(true)}
          />
        )}
      </main>

      {/* Bottom Sticky AdSense Banner (Only shown outside admin view) */}
      {currentTab !== 'admin' && (
        <AdSenseBanner slotType="sticky" slotId="pub-sticky-bottom-anchor" />
      )}

      {/* GDPR / CCPA AdSense Cookie Banner */}
      <CookieBanner onOpenPrivacy={(p) => setLegalPage(p)} />

      {/* Download Hub Modal */}
      {downloadModalMedia && (
        <DownloadModal
          media={downloadModalMedia}
          initialOption={downloadModalOption}
          isOpen={true}
          onClose={() => {
            setDownloadModalMedia(null);
            setDownloadModalOption(undefined);
          }}
        />
      )}

      {/* Request Content Modal */}
      <RequestMovieModal
        isOpen={requestModalOpen}
        onClose={() => setRequestModalOpen(false)}
      />

      {/* Legal & AdSense Compliance Modal */}
      <LegalModal
        pageType={legalPage}
        onClose={() => setLegalPage(null)}
        onSelectTab={(page) => setLegalPage(page)}
      />

      {/* Comprehensive Footer with AdSense Policies */}
      <Footer
        onOpenLegal={(page) => setLegalPage(page)}
        onSelectTab={handleSelectTab}
        onOpenSitemap={() => {
          setSelectedMedia(null);
          setCurrentTab('sitemap');
          window.location.hash = 'sitemap';
        }}
      />
    </div>
  );
}
