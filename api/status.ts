import { getDb } from './db.ts';

export default async function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const uri = process.env.MONGODB_URI || process.env.VITE_MONGODB_URI || '';
  
  if (!uri) {
    return res.status(200).json({
      connected: false,
      message: 'MONGODB_URI not configured in Vercel environment variables',
      hasUri: false,
    });
  }

  try {
    const db = await getDb();
    if (!db) {
      return res.status(500).json({
        connected: false,
        message: 'Could not establish MongoDB connection',
        hasUri: true,
      });
    }

    // Ping the database
    await db.command({ ping: 1 });
    const collections = await db.listCollections().toArray();

    return res.status(200).json({
      connected: true,
      message: 'MongoDB successfully connected and operational',
      database: db.databaseName,
      collectionsCount: collections.length,
      hasUri: true,
    });
  } catch (error: any) {
    return res.status(500).json({
      connected: false,
      message: error?.message || 'MongoDB connection error',
      hasUri: true,
    });
  }
}
