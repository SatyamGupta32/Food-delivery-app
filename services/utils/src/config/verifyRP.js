import crypto from 'crypto';
import { RAZORPAY_KEY_SECRET } from './env.js';

export const verifyRpSignature = (orderId, paymentId, signature) => {

    if (!orderId || !paymentId || !signature) {
        return false;
    }

    const body = `${orderId}|${paymentId}`;

    const expectedSignature = crypto
        .createHmac('sha256', RAZORPAY_KEY_SECRET)
        .update(body)
        .digest('hex');

    return expectedSignature === signature;
};