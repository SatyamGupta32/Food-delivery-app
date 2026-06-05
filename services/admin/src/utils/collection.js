import { connectDb } from '../config/db.js';

export const restaurantCollection = async () => {
    const db = await connectDb();
    return db.collection('restaurants');
}

export const ridersCollection = async () => {
    const db = await connectDb();
    return db.collection('riders');
}