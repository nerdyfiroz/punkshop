import {
  isR2Configured,
  R2_BUCKET,
  STORAGE_CEILING_BYTES,
  FREE_TIER_LIMIT_BYTES,
  MAX_SINGLE_FILE_SIZE_BYTES,
} from './r2-client';
import { getTotalStorageBytes } from './video-db';

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

  try {
    const { totalBytes, videoCount } = await getTotalStorageBytes();
    const percentOfCeiling = (totalBytes / STORAGE_CEILING_BYTES) * 100;
    const remainingBytes = Math.max(0, STORAGE_CEILING_BYTES - totalBytes);
    const isNearCeiling = percentOfCeiling >= 80;
    const isCeilingReached = totalBytes >= STORAGE_CEILING_BYTES;

    let statusMessage = 'Optimal free-tier usage.';
    if (isCeilingReached) {
      statusMessage = 'Safety ceiling of 9 GB reached. Further uploads are blocked to preserve free tier.';
    } else if (isNearCeiling) {
      statusMessage = 'Approaching 9 GB safety limit (>80% used). Consider pruning unused files.';
    }

    return res.status(200).json({
      success: true,
      r2Configured: isR2Configured(),
      bucket: R2_BUCKET,
      totalBytes,
      formattedTotal: `${(totalBytes / (1024 * 1024)).toFixed(1)} MB (${(totalBytes / (1024 * 1024 * 1024)).toFixed(2)} GB)`,
      storageCeilingBytes: STORAGE_CEILING_BYTES,
      formattedCeiling: '9.00 GB',
      freeTierLimitBytes: FREE_TIER_LIMIT_BYTES,
      formattedFreeTier: '10.00 GB',
      maxSingleFileSizeBytes: MAX_SINGLE_FILE_SIZE_BYTES,
      formattedMaxSingleFile: '500 MB',
      remainingBytes,
      formattedRemaining: `${(remainingBytes / (1024 * 1024 * 1024)).toFixed(2)} GB`,
      percentOfCeiling: Number(percentOfCeiling.toFixed(1)),
      videoCount,
      isNearCeiling,
      isCeilingReached,
      statusMessage,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to calculate storage metrics',
    });
  }
}
