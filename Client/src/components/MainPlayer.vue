<template>
  <div class="flex flex-col gap-3 items-center">
    <div
      class="flex flex-col justify-between items-center space-y-4"
      :class="{
        'border-cyan-900': isPlayerTurn,
        'border-gray-400 opacity-50 pointer-events-none': !isPlayerTurn,
      }"
    >
      <div
        class="flex flex-row justify-between items-center w-full px-4 py-2 bg-gray-100 rounded-lg shadow-md w-max-20px"
      >
        <p class="text-lg font-semibold text-gray-800">
          Name: {{ userStore.user.username }}
        </p>
        <p v-if="isPlayerTurn">YOUR TURN!</p>
        <p class="text-lg font-semibold text-gray-800">Score: 0 //TODO</p>
      </div>

      <div
        class="flex relative h-full pt-1 rounded-lg space-x-1 w-full px-4 py-4 items-center justify-center"
      >
        <CardComponent
          v-for="(card, index) in handStore.state.hand!.hand"
          :key="cardKey(card)"
          :card="card"
          :onclick="() => onPlayCard(card)"
          :hover="true"
        />
      </div>
      <div class="flex gap-5 w-full h-[40px] items-center justify-center">
        <button
          v-if="isPlayerTurn && !isThereAPlayableCard"
          class="bg-blue-500 text-white font-bold py-2 px-4 gap-2 rounded-lg shadow-md hover:bg-blue-600 transition flex flex-row justify-center items-center"
          :disabled="!isPlayerTurn && !isThereAPlayableCard"
          @click="() => onDrawCardButton()"
        >
          <img src="/assets/draw-card.png" class="h-[35px] w-[35px]" />
          DRAW CARD
        </button>
      </div>
    </div>
    <div class="flex w-[250px] items-center justify-center">
      <!-- <button
        v-if="showUNOButton"
        class="bg-red-500 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-red-600 transition w-full"
        :disabled="false"
        @click="
          () => {
            gameStore.callUNO(gameStore.players[0]);
            gameStore.addActionMessage(
              `${gameStore.players[0].name} called UNO!`
            );
          }
        "
      >
        UNO!
      </button> -->
      <!-- <button
        v-if="showInterruptUNOButton"
        class="bg-red-500 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-red-600 transition w-full"
        :disabled="false"
        @click="
          () => {
            gameStore.interruptUNO(botWithOneCard);
            gameStore.addActionMessage(
              `${gameStore.players[0].name} interrupted UNO!`
            );
          }
        "
      >
        Interrupt UNO!
      </button> -->
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, onUnmounted } from "vue";
import CardComponent from "../components/CardComponent.vue";
import type { Card } from "../../../Models/Card";

import { canPlayCard } from "../utils/random_utils";

import { useHandStore } from "../stores/handStore";
import { useUserStore } from "../stores/userStore";
import { usePopUpStore } from "../stores/popUpStore";
import { getSocket } from "../services/socketService";

const handStore = useHandStore();
const userStore = useUserStore();
const popUpStore = usePopUpStore();

const socket = getSocket();

onMounted(() => {
  socket.on("update-hand", (data) => {
    handStore.addCard(data.card);
    console.log("Hand updated:", data);
  });

  socket.on("update-deck", (data) => {
    const { deckSize } = data;
    handStore.updateDeckSize(deckSize);
  });

  socket.on("update-discard-pile", (data) => {
    const { discardPile } = data;
    handStore.updateDiscardPile(discardPile);
  });

  socket.on("update-player-info", (data) => {
    const { player } = data;
    console.log("player", player);

    userStore.updatePlayerInfo(player);
  });

  socket.on("update-player-at-hand", (data) => {
    const { playerAtHand } = data;
    handStore.updatePlayerAtHand(playerAtHand.username);
  });

  socket.on("update-game", (data) => {
    const { connectedPlayers } = data;
    connectedPlayers.forEach((player) => {
      userStore.updatePlayerInfo(player);
    });
  });
});

onUnmounted(() => {
  socket.off("update-hand");
  socket.off("update-deck");
  socket.off("update-discard-pile");
  socket.off("update-player-info");
});

const onDrawCardButton = () => {
  const playerId = userStore.user.id;
  socket.emit("draw-card", { playerId });
};

const onPlayCard = (card: Card) => {
  if (
    !canPlayCard(
      card,
      handStore.state.discardPile[handStore.state.discardPile.length - 1]
    )
  ) {
    return;
  }
  const playerId = userStore.user.id;
  console.log("playerId", userStore.user.id);
  console.log("Playing the following card", card);
  //triger the popup
  socket.emit("play-card", { playerId, card });

  if (card.type === "WILD" || card.type === "WILDDRAWFOUR") {
    handStore.handleWildCard(card);
    return;
  }
};

console.log("mainplayerTest", handStore.state.hand);
// const playerHand = computed(() => gameStore.getPlayerHand);

const isThereAPlayableCard = computed(() => {
  if (handStore.state.hand.hand) {
    return handStore.state.hand.hand.some((card) =>
      canPlayCard(
        card,
        handStore.state.discardPile[handStore.state.discardPile.length - 1]
      )
    );
  }
});

const isPlayerTurn = computed(() => {
  return handStore.state.playerAtHand === userStore.user.username;
});
console.log("isThereAPlayableCard", !isPlayerTurn && isThereAPlayableCard);

console.log("test", userStore.user.username);
console.log("test1", handStore.state.playerAtHand);

console.log("isPlayerTurn", isPlayerTurn);

// const showUNOButton = computed(() => {
//   return (
//     playerHand.value.length === 1 && gameStore.players[0].calledUNO === false
//   );
// });

// const showInterruptUNOButton = computed(() => {
//   return botWithOneCard.value !== undefined && gameStore.playerCanInterrupt;
// });
// Create unique keys for each card
const cardKey = (card: Card) => {
  return card.type === "NUMBERED"
    ? `${card.colour}-${card.value}`
    : `${card.type}-${card.colour || "no-colour"}`;
};
</script>
