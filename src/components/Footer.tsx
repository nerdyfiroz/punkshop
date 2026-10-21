import React from 'react';
import { Play, Shield, Lock, FileText, Mail, Award, Globe, Heart } from 'lucide-react';
import { LegalPageType } from '../types';

interface FooterProps {
  onOpenLegal: (page: LegalPageType) => void;
  onSelectTab: (tab: string) => void;
  onOpenSitemap: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenLegal,
  onSelectTab,
  onOpenSitemap
}) => {
  return (
    <footer className="w-full bg-zinc-950 border-t border-zinc-800/80 pt-12 pb-16 text-zinc-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="space-y-3 md:col-span-1">
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
              className="cursor-pointer flex items-center gap-2 group inline-flex"
            >
              <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center text-black font-black text-sm">
                <Play className="w-4 h-4 fill-black ml-0.5" />
              </div>
              <span className="font-black text-lg tracking-tight text-white font-heading">
                PUNK<span className="text-amber-400">SHOP</span>
              </span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Your premier gateway for streaming and downloading HD movies, binge-worthy TV series, and trending anime with zero intrusive adware.
            </p>
            <div className="pt-2 flex items-center gap-2 text-[11px] text-zinc-500">
              <Globe className="w-3.5 h-3.5 text-amber-500" />
              <span>Global CDN &bull; 99.98% Uptime</span>
            </div>
          </div>

          {/* Quick Categories */}
          <div className="space-y-3">
            <h3 className="text-white font-bold text-xs uppercase tracking-wider font-mono">
              Browse Catalog
            </h3>
            <ul className="space-y-2 text-zinc-400 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => onSelectTab('movies')}
                  className="cursor-pointer hover:text-amber-400 transition-colors"
                >
                  Featured Movies (4K / 1080p)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onSelectTab('tv')}
                  className="cursor-pointer hover:text-amber-400 transition-colors"
                >
                  TV Shows & Full Seasons
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onSelectTab('anime')}
                  className="cursor-pointer hover:text-amber-400 transition-colors"
                >
                  Anime (Sub & Dub)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onSelectTab('top-imdb')}
                  className="cursor-pointer hover:text-amber-400 transition-colors"
                >
                  Top IMDb Hall of Fame
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onSelectTab('trending')}
                  className="cursor-pointer hover:text-amber-400 transition-colors"
                >
                  Trending Now
                </button>
              </li>
            </ul>
          </div>

          {/* AdSense Legal Policies */}
          <div className="space-y-3">
            <h3 className="text-white font-bold text-xs uppercase tracking-wider font-mono">
              AdSense Legal & Compliance
            </h3>
            <ul className="space-y-2 text-zinc-400 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => onOpenLegal('privacy')}
                  className="cursor-pointer hover:text-amber-400 transition-colors flex items-center gap-1.5"
                >
                  <Lock className="w-3 h-3 text-amber-400" />
                  <span>Privacy Policy (GDPR / Cookies)</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenLegal('dmca')}
                  className="cursor-pointer hover:text-amber-400 transition-colors flex items-center gap-1.5"
                >
                  <Shield className="w-3 h-3 text-emerald-400" />
                  <span>DMCA & Copyright Agent</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenLegal('terms')}
                  className="cursor-pointer hover:text-amber-400 transition-colors flex items-center gap-1.5"
                >
                  <FileText className="w-3 h-3" />
                  <span>Terms of Service</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenLegal('about')}
                  className="cursor-pointer hover:text-amber-400 transition-colors flex items-center gap-1.5"
                >
                  <Award className="w-3 h-3" />
                  <span>Editorial Standards & Team</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenLegal('contact')}
                  className="cursor-pointer hover:text-amber-400 transition-colors flex items-center gap-1.5"
                >
                  <Mail className="w-3 h-3" />
                  <span>Contact Designated Agent</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Technical & Webmaster */}
          <div className="space-y-3">
            <h3 className="text-white font-bold text-xs uppercase tracking-wider font-mono">
              Webmaster & SEO
            </h3>
            <p className="text-xs text-zinc-400">
              Structured data compliant with Schema.org specifications and Google Search Console rich video indexing.
            </p>
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={onOpenSitemap}
                className="cursor-pointer px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-amber-400 border border-zinc-800 text-xs flex items-center gap-2 transition-colors"
              >
                <span>XML Sitemap Inspector</span>
              </button>
              <button
                type="button"
                onClick={() => onOpenLegal('adsense-guide')}
                className="cursor-pointer px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-amber-400 border border-zinc-800 text-xs flex items-center gap-2 transition-colors"
              >
                <span>AdSense Monetization Suite</span>
              </button>
            </div>
          </div>
        </div>

        {/* DMCA Legal Safe Harbor Disclaimer Box */}
        <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/80 text-[11px] text-zinc-500 leading-relaxed">
          <p>
            <strong>Legal Notice & Safe Harbor Disclaimer:</strong> PunkShop is a dynamic entertainment directory and editorial catalog. PunkShop does not upload, host, or transmit copyright-protected video streams on its proprietary web servers. All video streams and downloads linked herein are indexed from third-party media nodes, public web endpoints, and decentralized CDN providers. In accordance with the Digital Millennium Copyright Act (17 U.S.C. § 512), PunkShop will respond swiftly to copyright infringement notifications submitted to our designated agent at <span className="text-zinc-400 font-mono">dmca@punkshop.net</span>.
          </p>
        </div>

        {/* Bottom copyright line */}
        <div className="pt-4 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500">
          <p>&copy; {new Date().getFullYear()} PunkShop Media Network. All rights reserved.</p>
          <div className="flex items-center gap-1 text-[11px]">
            <span>Engineered for Ultra-Fast Loading &bull; Core Web Vitals Approved</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
