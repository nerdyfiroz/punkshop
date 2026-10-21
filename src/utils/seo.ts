import { MediaItem } from '../types';

interface SeoProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'video.movie' | 'video.tv_show';
  media?: MediaItem;
  breadcrumbs?: { name: string; item: string }[];
}

export function updatePageSEO({
  title,
  description,
  image,
  url,
  type = 'website',
  media,
  breadcrumbs = []
}: SeoProps) {
  if (typeof document === 'undefined') return;

  const siteName = 'PunkShop';
  const finalTitle = title 
    ? `${title} | ${siteName}` 
    : 'PunkShop – Stream & Download Movies and TV Shows Online in HD';
  
  const finalDesc = description || 
    'Stream & download full HD movies and TV series online with ultra-fast servers and multi-resolution downloads. High quality cinema with zero buffering.';

  const finalUrl = url || (window.location.origin + window.location.pathname + window.location.hash);
  const finalImage = image || (media?.posterUrl || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1200&q=80');

  // Update Title
  document.title = finalTitle;

  // Helper to set meta attribute
  const setMeta = (nameAttr: string, key: string, content: string) => {
    let el = document.querySelector(`meta[${nameAttr}="${key}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(nameAttr, key);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  // Standard SEO
  setMeta('name', 'description', finalDesc);

  // OpenGraph
  setMeta('property', 'og:title', finalTitle);
  setMeta('property', 'og:description', finalDesc);
  setMeta('property', 'og:type', type);
  setMeta('property', 'og:url', finalUrl);
  setMeta('property', 'og:image', finalImage);
  setMeta('property', 'og:site_name', siteName);

  // Twitter
  setMeta('name', 'twitter:card', 'summary_large_image');
  setMeta('name', 'twitter:title', finalTitle);
  setMeta('name', 'twitter:description', finalDesc);
  setMeta('name', 'twitter:image', finalImage);

  // Update Canonical
  let canonicalEl = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
  if (!canonicalEl) {
    canonicalEl = document.createElement('link');
    canonicalEl.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalEl);
  }
  canonicalEl.setAttribute('href', finalUrl);

  // Update Structured Data JSON-LD
  let scriptEl = document.getElementById('dynamic-schema-ld') as HTMLScriptElement;
  if (!scriptEl) {
    scriptEl = document.createElement('script');
    scriptEl.id = 'dynamic-schema-ld';
    scriptEl.type = 'application/ld+json';
    document.head.appendChild(scriptEl);
  }

  const structuredDataList: object[] = [];

  // Breadcrumbs schema
  if (breadcrumbs.length > 0) {
    structuredDataList.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': breadcrumbs.map((b, idx) => ({
        '@type': 'ListItem',
        'position': idx + 1,
        'name': b.name,
        'item': b.item
      }))
    });
  }

  // Media schema
  if (media) {
    if (media.type === 'movie') {
      structuredDataList.push({
        '@context': 'https://schema.org',
        '@type': 'Movie',
        'name': media.title,
        'image': media.posterUrl,
        'description': media.overview,
        'datePublished': media.releaseDate,
        'director': {
          '@type': 'Person',
          'name': media.director
        },
        'actor': media.cast.map(c => ({
          '@type': 'Person',
          'name': c.name
        })),
        'aggregateRating': {
          '@type': 'AggregateRating',
          'ratingValue': media.rating.toString(),
          'bestRating': '10',
          'ratingCount': media.voteCount.toString()
        },
        'duration': media.duration,
        'genre': media.genres,
        'potentialAction': {
          '@type': 'WatchAction',
          'target': finalUrl
        }
      });
    } else {
      structuredDataList.push({
        '@context': 'https://schema.org',
        '@type': 'TVSeries',
        'name': media.title,
        'image': media.posterUrl,
        'description': media.overview,
        'startDate': media.releaseDate,
        'actor': media.cast.map(c => ({
          '@type': 'Person',
          'name': c.name
        })),
        'aggregateRating': {
          '@type': 'AggregateRating',
          'ratingValue': media.rating.toString(),
          'bestRating': '10',
          'ratingCount': media.voteCount.toString()
        },
        'numberOfSeasons': media.seasons?.length || 1,
        'genre': media.genres
      });
    }

    // VideoObject schema for the video stream
    structuredDataList.push({
      '@context': 'https://schema.org',
      '@type': 'VideoObject',
      'name': `${media.title} Full HD Stream & Download`,
      'description': media.overview,
      'thumbnailUrl': media.posterUrl,
      'uploadDate': media.releaseDate,
      'contentUrl': media.videoUrl,
      'embedUrl': finalUrl
    });
  }

  if (structuredDataList.length > 0) {
    scriptEl.textContent = JSON.stringify(structuredDataList.length === 1 ? structuredDataList[0] : structuredDataList);
  }
}
