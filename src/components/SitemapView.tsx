import React, { useState } from 'react';
import { FileCode, Copy, Check, ExternalLink, Globe, Search } from 'lucide-react';
import { MOCK_MEDIA, GENRES_LIST } from '../data/mockMedia';

export const SitemapView: React.FC = () => {
  const [tab, setTab] = useState<'visual' | 'xml' | 'robots'>('visual');
  const [copied, setCopied] = useState(false);

  const baseUrl = 'https://punkshop.net';

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
  <!-- Homepage -->
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>hourly</changefreq>
    <priority>1.0</priority>
  </url>
  <!-- Main Catalog Views -->
  <url>
    <loc>${baseUrl}/movies</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/tv-series</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/anime</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <!-- Dynamic Media Slugs & Video Sitemaps -->
${MOCK_MEDIA.map(
  (m) => `  <url>
    <loc>${baseUrl}/watch/${m.slug}</loc>
    <lastmod>${m.releaseDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
    <video:video>
      <video:thumbnail_loc>${m.posterUrl}</video:thumbnail_loc>
      <video:title>${m.title}</video:title>
      <video:description>${m.overview.replace(/&/g, '&amp;')}</video:description>
      <video:content_loc>${m.videoUrl}</video:content_loc>
      <video:duration>7200</video:duration>
      <video:rating>${m.rating}</video:rating>
    </video:video>
  </url>`
).join('\n')}
</urlset>`;

  const robotsContent = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/private/

# Sitemaps
Sitemap: ${baseUrl}/sitemap.xml
Sitemap: ${baseUrl}/video-sitemap.xml`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5 mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 font-bold uppercase tracking-wider mb-1">
            <Globe className="w-4 h-4" />
            <span>Search Engine Crawling & Indexing</span>
          </div>
          <h1 className="text-2xl font-bold text-white font-heading">
            SEO XML Sitemap & Indexing Architecture
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Googlebot and Bing crawler compatible schema with real-time video sitemaps and canonical slugs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-zinc-900 border border-zinc-800 rounded-xl p-1">
            <button
              type="button"
              onClick={() => setTab('visual')}
              className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                tab === 'visual' ? 'bg-amber-500 text-black font-semibold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Visual Index
            </button>
            <button
              type="button"
              onClick={() => setTab('xml')}
              className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                tab === 'xml' ? 'bg-amber-500 text-black font-semibold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              sitemap.xml
            </button>
            <button
              type="button"
              onClick={() => setTab('robots')}
              className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                tab === 'robots' ? 'bg-amber-500 text-black font-semibold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              robots.txt
            </button>
          </div>
        </div>
      </div>

      {tab === 'visual' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
              <span className="text-xs text-zinc-400">Total Indexed URLs</span>
              <p className="text-2xl font-bold text-amber-400 mt-1">{MOCK_MEDIA.length + 8}</p>
            </div>
            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
              <span className="text-xs text-zinc-400">Video XML Nodes</span>
              <p className="text-2xl font-bold text-emerald-400 mt-1">{MOCK_MEDIA.length}</p>
            </div>
            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
              <span className="text-xs text-zinc-400">Crawl Frequency</span>
              <p className="text-2xl font-bold text-blue-400 mt-1">Hourly / Daily</p>
            </div>
          </div>

          <div className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden">
            <div className="p-4 bg-zinc-950/60 border-b border-zinc-800 flex items-center justify-between">
              <h2 className="text-sm font-bold text-white">Live Search Slugs & Canonical URLs</h2>
              <span className="text-xs text-zinc-400 font-mono">Status: 200 OK (Indexed)</span>
            </div>
            <div className="divide-y divide-zinc-800/80">
              {MOCK_MEDIA.map((m) => (
                <div key={m.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-zinc-800/30 transition-colors">
                  <div>
                    <span className="text-xs font-bold text-white">{m.title}</span>
                    <p className="text-xs text-amber-400/90 font-mono mt-0.5">
                      {baseUrl}/watch/{m.slug}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                    <span className="px-2 py-0.5 rounded bg-zinc-800 text-[10px] uppercase font-bold text-zinc-300">
                      Priority: 0.85
                    </span>
                    <span className="text-zinc-500">{m.releaseDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'xml' && (
        <div className="relative rounded-xl bg-zinc-950 border border-zinc-800 p-4 font-mono text-xs text-zinc-300 overflow-x-auto">
          <div className="flex justify-between items-center mb-3 border-b border-zinc-800 pb-2">
            <span className="text-zinc-400">application/xml</span>
            <button
              type="button"
              onClick={() => copyToClipboard(xmlContent)}
              className="cursor-pointer px-3 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-white text-xs flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy XML'}</span>
            </button>
          </div>
          <pre className="text-zinc-300 whitespace-pre leading-relaxed">{xmlContent}</pre>
        </div>
      )}

      {tab === 'robots' && (
        <div className="relative rounded-xl bg-zinc-950 border border-zinc-800 p-4 font-mono text-xs text-zinc-300 overflow-x-auto">
          <div className="flex justify-between items-center mb-3 border-b border-zinc-800 pb-2">
            <span className="text-zinc-400">text/plain</span>
            <button
              type="button"
              onClick={() => copyToClipboard(robotsContent)}
              className="cursor-pointer px-3 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-white text-xs flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy robots.txt'}</span>
            </button>
          </div>
          <pre className="text-zinc-300 whitespace-pre leading-relaxed">{robotsContent}</pre>
        </div>
      )}
    </div>
  );
};
