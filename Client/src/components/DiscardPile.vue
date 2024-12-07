<template>
  <div class="relative flex items-center">
    <CardComponent
      v-if="topDiscardCard"
      :card="topDiscardCard"
      :key="cardKey"
    />
    <div
      class="absolute bottom-2 left-2 bg-white text-black text-lg font-bold rounded-full h-10 w-10 flex items-center justify-center shadow-lg z-10"
    >
      {{ discardPileSize }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import CardComponent from "./CardComponent.vue";
import { useHandStore } from "../stores/handStore";
import { computed } from "vue";

const handStore = useHandStore();

const topDiscardCard = computed(
  () => handStore.state.discardPile[handStore.state.discardPile.length - 1]
);
const discardPileSize = computed(() => handStore.state.discardPile.length);

const cardKey = computed(() => {
  if (!topDiscardCard.value) return "default";
  const card = topDiscardCard.value;
  return card.type === "NUMBERED"
    ? `${card.colour.toLowerCase()}-${card.value}`
    : `${card.type.toLowerCase()}-${
        card.colour ? card.colour.toLowerCase() : ""
      }`;
});
</script>
