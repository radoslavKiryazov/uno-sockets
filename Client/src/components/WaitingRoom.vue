<template>
  <div
    class="flex flex-col justify-center bg-slate-200 items-center h-[100vh] w-full"
  >
    <h1 class="text-2xl font-semibold mb-6">Waiting Room</h1>

    <div
      class="flex flex-col bg-white w-[290px] h-auto px-5 py-3 max-w-sm rounded overflow-hidden shadow-lg space-y-5"
    >
      <!-- Display player's name input -->
      <div>
        <label class="block font-semibold mb-1" v-if="userStore.user"
          >Hello, {{ userStore.user.username }}:</label
        >
      </div>

      <div class="bg-gray-200 p-2 rounded shadow-lg">
        <h3 class="text-blue-500 font-bold text-center">Players in the Room</h3>
        <ul class="list-disc list-inside">
          <li
            v-for="player in userStore.connectedPlayers"
            :key="player.username"
          >
            {{ player.username }}
          </li>
        </ul>
      </div>

      <button
        v-if="userStore.connectedPlayers"
        :disabled="userStore.connectedPlayers.length < 1"
        @click="onGameStart"
        class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full pointer disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        :title="
          userStore.connectedPlayers.length <= 1
            ? 'Need at least two players to start the game'
            : ''
        "
      >
        Start Game
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { useUserStore } from "../stores/userStore";
import { getSocket } from "../services/socketService";
import { useGameStore } from "../stores/newGameStore";
import { useHandStore } from "../stores/handStore";

const router = useRouter();
const userStore = useUserStore();
const gameStore = useGameStore();
const handStore = useHandStore();
const socket = getSocket();

const onGameStart = () => {
  if (socket) {
    socket.emit("start-game");
  }
};

socket.on("game-started", (data) => {
  console.log("data", data);
  gameStore.state.hand.currentTurnIndex = data.currentHand.currentTurnIndex;
  gameStore.state.hand.deck = data.currentHand.deck;
  gameStore.state.hand.discardPile = data.currentHand.discardPile;

  userStore.setConnectedPlayers(data.players);
  userStore.setUserId(socket.id);
  handStore.updateDeckSize(data.deckSize);
  handStore.setDiscardPile(data.discardPile);
  handStore.updatePlayerAtHand(data.playerAtHand.username);

  console.log("bleh", socket.id);
  router.push("/play");
});

socket.on("your-hand", (data) => {
  handStore.setHand(data.hand);
  console.log("yourhand", data);
});
</script>
