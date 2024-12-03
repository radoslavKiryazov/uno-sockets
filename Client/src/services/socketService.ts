// src/services/socketService.ts
import { io, Socket } from 'socket.io-client';
import { onUnmounted } from 'vue';

let socket: Socket | null = null;

console.log(socket)

export const initializeSocket = () => {
    if (!socket) {
        socket = io('http://localhost:3000');

        socket.on('connect', () => {
            console.log('Connected to server');
        });

        // Add any global event listeners here if needed
        socket.on('player-connected', (data) => {
            console.log('Connected players', data.connectedPlayers);
        });

        socket.on('player-disconnected', (data) => {
            console.log('Connected players', data.connectedPlayers);
        });
    }
    return socket;
};

const handleBeforeUnload = () => {
    socket!.disconnect();
};
window.addEventListener('beforeunload', handleBeforeUnload);

onUnmounted(() => {
    window.removeEventListener('beforeunload', handleBeforeUnload);
    socket!.disconnect();
});

export const getSocket = () => socket;
