import express from "express";
import {
  PORT,
  CLOUD_NAME,
  CLOUD_API_KEY,
  CLOUD_SECRET_KEY,
} from "./config/env.js";
import cors from "cors";
import cloudinary from "cloudinary";
import uplodRoute from './routes/cloudinaryRouter.js';
import geoCodeRoute from './routes/geoCodeRouter.js';
import paymentRoute from './routes/paymentRouter.js';
import { connectToRabbitMQ } from "./config/rabbitMQ.js";


const app = express();
app.use(cors());

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

if (!CLOUD_NAME || !CLOUD_API_KEY || !CLOUD_SECRET_KEY)
  throw new Error("Missing cloudinary environment variables");

cloudinary.v2.config({
  cloud_name: CLOUD_NAME,
  api_key: CLOUD_API_KEY,
  api_secret: CLOUD_SECRET_KEY,
});


app.use('/api/utils', uplodRoute);
app.use('/api/utils', geoCodeRoute);
app.use('/api/payment', paymentRoute);


app.get("/", (req, res) => {
  res.send("Utils service");
});

app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

const startServer = async () => {

  await connectToRabbitMQ();

  app.listen(PORT, () => {
    console.log(`Utils Server running on port ${PORT}`);
  });

};

startServer();

export default app;
