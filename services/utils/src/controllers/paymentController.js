import { INTERNAL_SERVICE_KEY, RESTAURANT_SERVICE, RAZORPAY_KEY_ID, STRIPE_SECRET_KEY, FRONTEND_URL } from "../config/env.js";
import { publishPaySuccess } from "../config/payment.producer.js";
import { razorpay } from "../config/razorpay.js";
import { verifyRpSignature } from "../config/verifyRP.js";
import { TryCatch } from "../middlewares/tryCatch.js";
import axios from 'axios';
import Stripe from 'stripe';


export const createRzpOrder = TryCatch(async (req, res) => {

    const { orderId } = req.body;

    const { data } = await axios.get(`${RESTAURANT_SERVICE}/api/order/payment/${orderId}`,
        {
            headers: {
                'x-internal-key': INTERNAL_SERVICE_KEY,
            }
        }
    )
    const rpOrder = await razorpay.orders.create({
        amount: data.total * 100,
        currency: 'INR',
        receipt: orderId,
    });

    res.status(200).json({
        rpOrderId: rpOrder.id,
        key: RAZORPAY_KEY_ID,
    });
});

export const verifyRzpPayment = TryCatch(async (req, res) => {

    const { rp_order_id, rp_payment_id, rp_signature, orderId } = req.body;

    const isValid = verifyRpSignature(rp_order_id, rp_payment_id, rp_signature);

    if (!isValid) return res.status(400).json({ message: 'payment verification failed' });

    await publishPaySuccess({
        orderId,
        paymentId: rp_payment_id,
        provider: 'razorpay',
    });

    res.status(200).json({
        success: true,
        message: 'Payment verified',
    });
});

const stripe = new Stripe(STRIPE_SECRET_KEY);

export const createStripeOrder = TryCatch(async (req, res) => {
    const { orderId } = req.body;
    try {
        const { data } = await axios.get(`${RESTAURANT_SERVICE}/api/order/payment/${orderId}`,
            {
                headers: {
                    'x-internal-key': INTERNAL_SERVICE_KEY,
                }
            }
        )
        console.log(data);
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items: [{
                price_data: {
                    currency: 'INR',
                    product_data: {
                        name: 'Zomato App',
                    },
                    unit_amount: data.total * 100,
                },
                quantity: 1,
            }],
            metadata: {
                orderId: orderId,
            },
            success_url: `${FRONTEND_URL}/order-success/?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${FRONTEND_URL}/checkout`,
        })

        res.status(200).json({
            session_id: session.id,
            url: session.url,
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Stripe payment failed'
        })
    }
});

export const verifyStripePayment = TryCatch(async (req, res) => {
    const { session_id } = req.body;
    try {
        const session = await stripe.checkout.sessions.retrieve(session_id);

        if (!session) return res.status(400).json({ message: 'Payment verification failed' });

        if (session.payment_status !== 'paid') return res.status(400).json({ message: 'Payment not completed' });

        const orderId = session.metadata?.orderId;

        if (!orderId) return res.status(400).json({ message: 'OrderId is not found in stripe session' });

        await publishPaySuccess({
            orderId,
            paymentId: session.payment_intent,
            provider: 'stripe',
        });

        res.status(200).json({ 
            message: 'Payment verified',
            paymentId: session.payment_intent,
            provider: 'stripe', 
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Stripe payment failed' });
    }
});