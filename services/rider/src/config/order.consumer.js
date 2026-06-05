import axios from 'axios';
import { getChannel } from "./rabbitMQ.js";
import Rider from '../models/Rider.js';
import { INTERNAL_SERVICE_KEY, ORDER_QUEUE, REALTIME_SERVICE } from './env.js';

export const startOrderConsumer = async () => {
    const channel = getChannel();

    console.log('order ready to consume:', ORDER_QUEUE);

    channel.consume(ORDER_QUEUE, async (msg) => {
        if (!msg) return;

        try {
            console.log('message recieved:', msg.content.toString());
            const event = JSON.parse(msg.content.toString());

            console.log('event type', event.type);
            if (event.type !== 'ORDER_READY_FOR_RIDER') {
                console.log('skipping non-order-ready-for-rider event');
                channel.ack(msg);
                return;
            }
            const { orderId, restaurantId, location } = event.data;

            console.log("searching for nearby rider's", location);

            const riders = await Rider.find({
                isAvailable: true,
                isVerified: true,
                location: {
                    $near: {
                        $geometry: location,
                        $maxDistance: 1000,
                    }
                }
            });
            console.log(`${riders.length} riders found`);

            if (riders.length === 0) {
                console.log("no rider's found");
                channel.ack(msg);
                return;
            }

            for (const rider of riders) {
                console.log(`notifying rider userID: ${rider.userId}`);
                try {
                    await axios.post(`${REALTIME_SERVICE}/api/v1/internal/emit`, {
                        event: 'order-available',
                        room: `user:${rider.userId}`,
                        payload: { orderId, restaurantId }
                    }, {
                        headers: {
                            'x-internal-key': INTERNAL_SERVICE_KEY,
                        }
                    });
                    console.log(`notified rider ${rider.userId} successfully`);
                } catch (error) {
                    console.log(`failed to notified rider ${rider.userId}`)
                }
            }
            channel.ack(msg);
            console.log('message acknowledged');
        } catch (error) {
            console.log('order consumer error',error);
        }
    });
};