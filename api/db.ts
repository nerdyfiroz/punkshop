import { MongoClient } from 'mongodb';

const rawUri = process.env.MONGODB_URI || process.env.VITE_MONGODB_URI || '';
const uri = rawUri.replace(/^["']|["']$/g, '').trim();

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

export async function getMongoClient(): Promise<MongoClient | null> {
  if (!uri) {
    return null;
  }

  if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClientPromise) {
      client = new MongoClient(uri, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
      });
      global._mongoClientPromise = client.connect();
    }
    return global._mongoClientPromise;
  } else {
    if (!clientPromise) {
      client = new MongoClient(uri, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
      });
      clientPromise = client.connect();
    }
    return clientPromise;
  }
}

export async function getDb() {
  const c = await getMongoClient();
  if (!c) return null;
  return c.db();
}

export default async function handler(_req: any, res: any) {
  return res.status(404).json({ message: 'Database utility module' });
}
