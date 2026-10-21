import { createSignedDownloadUrl, isR2Configured } from './r2-client';
import { getVideoById, incrementVideoDownloads } from './video-db';

export default async function handler(req: any, res: any) {
  // CORS setup
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  const origin = req.headers?.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const url = new URL(req.url || '/', 'http://localhost');
  const id = (url.searchParams.get('id') || req.query?.id || '').toString();
  const format = url.searchParams.get('format') || req.query?.format || 'json';

  if (!id) {
    return res.status(400).json({ success: false, message: 'Missing video id parameter' });
  }

  const video = await getVideoById(id);
  if (!video) {
    return res.status(404).json({ success: false, message: 'Video not found' });
  }

  // Increment download counter
  incrementVideoDownloads(video.id).catch(() => {});

  // Compute safe download filename
  const ext = video.contentType === 'video/webm' ? 'webm' : video.contentType === 'video/quicktime' ? 'mov' : 'mp4';
  const cleanTitle = video.title.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim().replace(/\s+/g, '_');
  const downloadFilename = `PunkShop_${cleanTitle}.${ext}`;

  if (!isR2Configured()) {
    return res.status(503).json({
      success: false,
      message: 'Cloudflare R2 storage credentials are not configured on Vercel.',
      videoTitle: video.title,
    });
  }

  try {
    // Generate signed download URL with Content-Disposition: attachment
    const downloadUrl = await createSignedDownloadUrl(
      video.r2Key,
      downloadFilename,
      video.contentType,
      3600 // 1 hour expiration
    );

    if (format === 'redirect') {
      return res.redirect(302, downloadUrl);
    }

    return res.status(200).json({
      success: true,
      downloadUrl,
      filename: downloadFilename,
      sizeBytes: video.sizeBytes,
      contentType: video.contentType,
      expiresIn: 3600,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: `Failed to generate download URL: ${err.message}`,
    });
  }
}
