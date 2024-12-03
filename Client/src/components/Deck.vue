<template>
  <div class="relative flex items-center">
    <img
      src="/public/assets/deck/back.png"
      class="max-h-[200px] max-w-[200px] hover:animate-pulse cursor-pointer"
    />
    <div
      class="absolute top-2 right-2 bg-white text-black text-lg font-bold rounded-full h-10 w-10 flex items-center justify-center shadow-lg z-10"
    >
      {{ deckSize }}
    </div>
  </div>
</template>

<script setup>
import { useGameStore } from "../stores/newGameStore";
import { computed } from "vue";

const store = useGameStore();
console.log('storetest',store.state);
const deckSize = computed(() => store.state.hand.deck.preparedDeck.length);

</script>
