<template>
  <img :src="cardImage" :class="imageClass" @click="onClick" />
</template>

<script lang="ts" setup>
import { defineProps, computed } from "vue";
import type { Card } from "../../../Models/Card";

const props = defineProps<{
  card: Card;
  onClick?: () => void;
  hover?: boolean;
}>();

const { card, hover } = props;
console.log("card from card component", card);

const cardImage = computed(() => {
  if (!props.card) {
    return "/assets/deck/back.png";
  }
  if (card.type === "NUMBERED") {
    return `/assets/deck/${card.colour.toLocaleLowerCase()}-${card.value}.png`;
  }
  if (card.type === "WILD") {
    return `/assets/deck/wild-card.png`;
  }
  if (card.type === "REVERSE") {
    return `/assets/deck/${card.colour.toLocaleLowerCase()}-reverse.png`;
  }
  if (card.type === "SKIP") {
    return `/assets/deck/${card.colour.toLocaleLowerCase()}-skip.png`;
  }
  if (card.type === "DRAWTWO") {
    return `/assets/deck/${card.colour.toLocaleLowerCase()}-draw-two.png`;
  }
  if (card.type === "WILDDRAWFOUR") {
    return `/assets/deck/wild-draw-four.png`;
  }
});
const imageClass = computed(() => {
  const baseClass =
    "max-h-[200px] max-w-[200px] cursor-pointer animate-fade-up animate-ease-in-out";
  return hover ? `${baseClass} hover:animate-pulse` : baseClass;
});
</script>
