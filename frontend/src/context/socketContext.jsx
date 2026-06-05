import { useContext, useRef, useEffect, createContext } from 'react';
import { io } from 'socket.io-client';
import { useAppData } from './appContext';
import { realtimeService } from '../config/services';


const SocketContext = createContext({ socket: null });

export const SocketProvider = ({ children }) => {
    const { isAuth } = useAppData();

    const socketRef = useRef(null);

    useEffect(() => {
        console.log("isAuth:", isAuth);
        if (!isAuth) {
            socketRef.current?.disconnect();
            socketRef.current = null;
            return;
        }

        if (socketRef.current) return;

        console.log('front tokrn',localStorage.getItem('token'))

        const newSocket = io(realtimeService, {
            auth: {
                token: localStorage.getItem('token'),
            },
            transports: ['websocket'],
        });

        socketRef.current = newSocket;

        newSocket.on('connect', () => {
            console.log('Socket connected', newSocket.id);
        });

        newSocket.on('disconnect', (reason) => {
            console.log('Socket disconnected',reason);
        });

        newSocket.on('connect_error', (err) => {
            console.log('Socket Error:', err.message);
        });

        return (() => {
            newSocket.disconnect();
            socketRef.current = null;
        });
    }, [isAuth]);

    return (
        <SocketContext.Provider value={{ socket: socketRef.current }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);