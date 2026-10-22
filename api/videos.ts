import {
  createPresignedUploadUrl,
  verifyR2Object,
  deleteR2Object,
  isR2Configured,
  ALLOWED_MIME_TYPES,
  STORAGE_CEILING_BYTES,
} from './r2-client.ts';
import { isAdminAuthorized } from './auth-util.ts';
import {
  getVideos,
  getVideoById,
  saveVideo,
  updateVideoMetadata,
  deleteVideoRecord,
  getTotalStorageBytes,
  type HostedVideoRecord,
} from './video-db.ts';

export default async function handler(req: any, res: any) {
  // CORS setup
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  const origin = req.headers?.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, X-Admin-Session'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const url = new URL(req.url || '/', 'http://localhost');
  const query = req.query || Object.fromEntries(url.searchParams.entries());
  const action = (query.action || '').toString();

  // Parse Body
  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      // use raw
    }
  }

  // ==========================================
  // GET: List videos or get single video by ID
  // ==========================================
  if (req.method === 'GET') {
    const id = (query.id || '').toString();
    if (id) {
      const video = await getVideoById(id);
      if (!video) {
        return res.status(404).json({ success: false, message: 'Video not found' });
      }
      return res.status(200).json({ success: true, video });
    }

    const search = (query.search || '').toString();
    const category = (query.category || '').toString();
    const sortBy = (query.sortBy || 'latest') as any;
    const page = parseInt(query.page || '1', 10) || 1;
    const limit = parseInt(query.limit || '24', 10) || 24;

    const result = await getVideos({ search, category, sortBy, page, limit });
    return res.status(200).json({
      success: true,
      ...result,
      r2Configured: isR2Configured(),
    });
  }

  // ==========================================
  // POST: Presigned Upload URL or Upload Complete
  // ==========================================
  if (req.method === 'POST') {
    const targetAction = action || body?.action || '';

    // Action 1: Create Presigned Upload URL for direct browser-to-R2 upload
    if (targetAction === 'upload-url' || targetAction === 'create-upload-url') {
      if (!isAdminAuthorized(req)) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized: Admin session required to request upload URLs',
        });
      }

      if (!isR2Configured()) {
        return res.status(503).json({
          success: false,
          message: 'Cloudflare R2 is not configured. Missing R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, or R2_SECRET_ACCESS_KEY on Vercel.',
        });
      }

      const filename = (body?.filename || '').toString().trim();
      const contentType = (body?.contentType || '').toString().toLowerCase().trim();
      const fileSize = Number(body?.fileSize || 0);

      if (!filename || !contentType || !fileSize) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: filename, contentType, and fileSize are required.',
        });
      }

      if (!ALLOWED_MIME_TYPES.includes(contentType)) {
        return res.status(400).json({
          success: false,
          message: `Invalid MIME type: ${contentType}. Allowed formats: MP4 (video/mp4), WebM (video/webm), MOV (video/quicktime), JPEG, PNG, WebP.`,
        });
      }

      // Check 9 GB storage ceiling
      const { totalBytes } = await getTotalStorageBytes();
      if (totalBytes + fileSize > STORAGE_CEILING_BYTES) {
        const usedGb = (totalBytes / (1024 * 1024 * 1024)).toFixed(2);
        const reqMb = (fileSize / (1024 * 1024)).toFixed(1);
        return res.status(400).json({
          success: false,
          message: `Storage ceiling reached (9 GB limit). Currently using ${usedGb} GB. Uploading ${reqMb} MB would exceed the free-tier safety ceiling. Please delete older videos.`,
        });
      }

      try {
        const isImage = contentType.startsWith('image/');
        const prefix = isImage ? 'thumbnails' : 'videos';
        const uploadResult = await createPresignedUploadUrl({
          filename,
          contentType,
          fileSize,
          prefix,
        });

        return res.status(200).json({
          success: true,
          ...uploadResult,
        });
      } catch (err: any) {
        console.error('Presigned URL error:', err);
        return res.status(500).json({
          success: false,
          message: `Cloudflare R2 Error: ${err.message || 'Failed to create presigned upload URL'}`,
        });
      }
    }

    // Action 2: Complete upload and persist video metadata
    if (targetAction === 'complete' || targetAction === 'save') {
      if (!isAdminAuthorized(req)) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized: Admin session required to complete video uploads',
        });
      }

      const objectKey = (body?.objectKey || '').toString().trim();
      const title = (body?.title || '').toString().trim();
      const description = (body?.description || '').toString().trim();
      const category = (body?.category || 'Cyberpunk').toString().trim();
      const thumbnailUrl = (body?.thumbnailUrl || '').toString().trim();
      const durationFormatted = (body?.durationFormatted || '').toString().trim();
      const qualityBadge = (body?.qualityBadge || '1080p FHD').toString().trim();

      if (!objectKey || !title) {
        return res.status(400).json({
          success: false,
          message: 'Missing required metadata: objectKey and title are required.',
        });
      }

      // Verify object existence and true size directly from Cloudflare R2
      let verifiedSize = 0;
      let verifiedContentType = 'video/mp4';

      if (isR2Configured()) {
        try {
          const r2Metadata = await verifyR2Object(objectKey);
          verifiedSize = r2Metadata.size;
          verifiedContentType = r2Metadata.contentType;
        } catch (r2Err: any) {
          return res.status(400).json({
            success: false,
            message: `Could not verify object in Cloudflare R2: ${r2Err.message || 'Object not found'}`,
          });
        }
      } else {
        verifiedSize = Number(body?.sizeBytes || 0);
        verifiedContentType = body?.contentType || 'video/mp4';
      }

      // Generate slug and record
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || `video-${Date.now()}`;

      const videoId = `vid_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

      const newVideo: HostedVideoRecord = {
        id: videoId,
        title,
        description: description || 'Hosted on PunkShop private R2 storage.',
        category: category || 'Cyberpunk',
        r2Key: objectKey,
        thumbnailUrl:
          thumbnailUrl ||
          'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80',
        sizeBytes: verifiedSize,
        durationFormatted: durationFormatted || 'HD Video',
        contentType: verifiedContentType,
        qualityBadge,
        createdAt: Date.now(),
        views: 0,
        downloadsCount: 0,
        slug,
      };

      await saveVideo(newVideo);

      return res.status(200).json({
        success: true,
        message: 'Video uploaded and cataloged successfully',
        video: newVideo,
      });
    }

    return res.status(400).json({ success: false, message: 'Invalid action parameter' });
  }

  // ==========================================
  // PUT: Update video metadata
  // ==========================================
  if (req.method === 'PUT') {
    if (!isAdminAuthorized(req)) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Admin session required to edit video metadata',
      });
    }

    const id = (body?.id || query.id || '').toString();
    if (!id) {
      return res.status(400).json({ success: false, message: 'Video id is required' });
    }

    const updates: Partial<HostedVideoRecord> = {};
    if (body.title !== undefined) updates.title = body.title.toString().trim();
    if (body.description !== undefined) updates.description = body.description.toString().trim();
    if (body.category !== undefined) updates.category = body.category.toString().trim();
    if (body.thumbnailUrl !== undefined) updates.thumbnailUrl = body.thumbnailUrl.toString().trim();
    if (body.qualityBadge !== undefined) updates.qualityBadge = body.qualityBadge.toString().trim();
    if (body.durationFormatted !== undefined) updates.durationFormatted = body.durationFormatted.toString().trim();

    const updated = await updateVideoMetadata(id, updates);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Video not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Video metadata updated successfully',
      video: updated,
    });
  }

  // ==========================================
  // DELETE: Delete video from R2 and catalog
  // ==========================================
  if (req.method === 'DELETE') {
    if (!isAdminAuthorized(req)) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Admin session required to delete videos',
      });
    }

    const id = (query.id || body?.id || '').toString();
    if (!id) {
      return res.status(400).json({ success: false, message: 'Video id is required to delete' });
    }

    const video = await getVideoById(id);
    if (!video) {
      return res.status(404).json({ success: false, message: 'Video not found' });
    }

    // Delete object from Cloudflare R2
    if (isR2Configured() && video.r2Key) {
      try {
        await deleteR2Object(video.r2Key);
      } catch (r2Err: any) {
        console.warn('R2 delete warning:', r2Err.message);
        // Continue to delete metadata even if object already pruned
      }
    }

    await deleteVideoRecord(id);

    return res.status(200).json({
      success: true,
      message: `Video "${video.title}" permanently removed from R2 storage and catalog.`,
    });
  }

  return res.status(405).json({ message: 'Method Not Allowed' });
}
