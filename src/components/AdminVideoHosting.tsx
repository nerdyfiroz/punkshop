import React, { useState, useEffect, useRef } from 'react';
import {
  Upload,
  HardDrive,
  Film,
  Play,
  Download,
  Trash2,
  Edit3,
  X,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  RefreshCw,
  Search,
  ExternalLink,
  ShieldAlert,
  Clock,
  Layers,
  Sparkles,
  Info,
  Copy,
  Check,
  FileVideo,
  Eye,
} from 'lucide-react';
import { HostedVideo, formatBytes } from '../types';

interface StorageStats {
  success: boolean;
  r2Configured: boolean;
  bucket: string;
  totalBytes: number;
  formattedTotal: string;
  storageCeilingBytes: number;
  formattedCeiling: string;
  freeTierLimitBytes: number;
  formattedFreeTier: string;
  maxSingleFileSizeBytes: number;
  formattedMaxSingleFile: string;
  remainingBytes: number;
  formattedRemaining: string;
  percentOfCeiling: number;
  videoCount: number;
  isNearCeiling: boolean;
  isCeilingReached: boolean;
  statusMessage: string;
}

interface AdminVideoHostingProps {
  adminToken?: string;
  onVideoListChanged?: () => void;
  onPreviewVideo?: (video: HostedVideo) => void;
}

export const AdminVideoHosting: React.FC<AdminVideoHostingProps> = ({
  adminToken,
  onVideoListChanged,
  onPreviewVideo,
}) => {
  // Storage Stats State
  const [storage, setStorage] = useState<StorageStats | null>(null);
  const [loadingStorage, setLoadingStorage] = useState<boolean>(true);

  // Video List State
  const [videos, setVideos] = useState<HostedVideo[]>([]);
  const [loadingVideos, setLoadingVideos] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'latest' | 'size' | 'views' | 'title'>('latest');

  // Upload Form State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoTitle, setVideoTitle] = useState<string>('');
  const [videoDescription, setVideoDescription] = useState<string>('');
  const [videoCategory, setVideoCategory] = useState<string>('Cyberpunk');
  const [videoQuality, setVideoQuality] = useState<string>('1080p FHD');
  const [customThumbnailUrl, setCustomThumbnailUrl] = useState<string>('');
  const [selectedThumbnailFile, setSelectedThumbnailFile] = useState<File | null>(null);

  // Upload Progress State
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadedBytes, setUploadedBytes] = useState<number>(0);
  const [totalUploadBytes, setTotalUploadBytes] = useState<number>(0);
  const [uploadSpeed, setUploadSpeed] = useState<string>('');
  const [uploadStatusText, setUploadStatusText] = useState<string>('');
  const [uploadError, setUploadError] = useState<string>('');
  const [uploadSuccess, setUploadSuccess] = useState<string>('');

  // Active XHR reference for Cancel capability
  const activeXhrRef = useRef<XMLHttpRequest | null>(null);
  const uploadStartTimeRef = useRef<number>(0);

  // Modal States
  const [editingVideo, setEditingVideo] = useState<HostedVideo | null>(null);
  const [deleteConfirmVideo, setDeleteConfirmVideo] = useState<HostedVideo | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [previewingVideo, setPreviewingVideo] = useState<HostedVideo | null>(null);
  const [previewStreamUrl, setPreviewStreamUrl] = useState<string>('');
  const [loadingStream, setLoadingStream] = useState<boolean>(false);

  // Guide & CORS copy state
  const [copiedCors, setCopiedCors] = useState<boolean>(false);
  const [showR2Guide, setShowR2Guide] = useState<boolean>(false);

  const categories = [
    'Cyberpunk',
    'Movie',
    'TV Show',
    'Anime',
    'Trailer',
    'Short',
    'Music Video',
    'Exclusive',
    'Other',
  ];

  const fetchStorageStats = async () => {
    setLoadingStorage(true);
    try {
      const res = await fetch('/api/storage');
      if (res.ok) {
        const data = await res.json();
        setStorage(data);
      }
    } catch {
      // ignore
    } finally {
      setLoadingStorage(false);
    }
  };

  const fetchVideos = async () => {
    setLoadingVideos(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (categoryFilter !== 'all') params.append('category', categoryFilter);
      params.append('sortBy', sortBy);

      const res = await fetch(`/api/videos?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setVideos(data.videos || []);
      }
    } catch {
      // ignore
    } finally {
      setLoadingVideos(false);
    }
  };

  useEffect(() => {
    fetchStorageStats();
    fetchVideos();
  }, [categoryFilter, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchVideos();
  };

  // Handle Video File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate MIME type
    const validMimes = ['video/mp4', 'video/webm', 'video/quicktime'];
    const validExts = ['.mp4', '.webm', '.mov'];
    const hasValidExt = validExts.some((ext) => file.name.toLowerCase().endsWith(ext));

    if (!validMimes.includes(file.type.toLowerCase()) && !hasValidExt) {
      setUploadError(
        `Invalid video format. Please select an MP4, WebM, or MOV file. (Selected: ${file.type || 'unknown'})`
      );
      setSelectedFile(null);
      return;
    }

    // Validate 500 MB single file limit
    const MAX_SINGLE_FILE = 500 * 1024 * 1024;
    if (file.size > MAX_SINGLE_FILE) {
      setUploadError(
        `File exceeds 500 MB single file limit (${(file.size / (1024 * 1024)).toFixed(1)} MB). Please select a file under 500 MB.`
      );
      setSelectedFile(null);
      return;
    }

    // Check storage ceiling
    if (storage && storage.totalBytes + file.size > storage.storageCeilingBytes) {
      setUploadError(
        `Cannot upload: This file (${(file.size / (1024 * 1024)).toFixed(1)} MB) would exceed the 9 GB internal safety ceiling. Please delete older videos to free up storage.`
      );
      setSelectedFile(null);
      return;
    }

    setUploadError('');
    setSelectedFile(file);

    // Auto-populate title if empty
    if (!videoTitle) {
      const cleanName = file.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[-_]+/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
      setVideoTitle(cleanName);
    }
  };

  // Upload Video directly to R2
  const handleStartUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setUploadError('Please select a video file to upload.');
      return;
    }

    if (!videoTitle.trim()) {
      setUploadError('Please enter a title for the video.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadedBytes(0);
    setTotalUploadBytes(selectedFile.size);
    setUploadError('');
    setUploadSuccess('');
    setUploadStatusText('Requesting presigned upload URL from Cloudflare R2...');

    const authHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (adminToken) {
      authHeaders['Authorization'] = `Bearer ${adminToken}`;
      authHeaders['X-Admin-Session'] = adminToken;
    }

    try {
      // Step 1: Optional thumbnail upload if a custom thumbnail image was picked
      let finalThumbnailUrl = customThumbnailUrl.trim();
      if (selectedThumbnailFile) {
        setUploadStatusText('Uploading thumbnail image to R2...');
        const thumbUrlRes = await fetch('/api/videos?action=upload-url', {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify({
            filename: selectedThumbnailFile.name,
            contentType: selectedThumbnailFile.type || 'image/jpeg',
            fileSize: selectedThumbnailFile.size,
          }),
        });

        if (thumbUrlRes.ok) {
          const thumbUrlData = await thumbUrlRes.json();
          await fetch(thumbUrlData.uploadUrl, {
            method: 'PUT',
            headers: { 'Content-Type': selectedThumbnailFile.type || 'image/jpeg' },
            body: selectedThumbnailFile,
          });
          // Public streamable thumbnail URL or R2 object key
          finalThumbnailUrl = `/api/stream?id=${encodeURIComponent(thumbUrlData.objectKey)}`;
        }
      }

      // Step 2: Request presigned PUT URL for video
      setUploadStatusText('Authorizing direct R2 upload...');
      const urlRes = await fetch('/api/videos?action=upload-url', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          filename: selectedFile.name,
          contentType: selectedFile.type || 'video/mp4',
          fileSize: selectedFile.size,
        }),
      });

      if (!urlRes.ok) {
        const errData = await urlRes.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to generate presigned upload URL');
      }

      const { uploadUrl, objectKey } = await urlRes.json();

      // Step 3: Direct browser-to-R2 upload with progress tracking
      setUploadStatusText('Uploading video directly to Cloudflare R2...');
      uploadStartTimeRef.current = Date.now();

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        activeXhrRef.current = xhr;

        xhr.upload.onprogress = (evt) => {
          if (evt.lengthComputable) {
            const percent = Math.round((evt.loaded / evt.total) * 100);
            setUploadProgress(percent);
            setUploadedBytes(evt.loaded);
            setTotalUploadBytes(evt.total);

            // Calculate upload speed
            const elapsedSec = (Date.now() - uploadStartTimeRef.current) / 1000;
            if (elapsedSec > 0.5) {
              const bytesPerSec = evt.loaded / elapsedSec;
              const mbps = (bytesPerSec / (1024 * 1024)).toFixed(1);
              setUploadSpeed(`${mbps} MB/s`);
            }
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Cloudflare R2 upload returned status ${xhr.status}: ${xhr.statusText}`));
          }
        };

        xhr.onerror = () => {
          reject(
            new Error(
              'R2 Upload failed. Check your Cloudflare R2 CORS configuration (AllowedOrigins, AllowedMethods: PUT).'
            )
          );
        };

        xhr.onabort = () => {
          reject(new Error('Upload cancelled by user.'));
        };

        xhr.open('PUT', uploadUrl, true);
        xhr.setRequestHeader('Content-Type', selectedFile.type || 'video/mp4');
        xhr.send(selectedFile);
      });

      // Step 4: Complete upload and persist video metadata
      setUploadStatusText('Verifying object and saving catalog metadata...');
      const completeRes = await fetch('/api/videos?action=complete', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          objectKey,
          title: videoTitle.trim(),
          description: videoDescription.trim(),
          category: videoCategory,
          thumbnailUrl:
            finalThumbnailUrl ||
            'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80',
          durationFormatted: 'HD Video',
          qualityBadge: videoQuality,
          sizeBytes: selectedFile.size,
          contentType: selectedFile.type || 'video/mp4',
        }),
      });

      if (!completeRes.ok) {
        const errData = await completeRes.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to complete video registration');
      }

      setUploadSuccess(`Video "${videoTitle}" uploaded to Cloudflare R2 and published!`);
      // Reset form
      setSelectedFile(null);
      setSelectedThumbnailFile(null);
      setVideoTitle('');
      setVideoDescription('');
      setCustomThumbnailUrl('');
      setUploadProgress(100);

      // Refresh storage and videos
      fetchStorageStats();
      fetchVideos();
      if (onVideoListChanged) onVideoListChanged();
    } catch (err: any) {
      if (err.message !== 'Upload cancelled by user.') {
        setUploadError(err.message || 'An error occurred during upload.');
      } else {
        setUploadError('Upload cancelled.');
      }
    } finally {
      setIsUploading(false);
      activeXhrRef.current = null;
    }
  };

  const handleCancelUpload = () => {
    if (activeXhrRef.current) {
      activeXhrRef.current.abort();
      activeXhrRef.current = null;
      setIsUploading(false);
      setUploadError('Upload cancelled by user.');
    }
  };

  // Play / Preview Video in modal
  const handleOpenPreview = async (video: HostedVideo) => {
    setPreviewingVideo(video);
    setLoadingStream(true);
    setPreviewStreamUrl('');

    try {
      const res = await fetch(`/api/stream?id=${encodeURIComponent(video.id)}`);
      if (res.ok) {
        const data = await res.json();
        setPreviewStreamUrl(data.streamUrl);
      } else {
        setPreviewStreamUrl(`/api/stream?id=${encodeURIComponent(video.id)}&redirect=true`);
      }
    } catch {
      setPreviewStreamUrl(`/api/stream?id=${encodeURIComponent(video.id)}&redirect=true`);
    } finally {
      setLoadingStream(false);
    }
  };

  // Trigger direct download
  const handleTriggerDownload = (video: HostedVideo) => {
    const downloadUrl = `/api/download?id=${encodeURIComponent(video.id)}&format=redirect`;
    window.location.href = downloadUrl;
  };

  // Edit Video Metadata
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVideo) return;

    const authHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (adminToken) {
      authHeaders['Authorization'] = `Bearer ${adminToken}`;
      authHeaders['X-Admin-Session'] = adminToken;
    }

    try {
      const res = await fetch('/api/videos', {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({
          id: editingVideo.id,
          title: editingVideo.title,
          description: editingVideo.description,
          category: editingVideo.category,
          thumbnailUrl: editingVideo.thumbnailUrl,
          qualityBadge: editingVideo.qualityBadge,
        }),
      });

      if (res.ok) {
        setEditingVideo(null);
        fetchVideos();
        if (onVideoListChanged) onVideoListChanged();
      }
    } catch {
      // ignore
    }
  };

  // Delete Video with explicit confirmation
  const handleConfirmDelete = async () => {
    if (!deleteConfirmVideo) return;
    setIsDeleting(true);

    const authHeaders: Record<string, string> = {};
    if (adminToken) {
      authHeaders['Authorization'] = `Bearer ${adminToken}`;
      authHeaders['X-Admin-Session'] = adminToken;
    }

    try {
      const res = await fetch(`/api/videos?id=${encodeURIComponent(deleteConfirmVideo.id)}`, {
        method: 'DELETE',
        headers: authHeaders,
      });

      if (res.ok) {
        setDeleteConfirmVideo(null);
        fetchVideos();
        fetchStorageStats();
        if (onVideoListChanged) onVideoListChanged();
      }
    } catch {
      // ignore
    } finally {
      setIsDeleting(false);
    }
  };

  // Copy Cloudflare R2 CORS template
  const copyCorsPolicy = () => {
    const corsJson = JSON.stringify(
      [
        {
          AllowedOrigins: [
            'https://punkshop-flame.vercel.app',
            'http://localhost:3000',
            'http://localhost:5173',
          ],
          AllowedMethods: ['GET', 'PUT', 'HEAD', 'POST', 'DELETE'],
          AllowedHeaders: ['*'],
          ExposeHeaders: ['ETag', 'Content-Length', 'Content-Range', 'Accept-Ranges'],
          MaxAgeSeconds: 3600,
        },
      ],
      null,
      2
    );
    navigator.clipboard.writeText(corsJson);
    setCopiedCors(true);
    setTimeout(() => setCopiedCors(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* 1. Free-Tier Cost Control & Storage Gauge */}
      <div className="p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-xl backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <HardDrive className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-wide">
                  Cloudflare R2 Video Storage Meter
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  100% Free Tier
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Internal Safety Ceiling: 9.00 GB (Protects against 10 GB Cloudflare R2 Standard monthly allowance)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                fetchStorageStats();
                fetchVideos();
              }}
              disabled={loadingStorage}
              className="cursor-pointer px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingStorage ? 'animate-spin' : ''}`} />
              <span>Refresh Stats</span>
            </button>
            <button
              type="button"
              onClick={() => setShowR2Guide(!showR2Guide)}
              className="cursor-pointer px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-400 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-amber-500/20"
            >
              <Info className="w-3.5 h-3.5" />
              <span>R2 Setup Guide</span>
            </button>
          </div>
        </div>

        {/* Storage Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-zinc-300">
              Used:{' '}
              <span className="text-amber-400 font-bold">
                {storage ? storage.formattedTotal : '0.0 MB (0.00 GB)'}
              </span>
            </span>
            <span className="text-zinc-400">
              Remaining Free Capacity:{' '}
              <span className="text-emerald-400 font-bold">
                {storage ? storage.formattedRemaining : '9.00 GB'}
              </span>{' '}
              / 9.00 GB Limit
            </span>
          </div>

          <div className="w-full h-3.5 bg-zinc-800 rounded-full overflow-hidden p-0.5 border border-zinc-700/60 relative">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                (storage?.percentOfCeiling || 0) > 80
                  ? 'bg-gradient-to-r from-amber-500 to-rose-600'
                  : 'bg-gradient-to-r from-emerald-500 via-amber-500 to-amber-400'
              }`}
              style={{ width: `${Math.min(100, Math.max(1, storage?.percentOfCeiling || 0))}%` }}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between text-[11px] text-zinc-400 pt-1">
            <div className="flex items-center gap-4">
              <span>
                Total Videos: <strong className="text-white">{storage?.videoCount || videos.length}</strong>
              </span>
              <span>
                Max File Size: <strong className="text-white">500 MB</strong>
              </span>
              <span>
                Egress Fee: <strong className="text-emerald-400">$0.00 (Zero Egress Fees)</strong>
              </span>
            </div>
            <div>
              {storage?.isNearCeiling && (
                <span className="text-rose-400 font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Approaching 9 GB ceiling!
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Collapsible R2 Setup & CORS Guide */}
        {showR2Guide && (
          <div className="mt-6 pt-6 border-t border-zinc-800 space-y-4 text-xs text-zinc-300">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-white flex items-center gap-2 text-sm">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Cloudflare R2 Bucket & Vercel Setup (100% Free Tier)
              </h4>
              <button
                type="button"
                onClick={copyCorsPolicy}
                className="cursor-pointer px-3 py-1 rounded bg-amber-500 text-black font-bold flex items-center gap-1.5 hover:bg-amber-400 transition-colors"
              >
                {copiedCors ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCors ? 'Copied CORS Policy!' : 'Copy R2 CORS JSON'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                <p className="font-semibold text-amber-400">1. Create R2 Bucket & CORS</p>
                <ol className="list-decimal list-inside space-y-1 text-zinc-400 leading-relaxed">
                  <li>Go to Cloudflare Dashboard &rarr; <strong>R2 Object Storage</strong>.</li>
                  <li>Click <strong>Create Bucket</strong> with name: <code className="text-amber-300 font-mono">punkshop-videos</code>.</li>
                  <li>In bucket settings &rarr; <strong>CORS Policy</strong>, paste the copied CORS JSON.</li>
                  <li>Click <strong>Save CORS Policy</strong>.</li>
                </ol>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                <p className="font-semibold text-amber-400">2. Generate R2 Credentials & Add to Vercel</p>
                <ol className="list-decimal list-inside space-y-1 text-zinc-400 leading-relaxed">
                  <li>Go to R2 Overview &rarr; <strong>Manage R2 API Tokens</strong> &rarr; Create Token.</li>
                  <li>Permissions: <strong>Object Read & Write</strong>.</li>
                  <li>Copy your <strong>Account ID</strong>, <strong>Access Key ID</strong>, and <strong>Secret Access Key</strong>.</li>
                  <li>In Vercel Project Settings &rarr; Environment Variables, add:</li>
                </ol>
                <div className="bg-zinc-900 p-2 rounded text-[10px] font-mono text-zinc-300 overflow-x-auto">
                  R2_ACCOUNT_ID="your_account_id"<br />
                  R2_ACCESS_KEY_ID="your_access_key"<br />
                  R2_SECRET_ACCESS_KEY="your_secret_key"<br />
                  R2_BUCKET="punkshop-videos"<br />
                  SESSION_SECRET="your_secure_random_string"
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Direct Browser-to-R2 Video Uploader */}
      <div className="p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-xl backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-wide">
              Direct-to-R2 Video Uploader
            </h3>
            <p className="text-xs text-zinc-400">
              High-speed direct upload straight to Cloudflare R2 via presigned URLs. Bypasses Vercel payload limits.
            </p>
          </div>
        </div>

        {uploadError && (
          <div className="mb-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}

        {uploadSuccess && (
          <div className="mb-4 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{uploadSuccess}</span>
          </div>
        )}

        <form onSubmit={handleStartUpload} className="space-y-4">
          {/* File Picker Zone */}
          <div className="border-2 border-dashed border-zinc-700 hover:border-amber-500/60 rounded-2xl p-6 text-center transition-colors bg-zinc-950/40">
            <input
              type="file"
              id="video-file-input"
              accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
              disabled={isUploading}
              onChange={handleFileChange}
              className="hidden"
            />
            <label
              htmlFor="video-file-input"
              className="cursor-pointer flex flex-col items-center justify-center gap-2"
            >
              <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                <FileVideo className="w-6 h-6" />
              </div>
              <div className="text-sm font-semibold text-zinc-200">
                {selectedFile ? (
                  <span className="text-amber-400 font-bold">{selectedFile.name}</span>
                ) : (
                  <span>Click or drag a video file here to upload</span>
                )}
              </div>
              <p className="text-xs text-zinc-500">
                Supports MP4, WebM, MOV &bull; Single file limit: 500 MB &bull; Direct R2 PUT
              </p>
              {selectedFile && (
                <div className="mt-1 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-mono font-bold border border-amber-500/20">
                  Size: {formatBytes(selectedFile.size)}
                </div>
              )}
            </label>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1.5 lg:col-span-2">
              <label className="text-xs font-bold text-zinc-400">Video Title *</label>
              <input
                type="text"
                required
                disabled={isUploading}
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                placeholder="e.g. Cyberpunk 2077 Night City Chronicles"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-400">Category</label>
              <select
                disabled={isUploading}
                value={videoCategory}
                onChange={(e) => setVideoCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white focus:outline-none focus:border-amber-500"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-400">Quality Badge</label>
              <select
                disabled={isUploading}
                value={videoQuality}
                onChange={(e) => setVideoQuality(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white focus:outline-none focus:border-amber-500"
              >
                <option value="1080p FHD">1080p FHD</option>
                <option value="4K UHD">4K UHD</option>
                <option value="720p HD">720p HD</option>
              </select>
            </div>
          </div>

          {/* Description & Thumbnail */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-400">Description (Optional)</label>
              <textarea
                rows={2}
                disabled={isUploading}
                value={videoDescription}
                onChange={(e) => setVideoDescription(e.target.value)}
                placeholder="Enter storyline, tags, or episode details..."
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white focus:outline-none focus:border-amber-500 resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-400">
                Thumbnail Image (URL or Pick Image)
              </label>
              <input
                type="text"
                disabled={isUploading}
                value={customThumbnailUrl}
                onChange={(e) => setCustomThumbnailUrl(e.target.value)}
                placeholder="https://... (or leave blank for cyberpunk poster)"
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Upload Progress Bar & Control Buttons */}
          {isUploading && (
            <div className="p-4 rounded-xl bg-zinc-950 border border-amber-500/30 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-amber-400 flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  {uploadStatusText}
                </span>
                <span className="font-mono font-bold text-white">
                  {uploadProgress}% {uploadSpeed && `(${uploadSpeed})`}
                </span>
              </div>

              <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-200"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-[11px] text-zinc-400">
                <span>
                  Uploaded: {formatBytes(uploadedBytes)} / {formatBytes(totalUploadBytes)}
                </span>
                <button
                  type="button"
                  onClick={handleCancelUpload}
                  className="cursor-pointer text-rose-400 hover:text-rose-300 font-bold underline"
                >
                  Cancel Upload
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={isUploading || !selectedFile}
              className={`cursor-pointer px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${
                isUploading || !selectedFile
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                  : 'bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-500/20'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>{isUploading ? 'Uploading to R2...' : 'Upload Video to Cloudflare R2'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* 3. Hosted Videos Library Management */}
      <div className="p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-xl backdrop-blur-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">
                Uploaded Videos Catalog ({videos.length})
              </h3>
              <p className="text-xs text-zinc-400">
                Manage, preview streams, test downloads, edit metadata, and prune videos.
              </p>
            </div>
          </div>

          {/* Search & Sort Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Search hosted videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 w-44 md:w-56"
              />
            </form>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 focus:outline-none focus:border-amber-500"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 focus:outline-none focus:border-amber-500"
            >
              <option value="latest">Newest First</option>
              <option value="size">Largest Size</option>
              <option value="views">Most Views</option>
              <option value="title">Title A-Z</option>
            </select>
          </div>
        </div>

        {/* Video Cards Grid */}
        {loadingVideos ? (
          <div className="py-12 text-center text-zinc-500 text-xs">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-500" />
            Loading uploaded videos...
          </div>
        ) : videos.length === 0 ? (
          <div className="py-12 text-center border border-dashed border-zinc-800 rounded-2xl p-8">
            <FileVideo className="w-10 h-10 text-zinc-600 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-zinc-300">No hosted videos found</h4>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
              Use the uploader above to add your first video directly to Cloudflare R2!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.map((vid) => (
              <div
                key={vid.id}
                className="group p-4 rounded-xl bg-zinc-950 border border-zinc-800/80 hover:border-amber-500/50 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-zinc-900 mb-3">
                    <img
                      src={vid.thumbnailUrl}
                      alt={vid.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-[10px] font-bold text-amber-400 border border-amber-500/20">
                      {vid.category}
                    </div>
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-[10px] font-mono font-bold text-zinc-300 border border-zinc-700">
                      {vid.qualityBadge || '1080p FHD'}
                    </div>
                    <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-[10px] font-mono text-zinc-300">
                      {formatBytes(vid.sizeBytes)}
                    </div>
                  </div>

                  <h4 className="font-bold text-sm text-white line-clamp-1 group-hover:text-amber-400 transition-colors">
                    {vid.title}
                  </h4>
                  <p className="text-xs text-zinc-400 line-clamp-2 mt-1">
                    {vid.description || 'No description provided.'}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-800/60 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      title="Preview stream"
                      onClick={() => handleOpenPreview(vid)}
                      className="cursor-pointer p-2 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500 hover:text-black transition-colors"
                    >
                      <Play className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      title="Direct download via signed URL"
                      onClick={() => handleTriggerDownload(vid)}
                      className="cursor-pointer p-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      title="Edit metadata"
                      onClick={() => setEditingVideo(vid)}
                      className="cursor-pointer p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      title="Delete video from R2 and catalog"
                      onClick={() => setDeleteConfirmVideo(vid)}
                      className="cursor-pointer p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Stream Preview Modal */}
      {previewingVideo && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Play className="w-4 h-4 text-amber-400" />
                <h4 className="font-bold text-white text-sm line-clamp-1">
                  Preview: {previewingVideo.title}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPreviewingVideo(null);
                  setPreviewStreamUrl('');
                }}
                className="cursor-pointer p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-black">
              {loadingStream ? (
                <div className="aspect-video flex items-center justify-center text-xs text-zinc-500">
                  <RefreshCw className="w-6 h-6 animate-spin text-amber-500 mr-2" />
                  Generating signed stream URL...
                </div>
              ) : previewStreamUrl ? (
                <video
                  controls
                  autoPlay
                  src={previewStreamUrl}
                  className="w-full aspect-video rounded-lg bg-black"
                />
              ) : (
                <div className="aspect-video flex items-center justify-center text-xs text-rose-400">
                  Failed to load signed stream URL.
                </div>
              )}
            </div>

            <div className="p-4 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
              <span>Size: {formatBytes(previewingVideo.sizeBytes)} &bull; Seekable HTTP Range playback</span>
              <button
                type="button"
                onClick={() => handleTriggerDownload(previewingVideo)}
                className="cursor-pointer px-4 py-1.5 rounded-lg bg-amber-500 text-black font-bold flex items-center gap-1.5 hover:bg-amber-400"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Attachment</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Edit Video Metadata Modal */}
      {editingVideo && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h4 className="font-bold text-white text-base flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-amber-400" />
                Edit Video Metadata
              </h4>
              <button
                type="button"
                onClick={() => setEditingVideo(null)}
                className="cursor-pointer text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-zinc-400">Title</label>
                <input
                  type="text"
                  required
                  value={editingVideo.title}
                  onChange={(e) => setEditingVideo({ ...editingVideo, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-amber-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-zinc-400">Category</label>
                  <select
                    value={editingVideo.category}
                    onChange={(e) => setEditingVideo({ ...editingVideo, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-amber-500"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-zinc-400">Quality Badge</label>
                  <select
                    value={editingVideo.qualityBadge || '1080p FHD'}
                    onChange={(e) => setEditingVideo({ ...editingVideo, qualityBadge: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="1080p FHD">1080p FHD</option>
                    <option value="4K UHD">4K UHD</option>
                    <option value="720p HD">720p HD</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-zinc-400">Thumbnail URL</label>
                <input
                  type="text"
                  value={editingVideo.thumbnailUrl}
                  onChange={(e) => setEditingVideo({ ...editingVideo, thumbnailUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-zinc-400">Description</label>
                <textarea
                  rows={3}
                  value={editingVideo.description}
                  onChange={(e) => setEditingVideo({ ...editingVideo, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingVideo(null)}
                  className="cursor-pointer px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 font-bold hover:bg-zinc-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="cursor-pointer px-5 py-2 rounded-xl bg-amber-500 text-black font-bold hover:bg-amber-400"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Delete Confirmation Modal */}
      {deleteConfirmVideo && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-zinc-900 border border-rose-500/30 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500 mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h4 className="font-bold text-white text-base">Permanently Delete Video?</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                This will delete <strong className="text-white">"{deleteConfirmVideo.title}"</strong> ({formatBytes(deleteConfirmVideo.sizeBytes)}) directly from Cloudflare R2 bucket and remove its catalog entry. This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeleteConfirmVideo(null)}
                className="cursor-pointer px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 font-bold text-xs hover:bg-zinc-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="cursor-pointer px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-lg shadow-rose-600/30"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Deleting from R2...' : 'Yes, Delete from R2'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
