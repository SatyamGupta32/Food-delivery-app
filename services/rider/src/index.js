import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import { PORT } from './config/env.js'; 
import riderRouter from './routes/riderRouter.js';
import { connectToRabbitMQ } from "./config/rabbitMQ.js";
import { startOrderConsumer } from './config/order.consumer.js';


const app = express();

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));

app.use(express.json());

app.use('/api/rider', riderRouter);

app.get('/', (req, res) => {
    res.send('Rider service');
});

app.use((err, req, res, next) => {
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || "Internal Server Error"
    });
});

const startServer = async () => {

    await connectDB();
    await connectToRabbitMQ();
    await startOrderConsumer();

    app.listen(PORT, () => {
        console.log(`Rider Server running on port ${PORT}`);
    });

};

startServer();

export default app;