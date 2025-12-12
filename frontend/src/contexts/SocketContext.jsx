import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const { token, user } = useSelector((state) => state.auth);

    useEffect(() => {
        if (token && user) {
            const newSocket = io('http://localhost:3000', {
                auth: { token }, // Pass token for authentication
            });

            newSocket.on('connect', () => {
                console.log('Socket connected:', newSocket.id);
                // Join user-specific room
                newSocket.emit('join', user._id);
            });

            newSocket.on('disconnect', () => {
                console.log('Socket disconnected');
            });

            setSocket(newSocket);

            return () => {
                newSocket.disconnect();
            };
        } else {
            if (socket) {
                socket.disconnect();
                setSocket(null);
            }
        }
    }, [token, user]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
