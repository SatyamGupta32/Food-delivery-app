import dotenv from 'dotenv';
dotenv.config(); 


export const PORT = process.env.PORT || 4002;
export const MONGO_URI = process.env.MONGO_URI;
export const JWT_SECRET = process.env.JWT_SECRET;
export const CLOUD_NAME = process.env.CLOUD_NAME;
export const CLOUD_API_KEY = process.env.CLOUD_API_KEY;
export const CLOUD_SECRET_KEY = process.env.CLOUD_SECRET_KEY;
export const RESTAURANT_SERVICE = process.env.RESTAURANT_SERVICE;
export const FRONTEND_URL = process.env.FRONTEND_URL;
export const INTERNAL_SERVICE_KEY = process.env.INTERNAL_SERVICE_KEY;
export const RABBITMQ_URL = process.env.RABBITMQ_URL;
export const PAYMENT_QUEUE = process.env.PAYMENT_QUEUE;
export const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
export const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
export const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
