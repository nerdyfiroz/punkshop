import { getDb } from './db.ts';

export default async function handler(req: any, res: any) {
  // CORS setup for Vercel functions
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

  const db = await getDb();
  if (!db) {
    return res.status(200).json({
      success: false,
      message: 'MongoDB not connected. Operating in client-side storage mode.',
      items: []
    });
  }

  const collection = db.collection('media');

  try {
    if (req.method === 'GET') {
      const items = await collection.find({}).sort({ _id: -1 }).toArray();
      return res.status(200).json({ success: true, items });
    }

    if (req.method === 'POST') {
      let mediaItem = req.body;
      if (typeof mediaItem === 'string') {
        try {
          mediaItem = JSON.parse(mediaItem);
        } catch {
          // ignore
        }
      }

      if (!mediaItem || !mediaItem.id) {
        return res.status(400).json({ success: false, message: 'Invalid media item payload' });
      }

      await collection.updateOne(
        { id: mediaItem.id },
        { $set: mediaItem },
        { upsert: true }
      );
      return res.status(200).json({ success: true, message: 'Saved to MongoDB', item: mediaItem });
    }

    if (req.method === 'PUT') {
      let mediaItem = req.body;
      if (typeof mediaItem === 'string') {
        try {
          mediaItem = JSON.parse(mediaItem);
        } catch {
          // ignore
        }
      }

      if (!mediaItem || !mediaItem.id) {
        return res.status(400).json({ success: false, message: 'Missing media id' });
      }

      await collection.updateOne(
        { id: mediaItem.id },
        { $set: mediaItem },
        { upsert: true }
      );
      return res.status(200).json({ success: true, message: 'Updated in MongoDB', item: mediaItem });
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ success: false, message: 'Missing media id to delete' });
      }

      await collection.deleteOne({ id });
      return res.status(200).json({ success: true, message: 'Deleted from MongoDB' });
    }

    return res.status(405).json({ message: 'Method Not Allowed' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error?.message || 'Database error' });
  }
}
