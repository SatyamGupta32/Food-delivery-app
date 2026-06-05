import express from 'express';
import cors from 'cors';
import { PORT } from './config/env.js';
import connectDB from './config/db.js';
import authRouter from './routes/authRouter.js';

const app = express();
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());


app.use('/api/auth', authRouter);


app.get('/', (req, res) => {
  res.send('Auth service');
});

app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
});

const startServer = async () => {

  await connectDB();

  app.listen(PORT, () => {
    console.log(`Auth Server running on port ${PORT}`);
  });

};

startServer();


export default app;
