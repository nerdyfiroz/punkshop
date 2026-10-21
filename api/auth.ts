export default async function handler(req: any, res: any) {
  // CORS setup for Vercel functions
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const rawEnvUser = process.env.ADMIN_USERNAME || process.env.VITE_ADMIN_USERNAME || '';
  const rawEnvPass = process.env.ADMIN_PASSWORD || process.env.VITE_ADMIN_PASSWORD || '';
  const rawMongo = process.env.MONGODB_URI || process.env.VITE_MONGODB_URI || '';

  // Clean strings (remove accidental quotes or whitespace from env var entry)
  const cleanStr = (s: string) => s.replace(/^["']|["']$/g, '').trim();
  const expectedUser = cleanStr(rawEnvUser) || 'admin';
  const expectedPass = cleanStr(rawEnvPass) || 'admin123';

  if (req.method === 'GET') {
    // Return environment diagnosis (without revealing secret credentials)
    return res.status(200).json({
      configured: Boolean(rawEnvUser || rawEnvPass),
      hasAdminUsername: Boolean(rawEnvUser),
      hasAdminPassword: Boolean(rawEnvPass),
      hasMongoUri: Boolean(rawMongo),
      usernameDisplay: rawEnvUser ? `${rawEnvUser.slice(0, 2)}***` : 'default (admin)',
    });
  }

  if (req.method === 'POST') {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        // use as is
      }
    }

    const username = cleanStr(body?.username || '');
    const password = cleanStr(body?.password || '');

    const isUserMatch = username.toLowerCase() === expectedUser.toLowerCase();
    const isPassMatch = password === expectedPass;

    if (isUserMatch && isPassMatch) {
      // Issue session auth token
      const sessionToken = Buffer.from(`${username}:${Date.now()}`).toString('base64');
      return res.status(200).json({
        success: true,
        message: 'Authentication successful',
        user: username,
        token: sessionToken,
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid username or password. Verify your Vercel ADMIN_USERNAME and ADMIN_PASSWORD settings.',
    });
  }

  return res.status(405).json({ message: 'Method Not Allowed' });
}
