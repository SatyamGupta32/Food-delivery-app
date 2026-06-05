import { PAYMENT_QUEUE } from "./env.js";
import { getChannel } from "./rabbitMQ.js";

export const publishPaySuccess = async ({ orderId, paymentId, provider }) => {

    if (!["stripe", "razorpay"].includes(provider)) {
        throw new Error("Invalid provider");
    }

    const channel = getChannel();

    if (!channel) throw new Error("RabbitMQ channel not initialized");

    channel.sendToQueue(
        PAYMENT_QUEUE,
        Buffer.from(
            JSON.stringify({
                type: 'PAYMENT_SUCCESS',
                data: { orderId, paymentId, provider },
            })
        ),
        { persistent: true }
    );
};