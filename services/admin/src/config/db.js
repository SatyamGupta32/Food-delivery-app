import { MongoClient } from 'mongodb';
import { MONGO_URI, DB_NAME } from './env.js';

let client;
let db;

export const connectDb = async () => {

    if (db) return db;

    client = new MongoClient(MONGO_URI);

    await client.connect();

    db = client.db(DB_NAME);

    console.log('✓ MongoDB connected to Admin service');

    return db;
};