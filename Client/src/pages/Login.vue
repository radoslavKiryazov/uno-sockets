<template>
    <div
        class="flex flex-col items-center justify-center min-h-screen bg-gray-100"
    >
        <h1 class="text-2xl font-semibold mb-6">Login</h1>

        <form
            @submit.prevent="handleSubmit"
            class="w-full max-w-xs p-6 bg-white rounded-lg shadow-md"
        >
            <div class="mb-4">
                <label for="username" class="block text-gray-700"
                    >Username</label
                >
                <input
                    type="username"
                    v-model="username"
                    required
                    class="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring focus:border-blue-500"
                />
            </div>
            <div class="mb-6">
                <label for="password" class="block text-gray-700"
                    >Password</label
                >
                <input
                    type="password"
                    v-model="password"
                    required
                    class="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring focus:border-blue-500"
                />
            </div>

            <button
                type="submit"
                class="w-full py-2 mb-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none"
            >
                Login
            </button>
        </form>

        <div class="flex flex-col items-center justify-center space-y-2">
            <p class="mt-4">Don't have an account?</p>
            <p
                class="mt-4 text-blue-500 cursor-pointer hover:text-blue-800"
                :onclick="redirectToSignup"
            >
                Sign Up
            </p>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, onUnmounted } from 'vue';
import axios from 'axios';
import router from '../router';
import { io } from 'socket.io-client';
import { useUserStore } from '../stores/userStore';
import { initializeSocket } from '../services/socketService';

const username = ref<string>('');
const password = ref<string>('');
const userStore = useUserStore();

const redirectToSignup = () => {
    router.push('/signup');
};

const handleSubmit = async () => {
    const endpoint = 'http://localhost:3000/api/auth/signin';
    const payload = { username: username.value, password: password.value };

    console.log(payload);

    try {
        const response = await axios.post(endpoint, payload, {
            withCredentials: true
        });

        console.log(response);
        console.log(response.status);
        if (response.status === 200) {
            const socket = initializeSocket();

            const { username, _id } = response.data;

            console.log('data', response.data);

            socket.on('player-connected', (data) => {
                console.log('Connected players', data.connectedPlayers);
                userStore.setConnectedPlayers(data.connectedPlayers);
            });

            socket.on('player-disconnected', (data) => {
                console.log('Connected players', data.connectedPlayers);
                userStore.setConnectedPlayers(data.connectedPlayers);
            });

            const handleBeforeUnload = () => {
                socket.disconnect();
            };
            window.addEventListener('beforeunload', handleBeforeUnload);

            onUnmounted(() => {
                window.removeEventListener('beforeunload', handleBeforeUnload);
                socket.disconnect();
            });

            userStore.setUser(username);
            socket.emit('player-joined', { username });
            router.push('/waitingroom');
        } else {
            alert(`Error: ${response.data.message}`);
        }
    } catch (error) {
        console.error(error);
        alert('An error occurred. Please try again.');
    }
};
</script>
