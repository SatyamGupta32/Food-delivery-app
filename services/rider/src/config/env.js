import dotenv from 'dotenv';
dotenv.config();


export const PORT = process.env.PORT || 4004;
export const MONGO_URI = process.env.MONGO_URI;
export const JWT_SECRET = process.env.JWT_SECRET;
export const AUTH_SERVICE = process.env.AUTH_SERVICE;
export const UTILS_SERVICE = process.env.UTILS_SERVICE;
export const REALTIME_SERVICE = process.env.REALTIME_SERVICE;
export const RESTAURANT_SERVICE = process.env.RESTAURANT_SERVICE;
export const INTERNAL_SERVICE_KEY = process.env.INTERNAL_SERVICE_KEY;
export const ORDER_QUEUE = process.env.ORDER_QUEUE;
export const RIDER_QUEUE = process.env.RIDER_QUEUE;
export const RABBITMQ_URL = process.env.RABBITMQ_URL;