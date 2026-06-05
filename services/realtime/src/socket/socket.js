import { Server } from "socket.io";
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from "../config/env.js";


let io;

export const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: "*",
            credentials: true
        }
    });

    io.use((socket, next) => {
        try {
            const token = socket.handshake.auth?.token;

            if (!token) return next(new Error("Unauthorized"));

            const decoded = jwt.verify(token,JWT_SECRET);

            if (!decoded) return next(new Error("Unauthorized"));

            socket.data.user = decoded;
            console.log('socket auth success');
            next();
        } catch (error) {
            console.log('❌ socket auth failed: ', error);
            next(new Error("Unauthorized"));
        }
    });

    io.on("connection", (socket) => {

        const user = socket.data.user;

        if (!user) { socket.disconnect(true); return; }

        const userId = user.id;

        socket.join(`user:${userId}`);

        if (user.restaurantId) socket.join(`restaurant:${user.restaurantId}`);

        socket.join('restaurants');

        console.log(`User Connected: ${userId}`);
        console.log('Socket room: ', [...socket.rooms]);
        console.log('')

        socket.on("disconnect", () => {
            console.log(`User Disconnected: ${userId}`);
        });
    });

    return io;
};


export const getIO = () => {
    if (!io) throw new Error('Socket.io not initialized');
    return io;

};