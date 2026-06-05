import express from "express";

import cors from "cors";
import { PORT } from "./config/env.js";
import adminRouter from "./routers/adminRouter.js";
import { connectDb } from "./config/db.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1/admin", adminRouter);

app.get("/", (req, res) => {
    res.send("Admin service");
});

app.use((err, req, res, next) => {
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || "Internal Server Error",
    });
});


const startServer = async () => {
    await connectDb();
    app.listen(PORT, () => {
        console.log(`Admin Server running on port ${PORT}`);
    });
};

startServer();


export default app;