<template>
  <div class="flex flex-row justify-center items-center gap-20 bg-blue-500">
    <div class="flex flex-col justify-center items-center space-y-3">
      <div class="flex flex-row space-x-2">
        <DiscardPile />
        <Deck />
      </div>
      <!-- <div class="flex flex-col justify-center items-center">
        Current color:
        <div
          class="flex h-[50px] w-[50px] rounded-[50px] border-white-100 border-5"
          :style="{ backgroundColor: color }"
        ></div>
      </div> -->
    </div>
  </div>
</template>

<script setup>
import DiscardPile from "./DiscardPile.vue";
import Deck from "./Deck.vue";
import { useGameStore } from "../stores/newGameStore";
import { computed } from "vue";
import ActionMessages from "./ActionMessages.vue";

const gameStore = useGameStore();
console.log('currentHand',gameStore.state.hand);

//const color = computed(() => gameStore.topDiscardCard?.colour || "white");
</script>
