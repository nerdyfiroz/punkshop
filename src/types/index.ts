export type MediaType = 'movie' | 'tv' | 'anime';

export type QualityBadge = '4K UHD' | '1080p FHD' | '720p HD' | '480p SD';

export interface StreamServer {
  id: string;
  name: string;
  region: string;
  badge: string;
  quality: string;
  videoUrl: string;
}

export interface DownloadOption {
  id: string;
  quality: QualityBadge;
  resolution: string;
  format: string;
  size: string;
  codec: string;
  audio: string;
  directUrl: string;
  torrentName?: string;
  seeders?: number;
  leechers?: number;
}

export interface Episode {
  id: string;
  episodeNumber: number;
  seasonNumber: number;
  title: string;
  duration: string;
  overview: string;
  stillUrl: string;
  videoUrl: string;
  downloadOptions: DownloadOption[];
}

export interface Season {
  seasonNumber: number;
  title: string;
  episodeCount: number;
  episodes: Episode[];
}

export interface CastMember {
  name: string;
  character: string;
  photo: string;
}

export interface MediaFAQ {
  question: string;
  answer: string;
}

export interface MediaItem {
  id: string;
  title: string;
  slug: string;
  type: MediaType;
  posterUrl: string;
  backdropUrl: string;
  overview: string;
  editorialReview: string; // Crucial for Google AdSense editorial quality
  releaseYear: number;
  releaseDate: string;
  rating: number; // IMDb rating
  voteCount: number;
  genres: string[];
  duration: string;
  ageRating: string;
  director: string;
  cast: CastMember[];
  country: string;
  quality: QualityBadge;
  audio: string[];
  subtitles: string[];
  servers: StreamServer[];
  videoUrl: string;
  downloadOptions: DownloadOption[];
  seasons?: Season[];
  isTrending?: boolean;
  isFeatured?: boolean;
  isLatest?: boolean;
  views: number;
  downloadsCount: number;
  faq: MediaFAQ[];
}

export interface UserReview {
  id: string;
  mediaId: string;
  author: string;
  rating: number;
  date: string;
  content: string;
  likes: number;
}

export interface FilterState {
  query: string;
  type: string;
  genre: string;
  year: string;
  quality: string;
  sortBy: string;
}

export type LegalPageType =
  | 'dmca'
  | 'privacy'
  | 'terms'
  | 'about'
  | 'contact'
  | 'adsense-guide'
  | 'sitemap';
