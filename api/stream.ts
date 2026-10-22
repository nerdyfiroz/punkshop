import { createSignedStreamUrl, isR2Configured } from './r2-client.ts';
import { getVideoById, incrementVideoViews } from './video-db.ts';

export default async function handler(req: any, res: any) {
  // CORS setup
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  const origin = req.headers?.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Range'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const url = new URL(req.url || '/', 'http://localhost');
  const id = (url.searchParams.get('id') || req.query?.id || '').toString();
  const shouldRedirect = url.searchParams.get('redirect') === 'true' || req.query?.redirect === 'true';

  if (!id) {
    return res.status(400).json({ success: false, message: 'Missing video id parameter' });
  }

  const video = await getVideoById(id);
  if (!video) {
    return res.status(404).json({ success: false, message: 'Video not found' });
  }

  // Increment view counter asynchronously
  incrementVideoViews(video.id).catch(() => {});

  if (!isR2Configured()) {
    // If R2 not yet configured, provide demo sample or informative message
    const fallbackStreamUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
    if (shouldRedirect) {
      return res.redirect(302, fallbackStreamUrl);
    }
    return res.status(200).json({
      success: true,
      streamUrl: fallbackStreamUrl,
      expiresIn: 7200,
      isDemo: true,
      message: 'Cloudflare R2 credentials not configured. Streaming placeholder.',
      video,
    });
  }

  try {
    // Generate signed streaming GET URL valid for 2 hours (7200 seconds)
    // Cloudflare R2 handles HTTP Range requests seamlessly on signed URLs
    const streamUrl = await createSignedStreamUrl(video.r2Key, 7200);

    if (shouldRedirect) {
      return res.redirect(302, streamUrl);
    }

    return res.status(200).json({
      success: true,
      streamUrl,
      expiresIn: 7200,
      title: video.title,
      contentType: video.contentType,
      sizeBytes: video.sizeBytes,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: `Failed to generate streaming URL: ${err.message}`,
    });
  }
}
