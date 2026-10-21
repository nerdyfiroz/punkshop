import crypto from 'crypto';

interface RateLimitRecord {
  attempts: number;
  lastAttempt: number;
  lockedUntil: number;
}

// In-memory sliding window rate limiter
const loginAttemptsMap = new Map<string, RateLimitRecord>();

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes lockout
const WINDOW_MS = 15 * 60 * 1000;

export function checkRateLimit(identifier: string): { allowed: boolean; remainingAttempts: number; retryAfterSec?: number } {
  const now = Date.now();
  const record = loginAttemptsMap.get(identifier);

  if (!record) {
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS };
  }

  if (record.lockedUntil > now) {
    const retryAfterSec = Math.ceil((record.lockedUntil - now) / 1000);
    return { allowed: false, remainingAttempts: 0, retryAfterSec };
  }

  // If outside sliding window, reset
  if (now - record.lastAttempt > WINDOW_MS) {
    loginAttemptsMap.delete(identifier);
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS };
  }

  const remaining = Math.max(0, MAX_ATTEMPTS - record.attempts);
  return { allowed: record.attempts < MAX_ATTEMPTS, remainingAttempts: remaining };
}

export function recordFailedAttempt(identifier: string): { remainingAttempts: number; locked: boolean; retryAfterSec?: number } {
  const now = Date.now();
  const record = loginAttemptsMap.get(identifier) || { attempts: 0, lastAttempt: now, lockedUntil: 0 };

  record.attempts += 1;
  record.lastAttempt = now;

  if (record.attempts >= MAX_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_MS;
    loginAttemptsMap.set(identifier, record);
    return { remainingAttempts: 0, locked: true, retryAfterSec: Math.ceil(LOCKOUT_MS / 1000) };
  }

  loginAttemptsMap.set(identifier, record);
  return { remainingAttempts: MAX_ATTEMPTS - record.attempts, locked: false };
}

export function resetRateLimit(identifier: string) {
  loginAttemptsMap.delete(identifier);
}

const cleanStr = (s: string) => s.replace(/^["']|["']$/g, '').trim();

export function getExpectedCredentials() {
  const rawEnvUser = process.env.ADMIN_USERNAME || process.env.VITE_ADMIN_USERNAME || '';
  const rawEnvPass = process.env.ADMIN_PASSWORD || process.env.VITE_ADMIN_PASSWORD || '';
  return {
    rawUser: rawEnvUser,
    rawPass: rawEnvPass,
    username: cleanStr(rawEnvUser) || 'admin',
    password: cleanStr(rawEnvPass) || 'admin123',
    hasCustomPassword: Boolean(rawEnvPass),
    hasCustomUsername: Boolean(rawEnvUser),
  };
}

/**
 * Constant-time string comparison using SHA-256 to prevent timing attacks.
 * Also checks trimmed variations to prevent accidental trailing space issues.
 */
export function verifyPasswordConstantTime(provided: string, expected: string): boolean {
  if (!provided || !expected) return false;
  
  const hash = (s: string) => crypto.createHash('sha256').update(s).digest();
  
  // Exact match
  const matchExact = crypto.timingSafeEqual(hash(provided), hash(expected));
  if (matchExact) return true;

  // Trimmed match
  const matchTrimmed = crypto.timingSafeEqual(hash(provided.trim()), hash(expected.trim()));
  if (matchTrimmed) return true;

  return false;
}

const getSessionSecret = () => {
  const secret = process.env.SESSION_SECRET || process.env.VITE_SESSION_SECRET || 'punkshop-secure-session-key-autumn-2026';
  return cleanStr(secret);
};

export interface SessionPayload {
  user: string;
  iat: number;
  exp: number;
  nonce: string;
}

/**
 * Creates an HMAC-SHA256 signed session token
 */
export function createSessionToken(username: string): string {
  const secret = getSessionSecret();
  const payload: SessionPayload = {
    user: username,
    iat: Date.now(),
    exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    nonce: crypto.randomBytes(8).toString('hex'),
  };

  const b64Payload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', secret).update(b64Payload).digest('base64url');
  return `${b64Payload}.${signature}`;
}

/**
 * Verifies an HMAC-SHA256 signed session token
 */
export function verifySessionToken(token: string): { valid: boolean; user?: string } {
  if (!token || typeof token !== 'string') return { valid: false };
  const parts = token.split('.');
  if (parts.length !== 2) return { valid: false };

  const [b64Payload, signature] = parts;
  const secret = getSessionSecret();
  const expectedSig = crypto.createHmac('sha256', secret).update(b64Payload).digest('base64url');

  if (signature.length !== expectedSig.length) return { valid: false };

  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expectedSig);
  if (!crypto.timingSafeEqual(sigBuf, expBuf)) {
    return { valid: false };
  }

  try {
    const payloadStr = Buffer.from(b64Payload, 'base64url').toString('utf8');
    const payload: SessionPayload = JSON.parse(payloadStr);

    if (Date.now() > payload.exp) {
      return { valid: false };
    }

    return { valid: true, user: payload.user };
  } catch {
    return { valid: false };
  }
}

/**
 * Parses cookies from request headers
 */
export function parseCookies(cookieHeader: string = ''): Record<string, string> {
  const list: Record<string, string> = {};
  if (!cookieHeader) return list;

  cookieHeader.split(';').forEach((cookie) => {
    const parts = cookie.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim();
      list[key] = decodeURIComponent(val);
    }
  });
  return list;
}

/**
 * Extracts and verifies admin authorization from request (Cookie or Bearer / X-Admin-Session header)
 */
export function isAdminAuthorized(req: any): boolean {
  // 1. Check HttpOnly signed cookie
  const cookieHeader = req.headers?.cookie || '';
  const cookies = parseCookies(cookieHeader);
  const cookieToken = cookies['punkshop_admin_session'];

  if (cookieToken && verifySessionToken(cookieToken).valid) {
    return true;
  }

  // 2. Check Authorization Header (Bearer token)
  const authHeader = req.headers?.authorization || '';
  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    if (verifySessionToken(token).valid) {
      return true;
    }
  }

  // 3. Check custom header X-Admin-Session
  const customHeader = req.headers?.['x-admin-session'];
  if (customHeader && typeof customHeader === 'string') {
    if (verifySessionToken(customHeader.trim()).valid) {
      return true;
    }
  }

  return false;
}

/**
 * Generates Set-Cookie header for admin session
 */
export function buildSessionCookie(token: string, maxAgeSec: number = 86400): string {
  const isProd = process.env.NODE_ENV === 'production';
  return `punkshop_admin_session=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAgeSec}; ${isProd ? 'Secure;' : ''}`;
}

/**
 * Generates Set-Cookie header to clear session
 */
export function buildClearSessionCookie(): string {
  return `punkshop_admin_session=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

export default async function handler(_req: any, res: any) {
  return res.status(404).json({ message: 'Auth utility module' });
}
