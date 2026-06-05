import { getIO } from '../socket/socket.js';
import { TryCatch } from '../middlewares/tryCatch.js';
import { INTERNAL_SERVICE_KEY } from '../config/env.js';

export const emitSocketEvent = TryCatch(async (req, res) => {

    if (req.headers['x-internal-key'] !== INTERNAL_SERVICE_KEY) return res.status(403).json({ message: 'forbidden' });

    const { event, room, payload } = req.body;

    if (!event || !room) return res.status(400).json({ message: 'invalid request' });

    const io = getIO();

    console.log(`📶 Emitting event ${event} to room ${room}`);

    io.to(room).emit(event, payload ?? {});

    return res.status(200).json({ message: 'event emitted successfully', success: true });
});
