import { getChannel } from './rabbitMQ.js';
import { ORDER_QUEUE } from './env.js'

export const publishEvent = async (type, data) => {
    const channel = getChannel();

    if (!channel) {
        console.log('RabbitMQ channel not ready');
        return;
    }

    channel.sendToQueue(
        ORDER_QUEUE,
        Buffer.from(JSON.stringify({ type, data })),
        { persistent: true }
    
    );
}