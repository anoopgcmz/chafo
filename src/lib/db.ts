import { MongoClient } from 'mongodb';

import { env } from './env';

const globalForMongo = global as typeof globalThis & {
  mongoClientPromise?: Promise<MongoClient>;
};

const mongoUri = env.MONGODB_URI;
const options = {};

let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  if (!globalForMongo.mongoClientPromise) {
    const client = new MongoClient(mongoUri, options);
    globalForMongo.mongoClientPromise = client.connect();
  }
  clientPromise = globalForMongo.mongoClientPromise;
} else {
  const client = new MongoClient(mongoUri, options);
  clientPromise = client.connect();
}

export async function getMongoClient() {
  return clientPromise;
}
