import mongoose from 'mongoose';
import { MONGO_URI } from './env.js';

const connectDB = async() => { 
  try {
    await mongoose.connect(MONGO_URI, {
      dbName: 'food-delivery-app',  
    });
    console.log('✓ MongoDB connected');
  } catch (err) {
    console.error('✗ MongoDB error:', err.message);
    process.exit(1);
  }
}

export default connectDB;