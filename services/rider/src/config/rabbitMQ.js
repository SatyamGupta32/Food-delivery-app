import amqp from 'amqplib';
import { RIDER_QUEUE, RABBITMQ_URL, ORDER_QUEUE } from './env.js';

let channel;

export const connectToRabbitMQ = async () => {

    if (!RABBITMQ_URL) {
        throw new Error("RABBITMQ_URL is missing");
    }

    const connection = await amqp.connect(RABBITMQ_URL);

    channel = await connection.createChannel();

    await channel.assertQueue(ORDER_QUEUE, { durable: true });

    console.log('🐇 RabbitMQ connected (rider service)');
};

export const getChannel = () => channel;