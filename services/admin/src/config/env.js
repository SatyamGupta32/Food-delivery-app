import dotenv from 'dotenv';
dotenv.config();

export const PORT = process.env.PORT || 4005;
export const MONGO_URI = process.env.MONGO_URI;
export const JWT_SECRET = process.env.JWT_SECRET;
export const DB_NAME = process.env.DB_NAME;
export const AUTH_SERVICE = process.env.AUTH_SERVICE || 'http://localhost:4000';
export const INTERNAL_SERVICE_KEY = process.env.INTERNAL_SERVICE_KEY;