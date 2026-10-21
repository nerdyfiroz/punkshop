import fs from 'fs';
import path from 'path';
import { getDb } from './db';

export interface HostedVideoRecord {
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

// Local filesystem fallback storage path when MongoDB is not connected
const FALLBACK_DIR = path.resolve(process.cwd(), '.data');
const FALLBACK_FILE = path.join(FALLBACK_DIR, 'videos.json');

// Memory cache
let memoryVideos: HostedVideoRecord[] = [];
let isMemoryInitialized = false;

function loadFallbackVideos(): HostedVideoRecord[] {
  if (isMemoryInitialized) return memoryVideos;
  try {
    if (fs.existsSync(FALLBACK_FILE)) {
      const data = fs.readFileSync(FALLBACK_FILE, 'utf-8');
      memoryVideos = JSON.parse(data);
    }
  } catch {
    memoryVideos = [];
  }
  isMemoryInitialized = true;
  return memoryVideos;
}

function saveFallbackVideos(videos: HostedVideoRecord[]) {
  memoryVideos = videos;
  try {
    if (!fs.existsSync(FALLBACK_DIR)) {
      fs.mkdirSync(FALLBACK_DIR, { recursive: true });
    }
    fs.writeFileSync(FALLBACK_FILE, JSON.stringify(videos, null, 2), 'utf-8');
  } catch {
    // Ignore in read-only environments
  }
}

export async function getVideos(options: {
  search?: string;
  category?: string;
  sortBy?: 'latest' | 'size' | 'views' | 'title';
  page?: number;
  limit?: number;
}): Promise<{ videos: HostedVideoRecord[]; total: number; page: number; totalPages: number }> {
  const page = Math.max(1, options.page || 1);
  const limit = Math.min(100, Math.max(1, options.limit || 24));
  const search = (options.search || '').trim().toLowerCase();
  const category = (options.category || 'all').trim();
  const sortBy = options.sortBy || 'latest';

  const db = await getDb();
  if (db) {
    try {
      const collection = db.collection<HostedVideoRecord>('hosted_videos');
      const query: any = {};

      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { category: { $regex: search, $options: 'i' } },
        ];
      }

      if (category && category !== 'all' && category !== 'All') {
        query.category = { $regex: `^${category}$`, $options: 'i' };
      }

      let sortObj: any = { createdAt: -1 };
      if (sortBy === 'size') sortObj = { sizeBytes: -1 };
      if (sortBy === 'views') sortObj = { views: -1 };
      if (sortBy === 'title') sortObj = { title: 1 };

      const total = await collection.countDocuments(query);
      const videos = await collection
        .find(query)
        .sort(sortObj)
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray();

      return {
        videos,
        total,
        page,
        totalPages: Math.ceil(total / limit) || 1,
      };
    } catch {
      // Fallback if DB fails
    }
  }

  // Fallback storage
  let list = loadFallbackVideos();

  if (search) {
    list = list.filter(
      (v) =>
        v.title.toLowerCase().includes(search) ||
        v.description.toLowerCase().includes(search) ||
        v.category.toLowerCase().includes(search)
    );
  }

  if (category && category !== 'all' && category !== 'All') {
    list = list.filter((v) => v.category.toLowerCase() === category.toLowerCase());
  }

  if (sortBy === 'latest') list.sort((a, b) => b.createdAt - a.createdAt);
  else if (sortBy === 'size') list.sort((a, b) => b.sizeBytes - a.sizeBytes);
  else if (sortBy === 'views') list.sort((a, b) => b.views - a.views);
  else if (sortBy === 'title') list.sort((a, b) => a.title.localeCompare(b.title));

  const total = list.length;
  const start = (page - 1) * limit;
  const paginated = list.slice(start, start + limit);

  return {
    videos: paginated,
    total,
    page,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

export async function getVideoById(idOrSlug: string): Promise<HostedVideoRecord | null> {
  const db = await getDb();
  if (db) {
    try {
      const collection = db.collection<HostedVideoRecord>('hosted_videos');
      const video = await collection.findOne({
        $or: [{ id: idOrSlug }, { slug: idOrSlug }, { r2Key: idOrSlug }],
      });
      if (video) return video;
    } catch {
      // Fallback
    }
  }

  const list = loadFallbackVideos();
  return list.find((v) => v.id === idOrSlug || v.slug === idOrSlug || v.r2Key === idOrSlug) || null;
}

export async function saveVideo(video: HostedVideoRecord): Promise<HostedVideoRecord> {
  const db = await getDb();
  if (db) {
    try {
      const collection = db.collection<HostedVideoRecord>('hosted_videos');
      await collection.updateOne({ id: video.id }, { $set: video }, { upsert: true });
      return video;
    } catch {
      // Fallback
    }
  }

  const list = loadFallbackVideos();
  const existingIdx = list.findIndex((v) => v.id === video.id);
  if (existingIdx >= 0) {
    list[existingIdx] = video;
  } else {
    list.unshift(video);
  }
  saveFallbackVideos(list);
  return video;
}

export async function updateVideoMetadata(
  id: string,
  updates: Partial<HostedVideoRecord>
): Promise<HostedVideoRecord | null> {
  const video = await getVideoById(id);
  if (!video) return null;

  const updated: HostedVideoRecord = { ...video, ...updates };

  const db = await getDb();
  if (db) {
    try {
      const collection = db.collection<HostedVideoRecord>('hosted_videos');
      await collection.updateOne({ id }, { $set: updates });
      return updated;
    } catch {
      // Fallback
    }
  }

  const list = loadFallbackVideos();
  const idx = list.findIndex((v) => v.id === id);
  if (idx >= 0) {
    list[idx] = updated;
    saveFallbackVideos(list);
  }
  return updated;
}

export async function deleteVideoRecord(id: string): Promise<HostedVideoRecord | null> {
  const video = await getVideoById(id);
  if (!video) return null;

  const db = await getDb();
  if (db) {
    try {
      const collection = db.collection<HostedVideoRecord>('hosted_videos');
      await collection.deleteOne({ id });
    } catch {
      // Fallback
    }
  }

  const list = loadFallbackVideos();
  const filtered = list.filter((v) => v.id !== id);
  saveFallbackVideos(filtered);

  return video;
}

export async function incrementVideoViews(id: string): Promise<void> {
  const db = await getDb();
  if (db) {
    try {
      const collection = db.collection<HostedVideoRecord>('hosted_videos');
      await collection.updateOne({ id }, { $inc: { views: 1 } });
      return;
    } catch {
      // Fallback
    }
  }

  const list = loadFallbackVideos();
  const item = list.find((v) => v.id === id);
  if (item) {
    item.views = (item.views || 0) + 1;
    saveFallbackVideos(list);
  }
}

export async function incrementVideoDownloads(id: string): Promise<void> {
  const db = await getDb();
  if (db) {
    try {
      const collection = db.collection<HostedVideoRecord>('hosted_videos');
      await collection.updateOne({ id }, { $inc: { downloadsCount: 1 } });
      return;
    } catch {
      // Fallback
    }
  }

  const list = loadFallbackVideos();
  const item = list.find((v) => v.id === id);
  if (item) {
    item.downloadsCount = (item.downloadsCount || 0) + 1;
    saveFallbackVideos(list);
  }
}

/**
 * Calculates the total stored bytes across all hosted videos in the library
 */
export async function getTotalStorageBytes(): Promise<{ totalBytes: number; videoCount: number }> {
  const db = await getDb();
  if (db) {
    try {
      const collection = db.collection<HostedVideoRecord>('hosted_videos');
      const result = await collection
        .aggregate([
          {
            $group: {
              _id: null,
              totalBytes: { $sum: '$sizeBytes' },
              videoCount: { $sum: 1 },
            },
          },
        ])
        .toArray();

      if (result.length > 0) {
        return {
          totalBytes: result[0].totalBytes || 0,
          videoCount: result[0].videoCount || 0,
        };
      }
      return { totalBytes: 0, videoCount: 0 };
    } catch {
      // Fallback
    }
  }

  const list = loadFallbackVideos();
  const totalBytes = list.reduce((acc, curr) => acc + (curr.sizeBytes || 0), 0);
  return { totalBytes, videoCount: list.length };
}
