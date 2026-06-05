import amqp from 'amqplib';
import { PAYMENT_QUEUE, RABBITMQ_URL } from './env.js';

let channel;

export const connectToRabbitMQ = async () => {

    if (!RABBITMQ_URL) {
        throw new Error("RABBITMQ_URL is missing");
    }

    const connection = await amqp.connect(RABBITMQ_URL);

    channel = await connection.createChannel();

    await channel.assertQueue(PAYMENT_QUEUE, { durable: true });

    console.log('🐇 RabbitMQ connected(utils service)');
};

export const getChannel = () => channel;