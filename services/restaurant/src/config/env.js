import dotenv from 'dotenv';
dotenv.config();

export const PORT = process.env.PORT || 4001;
export const MONGO_URI = process.env.MONGO_URI;
export const JWT_SECRET = process.env.JWT_SECRET;
export const UTILS_SERVICE = process.env.UTILS_SERVICE;
export const REALTIME_SERVICE = process.env.REALTIME_SERVICE;
export const INTERNAL_SERVICE_KEY = process.env.INTERNAL_SERVICE_KEY;
export const RABBITMQ_URL = process.env.RABBITMQ_URL;
export const PAYMENT_QUEUE = process.env.PAYMENT_QUEUE;
export const ORDER_QUEUE = process.env.ORDER_QUEUE;
export const RIDER_QUEUE = process.env.RIDER_QUEUE;