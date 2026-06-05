import express from 'express';
import cors from 'cors';
import { PORT } from './config/env.js';
import http from 'http';
import { initSocket } from './socket/socket.js';
import internalRouter from './routes/internalRouter.js';

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());

app.use('/api/v1/internal', internalRouter);

app.get('/', (req, res) => {
  res.send('Realtime service');
});

app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
});

const server = http.createServer(app);
initSocket(server);

server.listen(PORT, () => {
  console.log(`Realtime Server running on port ${PORT}`);
});

export default app;