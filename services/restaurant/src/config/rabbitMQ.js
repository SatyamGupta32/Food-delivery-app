import amqp from 'amqplib';
import { PAYMENT_QUEUE, RIDER_QUEUE, RABBITMQ_URL, ORDER_QUEUE } from './env.js';

let channel;

export const connectToRabbitMQ = async () => {

    if (!RABBITMQ_URL) {
        throw new Error("RABBITMQ_URL is missing");
    }

    const connection = await amqp.connect(RABBITMQ_URL);

    channel = await connection.createChannel();

    await channel.assertQueue(PAYMENT_QUEUE, { durable: true });

    await channel.assertQueue(ORDER_QUEUE, { durable: true });
    // await channel.assertQueue(RIDER_QUEUE, { durable: true });

    console.log('🐇 RabbitMQ connected (restaurant service)');
};

export const getChannel = () => channel;