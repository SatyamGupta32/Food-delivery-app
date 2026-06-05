import express from 'express';
import cors from 'cors';
import { PORT } from './config/env.js';
import connectDB from './config/db.js';
import { startPaymentConsumer } from './config/payment.consumer.js';
import restaurantRouter from './routes/restaurantRouter.js';
import menuRouter from './routes/menuRouter.js';
import cartRouter from './routes/cartRouter.js';
import addressRouter from './routes/addressRouter.js';
import orderRouter from './routes/orderRouter.js';
import { connectToRabbitMQ } from './config/rabbitMQ.js';
import Restaurant from './models/Restaurant.js';


const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());

app.use('/api/restaurant', restaurantRouter);
app.use('/api/menu', menuRouter);
app.use('/api/cart', cartRouter);
app.use('/api/address', addressRouter);
app.use('/api/order', orderRouter);


app.get('/', (req, res) => {
  res.send('Restaurant service');
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
  await startPaymentConsumer();


  app.listen(PORT, () => {
    console.log(`Restaurant Server running on port ${PORT}`);
  });

};

startServer();

export default app;