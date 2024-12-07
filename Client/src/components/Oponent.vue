<template>
  <div
    class="relative flex items-center h-[200px] w-[200px] bg-white"
    v-if="props.player"
  >
    <img
      src="/assets/card-fan.png"
      class="max-w-[200px] max-h-[200px] left-0"
    />

    <div
      class="absolute bottom-4 right-4 bg-white text-black text-lg font-bold rounded-full h-10 w-10 flex items-center justify-center shadow-lg"
    >
      {{ handSize }}
    </div>

    <div
      class="absolute top-2 left-2 bg-white text-black text-sm font-bold px-2 py-1 rounded shadow-md"
    >
      {{ props.player.username }}
    </div>

    <div
      class="absolute top-2 right-2 bg-white text-black text-sm font-bold px-2 py-1 rounded shadow-md"
    >
      Score: {{ props.player.score }}
    </div>

    <div
      v-if="isCurrentPlayer"
      class="absolute top-16 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-sm font-bold px-2 py-1 rounded shadow-md"
    >
      Your Turn!
    </div>

    <div v-else class="h-[200px] w-[200px] bg-white"></div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, computed } from "vue";
import type { Player } from "../model/Player_model";
import { useHandStore } from "../stores/handStore";

const handStore = useHandStore();

const props = defineProps<{
  player: Player;
  playerIndex: number;
}>();

const isCurrentPlayer = computed((): boolean => {
  return handStore.state.playerAtHand === props.player.username;
});

console.log("oponent", props.player);
console.log("oponentname", props.player.name);
console.log("playerAtHand", handStore.state.playerAtHand);
console.log("isCurrentPlayer", isCurrentPlayer);

const handSize = computed(() => props.player.hand.length);

console.log("isCurrentPlayer", isCurrentPlayer);
</script>
