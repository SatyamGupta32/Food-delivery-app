import dotenv from 'dotenv';
dotenv.config();


export const PORT = process.env.PORT || 4003;
export const JWT_SECRET  = process.env.JWT_SECRET; 
export const INTERNAL_SERVICE_KEY = process.env.INTERNAL_SERVICE_KEY;
