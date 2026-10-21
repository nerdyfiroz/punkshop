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
  isR2Hosted?: boolean;
  r2Key?: string;
  sizeBytes?: number;
}

export interface HostedVideo {
  id: string;
  title: string;
  description: string;
  category: string;
  r2Key: string;
  thumbnailUrl: string;
  sizeBytes: number;
  durationFormatted?: string;
  contentType: string;
  qualityBadge?: string;
  createdAt: number;
  views: number;
  downloadsCount: number;
  slug: string;
}

export function formatBytes(bytes: number, decimals: number = 2): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function hostedVideoToMediaItem(video: HostedVideo): MediaItem {
  const formattedSize = formatBytes(video.sizeBytes);
  const streamUrl = `/api/stream?id=${encodeURIComponent(video.id)}`;
  const downloadUrl = `/api/download?id=${encodeURIComponent(video.id)}`;

  return {
    id: video.id,
    title: video.title,
    slug: video.slug || video.id,
    type: 'movie',
    posterUrl: video.thumbnailUrl || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80',
    backdropUrl: video.thumbnailUrl || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1920&q=80',
    overview: video.description || 'Hosted on PunkShop private Cloudflare R2 storage with instant streaming and direct download.',
    editorialReview: `Official PunkShop private R2 stream. Features ultra-fast seekable playback via Cloudflare R2 edge network with zero buffering and direct full-speed downloads.`,
    releaseYear: new Date(video.createdAt || Date.now()).getFullYear(),
    releaseDate: new Date(video.createdAt || Date.now()).toISOString().split('T')[0],
    rating: 9.8,
    voteCount: 1420,
    genres: [video.category || 'Cyberpunk', 'R2 Hosted', 'Direct Stream'],
    duration: video.durationFormatted || 'HD Video',
    ageRating: 'PG-13',
    director: 'PunkShop Studio',
    cast: [
      { name: 'Cloudflare R2', character: 'High Speed Edge Storage', photo: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=300&q=80' }
    ],
    country: 'United States',
    quality: (video.qualityBadge as QualityBadge) || '1080p FHD',
    audio: ['English (Stereo)', 'Original Audio'],
    subtitles: ['English', 'Spanish'],
    servers: [
      {
        id: 'r2-fast-edge',
        name: 'Cloudflare R2 Direct Edge',
        region: 'Global CDN',
        badge: 'Zero-Egress Free',
        quality: video.qualityBadge || '1080p FHD',
        videoUrl: streamUrl,
      },
    ],
    videoUrl: streamUrl,
    downloadOptions: [
      {
        id: `dl-${video.id}`,
        quality: (video.qualityBadge as QualityBadge) || '1080p FHD',
        resolution: '1920x1080',
        format: video.contentType === 'video/webm' ? 'WEBM' : 'MP4',
        size: formattedSize,
        codec: 'H.264 / AAC',
        audio: 'Original',
        directUrl: downloadUrl,
      },
    ],
    isR2Hosted: true,
    r2Key: video.r2Key,
    sizeBytes: video.sizeBytes,
    views: video.views || 0,
    downloadsCount: video.downloadsCount || 0,
    faq: [
      {
        question: 'How fast is streaming from Cloudflare R2?',
        answer: 'Cloudflare R2 serves videos directly from nearest edge locations with zero egress fees and full HTTP byte-range scrubbing support.',
      },
      {
        question: 'Are downloads free and direct?',
        answer: 'Yes! Clicking Download generates a temporary signed direct attachment link without sending bytes through Vercel.',
      },
    ],
  };
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

