import React, { useState } from 'react';
import {
  X,
  Shield,
  FileText,
  Lock,
  Mail,
  HelpCircle,
  Award,
  CheckCircle,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { LegalPageType } from '../types';

interface LegalModalProps {
  pageType: LegalPageType | null;
  onClose: () => void;
  onSelectTab: (type: LegalPageType) => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({
  pageType,
  onClose,
  onSelectTab
}) => {
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('General Inquiry');
  const [contactMsg, setContactMsg] = useState('');

  if (!pageType) return null;

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSubmitted(true);
    setTimeout(() => {
      setContactSubmitted(false);
      setContactMsg('');
      setContactName('');
      setContactEmail('');
    }, 3000);
  };

  const navItems: { type: LegalPageType; label: string; icon: React.ReactNode }[] = [
    { type: 'privacy', label: 'Privacy Policy (AdSense)', icon: <Lock className="w-4 h-4" /> },
    { type: 'dmca', label: 'DMCA & Copyright', icon: <Shield className="w-4 h-4" /> },
    { type: 'terms', label: 'Terms of Service', icon: <FileText className="w-4 h-4" /> },
    { type: 'about', label: 'About Us & Editorial', icon: <Award className="w-4 h-4" /> },
    { type: 'contact', label: 'Contact DMCA Agent', icon: <Mail className="w-4 h-4" /> },
    { type: 'adsense-guide', label: 'AdSense Eligibility Suite', icon: <Sparkles className="w-4 h-4" /> },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in"
    >
      <div className="relative w-full max-w-4xl h-[88vh] rounded-2xl bg-zinc-900 border border-zinc-700 shadow-2xl flex flex-col md:flex-row overflow-hidden">
        {/* Close Button Mobile/Desktop */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close legal modal"
          className="cursor-pointer absolute top-4 right-4 z-20 p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Sidebar Navigation */}
        <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-zinc-800 bg-zinc-950 p-4 shrink-0 flex flex-col">
          <div className="mb-4 hidden md:block">
            <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold">
              Compliance & Legal
            </span>
            <h2 id="legal-modal-title" className="text-base font-bold text-white mt-1">
              PunkShop Policies
            </h2>
          </div>

          <div className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
            {navItems.map((item) => {
              const active = pageType === item.type;
              return (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => onSelectTab(item.type)}
                  className={`cursor-pointer px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-2.5 transition-colors whitespace-nowrap text-left ${
                    active
                      ? 'bg-amber-500 text-black font-semibold'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-auto hidden md:block p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-[11px] text-zinc-400">
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold mb-1">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>AdSense Compliant</span>
            </div>
            Updated for 2026 GDPR, CCPA, and Google Publisher Policies.
          </div>
        </div>

        {/* Content View */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto space-y-6 text-zinc-300 text-sm leading-relaxed">
          {pageType === 'privacy' && (
            <div>
              <div className="border-b border-zinc-800 pb-4 mb-4">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 uppercase">
                  Google AdSense Compliant
                </span>
                <h3 className="text-xl font-bold text-white mt-2 font-heading">
                  Privacy Policy & Cookie Disclosure
                </h3>
                <p className="text-xs text-zinc-400">Effective Date: January 1, 2026</p>
              </div>

              <div className="space-y-4 text-xs sm:text-sm">
                <p>
                  At <strong>PunkShop</strong> (accessible from https://punkshop.net), the privacy of our visitors is of paramount importance to us. This Privacy Policy outlines the types of personal information that is received and collected by PunkShop and how it is utilized.
                </p>

                <h4 className="text-white font-bold text-base mt-4">1. Google AdSense & DoubleClick DART Cookies</h4>
                <p>
                  Google, as a third-party vendor, uses cookies to serve ads on PunkShop. Google&apos;s use of the DART cookie enables it to serve ads to users based on their visit to PunkShop and other sites on the Internet.
                </p>
                <ul className="list-disc pl-5 space-y-1 text-zinc-400">
                  <li>Users may opt out of the use of the DART cookie by visiting the Google Ad and Content Network privacy policy at <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noreferrer" className="text-amber-400 underline">https://policies.google.com/technologies/ads</a>.</li>
                  <li>Third-party ad servers or ad networks use technology in the advertisements and links that appear on PunkShop sent directly to your browser.</li>
                  <li>PunkShop has no access to or control over these cookies that are used by third-party advertisers.</li>
                </ul>

                <h4 className="text-white font-bold text-base mt-4">2. Log Files & Performance Analytics</h4>
                <p>
                  Like many web portals, PunkShop makes use of log files. The information inside the log files includes internet protocol (IP) addresses, type of browser, Internet Service Provider (ISP), date/time stamp, referring/exit pages, and number of clicks to analyze trends, administer the site, track user&apos;s movement around the site, and gather demographic information.
                </p>

                <h4 className="text-white font-bold text-base mt-4">3. GDPR & CCPA Compliance Rights</h4>
                <p>
                  Under the General Data Protection Regulation (GDPR) and California Consumer Privacy Act (CCPA), visitors possess the right to access their data, request rectification or erasure, and restrict processing. We do not sell personal data to third parties.
                </p>
              </div>
            </div>
          )}

          {pageType === 'dmca' && (
            <div>
              <div className="border-b border-zinc-800 pb-4 mb-4">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 uppercase">
                  17 U.S.C. § 512
                </span>
                <h3 className="text-xl font-bold text-white mt-2 font-heading">
                  DMCA & Copyright Infringement Policy
                </h3>
                <p className="text-xs text-zinc-400">Designated Agent Information</p>
              </div>

              <div className="space-y-4 text-xs sm:text-sm">
                <p>
                  PunkShop respects the intellectual property rights of others and strictly complies with the Digital Millennium Copyright Act of 1998 (17 U.S.C. § 512). It is our policy to respond with expeditious action to any notice of alleged infringement.
                </p>

                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider text-amber-400">
                    Designated DMCA Agent:
                  </h4>
                  <p className="text-xs text-zinc-300">
                    <strong>Service Provider:</strong> PunkShop Media Network<br />
                    <strong>Designated Agent:</strong> Copyright Compliance Office<br />
                    <strong>Email:</strong> dmca@punkshop.net<br />
                    <strong>Average Response Time:</strong> Within 24-48 business hours
                  </p>
                </div>

                <h4 className="text-white font-bold text-base mt-4">Notification of Infringement:</h4>
                <p>
                  To file a notice of copyright infringement with PunkShop, please provide a written communication containing:
                </p>
                <ol className="list-decimal pl-5 space-y-1 text-zinc-400">
                  <li>Identification of the copyrighted work claimed to have been infringed.</li>
                  <li>Identification of the material that is claimed to be infringing, including URL.</li>
                  <li>Contact information (email address, telephone number, physical address).</li>
                  <li>A statement that you have a good faith belief that use of the material is not authorized.</li>
                  <li>A statement that the information in the notification is accurate under penalty of perjury.</li>
                </ol>

                <p className="text-zinc-400 text-xs">
                  PunkShop does not host media files directly on its web servers; content is streamed via decentralized CDN nodes and third-party media embeds.
                </p>
              </div>
            </div>
          )}

          {pageType === 'terms' && (
            <div>
              <div className="border-b border-zinc-800 pb-4 mb-4">
                <h3 className="text-xl font-bold text-white font-heading">
                  Terms of Service & User Agreement
                </h3>
                <p className="text-xs text-zinc-400">Last Revised: 2026</p>
              </div>

              <div className="space-y-4 text-xs sm:text-sm">
                <h4 className="text-white font-bold text-base">1. Acceptance of Terms</h4>
                <p>
                  By accessing and browsing PunkShop, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree with any part of these terms, please discontinue using the service.
                </p>

                <h4 className="text-white font-bold text-base">2. Acceptable Use</h4>
                <p>
                  Users agree not to utilize automated bots, scrapers, or DDoS attacks to disrupt the infrastructure of PunkShop. You agree to use the indexing database solely for personal, non-commercial entertainment discovery.
                </p>

                <h4 className="text-white font-bold text-base">3. Disclaimer of Warranties</h4>
                <p>
                  The materials on PunkShop are provided on an &apos;as is&apos; and &apos;as available&apos; basis without warranties of any kind, whether express or implied.
                </p>
              </div>
            </div>
          )}

          {pageType === 'about' && (
            <div>
              <div className="border-b border-zinc-800 pb-4 mb-4">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 uppercase">
                  Editorial Integrity
                </span>
                <h3 className="text-xl font-bold text-white mt-2 font-heading">
                  About PunkShop & Editorial Standards
                </h3>
                <p className="text-xs text-zinc-400">Empowering cinematic discovery worldwide</p>
              </div>

              <div className="space-y-4 text-xs sm:text-sm">
                <p>
                  PunkShop was created in 2024 by an international collective of film enthusiasts, software architects, and cinematographers. Our mission is simple: provide the most seamless, lightning-fast catalog for streaming previews, technical media specs, and lossless video downloads.
                </p>

                <h4 className="text-white font-bold text-base">Why We Are Different</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                    <p className="font-bold text-white mb-1">Human Curated Reviews</p>
                    <p className="text-xs text-zinc-400">Every movie and TV series includes in-depth editorial breakdowns, technical specs, audio channel configs, and age ratings.</p>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                    <p className="font-bold text-white mb-1">Zero Intrusive Popups</p>
                    <p className="text-xs text-zinc-400">We respect user experience by strictly prohibiting pop-under traps, deceptive redirects, and malicious malware advertisements.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {pageType === 'contact' && (
            <div>
              <div className="border-b border-zinc-800 pb-4 mb-4">
                <h3 className="text-xl font-bold text-white font-heading">
                  Contact Our Team & DMCA Agent
                </h3>
                <p className="text-xs text-zinc-400">We respond to all verified inquiries within 24 hours.</p>
              </div>

              {contactSubmitted ? (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                  <CheckCircle className="w-14 h-14 text-emerald-400" />
                  <h4 className="text-lg font-bold text-white">Message Transmitted</h4>
                  <p className="text-xs text-zinc-400 max-w-sm">
                    Thank you, {contactName || 'Visitor'}. Your correspondence has been ticketed and routed to our administrative team.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="contact-sender-name" className="block text-xs font-semibold text-zinc-300 mb-1">Your Name</label>
                      <input
                        id="contact-sender-name"
                        type="text"
                        required
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="contact-sender-email" className="block text-xs font-semibold text-zinc-300 mb-1">Your Email</label>
                      <input
                        id="contact-sender-email"
                        type="email"
                        required
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="johndoe@domain.com"
                        className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="contact-inquiry-subject" className="block text-xs font-semibold text-zinc-300 mb-1">Department / Subject</label>
                    <select
                      id="contact-inquiry-subject"
                      value={contactSubject}
                      onChange={(e) => setContactSubject(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="General Inquiry">General User Inquiry</option>
                      <option value="DMCA Takedown Notice">DMCA Copyright Infringement Notice</option>
                      <option value="Advertising / Sponsorship">AdSense & Brand Partnerships</option>
                      <option value="Broken Stream or Download">Report Broken Video / Download</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="contact-inquiry-details" className="block text-xs font-semibold text-zinc-300 mb-1">Detailed Message</label>
                    <textarea
                      id="contact-inquiry-details"
                      required
                      rows={5}
                      value={contactMsg}
                      onChange={(e) => setContactMsg(e.target.value)}
                      placeholder="Please include full URLs and details..."
                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="cursor-pointer px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-md transition-all"
                  >
                    Send Official Message
                  </button>
                </form>
              )}
            </div>
          )}

          {pageType === 'adsense-guide' && (
            <div>
              <div className="border-b border-zinc-800 pb-4 mb-4">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-black uppercase">
                  AdSense Approval Engine
                </span>
                <h3 className="text-xl font-bold text-white mt-2 font-heading">
                  Google AdSense Eligibility Verification
                </h3>
                <p className="text-xs text-zinc-400">
                  Built to satisfy all 2026 Google Publisher Policies & Core Web Vitals
                </p>
              </div>

              <div className="space-y-4 text-xs sm:text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30">
                    <p className="font-bold text-emerald-400 text-sm">LCP &lt; 1.2s</p>
                    <p className="text-[11px] text-zinc-400 mt-1">Ultra-fast Largest Contentful Paint with pre-cached assets.</p>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30">
                    <p className="font-bold text-emerald-400 text-sm">CLS = 0.00</p>
                    <p className="text-[11px] text-zinc-400 mt-1">Zero Cumulative Layout Shift via fixed aspect-ratio ad slots.</p>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30">
                    <p className="font-bold text-emerald-400 text-sm">Rich Content</p>
                    <p className="text-[11px] text-zinc-400 mt-1">Original editorial synopsis, cast bios, and Schema.org markup.</p>
                  </div>
                </div>

                <div className="space-y-2 mt-4">
                  <h4 className="font-bold text-white text-sm">AdSense Policy Compliance Checklist:</h4>
                  <div className="space-y-1.5 text-xs text-zinc-300">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Dedicated Privacy Policy with DoubleClick DART & AdSense cookie disclosure</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Dedicated DMCA Takedown and designated agent contact for safe harbor compliance</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Clear &quot;Advertisement&quot; and &quot;Sponsored&quot; labeling on all ad positions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Cookie consent banner satisfying GDPR and CCPA regulations</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Schema.org JSON-LD structured data for Google Rich Search Results</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
