import {
  checkRateLimit,
  recordFailedAttempt,
  resetRateLimit,
  getExpectedCredentials,
  verifyPasswordConstantTime,
  createSessionToken,
  isAdminAuthorized,
  buildSessionCookie,
  buildClearSessionCookie,
} from './auth-util.ts';

export default async function handler(req: any, res: any) {
  // CORS setup for Vercel functions
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  const origin = req.headers?.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, X-Admin-Session'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const clientIp = (
    req.headers?.['x-forwarded-for'] ||
    req.headers?.['x-real-ip'] ||
    req.socket?.remoteAddress ||
    '127.0.0.1'
  )
    .toString()
    .split(',')[0]
    .trim();

  const url = new URL(req.url || '/', 'http://localhost');
  const action = url.searchParams.get('action') || (req.query?.action as string) || '';

  // 1. Session verification check (GET or POST /api/auth?action=me)
  if (action === 'me') {
    const isAuth = isAdminAuthorized(req);
    return res.status(200).json({
      authenticated: isAuth,
      user: isAuth ? 'admin' : null,
    });
  }

  // 2. Logout (POST /api/auth?action=logout)
  if (action === 'logout' || (req.method === 'POST' && req.body?.action === 'logout')) {
    res.setHeader('Set-Cookie', buildClearSessionCookie());
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  }

  // 3. Status diagnosis for Admin settings (GET /api/auth)
  if (req.method === 'GET') {
    const rawEnvUser = process.env.ADMIN_USERNAME || process.env.VITE_ADMIN_USERNAME || '';
    const rawEnvPass = process.env.ADMIN_PASSWORD || process.env.VITE_ADMIN_PASSWORD || '';
    const rawMongo = process.env.MONGODB_URI || process.env.VITE_MONGODB_URI || '';
    const rawR2Id = process.env.R2_ACCOUNT_ID || process.env.VITE_R2_ACCOUNT_ID || '';
    const rawR2Key = process.env.R2_ACCESS_KEY_ID || process.env.VITE_R2_ACCESS_KEY_ID || '';
    const isAuth = isAdminAuthorized(req);

    return res.status(200).json({
      configured: Boolean(rawEnvUser || rawEnvPass),
      hasAdminUsername: Boolean(rawEnvUser),
      hasAdminPassword: Boolean(rawEnvPass),
      hasMongoUri: Boolean(rawMongo),
      hasR2Config: Boolean(rawR2Id && rawR2Key),
      authenticated: isAuth,
      usernameDisplay: rawEnvUser ? `${rawEnvUser.slice(0, 2)}***` : 'default (admin)',
    });
  }

  // 4. Admin Login (POST /api/auth)
  if (req.method === 'POST') {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        // use as is
      }
    }

    const username = (body?.username || '').toString().trim();
    const password = (body?.password || '').toString();

    // Check rate limit before verifying credentials
    const rateCheck = checkRateLimit(clientIp);
    if (!rateCheck.allowed) {
      return res.status(429).json({
        success: false,
        message: `Too many failed login attempts. Rate limit active. Please try again in ${rateCheck.retryAfterSec || 900} seconds.`,
        retryAfter: rateCheck.retryAfterSec,
      });
    }

    const creds = getExpectedCredentials();

    const isUserMatch = username.toLowerCase() === creds.username.toLowerCase();
    const isPassMatch =
      verifyPasswordConstantTime(password, creds.password) ||
      (creds.rawPass ? verifyPasswordConstantTime(password, creds.rawPass) : false);

    if (isUserMatch && isPassMatch) {
      resetRateLimit(clientIp);
      const token = createSessionToken(username);

      // Set HttpOnly, Secure, SameSite=Strict cookie
      res.setHeader('Set-Cookie', buildSessionCookie(token));

      return res.status(200).json({
        success: true,
        message: 'Authentication successful',
        user: username,
        token, // Included for authorization headers or cross-origin fallbacks
      });
    }

    // Failed login: record attempt
    const failRecord = recordFailedAttempt(clientIp);
    const remainingMsg = failRecord.locked
      ? 'Account locked for 15 minutes due to too many failed attempts.'
      : `${failRecord.remainingAttempts} attempt(s) remaining before temporary lockout.`;

    let specificReason = 'Invalid credentials.';
    if (!creds.hasCustomPassword) {
      specificReason =
        'Vercel environment variables only take effect after a Redeploy. If you just added ADMIN_PASSWORD on Vercel, please go to Vercel Deployments and click "Redeploy". In the meantime, use the default password: admin123';
    } else if (!isUserMatch) {
      specificReason = `Username "${username}" does not match the configured admin user.`;
    } else if (!isPassMatch) {
      specificReason =
        'Incorrect password. Verify that exact spelling and capitalization match your Vercel ADMIN_PASSWORD setting.';
    }

    return res.status(401).json({
      success: false,
      message: `${specificReason} (${remainingMsg})`,
      hasCustomPassword: creds.hasCustomPassword,
      remainingAttempts: failRecord.remainingAttempts,
    });
  }

  return res.status(405).json({ message: 'Method Not Allowed' });
}
