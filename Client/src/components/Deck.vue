<template>
  <div class="relative flex items-center">
    <img
      src="/public/assets/deck/back.png"
      class="max-h-[200px] max-w-[200px] hover:animate-pulse cursor-pointer"
    />
    <div
      class="absolute top-2 right-2 bg-white text-black text-lg font-bold rounded-full h-10 w-10 flex items-center justify-center shadow-lg z-10"
    >
      {{ handStore.state.deckSize }}
    </div>
  </div>
</template>

<script setup>
import { useGameStore } from "../stores/newGameStore";
import { computed } from "vue";
import { useHandStore } from "../stores/handStore";

const store = useGameStore();
const handStore = useHandStore();
console.log('handStore.state.hand.deckSize', handStore.state.hand.deckSize);
const deckSize = computed(() => store.state.hand.deck.preparedDeck.length);

</script>
